import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import API from "../api";
import { queueBus } from "../lib/eventBus";
import '../pages/PatientDashboard.css';

function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Fetch doctors with ratings
        const res = await API.get('/doctor/ratings');
        if (!active) return;
        setDoctors((res.data.doctors || []).map(d => ({ 
          id: d._id, 
          name: d.name, 
          specialty: d.email,
          averageRating: d.averageRating,
          totalReviews: d.totalReviews
        })));
      } catch (_) {}
    })();
    return () => { active = false; };
  }, []);
  return doctors;
}

// Helper function to render star rating
function renderStars(rating) {
  if (!rating) return 'No ratings yet';
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>
      {'★'.repeat(fullStars)}
      {hasHalfStar ? '⯨' : ''}
      {'☆'.repeat(emptyStars)}
      <span style={{ color: '#6b7280', marginLeft: '4px' }}>({rating.toFixed(1)})</span>
    </span>
  );
}

function AppointmentBookingForm() {
	const [date, setDate] = useState("");
	const doctors = useDoctors();
	const [doctorId, setDoctorId] = useState("");
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(null);


	const selectedDoctor = useMemo(() => doctors.find(d => d.id === doctorId), [doctorId, doctors]);

	const submit = async (e) => {
		e.preventDefault();
		if (!date) { toast.error("Select date"); return; }
		if (!doctorId) { toast.error("Select a doctor"); return; }
		
		setLoading(true);
		try {
			const res = await API.post('/appointments', { doctorId, date, reason });
			setBookingSuccess({
				token: res.data.appointment.token,
				doctor: selectedDoctor?.name,
				date,
				bookedAtIST: res.data.appointmentTimeIST || res.data.appointment.time,
				status: res.data.appointment.status,
				waitingTime: res.data.waitingTime
			});
			toast.success(`Your appointment has been successfully booked at ${res.data.appointmentTimeIST || res.data.appointment.time} (IST)`);
			
			// Emit event to refresh appointments in other components
			queueBus.emit('appointmentBooked', res.data.appointment);
			
			// Reset form
			setDate("");
			setDoctorId("");
			setReason("");
		} catch (e) {
			console.error('Booking error:', e);
			toast.error('Failed to book appointment');
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setBookingSuccess(null);
		setDate("");
		setDoctorId("");
		setReason("");
	};

	if (bookingSuccess) {
		return (
			<section className="appointment-section">
				<div className="card appointment-card patient-card">
					<div className="card-header patient-card-header">
						<h3 className="card-title patient-card-title">Booking Confirmed!</h3>
						<CheckCircle2 size={20} color="#10b981" />
					</div>
					<div className="patient-booking-success patient-card-body">
						<div className="patient-booking-success-header">
							<CheckCircle2 size={16} color="#10b981" />
							<span className="patient-booking-success-title">Appointment Booked Successfully</span>
						</div>
						<div className="patient-booking-details">
							<div className="patient-booking-detail"><strong>Token:</strong> <span>{bookingSuccess.token}</span></div>
							<div className="patient-booking-detail"><strong>Doctor:</strong> <span>{bookingSuccess.doctor}</span></div>
							<div className="patient-booking-detail"><strong>Date:</strong> <span>{bookingSuccess.date}</span></div>
							<div className="patient-booking-detail"><strong>Booked At (IST):</strong> <span>{bookingSuccess.bookedAtIST}</span></div>
							{typeof bookingSuccess.waitingTime === 'number' && (
								<div className="patient-booking-detail"><strong>Estimated Waiting Time:</strong> <span>{bookingSuccess.waitingTime} minutes</span></div>
							)}
							<div className="patient-booking-detail"><strong>Status:</strong> <span>{bookingSuccess.status}</span></div>
						</div>
						<button 
							className="btn btn-primary patient-btn" 
							onClick={resetForm}
						>
							Book Another Appointment
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="appointment-section">
			<div className="card appointment-card patient-card">
				<div className="card-header patient-card-header">
					<h3 className="card-title patient-card-title">Book Appointment</h3>
					<CalendarDays size={20} color="#0f766e" />
				</div>
				<div className="patient-card-body">
					<form onSubmit={submit} className="form-modern form-compact appointment-form">
						<div className="grid grid-2">
							<div className="form-field">
								<label className="label">Date *</label>
								<input 
									className="input" 
									type="date" 
									value={date} 
									onChange={(e) => setDate(e.target.value)}
									min={new Date().toISOString().split('T')[0]}
									required
								/>
							</div>
							<div className="form-field">
								<label className="label">Doctor *</label>
								<select 
									className="input" 
									value={doctorId} 
									onChange={(e) => setDoctorId(e.target.value)}
									required
								>
									<option value="">Select doctor</option>
									{doctors.map((d) => {
										const fullStars = d.averageRating ? Math.floor(d.averageRating) : 0;
										const hasHalfStar = d.averageRating && (d.averageRating % 1 >= 0.5);
										const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
										const starDisplay = d.averageRating 
											? `${'★'.repeat(fullStars)}${hasHalfStar ? '⯨' : ''}${'☆'.repeat(emptyStars)} (${d.averageRating.toFixed(1)})`
											: 'No ratings yet';
										return (
											<option key={d.id} value={d.id}>
												{d.name} {starDisplay}
											</option>
										);
									})}
								</select>
							</div>
						</div>
						<div className="form-field">
							<label className="label">Reason for Visit</label>
							<textarea 
								className="input" 
								rows={3} 
								placeholder="Brief reason for visit" 
								value={reason} 
								onChange={(e) => setReason(e.target.value)} 
							/>
						</div>
						<button 
							className="btn btn-primary patient-btn" 
							type="submit" 
							disabled={!date || !doctorId || loading}
						>
							{loading ? (
								<>
									<div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
									Booking...
								</>
							) : (
								<>
									<CheckCircle2 size={16} />
									Confirm Booking
								</>
							)}
						</button>
						{selectedDoctor && (
							<div className="selected-doctor-rating">
								<p className="text-muted" style={{ margin: '0 0 8px 0' }}>
									Selected: <strong>{selectedDoctor.name}</strong> — {selectedDoctor.specialty}
								</p>
								<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
									<span className="rating-label">Rating:</span>
									<span className="doctor-rating-stars">
										{renderStars(selectedDoctor.averageRating)}
									</span>
									{selectedDoctor.totalReviews > 0 && (
										<span className="review-count">
											({selectedDoctor.totalReviews} {selectedDoctor.totalReviews === 1 ? 'review' : 'reviews'})
										</span>
									)}
								</div>
							</div>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}

export default AppointmentBookingForm;



