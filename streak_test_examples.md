# Streak System API Test Examples

## Test Cases

### 1. Log Activity - First Activity (Streak Starts at 1)
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "redo"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_streak": 1,
    "already_logged_today": false,
    "activity_logged": {
      "activity_type": "redo",
      "activity_date": "2026-01-26"
    }
  },
  "message": "Activity logged successfully"
}
```

### 2. Log Activity - Next Day (Streak Increments)
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "revision"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_streak": 2,
    "already_logged_today": false,
    "activity_logged": {
      "activity_type": "revision",
      "activity_date": "2026-01-27"
    }
  },
  "message": "Activity logged successfully"
}
```

### 3. Log Activity - Skip Day Then Return (Streak Resets)
```bash
# Day 1: Activity
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "shuffle"}'

# Day 2: No activity (streak would be 2)

# Day 3: Activity again (streak resets to 1)
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "redo"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_streak": 1,
    "already_logged_today": false,
    "activity_logged": {
      "activity_type": "redo",
      "activity_date": "2026-01-28"
    }
  },
  "message": "Activity logged successfully"
}
```

### 4. Log Activity - Same Day Multiple Times (Idempotent)
```bash
# First activity today
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "redo"}'

# Second activity same day
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "revision"
  }'
```

**Expected Response (Second call):**
```json
{
  "success": true,
  "data": {
    "current_streak": 5, // Unchanged from first call
    "already_logged_today": true
  },
  "message": "Activity already logged for today"
}
```

### 5. Get Current Streak
```bash
curl -X GET http://localhost:3000/api/streak/current \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
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

### 6. Get Streak Stats
```bash
curl -X GET http://localhost:3000/api/streak/stats \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
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

### 7. Different Activity Types
```bash
# Log redo activity
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "redo"}'

# Log revision activity
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "revision"}'

# Log shuffle activity
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "shuffle"}'
```

### 8. Validation Errors

#### Missing Activity Type
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 - Activity type is required
```

#### Invalid Activity Type
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "invalid"
  }'
# Expected: 400 - Activity type must be one of: redo, revision, shuffle
```

#### Empty Activity Type
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": ""
  }'
# Expected: 400 - Activity type must be one of: redo, revision, shuffle
```

### 9. Security Tests

#### Access Without Token
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "redo"}'
# Expected: 401 - Access token required
```

#### Access With Invalid Token
```bash
curl -X POST http://localhost:3000/api/streak/activity \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "redo"}'
# Expected: 401 - Invalid or expired token
```

#### Get Current Streak Without Token
```bash
curl -X GET http://localhost:3000/api/streak/current
# Expected: 401 - Access token required
```

## Database State Verification

### Check User Streak State
```sql
SELECT 
  id,
  email,
  streak_count,
  last_active_date,
  created_at,
  updated_at
FROM users
WHERE id = 'your-user-id';
```

### Check Streak Log Entries
```sql
SELECT 
  streak_id,
  user_id,
  activity_type,
  activity_date,
  is_active,
  created_at
FROM streak_log
WHERE user_id = 'your-user-id'
ORDER BY activity_date DESC;
```

### Verify Calendar-Based Streak Logic
```sql
-- Check if yesterday had activity
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM streak_log 
      WHERE user_id = 'your-user-id' 
      AND activity_date = CURRENT_DATE - INTERVAL '1 day'
    ) THEN true
    ELSE false
  END as yesterday_had_activity;

-- Check today's activity
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM streak_log 
      WHERE user_id = 'your-user-id' 
      AND activity_date = CURRENT_DATE
    ) THEN true
    ELSE false
  END as today_has_activity;
```

### Verify Streak Calculation
```sql
SELECT 
  u.streak_count as cached_streak,
  u.last_active_date,
  CASE 
    WHEN u.last_active_date IS NULL THEN 0
    WHEN CURRENT_DATE - u.last_active_date > INTERVAL '1 day' THEN 0
    ELSE u.streak_count
  END as calculated_streak
FROM users u
WHERE u.id = 'your-user-id';
```

### Check Activity Type Distribution
```sql
SELECT 
  activity_type,
  COUNT(*) as count,
  MIN(activity_date) as first_activity,
  MAX(activity_date) as last_activity
FROM streak_log
WHERE user_id = 'your-user-id'
GROUP BY activity_type
ORDER BY activity_type;
```