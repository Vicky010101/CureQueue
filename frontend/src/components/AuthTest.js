import React from 'react';
import { useAuth } from '../context/AuthContext';

function AuthTest() {
  const { isAuthenticated, user, isInitializing, login, logout } = useAuth();

  console.log('Auth Test State:', {
    isAuthenticated,
    user,
    isInitializing,
  });

  if (isInitializing) {
    return <div>Initializing authentication...</div>;
  }

  return (
    <div style={{ padding: 20, border: '1px solid #ccc', margin: 20 }}>
      <h3>Authentication Test Component</h3>
      <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      <p><strong>Is Initializing:</strong> {isInitializing ? 'Yes' : 'No'}</p>
      
      <div style={{ marginTop: 10 }}>
        <button onClick={logout} disabled={!isAuthenticated}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AuthTest;