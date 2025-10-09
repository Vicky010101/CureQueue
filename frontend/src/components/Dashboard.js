import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token) {
            navigate("/login");
            return;
        }
        if (role === "patient") navigate("/patient-dashboard");
        else if (role === "doctor") navigate("/doctor-dashboard");
        else if (role === "admin") navigate("/doctor-dashboard");
        else navigate("/login");
    }, [navigate]);

    return null;
}

export default Dashboard;
