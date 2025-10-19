# Fix for Offline Patient "Unknown Patient" Issue After Page Refresh

## Problem
When adding offline patients through the "Add Patient" form in DoctorDashboard, the patient name displays correctly immediately after submission, but after page refresh, it shows as "Unknown Patient".

## Root Cause
The backend endpoints `/doctor/appointments` and `/appointments/admin` were not properly handling offline patients. They were only looking for patient names in the `patientId.name` field (for registered users), but offline patients store their names directly in the `patientName` field of the appointment document.

## Solution Applied

### Backend Changes

#### 1. Fixed `/doctor/appointments` endpoint (`backend/routes/doctor.js`)
**Before:**
```javascript
patientName: apt.patientId?.name || 'Unknown Patient',
```

**After:**
```javascript
patientName: apt.isOffline ? apt.patientName : (apt.patientId?.name || 'Unknown Patient'),
doctorName: 'Dr. ' + req.user.name,
isOffline: apt.isOffline || false,
phone: apt.phone || ''
```

#### 2. Fixed `/appointments/admin` endpoint (`backend/routes/appointments.js`)
**Before:**
```javascript
patientName: apt.patientId?.name || 'Unknown Patient',
```

**After:**
```javascript
patientName: apt.isOffline ? apt.patientName : (apt.patientId?.name || 'Unknown Patient'),
isOffline: apt.isOffline || false,
phone: apt.phone || ''
```

### Frontend Changes

#### Added debugging logs (`frontend/src/pages/DoctorDashboard.js`)
- Added console logging to see raw backend data
- Added `isOffline` field to transformed appointments

## How the Fix Works

1. **For Regular (Online) Patients**: 
   - Have a `patientId` that references a User document
   - Patient name comes from `apt.patientId.name`

2. **For Offline Patients**: 
   - Have `isOffline: true`
   - Have NO `patientId` (it's null/undefined)
   - Patient name is stored directly in `apt.patientName`

3. **The Logic**: 
   ```javascript
   patientName: apt.isOffline ? apt.patientName : (apt.patientId?.name || 'Unknown Patient')
   ```
   - If offline → use stored `patientName`
   - If online → use `patientId.name`
   - If neither works → fallback to "Unknown Patient"

## Database Schema Context

The `Appointment` model supports both types:
```javascript
{
  patientId: { type: ObjectId, ref: "User" }, // For registered users
  patientName: { type: String },             // For offline patients
  isOffline: { type: Boolean, default: false }
}
```

## Testing Instructions

### 1. Verify the Fix
1. Add an offline patient using the "Add Patient" form
2. Verify the name appears correctly immediately
3. **Refresh the page**
4. ✅ The patient name should still display correctly (not "Unknown Patient")

### 2. Debug Information
- Open browser console (F12)
- Look for logs: "Raw appointment data from backend" and "Transformed appointments"
- Verify offline appointments have:
  - `isOffline: true`
  - `patientName: "Actual Patient Name"`
  - `patientId: null` or undefined

### 3. Test Both Types
- Add both online patients (through normal booking) and offline patients
- Verify both display correctly after page refresh
- Online patients should show the registered user's name
- Offline patients should show the manually entered name

## Files Modified
1. `backend/routes/doctor.js` - Fixed doctor appointments endpoint
2. `backend/routes/appointments.js` - Fixed admin appointments endpoint  
3. `frontend/src/pages/DoctorDashboard.js` - Added debugging logs

## No Breaking Changes
- All existing functionality remains unchanged
- Email updates, waiting times, and other features work as before
- The fix only affects how patient names are retrieved and displayed