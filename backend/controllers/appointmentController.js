const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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
      status: "Confirmed",
      waitingTime
    });

    await appointment.save();

    // Patient & doctor metadata
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    // ------------------ EMAIL USING RESEND ------------------
    if (process.env.MAIL_SENDER) {
      try {
        await resend.emails.send({
          from: `CureQueue <${process.env.MAIL_SENDER}>`,
          to: patient?.email || "",
          subject: "Appointment Confirmation",
          html: `
            <p>Dear ${patient?.name},</p>
            <p>Your appointment with <strong>Dr. ${doctor?.name}</strong> has been booked successfully.</p>
            <p>🗓 <strong>Date:</strong> ${date}</p>
            <p>⏰ <strong>Time:</strong> ${istTime} (IST)</p>
            <p>⌛ <strong>Estimated waiting time:</strong> ${waitingTime} minutes</p>
            <br>
            <p>Thank you for choosing <strong>CureQueue</strong> 🩵</p>
          `
        });
        console.log("Resend Email Sent to:", patient?.email);
      } catch (err) {
        console.error("Resend email error:", err.response?.data || err);
      }
    }
    // ---------------------------------------------------------

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
