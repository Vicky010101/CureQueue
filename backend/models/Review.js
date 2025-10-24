const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    stars: { type: Number, min: 1, max: 5, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

// Create compound index to prevent duplicate reviews for the same appointment
ReviewSchema.index({ appointmentId: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", ReviewSchema);











