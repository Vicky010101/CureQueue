import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Stethoscope, LogOut, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar({ onToggleSidebar }) {
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header className="navbar">
			<div className="container-responsive navbar-inner">
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<button
						className="hamburger md:hidden"
						aria-label="Toggle menu"
						onClick={onToggleSidebar}
					>
						<Menu size={20} />
					</button>
					<Link to={isAuthenticated ? "/dashboard" : "/"} className="brand">
						<Stethoscope size={24} color="#0f766e" />
						<span>CureQueue</span>
					</Link>
				</div>

				<nav className="navbar-actions">
					{isAuthenticated ? (
						<>
							<Link
								to={user?.role === "admin" ? "/doctor-dashboard" : user?.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
								className="btn"
							>
								<LayoutDashboard size={16} />
								Dashboard
							</Link>
							<button onClick={handleLogout} className="btn btn-primary">
								<LogOut size={16} />
								Logout
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn">
								<LogIn size={16} />
								Login
							</Link>
							<Link to="/register" className="btn btn-primary">
								<UserPlus size={16} />
								Register
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}

export default Navbar;


