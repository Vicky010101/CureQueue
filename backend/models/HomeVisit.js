const mongoose = require("mongoose");

const HomeVisitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: Date, required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    preferredTime: { type: Date },
    notes: { type: String },
    etaMinutes: { type: Number },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Cancelled", "Completed", "new", "approved", "rejected", "completed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeVisit", HomeVisitSchema);











