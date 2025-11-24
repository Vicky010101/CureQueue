const express = require("express");
const { auth, roleCheck } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Review = require("../models/Review");
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

// GET /api/doctor/ratings - Get all doctors with their average ratings
router.get("/ratings", async (req, res) => {
    try {
        // Get all doctors
        const doctors = await User.find({ role: "doctor" }).select("_id name email homeVisitFee");

        // Aggregate ratings for each doctor
        const ratingsAgg = await Review.aggregate([
            {
                $match: { doctorId: { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: "$doctorId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        // Create a map of doctorId to rating data
        const ratingsMap = {};
        ratingsAgg.forEach(item => {
            ratingsMap[item._id.toString()] = {
                averageRating: Math.round(item.averageRating * 10) / 10, // Round to 1 decimal
                totalReviews: item.totalReviews
            };
        });

        // Combine doctors with their ratings
        const doctorsWithRatings = doctors.map(doctor => ({
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            averageRating: ratingsMap[doctor._id.toString()]?.averageRating || null,
            totalReviews: ratingsMap[doctor._id.toString()]?.totalReviews || 0,
            homeVisitFee: doctor.homeVisitFee || null
        }));

        res.json({ doctors: doctorsWithRatings });
    } catch (e) {
        console.error('Get doctor ratings error:', e);
        res.status(500).json({ msg: "Server error while fetching doctor ratings" });
    }
});

// PATCH /api/doctor/home-visit-fee - Update logged-in doctor's home visit fee
router.patch("/home-visit-fee", auth, roleCheck("doctor"), async (req, res) => {
    try {
        const { homeVisitFee } = req.body;
        
        // Validate that homeVisitFee is a number if provided
        if (homeVisitFee !== undefined && homeVisitFee !== null) {
            const fee = Number(homeVisitFee);
            if (isNaN(fee) || fee < 0) {
                return res.status(400).json({ msg: "Home visit fee must be a non-negative number" });
            }
        }
        
        // Update the doctor's home visit fee
        const updatedDoctor = await User.findByIdAndUpdate(
            req.user.id,
            { homeVisitFee: homeVisitFee !== undefined && homeVisitFee !== null ? Number(homeVisitFee) : null },
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!updatedDoctor) {
            return res.status(404).json({ msg: "Doctor not found" });
        }
        
        res.json({ 
            success: true, 
            homeVisitFee: updatedDoctor.homeVisitFee 
        });
    } catch (e) {
        console.error('Update home visit fee error:', e);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
