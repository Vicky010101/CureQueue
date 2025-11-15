const Appointment = require("../models/Appointment");
const User = require("../models/User");
const nodemailer = require("nodemailer");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    // Patient must come from auth token, not frontend
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ msg: "Unauthorized: Patient not found from token" });
    }

    if (!doctorId || !date) {
      return res.status(400).json({ msg: "Doctor and appointment date are required" });
    }

    // Convert current UTC time -> IST
    const nowUtc = new Date();
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
    const parts = Object.fromEntries(fmt.formatToParts(nowUtc).map(p => [p.type, p.value]));
    const istDate = `${parts.year}-${parts.month}-${parts.day}`;
    const istTime = `${parts.hour}:${parts.minute}`;

    // Count today's active appointments to calculate wait time
    const todayCount = await Appointment.countDocuments({
      doctorId,
      date: istDate,
      status: { $in: ["Confirmed", "Pending"] }
    });

    const waitingTime = todayCount * 5; // 5 mins per patient

    // Create new appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time: istTime,
      reason,
      status: "Confirmed", // use consistent capital C
      waitingTime
    });

    await appointment.save();

    // Patient & doctor metadata
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    // Email (if credentials exist)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient?.email || "",
        subject: "Appointment Confirmation",
        text: `Dear ${patient?.name},

Your appointment with Dr. ${doctor?.name} has been booked successfully.

🗓 Date: ${date}
⏰ Time: ${istTime} (IST)
⌛ Estimated waiting time: ${waitingTime} minutes

Thank you for choosing CureQueue!`
      };

      transporter.sendMail(mailOptions).catch(err =>
        console.error("Email warning:", err.message)
      );
    }

    res.status(201).json({
      msg: "Appointment booked successfully",
      appointment,
      appointmentTimeIST: istTime,
      waitingTime
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({
      msg: "Server error while booking appointment",
      error: err.message
    });
  }
};
