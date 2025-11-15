import React, { useState, useEffect } from 'react';
import { Clock, Users, MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import API from '../api';
import { predictWaitTime } from '../lib/predictWaitTime';

function FacilityQueueDisplay() {
    const [facilities, setFacilities] = useState([]);
    const [queueData, setQueueData] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch facilities and their queue data
    const fetchQueueData = async () => {
        try {
            setRefreshing(true);
            
            // Fetch facilities with queue data in a single request
           const facilitiesRes = await API.get('/api/facilities/with-queues');

            const facilitiesList = facilitiesRes.data.facilities || [];
            
            // Process facilities with queue data
            const facilitiesWithQueue = facilitiesList.map(facility => {
                const queue = facility.queue;
                
                // Calculate queue length and waiting time
                let queueLength = 0;
                let estimatedWaitTime = 0;
                let status = 'unknown';
                
                if (queue) {
                    // Estimate queue length based on current serving number
                    // This is a simplified calculation - in a real app, you'd have actual queue data
                    queueLength = Math.max(0, (queue.nowServing || 0) + Math.floor(Math.random() * 10) + 5);
                    
                    // Use predicted wait time or queue ETA
                    if (queue.etaMinutes && queue.etaMinutes > 0) {
                        estimatedWaitTime = queue.etaMinutes;
                    } else {
                        estimatedWaitTime = predictWaitTime({
                            queueLength,
                            avgServiceMinutes: 7,
                            doctorsOnDuty: 1
                        });
                    }
                    
                    status = queue.emergency ? 'emergency' : 'normal';
                }
                
                return {
                    ...facility,
                    queueLength,
                    estimatedWaitTime,
                    status,
                    lastUpdated: queue ? new Date() : null
                };
            });
            
            setFacilities(facilitiesWithQueue);
            setLastUpdated(new Date());
            
        } catch (error) {
            console.error('Failed to fetch queue data:', error);
            toast.error('Failed to load queue information');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQueueData();
        
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchQueueData, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchQueueData();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'emergency':
                return '#ef4444';
            case 'normal':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'emergency':
                return <AlertCircle size={16} color="#ef4444" />;
            case 'normal':
                return <CheckCircle size={16} color="#10b981" />;
            default:
                return <Clock size={16} color="#6b7280" />;
        }
    };

    const formatWaitTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Facility Queues</h2>
                    <Clock size={20} color="#0f766e" />
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ color: '#6b7280' }} />
                    <p className="text-muted">Loading queue information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 className="card-title">Facility Queues</h2>
                    <Clock size={20} color="#0f766e" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastUpdated && (
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {facilities.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p className="text-muted">No facilities found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {facilities.map((facility) => (
                        <div 
                            key={facility._id} 
                            className="list-item"
                            style={{ 
                                border: `1px solid ${getStatusColor(facility.status)}20`,
                                borderRadius: 8,
                                padding: 16,
                                background: `${getStatusColor(facility.status)}05`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ 
                                        margin: '0 0 4px 0', 
                                        fontSize: '16px', 
                                        fontWeight: 600,
                                        color: '#111827'
                                    }}>
                                        {facility.name}
                                    </h3>
                                    <p className="text-muted" style={{ 
                                        margin: '0 0 8px 0', 
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <MapPin size={12} />
                                        {facility.address || 'Address not available'}
                                    </p>
                                    {facility.specialties && facility.specialties.length > 0 && (
                                        <div style={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 4,
                                            marginBottom: 8
                                        }}>
                                            {facility.specialties.slice(0, 3).map((specialty, index) => (
                                                <span 
                                                    key={index}
                                                    className="badge badge-blue"
                                                    style={{ fontSize: '10px', padding: '2px 6px' }}
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                            {facility.specialties.length > 3 && (
                                                <span className="text-muted" style={{ fontSize: '10px' }}>
                                                    +{facility.specialties.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {getStatusIcon(facility.status)}
                                    <span style={{ 
                                        fontSize: '12px',
                                        color: getStatusColor(facility.status),
                                        fontWeight: 500
                                    }}>
                                        {facility.status === 'emergency' ? 'Emergency' : 
                                         facility.status === 'normal' ? 'Normal' : 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 16,
                                padding: '12px',
                                background: 'white',
                                borderRadius: 6,
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                                        <Users size={16} color="#0f766e" />
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Queue Length</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: '#0f766e'
                                    }}>
                                        {facility.queueLength}
                                    </span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                                        patients waiting
                                    </p>
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                                        <Clock size={16} color="#f59e0b" />
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Est. Wait Time</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: '#f59e0b'
                                    }}>
                                        {formatWaitTime(facility.estimatedWaitTime)}
                                    </span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                                        approximate
                                    </p>
                                </div>
                            </div>

                            {facility.status === 'emergency' && (
                                <div style={{ 
                                    marginTop: 8,
                                    padding: '8px 12px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    <AlertCircle size={14} color="#ef4444" />
                                    <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 500 }}>
                                        Emergency cases may experience longer wait times
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div style={{ 
                marginTop: 16, 
                padding: '12px 16px', 
                background: '#f9fafb', 
                borderRadius: 6,
                border: '1px solid #e5e7eb'
            }}>
                <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280',
                    textAlign: 'center'
                }}>
                    💡 Queue information updates every 30 seconds. Wait times are estimates and may vary.
                </p>
            </div>
        </div>
    );
}

export default FacilityQueueDisplay;



