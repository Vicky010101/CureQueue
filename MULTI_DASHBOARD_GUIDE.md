# Multi-Dashboard Development Setup

This setup allows you to run three different dashboards simultaneously on different ports, each with isolated authentication:

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

### 2. Start Individual Dashboards

**Patient Dashboard (Port 3000):**
```bash
cd frontend
npm run start:patient
# Opens http://localhost:3000
```

**Doctor Dashboard (Port 3001):**
```bash
cd frontend
npm run start:doctor  
# Opens http://localhost:3001
```

**Manager Dashboard (Port 3002):**
```bash
cd frontend
npm run start:manager
# Opens http://localhost:3002
```

## Authentication Isolation

Each dashboard maintains independent login sessions:

- **Patient Dashboard**: Uses `patient_token`, `patient_role`, `patient_user` in localStorage
- **Doctor Dashboard**: Uses `doctor_token`, `doctor_role`, `doctor_user` in localStorage  
- **Manager Dashboard**: Uses `manager_token`, `manager_role`, `manager_user` in localStorage

## Features

✅ **Independent Sessions**: Log into different roles simultaneously without conflicts
✅ **Role Validation**: Each dashboard validates that users have the correct role
✅ **Port-Based Detection**: Automatically detects dashboard type based on port
✅ **Environment Variables**: Each dashboard has its own environment configuration
✅ **Visual Indicators**: Development mode shows which dashboard is active

## Testing Multi-Dashboard Setup

1. Open three terminal windows
2. Start each dashboard in a separate terminal:
   - Terminal 1: `npm run start:patient`
   - Terminal 2: `npm run start:doctor`
   - Terminal 3: `npm run start:manager`
3. Navigate to each URL and log in with different user accounts
4. Verify that logging into one doesn't affect the others

## Environment Files

- `.env.patient` - Patient dashboard configuration
- `.env.doctor` - Doctor dashboard configuration  
- `.env.manager` - Manager dashboard configuration

## Development Notes

- Dashboard type is detected by port number (3000=patient, 3001=doctor, 3002=manager)
- Each dashboard validates user roles on startup and during navigation
- All dashboards connect to the same backend API (localhost:5000)
- Storage keys are automatically prefixed by dashboard type
- CORS is handled by the existing backend configuration

## Troubleshooting

**Port Already in Use:**
- Kill existing processes: `npx kill-port 3000 3001 3002`
- Or use different ports in the .env files

**Authentication Issues:**
- Clear localStorage for specific dashboard: Open DevTools → Application → Storage → Clear
- Check console logs for authentication flow details

**Role Mismatch:**
- Ensure user accounts have correct roles (patient/doctor/admin)
- Manager dashboard expects users with 'admin' role