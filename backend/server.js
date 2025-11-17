require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
module.exports.resend = resend;

const app = express();
app.use(express.json());

// CORS FIX 🚀 (no trailing slash + include frontend URL)
app.use(
  cors({
    origin: [
      "https://cure-queue-cyan.vercel.app",  // your Vercel frontend URL
      "http://localhost:3000"                // local testing
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
    credentials: true
  })
);

// Connect DB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/curequeue";
mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("⚠️ Server will continue running without DB connection...");
  });

// Default test route
app.get("/", (req, res) => res.send("CureQueue Backend Running"));

// Routes
app.use("/api/auth", require("./routes/auth"));

const { auth, roleCheck } = require("./middleware/auth");

// Protected example route for patients
app.get("/api/patient/profile", auth, (req, res) => {
  res.json({ msg: "This is a protected route", patient: req.user });
});

// Protected example route for doctors
app.get("/api/doctor/dashboard", auth, roleCheck("doctor"), (req, res) => {
  res.json({ msg: "Welcome Doctor!", doctor: req.user });
});

// Other API modules
app.use("/api/patient", require("./routes/patient"));
app.use("/api/doctor", require("./routes/doctor"));
app.use("/api/facilities", require("./routes/facilities"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/queue", require("./routes/queue"));
app.use("/api/home-visits", require("./routes/homevisits"));
app.use("/api/search", require("./routes/search"));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
