import React, { useEffect, useState } from "react";
import { Home, MapPin, Calendar, User, FileText, CheckCircle, Clock, XCircle, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import API from "../api";
import '../pages/DoctorDashboard.css';

function HomeVisitRequests({ doctorId }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(null);
	const [filter, setFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		fetchRequests();
	}, [doctorId]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			const res = await API.get(`/home-visits/doctor/${doctorId}`);
			setRequests(res.data.requests || []);
		} catch (e) {
			console.error('Error fetching home visit requests:', e);
			toast.error('Failed to load home visit requests');
		} finally {
			setLoading(false);
		}
	};

	const acceptRequest = async (requestId) => {
		try {
			setUpdating(requestId);
			const res = await API.put(`/home-visits/${requestId}/accept`);
			toast.success(res.data.msg || 'Home visit request accepted');
			// Update local state
			setRequests(requests.map(req => 
				req._id === requestId ? { ...req, status: 'Accepted' } : req
			));
		} catch (e) {
			console.error('Error accepting request:', e);
			toast.error(e.response?.data?.msg || 'Failed to accept request');
		} finally {
			setUpdating(null);
		}
	};

	const rejectRequest = async (requestId) => {
		try {
			setUpdating(requestId);
			const res = await API.put(`/home-visits/${requestId}/reject`);
			toast.success(res.data.msg || 'Home visit request rejected');
			// Update local state
			setRequests(requests.map(req => 
				req._id === requestId ? { ...req, status: 'Rejected' } : req
			));
		} catch (e) {
			console.error('Error rejecting request:', e);
			toast.error(e.response?.data?.msg || 'Failed to reject request');
		} finally {
			setUpdating(null);
		}
	};

	const completeVisit = async (requestId) => {
		try {
			setUpdating(requestId);
			const res = await API.put(`/home-visits/${requestId}/complete`);
			toast.success(res.data.msg || 'Home visit marked as completed');
			// Update local state
			setRequests(requests.map(req => 
				req._id === requestId ? { ...req, status: 'Completed' } : req
			));
		} catch (e) {
			console.error('Error completing visit:', e);
			toast.error(e.response?.data?.msg || 'Failed to mark as completed');
		} finally {
			setUpdating(null);
		}
	};

	const openMap = (latitude, longitude) => {
		if (!latitude || !longitude) {
			toast.error('Location not available');
			return;
		}
		const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
		window.open(url, '_blank');
	};

	const callPatient = (request) => {
		const phoneNumber = request.patientId?.phone || request.patientId?.mobile;
		const patientName = request.patientId?.name || 'patient';
		
		if (phoneNumber) {
			try {
				// Use tel: protocol to trigger phone dialer
				window.location.href = `tel:${phoneNumber}`;
				toast.success(`Calling ${patientName} at ${phoneNumber}`);
			} catch (error) {
				console.error('Call error:', error);
				toast.error('Unable to initiate call');
			}
		} else {
			toast.warning(`Phone number not available for ${patientName}`);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-IN', { 
			year: 'numeric', 
			month: '2-digit', 
			day: '2-digit'
		}).split('/').reverse().join('-'); // Returns YYYY-MM-DD format
	};

	const statusBadgeClass = (status) => {
		switch(status) {
			case 'Completed': return 'badge badge-green';
			case 'Accepted': return 'badge badge-blue';
			case 'Rejected': return 'badge badge-red';
			case 'Cancelled': return 'badge badge-gray';
			case 'Pending':
			default: return 'badge badge-yellow';
		}
	};

	// Filter requests based on status filter and search query
	const filteredRequests = requests.filter(request => {
		// Filter by status
		if (filter === 'pending' && request.status !== 'Pending') return false;
		if (filter === 'accepted' && request.status !== 'Accepted') return false;
		if (filter === 'completed' && request.status !== 'Completed') return false;
		if (filter === 'rejected' && request.status !== 'Rejected') return false;
		if (filter === 'cancelled' && request.status !== 'Cancelled') return false;
		
		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const patientName = (request.patientId?.name || '').toLowerCase();
			const address = (request.address || '').toLowerCase();
			const reason = (request.reason || '').toLowerCase();
			return patientName.includes(query) || address.includes(query) || reason.includes(query);
		}
		
		return true;
	});

	if (loading) {
		return (
			<div className="card doctor-card" style={{ marginTop: '24px' }}>
				<div className="card-header doctor-card-header">
					<h2 className="card-title doctor-card-title">Home Visit Requests 🏠</h2>
				</div>
				<div className="doctor-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
					<div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
					<p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading requests...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="card doctor-card" style={{ marginTop: '24px' }}>
			<div className="card-header doctor-card-header">
				<h2 className="card-title doctor-card-title">Home Visit Requests 🏠</h2>
			</div>
			<div className="doctor-card-body">
				{/* Search and Filter Toolbar */}
				<div className="doctor-toolbar">
					<div className="doctor-search-group">
						<Search size={14} color="#6b7280" />
						<input
							className="doctor-search-input"
							placeholder="Search patient, address or reason"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="doctor-filter-group">
						<button className={`doctor-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
						<button className={`doctor-filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
						<button className={`doctor-filter-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>Accepted</button>
						<button className={`doctor-filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
						<button className={`doctor-filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
					</div>
				</div>

				{/* Table View */}
				{filteredRequests.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
						<Home size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
						<p>No home visit requests found</p>
					</div>
				) : (
					<div className="table-modern doctor-table">
						<div className="table-row table-header doctor-table-header">
							<div className="table-cell doctor-table-cell" style={{ width: '50px' }}>#</div>
							<div className="table-cell doctor-table-cell">Patient</div>
							<div className="table-cell doctor-table-cell">Date</div>
							<div className="table-cell doctor-table-cell">Address</div>
							<div className="table-cell doctor-table-cell">Reason</div>
							<div className="table-cell doctor-table-cell">Status</div>
							<div className="table-cell doctor-table-cell" style={{ textAlign: 'right' }}>Actions</div>
						</div>
						{filteredRequests.map((request, index) => (
							<div key={request._id} className="table-row doctor-table-row">
								<div className="table-cell doctor-table-cell" style={{ width: '50px', fontWeight: 600, color: '#6b7280' }}>
									{index + 1}
								</div>
								<div className="table-cell doctor-table-cell">{request.patientId?.name || 'Unknown'}</div>
								<div className="table-cell doctor-table-cell">{formatDate(request.date)}</div>
								<div className="table-cell doctor-table-cell" style={{ maxWidth: '200px' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
										<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{request.address}
										</span>
										{request.location?.latitude && request.location?.longitude && (
											<button
												onClick={() => openMap(request.location.latitude, request.location.longitude)}
												className="btn btn-sm"
												title="View on Map"
												style={{ 
													padding: '2px 6px',
													minWidth: 'auto',
													background: '#f3f4f6',
													border: 'none'
												}}
											>
												<MapPin size={12} color="#0f766e" />
											</button>
										)}
									</div>
								</div>
								<div className="table-cell doctor-table-cell" style={{ maxWidth: '180px' }}>
									<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={request.reason}>
										{request.reason}
									</span>
								</div>
								<div className="table-cell doctor-table-cell">
									<span className={`${statusBadgeClass(request.status)} doctor-status-badge`}>
										{request.status}
									</span>
								</div>
								<div className="table-cell doctor-table-cell" style={{ textAlign: 'right' }}>
									<div className="doctor-table-actions">
										{(request.patientId?.phone || request.patientId?.mobile) && (
											<button 
												className="btn btn-call doctor-btn doctor-btn-sm doctor-btn-call" 
												title={`Call ${request.patientId?.name || 'patient'}`} 
												onClick={() => callPatient(request)}
											>
												<Phone size={12} />
											</button>
										)}
										{request.status === 'Pending' && (
											<>
												<button
													className="btn btn-sm doctor-btn doctor-btn-sm"
													title="Accept"
													onClick={() => acceptRequest(request._id)}
													disabled={updating === request._id}
													style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}
												>
													<CheckCircle size={12} />
												</button>
												<button
													className="btn btn-outline btn-sm doctor-btn doctor-btn-sm doctor-btn-danger"
													title="Reject"
													onClick={() => rejectRequest(request._id)}
													disabled={updating === request._id}
												>
													<XCircle size={12} />
												</button>
											</>
										)}
										{request.status === 'Accepted' && (
											<button
												className="btn btn-outline btn-sm doctor-btn doctor-btn-sm doctor-btn-outline"
												title="Mark Completed"
												onClick={() => completeVisit(request._id)}
												disabled={updating === request._id}
											>
												<CheckCircle size={12} />
											</button>
										)}
										{(request.status === 'Completed' || request.status === 'Rejected' || request.status === 'Cancelled') && (
											<span style={{ fontSize: '0.75rem', color: '#6b7280' }}>-</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default HomeVisitRequests;
