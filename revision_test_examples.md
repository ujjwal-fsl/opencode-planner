# Spaced Revision System API Test Examples

## Test Cases

### 1. Schedule Revision - Easy Difficulty
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "770e8400-e29b-41d4-a716-446655440011",
    "difficulty": "easy"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "uuid",
    "topic_id": "770e8400-e29b-41d4-a716-446655440011",
    "slot_type": "easy_7d",
    "scheduled_for": "2026-02-02", // +7 days from today
    "completed": false
  }
}
```

### 2. Schedule Revision - Medium Difficulty
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "770e8400-e29b-41d4-a716-446655440017",
    "difficulty": "medium"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "uuid",
    "topic_id": "770e8400-e29b-41d4-a716-446655440017",
    "slot_type": "medium_3d",
    "scheduled_for": "2026-01-29", // +3 days from today
    "completed": false
  }
}
```

### 3. Schedule Revision - Hard Difficulty
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "770e8400-e29b-41d4-a716-446655440001",
    "difficulty": "hard"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "uuid",
    "topic_id": "770e8400-e29b-41d4-a716-446655440001",
    "slot_type": "hard_tom",
    "scheduled_for": "2026-01-27", // +1 day from today
    "completed": false
  }
}
```

### 4. Get Pending Revision Slots
```bash
curl -X GET http://localhost:3000/api/revision/slots \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "revision_id": "uuid",
      "topic_id": "770e8400-e29b-41d4-a716-446655440001",
      "topic_name": "Linear Equations",
      "chapter_name": "Algebra",
      "subject_name": "Mathematics",
      "scheduled_for": "2026-01-27",
      "slot_type": "hard_tom",
      "completed": false
    },
    {
      "revision_id": "uuid",
      "topic_id": "770e8400-e29b-41d4-a716-446655440017",
      "topic_name": "Kinematics",
      "chapter_name": "Mechanics",
      "subject_name": "Physics",
      "scheduled_for": "2026-01-29",
      "slot_type": "medium_3d",
      "completed": false
    }
  ]
}
```

### 5. Get All Revision Slots (Including Completed)
```bash
curl -X GET "http://localhost:3000/api/revision/slots?include=all" \
  -H "Authorization: Bearer <token>"
```

### 6. Complete a Revision
```bash
curl -X POST http://localhost:3000/api/revision/complete/your-revision-id \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "your-revision-id",
    "completed": true,
    "updated_at": "2026-01-26T10:00:00Z"
  },
  "message": "Revision marked as completed"
}
```

### 7. Get Revision Stats
```bash
curl -X GET http://localhost:3000/api/revision/stats \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pending": 2,
    "completed": 8
  }
}
```

### 8. Validation Errors

#### Invalid Topic ID
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "invalid-uuid",
    "difficulty": "easy"
  }'
# Expected: 400 - Topic ID must be a valid UUID
```

#### Invalid Difficulty
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "770e8400-e29b-41d4-a716-446655440001",
    "difficulty": "invalid"
  }'
# Expected: 400 - Difficulty must be one of: easy, medium, hard
```

#### Non-Existent Topic
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "00000000-0000-0000-0000-000000000000",
    "difficulty": "easy"
  }'
# Expected: 404 - Topic not found
```

#### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/revision/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "770e8400-e29b-41d4-a716-446655440001"
  }'
# Expected: 400 - Difficulty is required
```

#### Invalid Revision ID for Completion
```bash
curl -X POST http://localhost:3000/api/revision/complete/invalid-id \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Invalid revision slot ID format
```

#### Complete Another User's Revision
```bash
curl -X POST http://localhost:3000/api/revision/complete/other-user-revision-id \
  -H "Authorization: Bearer <token>"
# Expected: 404 - Revision slot not found (access denied)
```

#### Complete Already Completed Revision
```bash
curl -X POST http://localhost:3000/api/revision/complete/already-completed-id \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Revision already completed
```

## Database State Verification

### Check Revision Slots
```sql
SELECT 
  rs.revision_id,
  rs.topic_id,
  t.name as topic_name,
  rs.slot_type,
  rs.scheduled_for,
  rs.completed,
  rs.created_at
FROM revision_slots rs
JOIN topics t ON rs.topic_id = t.id
WHERE rs.user_id = 'your-user-id'
ORDER BY rs.scheduled_for ASC;
```

### Verify Scheduling Logic
```sql
-- Check if easy revision is scheduled 7 days ahead
SELECT 
  rs.slot_type,
  rs.scheduled_for,
  rs.created_at,
  rs.scheduled_for - rs.created_at::date as days_scheduled
FROM revision_slots rs
WHERE rs.user_id = 'your-user-id' AND rs.slot_type = 'easy_7d';
```

### Check Completed vs Pending Count
```sql
SELECT 
  COUNT(CASE WHEN completed = FALSE THEN 1 END) as pending,
  COUNT(CASE WHEN completed = TRUE THEN 1 END) as completed
FROM revision_slots
WHERE user_id = 'your-user-id';
```