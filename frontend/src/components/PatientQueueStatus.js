import React, { useState, useEffect } from 'react';
import { User, Clock, MapPin, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import API from '../api';

function PatientQueueStatus({ patientId }) {
    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPatientQueueStatus = async () => {
        if (!patientId) return;
        
        try {
            setLoading(true);
            const response = await API.get(`/queue/patient/${patientId}/status`);
            setQueueStatus(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch patient queue status:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to load queue status');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientQueueStatus();
        
        // Set up auto-refresh every 15 seconds for patient's own status
        const interval = setInterval(fetchPatientQueueStatus, 15000);
        
        return () => clearInterval(interval);
    }, [patientId]);

    if (!patientId) {
        return null;
    }

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Your Queue Status</h3>
                    <User size={20} color="#0f766e" />
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="animate-spin" style={{ 
                        width: '24px', 
                        height: '24px', 
                        border: '2px solid #e5e7eb',
                        borderTop: '2px solid #0f766e',
                        borderRadius: '50%',
                        margin: '0 auto 12px auto'
                    }} />
                    <p className="text-muted">Loading your queue status...</p>
                </div>
            </div>
        );
    }

    if (!queueStatus || !queueStatus.inQueue) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Your Queue Status</h3>
                    <User size={20} color="#0f766e" />
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', marginBottom: 16 }} />
                    <p className="text-muted">No appointments in queue for today</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>
                        You're all caught up! 🎉
                    </p>
                </div>
            </div>
        );
    }

    const currentAppointment = queueStatus.appointments[0];
    const queueInfo = queueStatus.queueStatus;

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="card-title">Your Queue Status</h3>
                    <User size={20} color="#0f766e" />
                </div>
                {lastUpdated && (
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>

            <div style={{ padding: '16px' }}>
                {/* Current Appointment Info */}
                <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '16px',
                    marginBottom: '16px'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '16px' }}>
                        Current Appointment
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <MapPin size={14} color="#166534" />
                        <span style={{ fontSize: '14px', color: '#166534' }}>
                            {currentAppointment.doctorName || 'Doctor'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="#166534" />
                        <span style={{ fontSize: '14px', color: '#166534' }}>
                            {currentAppointment.time}
                        </span>
                        {currentAppointment.token && (
                            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                                Token: {currentAppointment.token}
                            </span>
                        )}
                    </div>
                </div>

                {/* Queue Status */}
                {queueInfo && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ 
                            background: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px', 
                            padding: '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                                <Users size={16} color="#0f766e" />
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Your Position</span>
                            </div>
                            <span style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold',
                                color: '#0f766e'
                            }}>
                                {currentAppointment.token || 'N/A'}
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                                in queue
                            </p>
                        </div>

                        <div style={{ 
                            background: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px', 
                            padding: '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                                <Clock size={16} color="#f59e0b" />
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Est. Wait Time</span>
                            </div>
                            <span style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold',
                                color: '#f59e0b'
                            }}>
                                {currentAppointment.waitingTime > 0 ? `${currentAppointment.waitingTime} min` : 'N/A'}
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                                approximate
                            </p>
                        </div>
                    </div>
                )}

                {/* Emergency Notice */}
                {queueInfo?.emergency && (
                    <div style={{ 
                        background: '#fef2f2', 
                        border: '1px solid #fecaca', 
                        borderRadius: '8px', 
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <AlertCircle size={16} color="#ef4444" />
                        <span style={{ fontSize: '12px', color: '#991b1b' }}>
                            Emergency cases are being prioritized. Your wait time may be longer than usual.
                        </span>
                    </div>
                )}

                {/* Status Updates */}
                <div style={{ 
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '12px', 
                        color: '#6b7280',
                        textAlign: 'center'
                    }}>
                        💡 Your queue status updates every 15 seconds. Keep this page open for real-time updates.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PatientQueueStatus;



