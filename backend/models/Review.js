const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);











