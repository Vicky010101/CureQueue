import React, { useEffect, useState } from "react";
import { Home, MapPin, Calendar, User, FileText, CheckCircle, Clock, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import API from "../api";
import ReviewModal from "./ReviewModal";
import '../pages/PatientDashboard.css';

function PatientHomeVisitHistory({ patientId }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [cancelling, setCancelling] = useState(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewRequest, setReviewRequest] = useState(null);
	const [reviewedRequests, setReviewedRequests] = useState(new Set());

	useEffect(() => {
		if (patientId) {
			fetchRequests();
		}
	}, [patientId]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			const res = await API.get(`/api/home-visits/patient/${patientId}`);
			setRequests(res.data.requests || []);
		} catch (e) {
			console.error('Error fetching home visit requests:', e);
			toast.error('Failed to load home visit requests');
		} finally {
			setLoading(false);
		}
	};

	const cancelRequest = async (requestId) => {
		if (!window.confirm('Are you sure you want to cancel this home visit request?')) {
			return;
		}

		try {
			setCancelling(requestId);
			const res = await API.put(`/api/home-visits/${requestId}/cancel`);
			toast.success(res.data.msg || 'Home visit request cancelled');
			// Update local state
			setRequests(requests.map(req => 
				req._id === requestId ? { ...req, status: 'Cancelled' } : req
			));
		} catch (e) {
			console.error('Error cancelling request:', e);
			toast.error(e.response?.data?.msg || 'Failed to cancel request');
		} finally {
			setCancelling(null);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	};

	const getStatusIcon = (status) => {
		switch(status) {
			case 'Completed':
				return <CheckCircle size={20} color="#10b981" />;
			case 'Accepted':
				return <CheckCircle size={20} color="#3b82f6" />;
			case 'Rejected':
				return <XCircle size={20} color="#ef4444" />;
			case 'Cancelled':
				return <XCircle size={20} color="#6b7280" />;
			case 'Pending':
			default:
				return <Clock size={20} color="#f59e0b" />;
		}
	};

	const getStatusColor = (status) => {
		switch(status) {
			case 'Completed': return '#10b981';
			case 'Accepted': return '#3b82f6';
			case 'Rejected': return '#ef4444';
			case 'Cancelled': return '#6b7280';
			case 'Pending':
			default: return '#f59e0b';
		}
	};

	const handleReviewClick = (request) => {
		// Check if already reviewed
		if (reviewedRequests.has(request._id)) {
			toast.info('You have already reviewed this home visit');
			return;
		}

		// Set the request for review and show modal
		setReviewRequest({
			...request,
			doctorId: request.doctorId?._id || request.doctorId,
			doctor: request.doctorId?.name || 'Unknown Doctor'
		});
		setShowReviewModal(true);
	};

	const handleReviewModalClose = (wasSubmitted) => {
		setShowReviewModal(false);
		if (wasSubmitted && reviewRequest) {
			// Mark request as reviewed to prevent showing modal again
			setReviewedRequests(prev => new Set([...prev, reviewRequest._id]));
		}
		setReviewRequest(null);
	};

	if (loading) {
		return (
			<section className="appointment-section">
				<div className="card appointment-card patient-card">
					<div className="card-header patient-card-header">
						<h3 className="card-title patient-card-title">My Home Visit Requests</h3>
						<Home size={20} color="#0f766e" />
					</div>
					<div className="patient-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
						<div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
						<p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading requests...</p>
					</div>
				</div>
			</section>
		);
	}

		return (
			<>
			<section className="appointment-section">
				<div className="card appointment-card patient-card">
					<div className="card-header patient-card-header">
						<h3 className="card-title patient-card-title">My Home Visit Requests</h3>
						<Home size={20} color="#0f766e" />
					</div>
					<div className="patient-card-body">
						{requests.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
								<Home size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
								<p>You haven't submitted any home visit requests yet</p>
							</div>
						) : (
							<div style={{ display: 'grid', gap: '1rem' }}>
								{requests.map((request) => (
								<div 
									key={request._id} 
									className="card"
									style={{ 
										border: '1px solid #e5e7eb', 
										borderRadius: '8px',
										padding: '1rem',
										backgroundColor: request.status === 'Completed' ? '#f0fdf4' 
											: request.status === 'Accepted' ? '#eff6ff'
											: request.status === 'Rejected' ? '#fef2f2'
											: request.status === 'Cancelled' ? '#f9fafb'
											: '#ffffff'
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											{getStatusIcon(request.status)}
											<span style={{ 
												fontWeight: 600, 
												fontSize: '0.875rem',
												color: getStatusColor(request.status)
											}}>
												{request.status}
											</span>
										</div>
										<div style={{ display: 'flex', gap: '8px' }}>
											{(request.status === 'Pending' || request.status === 'Accepted') && (
												<button
													className="btn btn-sm btn-outline"
													onClick={() => cancelRequest(request._id)}
													disabled={cancelling === request._id}
													style={{ 
														padding: '4px 12px', 
														fontSize: '0.875rem',
														color: '#ef4444',
														borderColor: '#ef4444'
													}}
												>
													{cancelling === request._id ? 'Cancelling...' : 'Cancel Request'}
												</button>
											)}
											{request.status === 'Completed' && (
												<button
													className="btn btn-primary btn-sm"
													onClick={() => handleReviewClick(request)}
													disabled={reviewedRequests.has(request._id)}
													style={{ 
														padding: '4px 12px', 
														fontSize: '0.875rem',
														display: 'flex',
														alignItems: 'center',
														gap: '4px'
													}}
												>
													{reviewedRequests.has(request._id) ? (
														<>
															<CheckCircle size={14} />
															Reviewed
														</>
													) : (
														<>
															<Star size={14} />
															Review
														</>
													)}
												</button>
											)}
										</div>
									</div>

									<div style={{ display: 'grid', gap: '0.5rem' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											<User size={16} color="#6b7280" />
											<span style={{ fontSize: '0.875rem' }}>
												<strong>Doctor:</strong> {request.doctorId?.name || 'Unknown'}
											</span>
										</div>

										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											<Calendar size={16} color="#6b7280" />
											<span style={{ fontSize: '0.875rem' }}>
												<strong>Date:</strong> {formatDate(request.date)}
											</span>
										</div>

										<div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
											<MapPin size={16} color="#6b7280" style={{ marginTop: '2px' }} />
											<span style={{ fontSize: '0.875rem' }}>
												<strong>Address:</strong> {request.address}
											</span>
										</div>

										<div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
											<FileText size={16} color="#6b7280" style={{ marginTop: '2px' }} />
											<span style={{ fontSize: '0.875rem' }}>
												<strong>Reason:</strong> {request.reason}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</section>

		{/* Review Modal */}
		<ReviewModal
			isOpen={showReviewModal}
			onClose={handleReviewModalClose}
			appointment={reviewRequest}
			doctorName={reviewRequest?.doctor}
		/>
		</>
	);
}

export default PatientHomeVisitHistory;
