import React, { useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Heart, Stethoscope, Home } from "lucide-react";
import "../auth-pages.css";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "patient" });
    const [msg, setMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (!form.name.trim()) {
            setMsg("Name is required");
            return false;
        }
        if (!form.email.trim()) {
            setMsg("Email is required");
            return false;
        }
        if (!form.password) {
            setMsg("Password is required");
            return false;
        }
        if (form.password.length < 6) {
            setMsg("Password must be at least 6 characters");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setMsg("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            console.log('Registering user:', { ...form, password: '[HIDDEN]' });
            const res = await API.post("/auth/register", {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                phone: form.phone.trim(),
                role: form.role
            });
            
            console.log('Registration response:', res.data);
            setMsg(res.data.msg + " Please login to continue.");
            
            // Clear form on successful registration
            if (res.status === 201) {
                setForm({ name: "", email: "", password: "", phone: "", role: "patient" });
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err.response?.data?.msg || "Error occurred during registration";
            setMsg(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Home Button */}
            <Link to="/" className="auth-home-btn">
                <Home size={18} />
                Home
            </Link>
            
            {/* Left side with branding and illustration */}
            <motion.div
                className="auth-left"
                initial={{ opacity: 0, x: -50 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="auth-brand">
                    <div className="auth-illustration">
                        <Heart size={80} />
                    </div>
                    <h1>CureQueue</h1>
                    <p>Join our healthcare community</p>
                </div>
            </motion.div>

            {/* Right side with registration form */}
            <motion.div 
                className="auth-right"
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Join CureQueue to manage your healthcare appointments easily</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-form-field">
                            <label className="auth-form-label">Full Name *</label>
                            <input 
                                className="auth-form-input" 
                                name="name" 
                                type="text"
                                placeholder="Enter your full name" 
                                value={form.name}
                                onChange={handleChange} 
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="auth-form-field">
                            <label className="auth-form-label">Email Address *</label>
                            <input 
                                className="auth-form-input" 
                                name="email" 
                                type="email"
                                placeholder="Enter your email address" 
                                value={form.email}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="auth-form-field">
                            <label className="auth-form-label">Phone Number</label>
                            <input 
                                className="auth-form-input" 
                                name="phone" 
                                type="tel"
                                placeholder="Enter your phone number" 
                                value={form.phone}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="auth-form-field">
                            <label className="auth-form-label">Password * (min 6 characters)</label>
                            <input 
                                className="auth-form-input" 
                                name="password" 
                                type="password" 
                                placeholder="Create a secure password" 
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="auth-form-field">
                            <label className="auth-form-label">Account Type *</label>
                            <select 
                                className="auth-form-select" 
                                name="role" 
                                value={form.role} 
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Healthcare Provider</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="auth-loading">
                                    <div className="auth-spinner"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {msg && (
                        <div className={`auth-message ${msg.includes('successful') || msg.includes('Please login') ? 'success' : 'error'}`}>
                            {msg}
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;
