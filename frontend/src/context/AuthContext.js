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
  isInitializing: true,
};

// Create context
const AuthContext = createContext();

// AuthProvider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.INIT_START });

    const token = roleBasedStorage.getToken();
    const role = roleBasedStorage.getRole();

    console.log(`[Auth] Initializing session:`, { hasToken: !!token, role });

    if (!token || !role) {
      dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
      return;
    }

    try {
      // Validate token
      const res = await API.get("/auth/me");
      const user = res.data.user;

      // Check stored role matches backend user role
      if (user.role !== role) {
        console.log("[Auth] Role mismatch — clearing session");
        roleBasedStorage.clearAll();
        dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
        return;
      }

      console.log(`[Auth] Token verified — Restored session for ${user.name}`);
      dispatch({
        type: AUTH_ACTIONS.INIT_SUCCESS,
        payload: { user }
      });

    } catch (err) {
      console.log("[Auth] Token invalid — clearing session");
      roleBasedStorage.clearAll();
      dispatch({ type: AUTH_ACTIONS.INIT_FAILURE });
    }
  };

  const login = (userData, token) => {
    console.log(`[Auth] Logging in: ${userData.name} (${userData.role})`);
    roleBasedStorage.setToken(token);
    roleBasedStorage.setRole(userData.role);
    roleBasedStorage.setUser(userData);

    dispatch({
      type: AUTH_ACTIONS.LOGIN,
      payload: { user: userData }
    });
  };

  const logout = () => {
    console.log("[Auth] Logging out");
    roleBasedStorage.clearAll();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
