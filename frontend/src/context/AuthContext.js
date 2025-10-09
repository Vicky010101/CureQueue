import React, { createContext, useContext, useReducer, useEffect } from 'react';
import API from '../api';
import { roleBasedStorage } from '../utils/roleBasedStorage';

// Auth actions
const AUTH_ACTIONS = {
  INIT_START: 'INIT_START',
  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_FAILURE: 'INIT_FAILURE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.INIT_START:
      return {
        ...state,
        isInitializing: true,
        isAuthenticated: false,
        user: null,
      };
    case AUTH_ACTIONS.INIT_SUCCESS:
      return {
        ...state,
        isInitializing: false,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case AUTH_ACTIONS.INIT_FAILURE:
      return {
        ...state,
        isInitializing: false,
        isAuthenticated: false,
        user: null,
      };
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  isInitializing: true, // Show loading until we verify token
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.INIT_START });

    const token = roleBasedStorage.getToken();
    const role = roleBasedStorage.getRole();
    const dashboardType = roleBasedStorage.getDashboardType();

    console.log(`[Auth] Initializing ${dashboardType} dashboard:`, { hasToken: !!token, role });

    if (!token || !role) {
      console.log(`[Auth] No stored credentials for ${dashboardType} dashboard`);
      dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
      return;
    }

    try {
      // Verify token validity with backend
      const response = await API.get('/auth/me');
      
      // Token is valid, restore user session
      const user = response.data.user;
      
      // Verify that the stored role matches the backend user role
      if (user.role !== role) {
        // Role mismatch, clear storage and logout
        console.log(`[Auth] Role mismatch for ${dashboardType}: stored=${role}, backend=${user.role}`);
        roleBasedStorage.clearAll();
        dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
        return;
      }

      // Also verify that the user role matches the dashboard type (optional strict check)
      const expectedRole = dashboardType === 'manager' ? 'admin' : dashboardType;
      if (user.role !== expectedRole) {
        console.log(`[Auth] User role ${user.role} doesn't match ${dashboardType} dashboard`);
        roleBasedStorage.clearAll();
        dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
        return;
      }

      console.log(`[Auth] Successfully restored ${dashboardType} session for user:`, user.name);
      dispatch({ 
        type: AUTH_ACTIONS.INIT_SUCCESS, 
        payload: { user } 
      });
    } catch (error) {
      console.log(`[Auth] Token validation failed for ${dashboardType}:`, error.response?.status);
      
      // Token is invalid or expired, clear storage
      roleBasedStorage.clearAll();
      dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
    }
  };

  const login = (userData, token) => {
    const dashboardType = roleBasedStorage.getDashboardType();
    console.log(`[Auth] Logging in to ${dashboardType} dashboard:`, userData.name, userData.role);
    
    roleBasedStorage.setToken(token);
    roleBasedStorage.setRole(userData.role);
    roleBasedStorage.setUser(userData);
    
    dispatch({ 
      type: AUTH_ACTIONS.LOGIN, 
      payload: { user: userData } 
    });
  };

  const logout = () => {
    const dashboardType = roleBasedStorage.getDashboardType();
    console.log(`[Auth] Logging out from ${dashboardType} dashboard`);
    
    roleBasedStorage.clearAll();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    login,
    logout,
    initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;