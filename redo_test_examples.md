# Redo Engine API Test Examples

## Test Cases

### 1. Get Redo Schedule
```bash
curl -X GET http://localhost:3000/api/redo/schedule \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "redo_id": "uuid",
      "mistake_id": "uuid", 
      "question_text": "What is the integral of 2x?",
      "schedule_type": "three_days",
      "due_date": "2026-01-29"
    }
  ]
}
```

### 2. Create Redo Attempt (Correct)
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "your-redo-id",
    "is_correct": true
  }'
```

### 3. Create Redo Attempt (Incorrect)
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "your-redo-id",
    "is_correct": false
  }'
```

### 4. Attempt Already Performed Redo
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "already-attempted-redo-id",
    "is_correct": true
  }'
# Expected: 400 - Redo has already been performed
```

### 5. Attempt Another User's Redo
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "other-user-redo-id",
    "is_correct": true
  }'
# Expected: 403 - Access denied: redo does not belong to this user
```

### 6. Invalid Redo ID
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "invalid-uuid",
    "is_correct": true
  }'
# Expected: 400 - Invalid redo ID format
```

### 7. Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_correct": true
  }'
# Expected: 400 - Redo ID is required
```

### 8. Non-Existent Redo ID
```bash
curl -X POST http://localhost:3000/api/redo/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "redo_id": "00000000-0000-0000-0000-000000000000",
    "is_correct": true
  }'
# Expected: 404 - Redo schedule not found
```

### 9. Get Redo Attempts History
```bash
curl -X GET http://localhost:3000/api/redo/attempts \
  -H "Authorization: Bearer <token>"
```

### 10. Access Without Token
```bash
curl -X GET http://localhost:3000/api/redo/schedule
# Expected: 401 - Access token required
```

## Database State Verification

### Check Redo Schedule After Attempt
```sql
SELECT * FROM redo_schedule WHERE id = 'your-redo-id';
-- performed should be true
```

### Check Redo Attempt Record
```sql
SELECT * FROM redo_attempts WHERE redo_id = 'your-redo-id';
-- Should have exactly one record with correct timestamp
```

### Verify User Scoping
```sql
SELECT rs.*, m.user_id 
FROM redo_schedule rs
JOIN mistake_vault_entries m ON rs.mistake_id = m.id
WHERE m.user_id = 'your-user-id';
-- Should only return user's redo schedules
```