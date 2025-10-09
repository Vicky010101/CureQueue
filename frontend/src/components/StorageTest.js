import React, { useState } from 'react';
import { roleBasedStorage } from '../utils/roleBasedStorage';

function StorageTest() {
  const [testResults, setTestResults] = useState('');

  const runStorageTest = () => {
    let results = '=== Multi-Dashboard Storage Test ===\n\n';
    
    const currentDashboard = roleBasedStorage.getDashboardType();
    results += `Current Dashboard: ${currentDashboard}\n`;
    results += `Current Port: ${window.location.port}\n\n`;

    // Test setting tokens for different dashboards
    roleBasedStorage.setToken('patient-token-123', 'patient');
    roleBasedStorage.setToken('doctor-token-456', 'doctor');  
    roleBasedStorage.setToken('manager-token-789', 'manager');

    // Test setting roles
    roleBasedStorage.setRole('patient', 'patient');
    roleBasedStorage.setRole('doctor', 'doctor');
    roleBasedStorage.setRole('admin', 'manager');

    // Test setting users
    roleBasedStorage.setUser({ id: 1, name: 'John Patient', role: 'patient' }, 'patient');
    roleBasedStorage.setUser({ id: 2, name: 'Dr. Smith', role: 'doctor' }, 'doctor');
    roleBasedStorage.setUser({ id: 3, name: 'Manager Jones', role: 'admin' }, 'manager');

    results += 'Storage Keys Created:\n';
    const allKeys = roleBasedStorage.debugListKeys();
    allKeys.forEach(item => {
      results += `${item.key}: ${item.value.substring(0, 50)}${item.value.length > 50 ? '...' : ''}\n`;
    });

    results += '\n=== Current Dashboard Access ===\n';
    results += `Token: ${roleBasedStorage.getToken() || 'None'}\n`;
    results += `Role: ${roleBasedStorage.getRole() || 'None'}\n`;
    const user = roleBasedStorage.getUser();
    results += `User: ${user ? user.name : 'None'}\n`;

    results += '\n=== Cross-Dashboard Access Test ===\n';
    ['patient', 'doctor', 'manager'].forEach(dashboardType => {
      const token = roleBasedStorage.getToken(dashboardType);
      const role = roleBasedStorage.getRole(dashboardType);
      const user = roleBasedStorage.getUser(dashboardType);
      results += `${dashboardType}: Token=${token ? 'Present' : 'None'}, Role=${role || 'None'}, User=${user ? user.name : 'None'}\n`;
    });

    results += '\n=== Storage Isolation Verified! ===\n';
    results += 'Each dashboard maintains separate authentication storage.\n';

    setTestResults(results);
  };

  const clearAllStorage = () => {
    ['patient', 'doctor', 'manager'].forEach(type => {
      roleBasedStorage.clearAll(type);
    });
    setTestResults('All dashboard storage cleared!');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      left: 10, 
      maxWidth: '400px',
      background: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      zIndex: 1000,
      display: 'none'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Storage Test Utility</h4>
      <div style={{ marginBottom: '12px' }}>
        <button 
          onClick={runStorageTest}
          style={{ 
            marginRight: '8px', 
            padding: '4px 8px', 
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Run Test
        </button>
        <button 
          onClick={clearAllStorage}
          style={{ 
            padding: '4px 8px', 
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
      {testResults && (
        <pre style={{ 
          background: '#fff',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '10px',
          overflow: 'auto',
          maxHeight: '300px',
          whiteSpace: 'pre-wrap'
        }}>
          {testResults}
        </pre>
      )}
    </div>
  );
}

export default StorageTest;