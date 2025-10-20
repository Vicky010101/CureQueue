import React from 'react';
import { roleBasedStorage } from '../utils/roleBasedStorage';

function DashboardIndicator() {
  // Dashboard indicator permanently disabled
  return null;
  
  /* Keeping original code commented out
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
  */
}

export default DashboardIndicator;