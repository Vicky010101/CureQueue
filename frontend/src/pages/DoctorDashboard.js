import React, { useEffect, useState, useMemo } from "react";
import API from "../api";
import { motion } from "framer-motion";
import { ClipboardList, CalendarDays, X, User, Clock, FileText, CheckCircle, History, AlertCircle, Pencil, XCircle, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { queueBus } from "../lib/eventBus";

function DoctorDashboard() {
	const [todayAppointments, setTodayAppointments] = useState([]);
	const [pastAppointments, setPastAppointments] = useState([]);
	const [cancelledAppointments, setCancelledAppointments] = useState([]);
	const [allAppointments, setAllAppointments] = useState([]);
	const [me, setMe] = useState(null);
	const [activeTab, setActiveTab] = useState('today');
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState(null);
	const [editWaiting, setEditWaiting] = useState(0);
	const [filter, setFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [appointments, setAppointments] = useState([]);

	// Load all doctor's appointments function
	const loadAllAppointments = async () => {
		try {
			const res = await API.get('/doctor/appointments');
			const appointmentData = res.data.appointments || [];
			// Transform to enhanced appointment format
			const transformedAppointments = appointmentData.map(a => ({
				_id: a._id,
				patientName: a.patientName,
				doctorName: a.doctorName,
				date: a.date,
				time: a.time,
				status: a.status,
				reason: a.reason,
				token: a.token,
				waitingTime: a.waitingTime || 0
			}));
			setAppointments(transformedAppointments);
			
			// Also maintain existing format for compatibility
			const todayLocal = new Date();
			const yyyy = todayLocal.getFullYear();
			const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
			const dd = String(todayLocal.getDate()).padStart(2, '0');
			const todayStr = `${yyyy}-${mm}-${dd}`;
			
			const allAppts = appointmentData.map(a => ({ 
				id: a._id, patient: a.patientName, time: a.time, date: a.date, status: a.status, reason: a.reason, token: a.token, waitingTime: a.waitingTime
			}));
			const today = allAppts.filter(a => a.date === todayStr && a.status === 'confirmed');
			const past = allAppts.filter(a => a.date < todayStr && a.status === 'completed');
			const cancelled = allAppts.filter(a => a.status === 'cancelled');
			setTodayAppointments(today);
			setPastAppointments(past);
			setCancelledAppointments(cancelled);
			setAllAppointments(allAppts);
		} catch (e) {
			console.error('Load appointments error:', e);
			toast.error('Failed to load appointments');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const meRes = await API.get("/auth/me");
				if (!isMounted) return;
				setMe(meRes.data.user);
				await loadAllAppointments();
			} catch (e) {
				toast.error('Failed to load doctor data');
			}
		})();
		return () => { isMounted = false; };
	}, []);

	useEffect(() => {
		const handleNewAppointment = (appointment) => {
			const todayLocal = new Date();
			const yyyy = todayLocal.getFullYear();
			const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
			const dd = String(todayLocal.getDate()).padStart(2, '0');
			const todayStr = `${yyyy}-${mm}-${dd}`;
			if (appointment.date === todayStr) {
				const newAppt = { id: appointment._id, patient: appointment.patientName, time: appointment.time, date: appointment.date, status: appointment.status, reason: appointment.reason, token: appointment.token, waitingTime: appointment.waitingTime };
				setTodayAppointments(prev => [...prev, newAppt]);
				setAllAppointments(prev => [...prev, newAppt]);
				// Update enhanced appointments state
				const enhancedAppt = {
					_id: appointment._id,
					patientName: appointment.patientName,
					doctorName: appointment.doctorName,
					date: appointment.date,
					time: appointment.time,
					status: appointment.status,
					reason: appointment.reason,
					token: appointment.token,
					waitingTime: appointment.waitingTime || 0
				};
				setAppointments(prev => [...prev, enhancedAppt]);
			}
		};

		// Enhanced real-time synchronization - listen for updates from other sources
		const handleAppointmentUpdate = (updatedAppointment) => {
			// Update enhanced appointments state
			setAppointments(prev => prev.map(a => 
				a._id === updatedAppointment._id 
					? { ...a, ...updatedAppointment, waitingTime: updatedAppointment.waitingTime || a.waitingTime }
					: a
			));
			// Update legacy state for compatibility
			if (updatedAppointment.status) {
				updateAppointmentStatus(updatedAppointment._id, updatedAppointment.status);
			}
			// Note: Removed loadAllAppointments() to prevent unnecessary reloads
		};

		const handleWaitingTimeUpdate = (data) => {
			// Handle waiting time updates from real-time events
			setAppointments(prev => prev.map(a => 
				a._id === data._id 
					? { ...a, waitingTime: data.waitingTime }
					: a
			));
			// Update legacy state
			setAllAppointments(prev => prev.map(a => 
				a.id === data._id 
					? { ...a, waitingTime: data.waitingTime }
					: a
			));
		};

		// Subscribe to all relevant events
		const unsubscribeNew = queueBus.subscribe('appointmentBooked', handleNewAppointment);
		const unsubscribeUpdate = queueBus.subscribe('appointmentUpdated', handleAppointmentUpdate);
		const unsubscribeWaitingTime = queueBus.subscribe('waitingTimeUpdated', handleWaitingTimeUpdate);

		return () => {
			unsubscribeNew();
			unsubscribeUpdate();
			unsubscribeWaitingTime();
		};
	}, []);

	// Enhanced appointment management functions
	const completeAppointment = async (id) => {
		if (!window.confirm('Mark this appointment as completed?')) return;
		try {
			await API.patch(`/appointments/${id}/complete`);
			setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a));
			// Update legacy state for compatibility
			updateAppointmentStatus(id, 'completed');
			toast.success('Appointment marked as completed');
			queueBus.emit('appointmentUpdated', { _id: id, status: 'completed' });
		} catch (e) {
			console.error('Complete error:', e);
			toast.error('Failed to complete');
		}
	};

	const cancelAppointment = async (id) => {
		if (!window.confirm('Cancel this appointment?')) return;
		try {
			await API.patch(`/appointments/${id}/cancel`);
			setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
			// Update legacy state for compatibility
			updateAppointmentStatus(id, 'cancelled');
			toast.success('Appointment cancelled');
			queueBus.emit('appointmentUpdated', { _id: id, status: 'cancelled' });
		} catch (e) {
			console.error('Cancel error:', e);
			toast.error('Failed to cancel');
		}
	};

	const openEdit = (apt) => {
		setEditingId(apt._id);
		setEditWaiting(parseInt(apt.waitingTime || 0, 10));
	};

	const saveEdit = async () => {
		try {
			const newWaitingTime = parseInt(editWaiting) || 0;
			await API.post(`/appointments/${editingId}/waiting-time`, { waitingTime: newWaitingTime });
			
			// Update local state immediately for instant UI feedback
			setAppointments(prev => prev.map(a => 
				a._id === editingId ? { ...a, waitingTime: newWaitingTime } : a
			));
			
			// Update legacy state for compatibility
			setAllAppointments(prev => prev.map(a => 
				a.id === editingId ? { ...a, waitingTime: newWaitingTime } : a
			));
			
			// Update today's appointments if the appointment is for today
			setTodayAppointments(prev => prev.map(a => 
				a.id === editingId ? { ...a, waitingTime: newWaitingTime } : a
			));
			
			toast.success('Waiting time updated');
			setEditingId(null);
			
			// Emit event for real-time synchronization with other components
			queueBus.emit('appointmentUpdated', { _id: editingId, waitingTime: newWaitingTime });
			queueBus.emit('waitingTimeUpdated', { _id: editingId, waitingTime: newWaitingTime });
		} catch (e) {
			console.error('Update error:', e);
			toast.error('Failed to update waiting time');
			// Reset editing state on error
			setEditingId(null);
		}
	};

	// Add Patient placeholder function
	const handleAddPatient = () => {
		toast.info('Add Patient functionality coming soon!');
	};

	// Legacy functions for compatibility
	const handleCancelAppointment = async (appointmentId) => {
		return cancelAppointment(appointmentId);
	};

	const handleCompleteAppointment = async (appointmentId) => {
		return completeAppointment(appointmentId);
	};

	// Status badge helper
	const statusBadgeClass = (status) => {
		if (status === 'completed') return 'badge badge-green';
		if (status === 'cancelled') return 'badge badge-red';
		return 'badge badge-blue';
	};

	// Today string helper
	const todayStr = useMemo(() => {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}, []);

	// Filtered appointments for the enhanced table view
	const filteredAppointments = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		return appointments.filter(a => {
			const matchesSearch = !q || (a.patientName || '').toLowerCase().includes(q) || (a.doctorName || '').toLowerCase().includes(q);
			let matchesFilter = true;
			if (filter === 'today') matchesFilter = a.date === todayStr;
			if (filter === 'pending') matchesFilter = a.status === 'confirmed';
			if (filter === 'completed') matchesFilter = a.status === 'completed';
			if (filter === 'cancelled') matchesFilter = a.status === 'cancelled';
			return matchesSearch && matchesFilter;
		});
	}, [appointments, filter, searchQuery, todayStr]);

	const updateAppointmentStatus = (appointmentId, newStatus) => {
		const appointment = allAppointments.find(apt => apt.id === appointmentId);
		if (!appointment) return;
		const updated = { ...appointment, status: newStatus };
		setAllAppointments(prev => prev.map(apt => apt.id === appointmentId ? updated : apt));
		setTodayAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
		if (newStatus === 'completed') setPastAppointments(prev => [...prev, updated]);
		if (newStatus === 'cancelled') setCancelledAppointments(prev => [...prev, updated]);
	};

	const renderAppointmentList = (appointments, emptyMessage) => {
		if (appointments.length === 0) {
			return (<li className="list-item"><span className="text-muted">{emptyMessage}</span></li>);
		}
		return appointments.map((a) => (
			<li key={a.id} className="list-item">
				<div style={{ flex: 1 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
						<User size={16} color="#0f766e" />
						<span style={{ fontWeight: 600 }}>{a.patient}</span>
						<span className="badge" style={{ fontSize: '12px' }}>Token: {a.token}</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
						<Clock size={14} color="#6b7280" />
						<span className="text-muted" style={{ fontSize: 14 }}>{a.date} • {a.time}</span>
					</div>
					{a.reason && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<FileText size={14} color="#6b7280" />
							<span className="text-muted" style={{ fontSize: 12 }}>{a.reason}</span>
						</div>
					)}
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
					<span className={`badge ${a.status === 'confirmed' ? 'badge-green' : a.status === 'cancelled' ? 'badge-red' : a.status === 'completed' ? 'badge-blue' : 'badge-blue'}`}>{a.status}</span>
					{a.status === 'confirmed' && (
						<div style={{ display: 'flex', gap: 4 }}>
							<button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleCompleteAppointment(a.id)} title="Mark as completed"><CheckCircle size={12} />Complete</button>
							<button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleCancelAppointment(a.id)} title="Cancel appointment"><X size={12} />Cancel</button>
						</div>
					)}
				</div>
			</li>
		));
	};

	return (
		<div className="container-responsive" style={{ paddingTop: 24, paddingBottom: 24 }}>
			<div style={{ marginBottom: 24 }}>
				<h1 className="page-title">{me ? `Welcome, Dr. ${me.name}` : "Doctor Dashboard"}</h1>
				<p className="page-subtitle">Your schedule and current queue at a glance.</p>
			</div>

			{/* Enhanced Appointments Section with Advanced Management Features */}
			<motion.div layout className="card" style={{ marginBottom: 24 }}>
				<div className="card-header">
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<h2 className="card-title">Appointments Management</h2>
						<CalendarDays size={20} color="#0f766e" />
					</div>
					<button className="btn btn-primary" onClick={handleAddPatient} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						<UserPlus size={16} />
						Add Patient
					</button>
				</div>

				{/* Enhanced Toolbar: search + filters */}
				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '8px 0 12px 0' }}>
					<div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
						<Search size={14} color="#6b7280" />
						<input
							className="input"
							placeholder="Search patient or doctor"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{ width: 220 }}
						/>
					</div>
					<div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
						<button className={`btn ${filter === 'all' ? 'btn-primary btn-pill' : 'btn-outline btn-pill'}`} onClick={() => setFilter('all')}>All</button>
						<button className={`btn ${filter === 'today' ? 'btn-primary btn-pill' : 'btn-outline btn-pill'}`} onClick={() => setFilter('today')}>Today</button>
						<button className={`btn ${filter === 'pending' ? 'btn-primary btn-pill' : 'btn-outline btn-pill'}`} onClick={() => setFilter('pending')}>Pending</button>
						<button className={`btn ${filter === 'completed' ? 'btn-primary btn-pill' : 'btn-outline btn-pill'}`} onClick={() => setFilter('completed')}>Completed</button>
						<button className={`btn ${filter === 'cancelled' ? 'btn-primary btn-pill' : 'btn-outline btn-pill'}`} onClick={() => setFilter('cancelled')}>Cancelled</button>
					</div>
				</div>

				{/* Enhanced Table View */}
				{loading ? (
					<p className="text-muted">Loading...</p>
				) : (
					<div className="table-modern">
						<div className="table-row table-header">
							<div className="table-cell">Patient</div>
							<div className="table-cell">Doctor</div>
							<div className="table-cell">Date</div>
							<div className="table-cell">Time (IST)</div>
							<div className="table-cell">Status</div>
							<div className="table-cell">Waiting</div>
							<div className="table-cell" style={{ textAlign: 'right' }}>Actions</div>
						</div>
						{[...filteredAppointments].sort((a,b) => (a.waitingTime||0) - (b.waitingTime||0)).map((a) => (
							<div key={a._id} className="table-row">
								<div className="table-cell">{a.patientName || 'Patient'}</div>
								<div className="table-cell">{a.doctorName || 'Doctor'}</div>
								<div className="table-cell">{a.date}</div>
								<div className="table-cell">{a.time}</div>
								<div className="table-cell">
									<span className={statusBadgeClass(a.status)}>{a.status}</span>
								</div>
								<div className="table-cell" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
									<Clock size={14} color="#6b7280" /> {a.waitingTime || 0} min
								</div>
								<div className="table-cell" style={{ textAlign: 'right' }}>
									{editingId === a._id ? (
										<div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
											<input 
												className="input" 
												type="number" 
												style={{ width: 80 }} 
												value={editWaiting} 
												onChange={(e) => setEditWaiting(e.target.value)}
											/>
											<button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
											<button className="btn btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
										</div>
									) : (
										<div style={{ display: 'inline-flex', gap: 6 }}>
											<button className="btn btn-outline btn-sm" title="Update waiting time" onClick={() => openEdit(a)}><Pencil size={12} /> Update</button>
											{a.status !== 'completed' && (
												<button className="btn btn-outline btn-sm" title="Complete" onClick={() => completeAppointment(a._id)}>
													<CheckCircle size={12} /> Complete
												</button>
											)}
											{a.status !== 'cancelled' && (
												<button className="btn btn-outline btn-sm" title="Cancel" onClick={() => cancelAppointment(a._id)}>
													<XCircle size={12} /> Cancel
												</button>
											)}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Legacy Tab Navigation for backward compatibility */}
				<div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
					<button className={`btn ${activeTab === 'today' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('today')} style={{ padding: '6px 12px', fontSize: '14px' }}>Today's ({todayAppointments.length})</button>
					<button className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('past')} style={{ padding: '6px 12px', fontSize: '14px' }}><History size={14} />Past ({pastAppointments.length})</button>
					<button className={`btn ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('cancelled')} style={{ padding: '6px 12px', fontSize: '14px' }}><AlertCircle size={14} />Cancelled ({cancelledAppointments.length})</button>
					<button className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('all')} style={{ padding: '6px 12px', fontSize: '14px' }}>All ({allAppointments.length})</button>
				</div>

				{/* Legacy Tab Content for backward compatibility */}
				<ul className="card-list">
					{activeTab === 'today' && renderAppointmentList(todayAppointments, 'No appointments scheduled for today')}
					{activeTab === 'past' && renderAppointmentList(pastAppointments, 'No completed appointments found')}
					{activeTab === 'cancelled' && renderAppointmentList(cancelledAppointments, 'No cancelled appointments found')}
					{activeTab === 'all' && renderAppointmentList(allAppointments, 'No appointments found')}
				</ul>
			</motion.div>

			{/* Current Queue section now shows today's appointments with tokens */}
			<motion.div layout className="card">
				<div className="card-header">
					<h2 className="card-title">Current Queue</h2>
					<ClipboardList size={20} color="#0f766e" />
				</div>
				<ul className="card-list">
					{todayAppointments.length > 0 ? (
						todayAppointments
							.sort((a,b) => (a.token||0) - (b.token||0))
							.map((a) => (
								<li key={a.id} className="list-item">
									<span style={{ fontWeight: 600 }}>{a.patient}</span>
									<span className="badge">Token: {a.token ?? '-'}</span>
								</li>
							))
					) : (
						<li className="list-item"><span className="text-muted">No patients in queue</span></li>
					)}
				</ul>
			</motion.div>

		</div>
	);
}

export default DoctorDashboard;
