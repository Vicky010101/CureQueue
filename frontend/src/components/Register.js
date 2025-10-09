import React, { useState } from "react";
import API from "../api";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "patient" });
    const [msg, setMsg] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/register", form);
            setMsg(res.data.msg);
        } catch (err) {
            setMsg(err.response?.data?.msg || "Error occurred");
        }
    };

    return (
        <div className="container-responsive" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
                <h2 className="page-title" style={{ fontSize: 20 }}>Create an account</h2>
                <p className="page-subtitle">Join CureQueue to manage your appointments easily.</p>
                <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                    <div className="form-field">
                        <label className="label">Name</label>
                        <input className="input" name="name" placeholder="Full name" onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label className="label">Email</label>
                        <input className="input" name="email" placeholder="you@example.com" onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label className="label">Phone</label>
                        <input className="input" name="phone" placeholder="Phone number" onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label className="label">Password</label>
                        <input className="input" name="password" type="password" placeholder="••••••••" onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label className="label">Role</label>
                        <select className="input" name="role" value={form.role} onChange={handleChange}>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 12 }}>
                        <UserPlus size={16} />
                        Register
                    </button>
                </form>
                {msg && <p className="text-muted" style={{ marginTop: 12 }}>{msg}</p>}
            </motion.div>
        </div>
    );
}

export default Register;
