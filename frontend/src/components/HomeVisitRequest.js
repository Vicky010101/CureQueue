import React, { useEffect, useMemo, useState } from "react";
import { Home, CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";
import API from "../api";
import '../pages/PatientDashboard.css';

function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
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

function HomeVisitRequest() {
	const [date, setDate] = useState("");
	const doctors = useDoctors();
	const [doctorId, setDoctorId] = useState("");
	const [reason, setReason] = useState("");
	const [address, setAddress] = useState("");
	const [location, setLocation] = useState({ latitude: null, longitude: null });
	const [loading, setLoading] = useState(false);
	const [gettingLocation, setGettingLocation] = useState(false);
	const [requestSuccess, setRequestSuccess] = useState(null);

	const selectedDoctor = useMemo(() => doctors.find(d => d.id === doctorId), [doctorId, doctors]);

	const getLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}

		setGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocation({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});
				toast.success("Location detected successfully");
				setGettingLocation(false);
			},
			(error) => {
				console.error("Error getting location:", error);
				toast.error("Failed to get location. Please enable location services.");
				setGettingLocation(false);
			}
		);
	};

	const submit = async (e) => {
		e.preventDefault();
		if (!date) { toast.error("Select date"); return; }
		if (!doctorId) { toast.error("Select a doctor"); return; }
		if (!address) { toast.error("Enter address"); return; }
		if (!reason) { toast.error("Enter reason for visit"); return; }
		
		setLoading(true);
		try {
			const res = await API.post('/home-visits', { 
				doctorId, 
				date, 
				reason,
				address,
				location
			});
			
			setRequestSuccess({
				doctor: selectedDoctor?.name,
				date,
				address,
				reason,
				status: res.data.request.status
			});
			
			toast.success(res.data.msg || "Home Visit Request Submitted Successfully");
			
			// Reset form
			setDate("");
			setDoctorId("");
			setReason("");
			setAddress("");
			setLocation({ latitude: null, longitude: null });
		} catch (e) {
			console.error('Request error:', e);
			toast.error(e.response?.data?.msg || 'Failed to submit home visit request');
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setRequestSuccess(null);
		setDate("");
		setDoctorId("");
		setReason("");
		setAddress("");
		setLocation({ latitude: null, longitude: null });
	};

	if (requestSuccess) {
		return (
			<section className="appointment-section">
				<div className="card appointment-card patient-card">
					<div className="card-header patient-card-header">
						<h3 className="card-title patient-card-title">Request Confirmed!</h3>
						<CheckCircle2 size={20} color="#10b981" />
					</div>
					<div className="patient-booking-success patient-card-body">
						<div className="patient-booking-success-header">
							<CheckCircle2 size={16} color="#10b981" />
							<span className="patient-booking-success-title">Home Visit Request Submitted Successfully</span>
						</div>
						<div className="patient-booking-details">
							<div className="patient-booking-detail"><strong>Doctor:</strong> <span>{requestSuccess.doctor}</span></div>
							<div className="patient-booking-detail"><strong>Date:</strong> <span>{requestSuccess.date}</span></div>
							<div className="patient-booking-detail"><strong>Address:</strong> <span>{requestSuccess.address}</span></div>
							<div className="patient-booking-detail"><strong>Reason:</strong> <span>{requestSuccess.reason}</span></div>
							<div className="patient-booking-detail"><strong>Status:</strong> <span>{requestSuccess.status}</span></div>
						</div>
						<button 
							className="btn btn-primary patient-btn" 
							onClick={resetForm}
						>
							Submit Another Request
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
					<h3 className="card-title patient-card-title">Doctor Home Visit Request Form</h3>
					<Home size={20} color="#0f766e" />
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
								<label className="label">Select Doctor *</label>
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
							<label className="label">Address *</label>
							<input 
								className="input" 
								type="text" 
								placeholder="Enter your full address" 
								value={address} 
								onChange={(e) => setAddress(e.target.value)}
								required
							/>
						</div>

						<div className="form-field">
							<label className="label">Geolocation</label>
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
								<button 
									type="button"
									className="btn btn-secondary patient-btn" 
									onClick={getLocation}
									disabled={gettingLocation}
									style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}
								>
									<MapPin size={16} />
									{gettingLocation ? "Getting Location..." : "Use My Location"}
								</button>
								{location.latitude && location.longitude && (
									<span style={{ fontSize: '0.875rem', color: '#10b981' }}>
										✓ Location detected ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
									</span>
								)}
							</div>
						</div>

						<div className="form-field">
							<label className="label">Reason for Visit *</label>
							<textarea 
								className="input" 
								rows={3} 
								placeholder="Brief reason for home visit" 
								value={reason} 
								onChange={(e) => setReason(e.target.value)} 
								required
							/>
						</div>

						<button 
							className="btn btn-primary patient-btn" 
							type="submit" 
							disabled={!date || !doctorId || !address || !reason || loading}
						>
							{loading ? (
								<>
									<div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
									Submitting...
								</>
							) : (
								"Submit Request"
							)}
						</button>
					</form>
				</div>
			</div>
		</section>
	);
}

export default HomeVisitRequest;



