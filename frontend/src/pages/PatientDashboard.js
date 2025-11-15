import React, { useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";
import './PatientDashboard.css';
import { CalendarDays, ListChecks, PlusCircle, Search, User, MapPin, Stethoscope, CheckCircle, AlertCircle, Home } from "lucide-react";
import { toast } from "sonner";
import QueueStatusCard from "../components/QueueStatusCard";
import AppointmentBookingForm from "../components/AppointmentBookingForm";
import DoctorMapSearch from "../components/DoctorMapSearch";
import FacilityQueueDisplay from "../components/FacilityQueueDisplay";
import PatientQueueStatus from "../components/PatientQueueStatus";
import ReviewModal from "../components/ReviewModal";
import HomeVisitRequest from "../components/HomeVisitRequest";
import PatientHomeVisitHistory from "../components/PatientHomeVisitHistory";
import { queueBus } from "../lib/eventBus";
import { useNavigate } from "react-router-dom";

function PatientDashboard() {
	const navigate = useNavigate();
	const [appointments, setAppointments] = useState([]);
	const [me, setMe] = useState(null);
	const [queue, setQueue] = useState({ position: null, doctor: null, nowServing: null, eta: null, emergency: false });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [activeTab, setActiveTab] = useState('upcoming');
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewAppointment, setReviewAppointment] = useState(null);
	const [reviewedAppointments, setReviewedAppointments] = useState(new Set());
	const [activeForm, setActiveForm] = useState('clinic'); // 'clinic' or 'home'

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const meRes = await API.get("/auth/me");
				if (!isMounted) return;
				setMe(meRes.data.user);
				try {
					const aRes = await API.get('/appointments/me');
					if (!isMounted) return;
					setAppointments((aRes.data.appointments || []).map(a => ({
						id: a.id || a._id,
						date: a.date,
						time: a.time,
						doctor: a.doctorName,
						doctorId: a.doctorId, // Store doctorId for reviews
						status: a.status,
						waitingTime: a.waitingTime || 0,
						reason: a.reason,
						token: a.token
					})));
				} catch (_) {}
				setQueue({ position: null, doctor: null, nowServing: null, eta: null, emergency: false });
			} catch (e) {
				setError("Failed to load data");
				toast.error("Failed to load patient data");
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	// subscribe to admin queue updates
	React.useEffect(() => {
		const unsub = queueBus.subscribeQueueUpdates((u) => {
			setQueue((q) => ({ ...q, nowServing: u.nowServing, eta: u.eta, emergency: u.emergency }));
		});
		return () => unsub();
	}, []);

	// subscribe to waiting time updates
	React.useEffect(() => {
		const unsub = queueBus.subscribeWaitingTimeUpdates((update) => {
			setAppointments(prev => prev.map(apt => 
				apt.id === update.appointmentId ? { ...apt, waitingTime: update.waitingTime } : apt
			));
		});
		return () => unsub();
	}, []);

	// Listen for new appointments
	React.useEffect(() => {
		const handleNewAppointment = (appointment) => {
			// Add new appointment to the list
			setAppointments(prev => [...prev, {
				id: appointment._id,
				date: appointment.date,
				time: appointment.time,
				doctor: appointment.doctorName,
				doctorId: appointment.doctorId, // Store doctorId for reviews
				status: appointment.status,
				waitingTime: appointment.waitingTime || 0,
				reason: appointment.reason,
				token: appointment.token
			}]);
		};

		const unsubscribe = queueBus.subscribe('appointmentBooked', handleNewAppointment);
		return () => unsubscribe();
	}, []);

	// Listen for appointment status updates (completed, cancelled, etc.)
	React.useEffect(() => {
		const handleAppointmentUpdate = (updatedAppointment) => {
			// Trigger review modal when appointment is completed
			if (updatedAppointment.status === 'completed' && !reviewedAppointments.has(updatedAppointment._id)) {
				const completedApt = appointments.find(a => a.id === updatedAppointment._id);
				if (completedApt) {
					const doctorIdToUse = updatedAppointment.doctorId || completedApt.doctorId;
					setReviewAppointment({
						...completedApt,
						_id: updatedAppointment._id,
						doctorId: doctorIdToUse
					});
					setShowReviewModal(true);
				}
			}
			
			// Update the appointment in the local state
			setAppointments(prev => prev.map(apt => 
				apt.id === updatedAppointment._id ? {
					...apt,
					status: updatedAppointment.status,
					doctorId: updatedAppointment.doctorId || apt.doctorId
				} : apt
			));
		};

		const unsubscribe = queueBus.subscribe('appointmentUpdated', handleAppointmentUpdate);
		return () => unsubscribe();
	}, [appointments, reviewedAppointments]);

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		try {
			const response = await API.get(`/search?q=${encodeURIComponent(searchQuery)}`);
			setSearchResults(response.data.results || []);
			setShowSearchResults(true);
		} catch (error) {
			toast.error('Search failed');
			setSearchResults([]);
		}
	};

	const handleCancelAppointment = async (appointmentId) => {
		if (!window.confirm('Are you sure you want to cancel this appointment?')) {
			return;
		}

		try {
			await API.patch(`/appointments/${appointmentId}/cancel`);
			toast.success('Appointment cancelled successfully');
			
			// Update local state
			setAppointments(prev => prev.map(apt => 
				apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
			));
		} catch (error) {
			console.error('Cancel appointment error:', error);
			toast.error('Failed to cancel appointment');
		}
	};

	const handleReviewModalClose = (wasSubmitted) => {
		setShowReviewModal(false);
		if (wasSubmitted && reviewAppointment) {
			// Mark appointment as reviewed to prevent showing modal again
			setReviewedAppointments(prev => new Set([...prev, reviewAppointment._id || reviewAppointment.id]));
		}
		setReviewAppointment(null);
	};

	const handleReviewClick = (appointment) => {
		// Check if already reviewed
		if (reviewedAppointments.has(appointment.id)) {
			toast.info('You have already reviewed this appointment');
			return;
		}

		// Set the appointment for review and show modal
		setReviewAppointment({
			...appointment,
			_id: appointment.id,
			doctorId: appointment.doctorId
		});
		setShowReviewModal(true);
	};

	const renderAppointmentList = (appointments, emptyMessage) => {
		if (appointments.length === 0) {
			return (
				<li className="list-item">
					<span className="text-muted">{emptyMessage}</span>
				</li>
			);
		}

	return appointments.map((a) => (
			<li key={a.id} className="list-item patient-appointment-item">
				<div className="patient-appointment-info">
					<p className="patient-appointment-doctor">{a.doctor}</p>
					<p className="patient-appointment-meta">{a.date} • {a.time}</p>
					{a.waitingTime > 0 && (
						<p className="patient-appointment-wait">
							⏱️ Estimated wait: {a.waitingTime} minutes
						</p>
					)}
					{a.reason && (
						<p className="patient-appointment-reason">
							📝 {a.reason}
						</p>
					)}
				</div>
				<div className="patient-appointment-actions">
					<span className={`badge patient-status-badge ${a.status === 'confirmed' ? 'badge-green' : a.status === 'cancelled' ? 'badge-red' : a.status === 'completed' ? 'badge-blue' : 'badge-blue'}`}>
						{a.status}
					</span>
					{a.status === 'confirmed' && (
						<button 
							className="btn btn-outline btn-sm patient-btn"
							onClick={() => handleCancelAppointment(a.id)}
							disabled={loading}
						>
							Cancel
						</button>
					)}
					{a.status === 'completed' && (
						<button 
							className="btn btn-primary btn-sm patient-btn"
							onClick={() => handleReviewClick(a)}
							disabled={reviewedAppointments.has(a.id)}
							style={{ marginLeft: '8px' }}
						>
							{reviewedAppointments.has(a.id) ? '✓ Reviewed' : '⭐ Review'}
						</button>
					)}
				</div>
			</li>
		));
	};

	const SearchResults = () => (
		<motion.div 
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="card"
			style={{ marginTop: 16 }}
		>
			<h3 className="card-title">Search Results</h3>
			{searchResults.length > 0 ? (
				<div style={{ display: 'grid', gap: 12 }}>
					{searchResults.map((result, index) => (
						<div key={index} className="list-item" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<div style={{ 
									width: 40, 
									height: 40, 
									borderRadius: '50%', 
									background: '#0f766e', 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center',
									color: 'white',
									fontWeight: 'bold'
								}}>
									{result.type === 'doctor' ? 'Dr' : 'P'}
								</div>
								<div style={{ flex: 1 }}>
									<p style={{ fontWeight: 600, margin: 0 }}>
										{result.type === 'doctor' ? result.name : result.patientName}
									</p>
									{result.type === 'doctor' && (
										<p className="text-muted" style={{ fontSize: 14, margin: '4px 0 0 0' }}>
											<Stethoscope size={14} style={{ display: 'inline', marginRight: 4 }} />
											{result.specialization || 'General Medicine'}
										</p>
									)}
									{result.hospital && (
										<p className="text-muted" style={{ fontSize: 12, margin: '4px 0 0 0' }}>
											<MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
											{result.hospital}
										</p>
									)}
								</div>
								<span className={`badge ${result.type === 'doctor' ? 'badge-blue' : 'badge-green'}`}>
									{result.type === 'doctor' ? 'Doctor' : 'Patient'}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-muted">No results found for "{searchQuery}"</p>
			)}
		</motion.div>
	);

	return (
		<div className="container-responsive patient-dashboard-container">
			<div className="patient-header">
				<h1 className="page-title">{me ? `Welcome, ${me.name}` : "Patient Dashboard"}</h1>
				<p className="page-subtitle">Manage appointments and track your queue in real-time.</p>
			</div>
			<div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<div>
					<button 
						className="btn btn-primary patient-btn"
						onClick={() => navigate('/map')}
					>
						<MapPin size={16} />
						Find Doctors
					</button>
				</div>
			</div>

			{error && (
				<div className="card" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
					{error}
				</div>
			)}

			{loading ? (
				<p className="text-muted">Loading...</p>
			) : (
				<>
					{/* Facility Queue Display */}
					<motion.div layout>
						<FacilityQueueDisplay />
					</motion.div>

					{/* Personal Queue Status */}
					<motion.div layout>
						<PatientQueueStatus patientId={me?._id} />
					</motion.div>

					{/* Google Maps Doctor Search */}
					<motion.div layout>
						<DoctorMapSearch />
					</motion.div>

					{/* Search Section */}
					<motion.div layout className="card patient-card patient-search-container">
						<div className="card-header patient-card-header">
							<h2 className="card-title patient-card-title">Search Patients & Doctors</h2>
							<Search size={20} color="#0f766e" />
						</div>
						<div className="patient-card-body">
							<div className="patient-search-group">
								<input
									className="input patient-search-input"
									type="text"
									placeholder="Search by name..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
								/>
								<button 
									className="btn btn-primary patient-btn" 
									onClick={handleSearch}
									disabled={!searchQuery.trim()}
								>
									<Search size={16} />
									Search
								</button>
							</div>
						</div>
						{showSearchResults && <SearchResults />}
					</motion.div>

					{/* Toggle Slider for Clinic Visit / Home Visit */}
					<motion.div 
						layout 
						className="patient-forms-toggle-container"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="patient-forms-toggle">
							<button
								className={`patient-toggle-btn ${activeForm === 'clinic' ? 'active' : ''}`}
								onClick={() => setActiveForm('clinic')}
							>
								<CalendarDays size={18} />
								Clinic Visit
							</button>
							<button
								className={`patient-toggle-btn ${activeForm === 'home' ? 'active' : ''}`}
								onClick={() => setActiveForm('home')}
							>
								<Home size={18} />
								Home Visit
							</button>
						</div>
					</motion.div>

					{/* Forms - Conditionally Rendered Based on Toggle */}
					<motion.div 
						layout 
						className="patient-form-single-container"
						key={activeForm}
						initial={{ opacity: 0, x: activeForm === 'clinic' ? -20 : 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: activeForm === 'clinic' ? 20 : -20 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						{activeForm === 'clinic' && (
							<motion.div 
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3 }}
							>
								<AppointmentBookingForm />
							</motion.div>
						)}
						{activeForm === 'home' && (
							<motion.div 
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3 }}
							>
								<HomeVisitRequest />
							</motion.div>
						)}
					</motion.div>

					{/* Home Visit History */}
					{me && (
						<motion.div layout>
							<PatientHomeVisitHistory patientId={me._id} />
						</motion.div>
					)}

					{/* Appointments Section */}
					<motion.div layout className="card patient-card">
						<div className="card-header patient-card-header">
							<h2 className="card-title patient-card-title">My Appointments</h2>
							<CalendarDays size={20} color="#0f766e" />
						</div>

						{/* Tab Navigation */}
						<div className="patient-card-body">
							<div className="patient-tabs">
								<button 
									className={`patient-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
									onClick={() => setActiveTab('upcoming')}
								>
									Upcoming ({appointments.filter(a => a.status === 'confirmed').length})
								</button>
								<button 
									className={`patient-tab ${activeTab === 'completed' ? 'active' : ''}`}
									onClick={() => setActiveTab('completed')}
								>
									<CheckCircle size={14} />
									Completed ({appointments.filter(a => a.status === 'completed').length})
								</button>
								<button 
									className={`patient-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
									onClick={() => setActiveTab('cancelled')}
								>
									<AlertCircle size={14} />
									Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
								</button>
								<button 
									className={`patient-tab ${activeTab === 'all' ? 'active' : ''}`}
									onClick={() => setActiveTab('all')}
								>
									All ({appointments.length})
								</button>
							</div>

							{/* Tab Content */}
							<ul className="card-list patient-appointment-list">
								{activeTab === 'upcoming' && renderAppointmentList(appointments.filter(a => a.status === 'confirmed'), 'No upcoming appointments')}
								{activeTab === 'completed' && renderAppointmentList(appointments.filter(a => a.status === 'completed'), 'No completed appointments')}
								{activeTab === 'cancelled' && renderAppointmentList(appointments.filter(a => a.status === 'cancelled'), 'No cancelled appointments')}
								{activeTab === 'all' && renderAppointmentList(appointments, 'No appointments found')}
							</ul>
						</div>
					</motion.div>

					<div className="grid grid-2">
						<motion.div layout>
							<QueueStatusCard
								nowServing={queue.nowServing}
								yourNumber={queue.position}
								doctorName={queue.doctor}
								queueLength={Math.max(0, (queue.position ?? 0) - (queue.nowServing ?? 0))}
								doctorsOnDuty={1}
								emergency={queue.emergency}
							/>
							{(() => {
								// Find the next upcoming confirmed appointment and show its token
								const upcoming = [...appointments]
									.filter(a => a.status === 'confirmed')
									.sort((a,b) => {
										const da = new Date(`${a.date}T${a.time}:00`);
										const db = new Date(`${b.date}T${b.time}:00`);
										return da - db;
									});
								const next = upcoming[0];
								if (!next || next.token == null) return null;
								return (
									<div className="card" style={{ marginTop: 12, padding: 12 }}>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<div>
												<h3 className="card-title" style={{ fontSize: 14, margin: 0 }}>Your Next Token</h3>
												<p className="text-muted" style={{ margin: 0, fontSize: 12 }}>{next.date} • {next.time}</p>
											</div>
											<span className="badge" style={{ fontSize: 14 }}>Token: {next.token}</span>
										</div>
									</div>
								);
							})()}
						</motion.div>

						<motion.div layout className="card">
							<h2 className="card-title">Tips</h2>
							<p className="text-muted" style={{ marginTop: 8 }}>Arrive 10 minutes early to avoid delays. Keep your ID and reports ready.</p>
						</motion.div>
					</div>
				</>
			)}

			{/* Review Modal */}
			<ReviewModal
				isOpen={showReviewModal}
				onClose={handleReviewModalClose}
				appointment={reviewAppointment}
				doctorName={reviewAppointment?.doctor}
			/>
		</div>
	);
}

export default PatientDashboard;
