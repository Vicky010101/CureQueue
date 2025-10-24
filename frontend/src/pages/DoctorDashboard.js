import React, { useEffect, useState, useMemo } from "react";
import API from "../api";
import { motion } from "framer-motion";
import './DoctorDashboard.css';
import { ClipboardList, CalendarDays, X, User, Clock, FileText, CheckCircle, History, AlertCircle, Pencil, XCircle, Search, UserPlus, Phone, Home } from "lucide-react";
import { toast } from "sonner";
import { queueBus } from "../lib/eventBus";
import HomeVisitRequests from "../components/HomeVisitRequests";

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
	// Offline Patient Form state
	const [showAddForm, setShowAddForm] = useState(false);
	const [offlinePatientForm, setOfflinePatientForm] = useState({
		patientName: '',
		phone: '',
		age: '',
		gender: ''
	});

	// Load all doctor's appointments function
	const loadAllAppointments = async () => {
		try {
			const res = await API.get('/doctor/appointments');
			const appointmentData = res.data.appointments || [];
			console.log('Raw appointment data from backend:', appointmentData);
			
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
				waitingTime: a.waitingTime || 0,
				phone: a.phone || ''
			}));
			console.log('Transformed appointments:', transformedAppointments);
			setAppointments(transformedAppointments);
			
			// Also maintain existing format for compatibility
			const todayLocal = new Date();
			const yyyy = todayLocal.getFullYear();
			const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
			const dd = String(todayLocal.getDate()).padStart(2, '0');
			const todayStr = `${yyyy}-${mm}-${dd}`;
			
			const allAppts = appointmentData.map(a => ({ 
				id: a._id, patient: a.patientName, time: a.time, date: a.date, status: a.status, reason: a.reason, token: a.token, waitingTime: a.waitingTime, phone: a.phone || ''
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
			console.log('Event: handleNewAppointment received:', appointment);
			
			// Check if appointment already exists to prevent duplicates
			const existsInEnhanced = appointments.find(a => a._id === appointment._id);
			if (existsInEnhanced) {
				console.log('Event: Appointment already exists in enhanced state, skipping');
				return;
			}
			
			const todayLocal = new Date();
			const yyyy = todayLocal.getFullYear();
			const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
			const dd = String(todayLocal.getDate()).padStart(2, '0');
			const todayStr = `${yyyy}-${mm}-${dd}`;
			
			if (appointment.date === todayStr) {
				const newAppt = { 
					id: appointment._id, 
					patient: appointment.patientName, 
					time: appointment.time, 
					date: appointment.date, 
					status: appointment.status, 
					reason: appointment.reason, 
					token: appointment.token, 
					waitingTime: appointment.waitingTime 
				};
				
				// Check for duplicates in legacy states too
				setTodayAppointments(prev => {
					if (prev.find(a => a.id === appointment._id)) {
						console.log('Event: Duplicate in today appointments, skipping');
						return prev;
					}
					return [...prev, newAppt];
				});
				
				setAllAppointments(prev => {
					if (prev.find(a => a.id === appointment._id)) {
						console.log('Event: Duplicate in all appointments, skipping');
						return prev;
					}
					return [...prev, newAppt];
				});
				
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
				
				setAppointments(prev => {
					if (prev.find(a => a._id === appointment._id)) {
						console.log('Event: Duplicate in enhanced appointments, skipping');
						return prev;
					}
					return [...prev, enhancedAppt];
				});
				
				console.log('Event: Added new appointment from event:', appointment._id);
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
			// Emit with doctorId for review modal
			queueBus.emit('appointmentUpdated', { 
				_id: id, 
				status: 'completed',
				doctorId: me?.id || me?._id
			});
		} catch (e) {
			console.error('Complete error:', e);
			toast.error('Failed to complete');
		}
	};

	const cancelAppointment = async (id) => {
		// Find the appointment in our current state for validation
		const appointment = appointments.find(a => a._id === id);
		if (!appointment) {
			toast.error('Appointment not found in current data');
			return;
		}

		// Check if appointment can be cancelled
		if (appointment.status === 'cancelled') {
			toast.error('Appointment is already cancelled');
			return;
		}

		if (appointment.status === 'completed') {
			toast.error('Cannot cancel a completed appointment');
			return;
		}

		if (!window.confirm(`Cancel appointment for ${appointment.patientName}?`)) return;

		try {
			console.log('Attempting to cancel appointment:', {
				id,
				patient: appointment.patientName,
				status: appointment.status,
				date: appointment.date,
				time: appointment.time,
				doctorUser: me ? { id: me.id, name: me.name, role: me.role } : 'not loaded'
			});
			console.log('API call URL:', `/appointments/${id}/cancel`);
			
			const response = await API.patch(`/appointments/${id}/cancel`);
			console.log('Cancel response:', response.data);
			
			// Update appointments state
			setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
			// Update legacy state for compatibility
			updateAppointmentStatus(id, 'cancelled');
			toast.success(`Appointment for ${appointment.patientName} cancelled successfully`);
			queueBus.emit('appointmentUpdated', { _id: id, status: 'cancelled' });
		} catch (e) {
			console.error('Cancel error details:', {
				message: e.message,
				response: e.response?.data,
				status: e.response?.status,
				statusText: e.response?.statusText,
				url: e.config?.url,
				headers: e.config?.headers
			});
			const errorMessage = e.response?.data?.msg || `Failed to cancel appointment: ${e.message}`;
			toast.error(errorMessage);
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

	// Offline Patient functions
	const toggleAddForm = () => {
		setShowAddForm(!showAddForm);
		if (showAddForm) {
			// Reset form when closing
			setOfflinePatientForm({
				patientName: '',
				phone: '',
				age: '',
				gender: ''
			});
		}
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setOfflinePatientForm(prev => ({ ...prev, [name]: value }));
	};

	const calculateNextToken = () => {
		const todayAppts = appointments.filter(a => a.date === todayStr && a.status === 'confirmed');
		if (todayAppts.length === 0) return 1;
		const maxToken = Math.max(...todayAppts.map(a => a.token || 0));
		return maxToken + 1;
	};

	const calculateWaitingTime = () => {
		const todayAppts = appointments.filter(a => a.date === todayStr && a.status === 'confirmed');
		return todayAppts.length * 5; // 5 minutes per existing patient
	};

	const submitOfflinePatient = async () => {
		if (!offlinePatientForm.patientName.trim()) {
			toast.error('Patient name is required');
			return;
		}

		try {
			console.log('Submitting offline patient:', offlinePatientForm);
			
			// Create appointment data for offline patient
			const appointmentData = {
				doctorId: me.id,
				date: todayStr,
				reason: `Offline patient${offlinePatientForm.age ? ` - Age: ${offlinePatientForm.age}` : ''}${offlinePatientForm.gender ? `, Gender: ${offlinePatientForm.gender}` : ''}`,
				patientName: offlinePatientForm.patientName.trim(),
				phone: offlinePatientForm.phone || '',
				isOffline: true
			};

			console.log('Sending appointment data:', appointmentData);

			// Call the appointment creation API
			const response = await API.post('/appointments/offline', appointmentData);
			const newAppointment = response.data.appointment;
			
			console.log('Received new appointment from backend:', newAppointment);

			// Check if appointment already exists to prevent duplicates
			const existingAppt = appointments.find(a => a._id === newAppointment._id);
			if (existingAppt) {
				console.log('Appointment already exists, skipping duplicate add');
				return;
			}

			// Create enhanced appointment object using backend response data
			const enhancedAppt = {
				_id: newAppointment._id,
				// Use patientName from backend response, fallback to form data
				patientName: newAppointment.patientName || offlinePatientForm.patientName.trim(),
				doctorName: newAppointment.doctorName || `Dr. ${me.name}`,
				date: newAppointment.date,
				time: newAppointment.time,
				status: newAppointment.status,
				reason: newAppointment.reason,
				token: newAppointment.token,
				waitingTime: newAppointment.waitingTime || 0,
				isOffline: true
			};

			// Create legacy appointment object for backward compatibility
			const legacyAppt = {
				id: newAppointment._id,
				patient: newAppointment.patientName || offlinePatientForm.patientName.trim(),
				time: newAppointment.time,
				date: newAppointment.date,
				status: newAppointment.status,
				reason: newAppointment.reason,
				token: newAppointment.token,
				waitingTime: newAppointment.waitingTime || 0,
				isOffline: true
			};

			console.log('Adding appointment to state:', { enhancedAppt, legacyAppt });

			// Update state arrays with new appointment (DO NOT emit event to prevent duplicates)
			setAppointments(prev => {
				// Double-check for duplicates before adding
				if (prev.find(a => a._id === newAppointment._id)) {
					console.log('Duplicate detected in enhanced appointments, skipping');
					return prev;
				}
				return [...prev, enhancedAppt];
			});
			
			setAllAppointments(prev => {
				if (prev.find(a => a.id === newAppointment._id)) {
					console.log('Duplicate detected in all appointments, skipping');
					return prev;
				}
				return [...prev, legacyAppt];
			});
			
			// Only add to today's appointments if it's for today
			if (newAppointment.date === todayStr) {
				setTodayAppointments(prev => {
					if (prev.find(a => a.id === newAppointment._id)) {
						console.log('Duplicate detected in today appointments, skipping');
						return prev;
					}
					return [...prev, legacyAppt];
				});
			}

			// Store patient name for success message before form reset
			const patientName = offlinePatientForm.patientName.trim();

			// Reset form and hide it
			setOfflinePatientForm({
				patientName: '',
				phone: '',
				age: '',
				gender: ''
			});
			setShowAddForm(false);
			
			toast.success(`Patient ${patientName} added successfully! Token: ${newAppointment.token}`);
			console.log('Offline patient added successfully:', newAppointment._id);

		} catch (error) {
			console.error('Add offline patient error:', error);
			const errorMsg = error.response?.data?.msg || 'Failed to add offline patient';
			toast.error(errorMsg);
		}
	};

	// Legacy functions for compatibility
	const handleCancelAppointment = async (appointmentId) => {
		return cancelAppointment(appointmentId);
	};

	const handleCompleteAppointment = async (appointmentId) => {
		return completeAppointment(appointmentId);
	};

	// Call patient function
	const callPatient = (appointment) => {
		const phoneNumber = appointment.phone || appointment.patientPhone;
		if (phoneNumber) {
			try {
				// Use tel: protocol to trigger phone dialer
				window.location.href = `tel:${phoneNumber}`;
				toast.success(`Calling ${appointment.patientName || 'patient'} at ${phoneNumber}`);
			} catch (error) {
				console.error('Call error:', error);
				toast.error('Unable to initiate call');
			}
		} else {
			toast.warning('Phone number not available for this patient');
		}
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
						<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							{a.phone && (
								<button className="btn btn-call btn-sm doctor-btn-call" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => callPatient(a)} title={`Call ${a.patient || 'patient'}`}><Phone size={12} />Call</button>
							)}
							<button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleCompleteAppointment(a.id)} title="Mark as completed"><CheckCircle size={12} />Complete</button>
							<button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleCancelAppointment(a.id)} title="Cancel appointment"><X size={12} />Cancel</button>
						</div>
					)}
				</div>
			</li>
		));
	};

	return (
		<div className="container-responsive doctor-dashboard-container">
			<div className="doctor-header">
				<h1 className="page-title">{me ? `Welcome, Dr. ${me.name}` : "Doctor Dashboard"}</h1>
				<p className="page-subtitle">Your schedule and current queue at a glance.</p>
			</div>

			{/* Enhanced Appointments Section with Advanced Management Features */}
			<motion.div layout className="card doctor-card">
				<div className="card-header doctor-card-header">
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<h2 className="card-title doctor-card-title">Appointments Management</h2>
						<CalendarDays size={20} color="#007bff" />
					</div>
					<button className="btn btn-primary doctor-btn doctor-btn-primary" onClick={toggleAddForm}>
						<UserPlus size={16} />
						{showAddForm ? 'Cancel' : 'Add Patient'}
					</button>
				</div>

				{/* Inline Add Patient Form */}
				{showAddForm && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="doctor-add-form"
					>
						<h4 className="doctor-form-title">
							Add Offline Patient
						</h4>
						<p className="doctor-form-subtitle">
							This patient is being added offline for in-clinic queue management only.
						</p>

						<div className="doctor-form-grid">
							<div className="form-field doctor-form-field">
								<label className="label doctor-form-label">Patient Name *</label>
								<input
									className="input doctor-form-input"
									name="patientName"
									value={offlinePatientForm.patientName}
									onChange={handleFormChange}
									placeholder="Enter patient name"
									required
								/>
							</div>
							<div className="form-field doctor-form-field">
								<label className="label doctor-form-label">Phone Number</label>
								<input
									className="input doctor-form-input"
									name="phone"
									value={offlinePatientForm.phone}
									onChange={handleFormChange}
									placeholder="Enter phone number"
								/>
							</div>
						</div>

						<div className="doctor-form-grid">
							<div className="form-field doctor-form-field">
								<label className="label doctor-form-label">Age</label>
								<input
									className="input doctor-form-input"
									name="age"
									type="number"
									value={offlinePatientForm.age}
									onChange={handleFormChange}
									placeholder="Age"
								/>
							</div>
							<div className="form-field doctor-form-field">
								<label className="label doctor-form-label">Gender</label>
								<select
									className="input doctor-form-select"
									name="gender"
									value={offlinePatientForm.gender}
									onChange={handleFormChange}
								>
									<option value="">Select Gender</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Other">Other</option>
								</select>
							</div>
						</div>

						<div className="doctor-form-actions">
							<div className="doctor-token-info">
								<strong>Next Token:</strong> #{calculateNextToken()} | <strong>Estimated Wait:</strong> {calculateWaitingTime()} minutes
							</div>
							<div className="doctor-form-buttons">
								<button
									className="btn btn-outline btn-sm doctor-btn doctor-btn-outline"
									onClick={toggleAddForm}
								>
									Cancel
								</button>
								<button
									className="btn btn-primary btn-sm doctor-btn doctor-btn-primary"
									onClick={submitOfflinePatient}
								>
									<UserPlus size={14} />
									Add Patient
								</button>
							</div>
						</div>
					</motion.div>
				)}

				{/* Enhanced Toolbar: search + filters */}
				<div className="doctor-toolbar">
					<div className="doctor-search-group">
						<Search size={14} color="#6b7280" />
						<input
							className="doctor-search-input"
							placeholder="Search patient or doctor"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="doctor-filter-group">
						<button className={`doctor-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
						<button className={`doctor-filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
						<button className={`doctor-filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
						<button className={`doctor-filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
						<button className={`doctor-filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>Cancelled</button>
					</div>
				</div>

				{/* Enhanced Table View */}
				{loading ? (
					<p className="text-muted doctor-loading">Loading...</p>
				) : (
					<div className="table-modern doctor-table">
						<div className="table-row table-header doctor-table-header">
							<div className="table-cell doctor-table-cell">Patient</div>
							<div className="table-cell doctor-table-cell">Doctor</div>
							<div className="table-cell doctor-table-cell">Date</div>
							<div className="table-cell doctor-table-cell">Time (IST)</div>
							<div className="table-cell doctor-table-cell">Status</div>
							<div className="table-cell doctor-table-cell">Waiting</div>
							<div className="table-cell doctor-table-cell" style={{ textAlign: 'right' }}>Actions</div>
						</div>
						{[...filteredAppointments].sort((a,b) => (a.waitingTime||0) - (b.waitingTime||0)).map((a) => (
							<div key={a._id} className="table-row doctor-table-row">
								<div className="table-cell doctor-table-cell">{a.patientName || 'Patient'}</div>
								<div className="table-cell doctor-table-cell">{a.doctorName || 'Doctor'}</div>
								<div className="table-cell doctor-table-cell">{a.date}</div>
								<div className="table-cell doctor-table-cell">{a.time}</div>
								<div className="table-cell doctor-table-cell">
									<span className={`${statusBadgeClass(a.status)} doctor-status-badge doctor-status-${a.status}`}>{a.status}</span>
								</div>
								<div className="table-cell doctor-table-cell doctor-waiting-time">
									<Clock size={14} color="#6b7280" /> {a.waitingTime || 0} min
								</div>
								<div className="table-cell doctor-table-cell" style={{ textAlign: 'right' }}>
									{editingId === a._id ? (
										<div className="doctor-edit-group">
											<input 
												className="input doctor-edit-input" 
												type="number" 
												value={editWaiting} 
												onChange={(e) => setEditWaiting(e.target.value)}
											/>
											<button className="btn btn-primary btn-sm doctor-btn doctor-btn-sm doctor-btn-primary" onClick={saveEdit}>Save</button>
											<button className="btn btn-sm doctor-btn doctor-btn-sm doctor-btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
										</div>
									) : (
										<div className="doctor-table-actions">
											{a.phone && (
												<button className="btn btn-call doctor-btn doctor-btn-sm doctor-btn-call" title={`Call ${a.patientName || 'patient'}`} onClick={() => callPatient(a)}>
													<Phone size={12} />
												</button>
											)}
											<button className="btn btn-outline btn-sm doctor-btn doctor-btn-sm doctor-btn-outline" title="Update waiting time" onClick={() => openEdit(a)}><Pencil size={12} /></button>
											{a.status !== 'completed' && (
												<button className="btn btn-outline btn-sm doctor-btn doctor-btn-sm doctor-btn-outline" title="Complete" onClick={() => completeAppointment(a._id)}>
													<CheckCircle size={12} />
												</button>
											)}
											{a.status !== 'cancelled' && (
												<button className="btn btn-outline btn-sm doctor-btn doctor-btn-sm doctor-btn-danger" title="Cancel" onClick={() => cancelAppointment(a._id)}>
													<XCircle size={12} />
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
				<div className="doctor-tabs">
					<button className={`btn doctor-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Today's ({todayAppointments.length})</button>
					<button className={`btn doctor-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}><History size={14} />Past ({pastAppointments.length})</button>
					<button className={`btn doctor-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}><AlertCircle size={14} />Cancelled ({cancelledAppointments.length})</button>
					<button className={`btn doctor-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({allAppointments.length})</button>
				</div>

				{/* Legacy Tab Content for backward compatibility */}
				<ul className="card-list doctor-appointment-list">
					{activeTab === 'today' && renderAppointmentList(todayAppointments, 'No appointments scheduled for today')}
					{activeTab === 'past' && renderAppointmentList(pastAppointments, 'No completed appointments found')}
					{activeTab === 'cancelled' && renderAppointmentList(cancelledAppointments, 'No cancelled appointments found')}
					{activeTab === 'all' && renderAppointmentList(allAppointments, 'No appointments found')}
				</ul>
			</motion.div>

			{/* Current Queue section now shows today's appointments with tokens */}
			<motion.div layout className="card doctor-card">
				<div className="card-header doctor-card-header">
					<h2 className="card-title doctor-card-title">Current Queue</h2>
					<ClipboardList size={20} color="#007bff" />
				</div>
				<div className="doctor-card-body">
					{todayAppointments.length > 0 ? (
						todayAppointments
							.sort((a,b) => (a.token||0) - (b.token||0))
							.map((a) => (
								<div key={a.id} className="doctor-queue-item">
									<span className="doctor-queue-patient">{a.patient}</span>
									<span className="doctor-queue-token">{a.token ?? '-'}</span>
								</div>
							))
					) : (
						<div className="doctor-empty">No patients in queue</div>
					)}
				</div>
			</motion.div>

			{/* Home Visit Requests Section */}
			{me && (
				<motion.div layout>
					<HomeVisitRequests doctorId={me._id} />
				</motion.div>
			)}

		</div>
	);
}

export default DoctorDashboard;
