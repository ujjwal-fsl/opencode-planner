# Topic Heat Map API Test Examples

## Test Cases

### 1. Get All Topics Heat Map
```bash
curl -X GET http://localhost:3000/api/heatmap/topics \
  -H "Authorization: Bearer <token>"
```

**Expected Response (User with mistakes):**
```json
{
  "success": true,
  "data": [
    {
      "topic_id": "770e8400-e29b-41d4-a716-446655440011",
      "topic_name": "Integrals",
      "chapter_name": "Calculus",
      "subject_name": "Mathematics",
      "strength_level": "Weak",
      "mistake_freq": 6,
      "redo_success_rate": 0.33
    },
    {
      "topic_id": "770e8400-e29b-41d4-a716-446655440017",
      "topic_name": "Kinematics",
      "chapter_name": "Mechanics", 
      "subject_name": "Physics",
      "strength_level": "Medium",
      "mistake_freq": 3,
      "redo_success_rate": 0.60
    },
    {
      "topic_id": "770e8400-e29b-41d4-a716-446655440001",
      "topic_name": "Linear Equations",
      "chapter_name": "Algebra",
      "subject_name": "Mathematics", 
      "strength_level": "Strong",
      "mistake_freq": 1,
      "redo_success_rate": 0.80
    }
  ]
}
```

### 2. Get All Topics Heat Map (New User)
```bash
curl -X GET http://localhost:3000/api/heatmap/topics \
  -H "Authorization: Bearer <new-user-token>"
```

**Expected Response (No heatmap data yet):**
```json
{
  "success": true,
  "data": [
    {
      "topic_id": "770e8400-e29b-41d4-a716-446655440001",
      "topic_name": "Linear Equations",
      "chapter_name": "Algebra",
      "subject_name": "Mathematics",
      "strength_level": "Strong",
      "mistake_freq": 0,
      "redo_success_rate": 0.00
    }
  ]
}
```

### 3. Get Single Topic Heat Map
```bash
curl -X GET http://localhost:3000/api/heatmap/topic/770e8400-e29b-41d4-a716-446655440011 \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "topic_id": "770e8400-e29b-41d4-a716-446655440011",
    "topic_name": "Integrals",
    "chapter_name": "Calculus",
    "subject_name": "Mathematics",
    "mistake_freq": 6,
    "redo_success_rate": 0.33,
    "strength_level": "Weak",
    "last_calculated": "2026-01-26T10:00:00Z"
  }
}
```

### 4. Invalid Topic ID
```bash
curl -X GET http://localhost:3000/api/heatmap/topic/invalid-uuid \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Invalid topic ID format
```

### 5. Non-Existent Topic
```bash
curl -X GET http://localhost:3000/api/heatmap/topic/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer <token>"
# Expected: 404 - Topic not found
```

### 6. Access Without Token
```bash
curl -X GET http://localhost:3000/api/heatmap/topics
# Expected: 401 - Access token required
```

### 7. Manual HeatMap Update (All Users)
```bash
curl -X POST http://localhost:3000/api/heatmap/update \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "results": [
      {
        "userId": "user-uuid-1",
        "success": true,
        "topicsProcessed": 16
      }
    ]
  },
  "message": "HeatMap update completed successfully"
}
```

### 8. Manual HeatMap Update (Current User)
```bash
curl -X POST http://localhost:3000/api/heatmap/update/user \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "topicsProcessed": 16
  },
  "message": "User HeatMap update completed successfully"
}
```

## Strength Level Verification

### Weak (🔴) Scenario
- Mistakes: 5 or more
- Redo Success Rate: Less than 0.4
- Expected: "Weak"

### Medium (🟠) Scenario  
- Mistakes: 3 or more
- Redo Success Rate: Less than 0.7
- Expected: "Medium"

### Strong (🟢) Scenario
- Everything else
- Expected: "Strong"

## Database State Verification

### Check HeatMap Data
```sql
SELECT * FROM topic_heatmap WHERE user_id = 'your-user-id';
```

### Verify Strength Calculation
```sql
SELECT 
  th.topic_id,
  th.strength_level,
  th.mistake_freq,
  th.redo_success_rate,
  t.name as topic_name
FROM topic_heatmap th
JOIN topics t ON th.topic_id = t.id
WHERE th.user_id = 'your-user-id';
```

### Verify Aggregation Queries
```sql
-- Mistake frequency per topic
SELECT 
  t.id as topic_id,
  COUNT(m.id) as mistake_freq
FROM topics t
LEFT JOIN mistake_vault_entries m ON t.id = m.topic_id AND m.user_id = 'your-user-id'
GROUP BY t.id;

-- Redo success rate per topic
SELECT 
  t.id as topic_id,
  COUNT(ra.id) FILTER (WHERE ra.is_correct = true) * 1.0 / 
  NULLIF(COUNT(ra.id), 0) as redo_success_rate
FROM topics t
LEFT JOIN mistake_vault_entries m ON t.id = m.topic_id AND m.user_id = 'your-user-id'
LEFT JOIN redo_schedule rs ON m.id = rs.mistake_id  
LEFT JOIN redo_attempts ra ON rs.id = ra.redo_id
GROUP BY t.id;
```