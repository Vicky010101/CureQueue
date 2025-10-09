const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { auth, roleCheck } = require("../middleware/auth");

// Create appointment
router.post("/", auth, async (req, res) => {
  try {
    const { doctorId, facilityId, date, reason } = req.body;

    // Validate required fields
    if (!doctorId || !date) {
      return res.status(400).json({ msg: "Doctor and date are required" });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ msg: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Check if date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ msg: "Cannot book appointments for past dates" });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ msg: "Invalid doctor selected" });
    }


    // Generate token number for the day (based on selected date)
    const latest = await Appointment.find({ date, doctorId }).sort({ token: -1 }).limit(1);
    const nextToken = latest.length ? (latest[0].token || 0) + 1 : 1;

    // Compute current time in IST for booking time
    const nowUtc = new Date();
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    const parts = Object.fromEntries(fmt.formatToParts(nowUtc).map(p => [p.type, p.value]));
    const istDate = `${parts.year}-${parts.month}-${parts.day}`; // YYYY-MM-DD
    const istTime = `${parts.hour}:${parts.minute}`; // HH:mm

    // Calculate waiting time: number of appointments already booked with this doctor for today (IST)
    const todayCount = await Appointment.countDocuments({
      doctorId,
      date: istDate,
      status: { $in: ['confirmed', 'pending'] }
    });
    const waitingTime = todayCount * 5; // minutes

    // Create appointment (store IST time as booking time)
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      facilityId,
      date,
      time: istTime,
      reason: reason || '',
      token: nextToken,
      status: "confirmed",
      waitingTime
    });

    // Populate doctor name for response
    await appointment.populate('doctorId', 'name');

    // Send confirmation email to patient
    const patient = await User.findById(req.user.id);
    const doctorName = appointment.doctorId.name;
    const { sendAppointmentConfirmation } = require('../utils/mailer');
    if (patient && patient.email) {
      sendAppointmentConfirmation({
        to: patient.email,
        patientName: patient.name,
        doctorName,
        appointmentTimeIST: istTime,
        waitingTime
      }).catch(e => console.error('Email send error:', e));
    }

    res.status(201).json({
      appointment: {
        ...appointment.toObject(),
        doctorName: appointment.doctorId.name
      },
      appointmentTimeIST: istTime,
      waitingTime
    });
  } catch (e) {
    console.error('Appointment creation error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// My appointments
router.get("/me", auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name')
      .sort({ date: 1, time: 1 });

    const appointmentsWithNames = appts.map(apt => ({
      id: apt._id,
      patientName: req.user.name,
      doctorName: apt.doctorId?.name || 'Unknown Doctor',
      date: apt.date,
      time: apt.time,
      status: apt.status,
      waitingTime: apt.waitingTime || 0,
      reason: apt.reason,
      token: apt.token
    }));

    res.json({ appointments: appointmentsWithNames });
  } catch (e) {
    console.error('Get appointments error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Get all appointments
router.get("/admin", auth, roleCheck("admin"), async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ date: 1, time: 1 });

    const appointmentsWithNames = appts.map(apt => ({
      _id: apt._id,
      patientName: apt.patientId?.name || 'Unknown Patient',
      doctorName: apt.doctorId?.name || 'Unknown Doctor',
      date: apt.date,
      time: apt.time,
      status: apt.status,
      waitingTime: apt.waitingTime || 0,
      reason: apt.reason,
      token: apt.token
    }));

    res.json({ appointments: appointmentsWithNames });
  } catch (e) {
    console.error('Admin appointments error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Doctor: Get my appointments
router.get("/doctor/me", auth, roleCheck("doctor", "admin"), async (req, res) => {
  try {
    const appts = await Appointment.find({ doctorId: req.user.id })
      .populate('patientId', 'name')
      .sort({ date: 1, time: 1 });

    const appointmentsForDoctor = appts.map(apt => ({
      _id: apt._id,
      patientName: apt.patientId?.name || 'Unknown Patient',
      date: apt.date,
      time: apt.time,
      status: apt.status,
      waitingTime: apt.waitingTime || 0,
      reason: apt.reason,
      token: apt.token
    }));

    res.json({ appointments: appointmentsForDoctor });
  } catch (e) {
    console.error('Doctor appointments error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Cancel appointment (patient can cancel their own, doctor can cancel their appointments)
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    console.log(`[CANCEL] Attempting to cancel appointment with ID: ${req.params.id}`);
    console.log(`[CANCEL] User ID: ${req.user.id}, Role: ${req.user.role}`);
    
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`[CANCEL] Invalid ObjectId format: ${req.params.id}`);
      return res.status(400).json({ msg: "Invalid appointment ID format" });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      console.log(`[CANCEL] Appointment not found for ID: ${req.params.id}`);
      return res.status(404).json({ msg: "Appointment not found" });
    }

    console.log(`[CANCEL] Found appointment:`, {
      id: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      status: appointment.status,
      date: appointment.date,
      time: appointment.time
    });

    // Check if user has permission to cancel this appointment
    const isPatient = appointment.patientId.toString() === req.user.id;
    const isDoctor = appointment.doctorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log(`[CANCEL] Permission check: isPatient=${isPatient}, isDoctor=${isDoctor}, isAdmin=${isAdmin}`);

    if (!isPatient && !isDoctor && !isAdmin) {
      console.log(`[CANCEL] Permission denied for user ${req.user.id}`);
      return res.status(403).json({ msg: "You don't have permission to cancel this appointment" });
    }

    // Check if appointment can be cancelled (not completed or already cancelled)
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      console.log(`[CANCEL] Cannot cancel appointment - current status: ${appointment.status}`);
      return res.status(400).json({ msg: "Cannot cancel a completed or already cancelled appointment" });
    }

    // Update appointment status
    console.log(`[CANCEL] Updating appointment status to cancelled`);
    appointment.status = 'cancelled';
    await appointment.save();
    console.log(`[CANCEL] Appointment saved successfully`);

    // Populate patient and doctor info
    await appointment.populate('patientId', 'name email');
    await appointment.populate('doctorId', 'name');
    console.log(`[CANCEL] Appointment populated with patient and doctor info`);

    // Send cancellation email to patient
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;
    const patientName = patient?.name || 'Patient';
    const doctorName = doctor?.name || 'Doctor';
    const date = appointment.date;
    const time = appointment.time;
    const to = patient?.email;

    // Use mailer utility
    const { sendAppointmentCancellationByDoctor, sendAppointmentCancellationByPatient } = require('../utils/mailer');

    let emailPromise = null;
    if (to) {
      if (isDoctor) {
        // Doctor cancelled
        emailPromise = sendAppointmentCancellationByDoctor({
          to,
          patientName,
          doctorName,
          date,
          time
        });
      } else {
        // Patient or admin cancelled (treat as patient)
        emailPromise = sendAppointmentCancellationByPatient({
          to,
          patientName,
          doctorName,
          date,
          time
        });
      }
      emailPromise.catch(e => console.error('Cancel email send error:', e));
    }

    console.log(`[CANCEL] Sending success response`);
    res.json({
      msg: "Appointment cancelled successfully.",
      appointment: {
        ...appointment.toObject(),
        patientName,
        doctorName
      }
    });
    console.log(`[CANCEL] Cancel operation completed successfully for appointment ${req.params.id}`);
  } catch (e) {
    console.error('Cancel appointment error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Complete appointment (doctor can mark their appointments as completed)
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Check if user has permission to complete this appointment
    const isDoctor = appointment.doctorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isAdmin) {
      return res.status(403).json({ msg: "Only the assigned doctor can complete this appointment" });
    }

    // Check if appointment can be completed (not already completed or cancelled)
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ msg: "Cannot complete a completed or cancelled appointment" });
    }

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    // Populate names for response
    await appointment.populate('patientId', 'name');
    await appointment.populate('doctorId', 'name');

    res.json({
      appointment: {
        ...appointment.toObject(),
        patientName: appointment.patientId?.name || 'Unknown Patient',
        doctorName: appointment.doctorId?.name || 'Unknown Doctor'
      }
    });
  } catch (e) {
    console.error('Complete appointment error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin/Doctor: Assign waiting time to appointment
router.post("/:id/waiting-time", auth, async (req, res) => {
  try {
    const { waitingTime } = req.body;

    if (waitingTime < 0) {
      return res.status(400).json({ msg: "Waiting time cannot be negative" });
    }

    // Find the appointment first
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Check permissions: Admin can update any, Doctor can update their own appointments
    const isAdmin = req.user.role === 'admin';
    const isDoctor = req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id;
    
    if (!isAdmin && !isDoctor) {
      return res.status(403).json({ msg: "You don't have permission to update this appointment's waiting time" });
    }

    // Update the specific appointment waiting time
    let updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { waitingTime: parseInt(waitingTime) || 0 },
      { new: true }
    );

    // Populate to get patient and doctor info for email
    await updated.populate('patientId', 'name email');
    await updated.populate('doctorId', 'name');

    // Recalculate waiting times for this doctor's appointments on the same date
    const doctorId = updated.doctorId;
    const date = updated.date;
    const sameDay = await Appointment.find({
      doctorId: doctorId,
      date,
      status: { $in: ['confirmed', 'pending'] }
    }).sort({ token: 1, time: 1 });

    // Apply 5 minute increments based on order
    for (let i = 0; i < sameDay.length; i++) {
      const newWT = i * 5;
      if ((sameDay[i].waitingTime || 0) !== newWT) {
        sameDay[i].waitingTime = newWT;
        await sameDay[i].save();
      }
    }

    // Send email notification to the updated appointment's patient
    const { sendAppointmentWaitingTimeUpdate } = require('../utils/mailer');
    const to = updated.patientId?.email;
    const patientName = updated.patientId?.name || 'Patient';
    const doctorName = updated.doctorId?.name || 'Doctor';
    const wt = updated.waitingTime || 0;
    const status = 'Updated'; // Always show "Updated" status for manager updates
    if (to) {
      sendAppointmentWaitingTimeUpdate({
        to,
        patientName,
        doctorName,
        status,
        waitingTime: wt
      }).catch(err => console.error('Waiting time update email error:', err));
    }

    res.json({ appointment: updated });
  } catch (e) {
    console.error('Waiting time update error:', e);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;



