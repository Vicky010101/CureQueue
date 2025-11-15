import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Activity, Heart, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../auth-pages.css";

function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, isInitializing } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [msg, setMsg] = useState("");

    // Redirect already authenticated users
    useEffect(() => {
        if (!isInitializing && isAuthenticated && user) {
            if (user.role === "patient") {
                navigate("/patient-dashboard", { replace: true });
            } else if (user.role === "doctor") {
                navigate("/doctor-dashboard", { replace: true });
            } else if (user.role === "admin") {
                navigate("/doctor-dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [isAuthenticated, user, isInitializing, navigate]);

    // Show nothing while initializing (handled at App level)
    if (isInitializing) {
        return null;
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(""); // Clear previous messages
        
        try {
            console.log('Attempting login:', { email: form.email, password: '[HIDDEN]' });
           const res = await API.post("/api/auth/login", {

                email: form.email.trim(),
                password: form.password
            });
            
            console.log('Login response:', { user: res.data.user, hasToken: !!res.data.token });

            // Use AuthContext login method
            login(res.data.user, res.data.token);

            setMsg("Login successful! Redirecting...");

            // Redirect based on role
            if (res.data.user.role === "patient") {
                navigate("/patient-dashboard");
            } else if (res.data.user.role === "doctor") {
                navigate("/doctor-dashboard");
            } else if (res.data.user.role === "admin") {
                navigate("/doctor-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.response?.data?.msg || "Error occurred during login";
            setMsg(errorMsg);
            
            // Show debug info in development
            if (process.env.NODE_ENV === 'development' && err.response?.data?.debug) {
                console.log('Debug info:', err.response.data.debug);
            }
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
                        <Activity size={80} />
                    </div>
                    <h1>CureQueue</h1>
                    <p>Healthcare Queue Management System</p>
                </div>
            </motion.div>

            {/* Right side with login form */}
            <motion.div 
                className="auth-right"
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Sign In</h2>
                        <p>Welcome back to CureQueue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-form-field">
                            <label className="auth-form-label">Email</label>
                            <input
                                className="auth-form-input"
                                name="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="auth-form-field">
                            <label className="auth-form-label">Password</label>
                            <input
                                className="auth-form-input"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            <LogIn size={16} />
                            Sign In
                        </button>
                    </form>

                    {msg && (
                        <div className={`auth-message ${msg.includes('successful') ? 'success' : 'error'}`}>
                            {msg}
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
