const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Facility = require("../models/Facility");
const { auth } = require("../middleware/auth");

// GET /api/reviews/doctor/:doctorId - Get all reviews for a specific doctor
router.get("/doctor/:doctorId", auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Verify the requesting user is the doctor themselves
    if (req.user.id !== doctorId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Find all reviews for this doctor and populate patient info
    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ 
      reviews,
      count: reviews.length 
    });
  } catch (e) {
    console.error("Get doctor reviews error:", e);
    res.status(500).json({ msg: "Server error while fetching reviews" });
  }
});

// POST /api/reviews/add - Add appointment-based review (MUST be before /:facilityId routes)
router.post("/add", auth, async (req, res) => {
  try {
    const { appointmentId, doctorId, rating, comment } = req.body;
    
    // Validate required fields
    if (!appointmentId || !doctorId || !rating) {
      return res.status(400).json({ msg: "Appointment ID, doctor ID, and rating are required" });
    }

    // Check if rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ 
      appointmentId, 
      userId: req.user.id 
    });

    if (existingReview) {
      return res.status(400).json({ msg: "You have already reviewed this appointment" });
    }

    // Create the review
    const review = await Review.create({
      userId: req.user.id,
      patientId: req.user.id,
      appointmentId,
      doctorId,
      rating,
      stars: rating, // Keep both for compatibility
      comment: comment || ""
    });

    res.status(201).json({ 
      msg: "Review submitted successfully",
      review 
    });
  } catch (e) {
    console.error("Review submission error:", e);
    if (e.code === 11000) {
      return res.status(400).json({ msg: "You have already reviewed this appointment" });
    }
    res.status(500).json({ msg: "Server error while submitting review" });
  }
});

// Facility-based review routes (must come after /add route)
router.get("/:facilityId", async (req, res) => {
  try {
    const reviews = await Review.find({ facilityId: req.params.facilityId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:facilityId", auth, async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const r = await Review.create({ facilityId: req.params.facilityId, userId: req.user.id, stars, comment });
    // update facility average
    const agg = await Review.aggregate([
      { $match: { facilityId: r.facilityId } },
      { $group: { _id: "$facilityId", avg: { $avg: "$stars" }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Facility.findByIdAndUpdate(r.facilityId, { ratingAvg: agg[0].avg, ratingCount: agg[0].count });
    }
    res.status(201).json({ review: r });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;











