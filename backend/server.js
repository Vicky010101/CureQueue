const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://cure-queue-cyan.vercel.app/", // 🔥 replace this with your Vercel live URL
      "http://localhost:3000" // optional for local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
        console.log("⚠️  Starting server without database connection...");
    });

// Simple route
app.get("/", (req, res) => res.send("CureQueue Backend Running"));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Middleware (auth + role-based access)
const { auth, roleCheck } = require("./middleware/auth");

// Protected patient route
app.get("/api/patient/profile", auth, (req, res) => {
    res.json({ msg: "This is a protected route", patient: req.user });
});

// Example doctor-only route
app.get("/api/doctor/dashboard", auth, roleCheck("doctor"), (req, res) => {
    res.json({ msg: "Welcome Doctor!", doctor: req.user });
});

// Extra routes (if you create them)
const patientRoutes = require("./routes/patient");
const doctorRoutes = require("./routes/doctor");
const facilitiesRoutes = require("./routes/facilities");
const appointmentsRoutes = require("./routes/appointments");
const reviewsRoutes = require("./routes/reviews");
const queueRoutes = require("./routes/queue");
const homeVisitsRoutes = require("./routes/homevisits");
const searchRoutes = require("./routes/search");

app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/facilities", facilitiesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/home-visits", homeVisitsRoutes);
app.use("/api/search", searchRoutes);

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
