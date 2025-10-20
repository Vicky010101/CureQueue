const express = require("express");
const { auth, roleCheck } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const router = express.Router();

router.get("/dashboard", auth, roleCheck("doctor", "admin"), (req, res) => {
    res.json({ msg: "Doctor/Admin Dashboard", user: req.user });
});
// Get my appointments (doctor/admin)
router.get("/appointments", auth, roleCheck("doctor", "admin"), async (req, res) => {
    try {
        const appts = await Appointment.find({ doctorId: req.user.id })
            .populate('patientId', 'name phone')
            .sort({ date: 1, time: 1 });

        const appointmentsForDoctor = appts.map(apt => ({
            _id: apt._id,
            patientName: apt.isOffline ? apt.patientName : (apt.patientId?.name || 'Unknown Patient'),
            date: apt.date,
            time: apt.time,
            status: apt.status,
            waitingTime: apt.waitingTime || 0,
            reason: apt.reason,
            token: apt.token,
            phone: apt.isOffline ? apt.phone : (apt.patientId?.phone || '')
        }));

        res.json({ appointments: appointmentsForDoctor });
    } catch (e) {
        console.error('Doctor appointments error:', e);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
