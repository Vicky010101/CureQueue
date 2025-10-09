import React from 'react';
import { motion } from 'framer-motion';

function AuthLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
      gap: '16px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div 
          className="spinner" 
          style={{ 
            width: 32, 
            height: 32, 
            borderWidth: 3,
            borderColor: '#0f766e',
            borderRightColor: 'transparent'
          }}
        ></div>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: 500
        }}>
          Restoring session...
        </p>
      </motion.div>
    </div>
  );
}

export default AuthLoading;