// Role-based storage utility to handle isolated authentication per dashboard type
const DASHBOARD_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  MANAGER: 'manager'
};

// Get the dashboard type from environment variable or URL
const getDashboardType = () => {
  // Try environment variable first
  if (process.env.REACT_APP_DASHBOARD_TYPE) {
    return process.env.REACT_APP_DASHBOARD_TYPE.toLowerCase();
  }
  
  // Fall back to detecting from port or URL
  const port = window.location.port;
  switch (port) {
    case '3000':
      return DASHBOARD_TYPES.PATIENT;
    case '3001':
      return DASHBOARD_TYPES.DOCTOR;
    case '3002':
      return DASHBOARD_TYPES.MANAGER;
    default:
      // Default fallback - could also detect from pathname
      return DASHBOARD_TYPES.PATIENT;
  }
};

// Get storage keys for the current dashboard
const getStorageKeys = (dashboardType = null) => {
  const type = dashboardType || getDashboardType();
  return {
    token: `${type}_token`,
    role: `${type}_role`,
    user: `${type}_user`
  };
};

// Storage operations with role-based keys
export const roleBasedStorage = {
  // Get the current dashboard type
  getDashboardType,
  
  // Get storage keys for current or specified dashboard
  getStorageKeys,
  
  // Token operations
  setToken: (token, dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.setItem(keys.token, token);
  },
  
  getToken: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    return localStorage.getItem(keys.token);
  },
  
  removeToken: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.removeItem(keys.token);
  },
  
  // Role operations
  setRole: (role, dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.setItem(keys.role, role);
  },
  
  getRole: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    return localStorage.getItem(keys.role);
  },
  
  removeRole: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.removeItem(keys.role);
  },
  
  // User data operations
  setUser: (user, dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.setItem(keys.user, JSON.stringify(user));
  },
  
  getUser: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    const userData = localStorage.getItem(keys.user);
    return userData ? JSON.parse(userData) : null;
  },
  
  removeUser: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.removeItem(keys.user);
  },
  
  // Clear all data for current or specified dashboard
  clearAll: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.role);
    localStorage.removeItem(keys.user);
  },
  
  // Utility to check if we have stored data
  hasStoredAuth: (dashboardType = null) => {
    const keys = getStorageKeys(dashboardType);
    return !!(localStorage.getItem(keys.token) && localStorage.getItem(keys.role));
  },
  
  // Debug utility to list all stored keys
  debugListKeys: () => {
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('_token') || key.includes('_role') || key.includes('_user'))) {
        allKeys.push({
          key,
          value: localStorage.getItem(key)
        });
      }
    }
    return allKeys;
  }
};

export { DASHBOARD_TYPES };
export default roleBasedStorage;