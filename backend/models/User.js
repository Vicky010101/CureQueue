const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    role: {
        type: String,
        enum: ["patient", "doctor", "admin"],
        default: "patient"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
