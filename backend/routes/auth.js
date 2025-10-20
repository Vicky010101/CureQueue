const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // ✅ import bcrypt
const jwt = require("jsonwebtoken"); // ✅ import jwt
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// Escape regex special characters in a string
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        console.log("[REGISTER] Registration attempt:", { 
            body: { ...req.body, password: '[HIDDEN]' },
            contentType: req.get('Content-Type')
        });
        
        const { name, email, password, phone, role } = req.body;
        
        // Enhanced validation
        if (!name || !name.trim()) {
            console.log("[REGISTER] Validation failed: Missing name");
            return res.status(400).json({ msg: "Name is required" });
        }
        
        if (!email || !email.trim()) {
            console.log("[REGISTER] Validation failed: Missing email");
            return res.status(400).json({ msg: "Email is required" });
        }
        
        if (!password) {
            console.log("[REGISTER] Validation failed: Missing password");
            return res.status(400).json({ msg: "Password is required" });
        }
        
        if (password.length < 6) {
            console.log("[REGISTER] Validation failed: Password too short");
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }
        
        const normalizedEmail = (email || "").toLowerCase().trim();
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            console.log("[REGISTER] Validation failed: Invalid email format", normalizedEmail);
            return res.status(400).json({ msg: "Please enter a valid email address" });
        }

        console.log("[REGISTER] Checking for existing user:", normalizedEmail);
        const existingUser = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" }
        });
        
        if (existingUser) {
            console.log("[REGISTER] User already exists:", normalizedEmail);
            return res.status(400).json({ msg: "Email already registered" });
        }

        console.log("[REGISTER] Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone?.trim() || '',
            role: role || "patient", // default patient
        };
        
        console.log("[REGISTER] Creating new user:", { ...userData, password: '[HIDDEN]' });
        const newUser = new User(userData);

        console.log("[REGISTER] Saving user to database...");
        await newUser.save();
        console.log("[REGISTER] User saved successfully:", newUser._id);
        
        const responseData = {
            msg: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        };
        
        console.log("[REGISTER] Registration successful:", responseData.user);
        res.status(201).json(responseData);
        
    } catch (err) {
        console.error("[REGISTER] Server error:", err);
        
        // Handle specific MongoDB errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ msg: `${field} already exists` });
        }
        
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        
        res.status(500).json({ msg: "Server error during registration" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        console.log("[LOGIN] Login attempt:", { 
            body: { ...req.body, password: '[HIDDEN]' },
            contentType: req.get('Content-Type')
        });
        
        const { email, password } = req.body;
        
        // Enhanced validation
        if (!email || !email.trim()) {
            console.log("[LOGIN] Validation failed: Missing email");
            return res.status(400).json({ msg: "Email is required" });
        }
        
        if (!password) {
            console.log("[LOGIN] Validation failed: Missing password");
            return res.status(400).json({ msg: "Password is required" });
        }
        
        const normalizedEmail = (email || "").toLowerCase().trim();
        console.log("[LOGIN] Searching for user:", normalizedEmail);
        
        const user = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" }
        });
        
        if (!user) {
            console.log("[LOGIN] User not found for email:", normalizedEmail);
            // Count total users for debugging
            const totalUsers = await User.countDocuments({});
            const totalDoctors = await User.countDocuments({ role: 'doctor' });
            console.log(`[LOGIN] Total users in DB: ${totalUsers}, Total doctors: ${totalDoctors}`);
            
            if (process.env.NODE_ENV !== "production") {
                return res.status(400).json({ msg: "Invalid credentials", code: "USER_NOT_FOUND", debug: { totalUsers, totalDoctors } });
            }
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        
        console.log("[LOGIN] User found:", { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            hasPassword: !!user.password 
        });

        console.log("[LOGIN] Comparing password...");
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("[LOGIN] Password mismatch for email:", normalizedEmail);
            if (process.env.NODE_ENV !== "production") {
                return res.status(400).json({ msg: "Invalid credentials", code: "BAD_PASSWORD" });
            }
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        
        console.log("[LOGIN] Password verified, generating token...");
        const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
        const token = jwt.sign(
            { id: user._id, role: user.role },
            jwtSecret,
            { expiresIn: "1d" }
        );
        
        const responseData = {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
        
        console.log("[LOGIN] Login successful:", responseData.user);
        res.json(responseData);
        
    } catch (err) {
        console.error("[LOGIN] Server error:", err);
        res.status(500).json({ msg: "Server error during login" });
    }
});

// Current user endpoint
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json({ user });
    } catch (e) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        // Check if email is being changed and if it's already taken
        if (email) {
            const normalizedEmail = (email || "").toLowerCase().trim();
            const existingUser = await User.findOne({
                email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(400).json({ msg: "Email already in use" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, address },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ user: updatedUser });
    } catch (e) {
        console.error("Profile update error:", e);
        res.status(500).json({ msg: "Server error" });
    }
});

// Admin routes - Get all users
router.get("/users", auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json({ users });
    } catch (e) {
        console.error("Get users error:", e);
        res.status(500).json({ msg: "Server error" });
    }
});

// Admin routes - Update user
router.put("/users/:id", auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const { name, email, phone, role } = req.body;
        
        // Check if email is being changed and if it's already taken
        if (email) {
            const normalizedEmail = (email || "").toLowerCase().trim();
            const existingUser = await User.findOne({
                email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({ msg: "Email already in use" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ user: updatedUser });
    } catch (e) {
        console.error("Update user error:", e);
        res.status(500).json({ msg: "Server error" });
    }
});

// Admin routes - Delete user
router.delete("/users/:id", auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ msg: "User deleted successfully" });
    } catch (e) {
        console.error("Delete user error:", e);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
