import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleBasedStorage } from "../utils/roleBasedStorage";

function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, isInitializing } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [msg, setMsg] = useState("");
    const dashboardType = roleBasedStorage.getDashboardType();
    const port = window.location.port;

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
            const res = await API.post("/auth/login", {
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
        <div className="container-responsive" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h2 className="page-title" style={{ fontSize: 20, margin: 0 }}>Login</h2>
                    {process.env.NODE_ENV === 'development' && (
                        <span style={{ 
                            fontSize: 12, 
                            background: dashboardType === 'patient' ? '#3b82f6' : dashboardType === 'doctor' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'none'
                        }}>
                            {dashboardType.toUpperCase()} ::{port}
                        </span>
                    )}
                </div>
                <p className="page-subtitle">Welcome back to the {dashboardType} dashboard. Enter your credentials to continue.</p>
                <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                    <div className="form-field">
                        <label className="label">Email</label>
                        <input
                            className="input"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 12 }}>
                        <LogIn size={16} />
                        Login
                    </button>
                </form>
                {msg && <p className="text-muted" style={{ marginTop: 12 }}>{msg}</p>}
            </motion.div>
        </div>
    );
}

export default Login;
