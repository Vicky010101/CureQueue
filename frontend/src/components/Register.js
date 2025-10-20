import React, { useState } from "react";
import API from "../api";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

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
        <div className="container-responsive" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
                <h2 className="page-title" style={{ fontSize: 20 }}>Create an account</h2>
                <p className="page-subtitle">Join CureQueue to manage your appointments easily.</p>
                <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                    <div className="form-field">
                        <label className="label">Name *</label>
                        <input 
                            className="input" 
                            name="name" 
                            placeholder="Full name" 
                            value={form.name}
                            onChange={handleChange} 
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-field">
                        <label className="label">Email *</label>
                        <input 
                            className="input" 
                            name="email" 
                            type="email"
                            placeholder="you@example.com" 
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-field">
                        <label className="label">Phone</label>
                        <input 
                            className="input" 
                            name="phone" 
                            placeholder="Phone number" 
                            value={form.phone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-field">
                        <label className="label">Password * (min 6 characters)</label>
                        <input 
                            className="input" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-field">
                        <label className="label">Role *</label>
                        <select 
                            className="input" 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block" 
                        style={{ marginTop: 12 }}
                        disabled={isSubmitting}
                    >
                        <UserPlus size={16} />
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
                {msg && <p className="text-muted" style={{ marginTop: 12 }}>{msg}</p>}
            </motion.div>
        </div>
    );
}

export default Register;
