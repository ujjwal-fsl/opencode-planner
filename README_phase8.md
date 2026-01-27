# Streak System API Documentation

## Phase 8 Complete: Calendar-Based Daily Activity Tracking

### 🔐 Authentication
All Streak endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Log Activity
```
POST /api/streak/activity
```

**Request Body:**
```json
{
  "activity_type": "redo | revision | shuffle"
}
```

**Response (New Activity):**
```json
{
  "success": true,
  "data": {
    "current_streak": 5,
    "already_logged_today": false,
    "activity_logged": {
      "activity_type": "redo",
      "activity_date": "2026-01-26"
    }
  },
  "message": "Activity logged successfully"
}
```

**Response (Already Logged Today):**
```json
{
  "success": true,
  "data": {
    "current_streak": 5,
    "already_logged_today": true
  },
  "message": "Activity already logged for today"
}
```

#### Get Current Streak
```
GET /api/streak/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_streak": 5,
    "last_active_date": "2026-01-26"
  },
  "message": "Current streak retrieved successfully"
}
```

#### Get Streak Stats
```
GET /api/streak/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_streak": 5,
    "last_active_date": "2026-01-26",
    "total_activities": 42,
    "recent_30_days": [
      {
        "activity_type": "redo",
        "count": 15,
        "active_days": 8
      },
      {
        "activity_type": "revision",
        "count": 12,
        "active_days": 6
      },
      {
        "activity_type": "shuffle",
        "count": 8,
        "active_days": 4
      }
    ],
    "activity_breakdown": {
      "redo": 15,
      "revision": 12,
      "shuffle": 8,
      "total_days": 18
    }
  },
  "message": "Streak stats retrieved successfully"
}
```

### ⚙️ Streak Logic

#### Calendar-Based System
- **Daily logging**: Only one activity per calendar day counts
- **24-hour boundary**: Activities reset at midnight UTC
- **Consecutive days**: Streak continues with activity yesterday
- **Break detection**: Missing a calendar day resets streak to 1

#### Activity Types
- **redo**: User attempts a redo question
- **revision**: User completes a revision slot
- **shuffle**: User starts a shuffle session

#### Streak Calculation
1. Check if activity already logged today
2. If yes: return current streak unchanged
3. If no: check yesterday's activity
4. If yesterday active: increment streak
5. If yesterday inactive: reset streak to 1
6. Log today's activity

### 📊 Database Schema

#### StreakLog Table
```sql
CREATE TABLE streak_log (
    streak_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, activity_date)
);
```

#### Updated User Table
```sql
ALTER TABLE users ADD COLUMN streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_active_date DATE;
```

#### Constraints
- `activity_type IN ('redo', 'revision', 'shuffle')`
- `activity_date <= CURRENT_DATE`
- Unique constraint prevents duplicate daily entries

### 🔒 Security Features
- User-scoped streak tracking
- Activity type validation
- SQL injection protection
- Cascade delete maintains data integrity

### 📁 File Structure
```
src/
├── models/
│   └── streak.model.js          # StreakLog and User operations
├── services/
│   └── streak.service.js        # Calendar-based logic
├── controllers/
│   └── streak.controller.js     # HTTP handlers
├── middleware/
│   └── streakValidation.js      # Input validation
└── routes/
    └── streak.routes.js         # Route definitions
```

### 🧪 Test Cases Covered
- ✅ First activity → streak = 1
- ✅ Activity next day → streak increments
- ✅ Skip a day → streak resets to 1
- ✅ Two activities same day → streak unchanged
- ✅ GET current streak → returns correct value
- ✅ Another user cannot affect your streak
- ✅ Invalid activity type → 400 error
- ✅ Multiple consecutive days build streak
- ✅ Long gap breaks streak completely

### 🔄 Streak Lifecycle Examples

#### Building a Streak
```
Day 1: First activity → streak = 1
Day 2: Activity → streak = 2
Day 3: Activity → streak = 3
Day 4: No activity → streak = 0 (resets next activity)
Day 5: Activity → streak = 1 (restart)
Day 6: Activity → streak = 2
```

#### Idempotent Behavior
```
Day 1: Activity → streak = 1
Day 1: Another activity → streak = 1 (unchanged)
Day 2: Activity → streak = 2
Day 2: Another activity → streak = 2 (unchanged)
```

### 🎯 Integration Points

#### When to Call Streak API
- **Redo Engine**: After successful `/api/redo/attempt`
- **Revision System**: After successful `/api/revision/complete/:slotId`
- **Shuffle Mode**: After `/api/shuffle/questions` call starts

#### Automatic Streak Updates
The UI should automatically call the streak API when users perform meaningful learning actions to keep streak tracking current.

Streak System V1 complete with calendar-based daily activity tracking.