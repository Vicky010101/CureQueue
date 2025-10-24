# Manual Review Button Feature

## What Was Added

Added a **"⭐ Review"** button on completed appointments that allows patients to manually submit reviews.

## Changes Made

### PatientDashboard.js

1. **Added `handleReviewClick` function** (line 181-195)
   - Checks if appointment already reviewed
   - Shows info toast if already reviewed
   - Opens review modal for the selected appointment

2. **Added Review Button UI** (line 235-244)
   - Only shows on completed appointments
   - Shows "⭐ Review" if not reviewed
   - Shows "✓ Reviewed" (disabled) if already reviewed
   - Styled with teal theme matching CureQueue design

## How It Works

### User Flow

1. **Patient views completed appointments**
   - Goes to "Completed" tab in My Appointments section
   - Sees completed appointment with "⭐ Review" button

2. **Patient clicks Review button**
   - Review modal opens automatically
   - Shows doctor's name
   - 5-star rating system + optional comment

3. **Patient submits review**
   - Review saved to database
   - Button changes to "✓ Reviewed" (disabled)
   - Can't review same appointment again

### Features

- ✅ **Manual trigger**: Patient controls when to review
- ✅ **Visual feedback**: Button shows review status
- ✅ **Disabled after review**: Can't submit duplicate reviews
- ✅ **Same modal**: Uses existing ReviewModal component
- ✅ **Automatic + Manual**: Works alongside automatic popup

## Dual Review System

Now patients can review appointments in TWO ways:

1. **Automatic Popup** (existing)
   - Appears immediately when doctor completes appointment
   - Patient can review right away

2. **Manual Button** (new)
   - Patient can review later from completed appointments list
   - Useful if patient dismissed automatic popup
   - Always available for completed appointments

## UI Example

```
Completed Appointments:

┌─────────────────────────────────────────────────┐
│ Dr. Smith                          [Completed]  │
│ 2025-10-22 • 10:30                [⭐ Review]  │
│ 📝 General checkup                              │
└─────────────────────────────────────────────────┘

After review submitted:

┌─────────────────────────────────────────────────┐
│ Dr. Smith                          [Completed]  │
│ 2025-10-22 • 10:30                [✓ Reviewed] │
│ 📝 General checkup                              │
└─────────────────────────────────────────────────┘
```

## Notes

- Button only appears on completed appointments
- Clicking "Maybe Later" in popup doesn't mark as reviewed
- Button remains active until review is submitted
- After submission, button is disabled and shows "✓ Reviewed"
- All other appointment functionality unchanged
