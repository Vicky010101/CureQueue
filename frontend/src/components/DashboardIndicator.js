import React from 'react';
import { roleBasedStorage } from '../utils/roleBasedStorage';

function DashboardIndicator() {
  const dashboardType = roleBasedStorage.getDashboardType();
  const port = window.location.port;
  
  const getIndicatorColor = (type) => {
    switch (type) {
      case 'patient':
        return '#3b82f6'; // Blue
      case 'doctor':
        return '#10b981'; // Green
      case 'manager':
        return '#10b981'; // Green (same as doctor)
      default:
        return '#6b7280'; // Gray
    }
  };

  const getDashboardLabel = (type) => {
    switch (type) {
      case 'patient':
        return 'Patient Dashboard';
      case 'doctor':
        return 'Doctor Dashboard';
      case 'manager':
        return 'Doctor Dashboard';
      default:
        return 'Unknown Dashboard';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: getIndicatorColor(dashboardType),
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      userSelect: 'none',
      display: 'none'
    }}>
      {getDashboardLabel(dashboardType)} ::{port}
    </div>
  );
}

export default DashboardIndicator;