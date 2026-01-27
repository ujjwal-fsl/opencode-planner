# Shuffle Practice Mode API Test Examples

## Test Cases

### 1. Get Shuffle Questions (Default Limit)
```bash
curl -X GET http://localhost:3000/api/shuffle/questions \
  -H "Authorization: Bearer <token>"
```

**Expected Response (10 questions by default):**
```json
{
  "success": true,
  "data": [
    {
      "mistake_id": "uuid",
      "question_text": "What is the derivative of x^2?",
      "source": "mistake",
      "subject_id": "550e8400-e29b-41d4-a716-446655440001",
      "chapter_id": "660e8400-e29b-41d4-a716-446655440003",
      "topic_id": "770e8400-e29b-41d4-a716-446655440010",
      "topic_strength": "Weak"
    }
  ],
  "meta": {
    "requested_limit": null,
    "actual_limit": 10,
    "total_available": 15,
    "distribution": {
      "Weak": 6,
      "Medium": 3,
      "Strong": 1,
      "percentages": {
        "Weak": 60,
        "Medium": 30,
        "Strong": 10
      }
    }
  }
}
```

### 2. Get Shuffle Questions (Custom Limit)
```bash
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=5" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Shuffle Questions (Maximum Limit)
```bash
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=20" \
  -H "Authorization: Bearer <token>"
```

### 4. Get Shuffle Questions (User with Only Mistakes)
```bash
curl -X GET http://localhost:3000/api/shuffle/questions \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "mistake_id": "uuid",
      "question_text": "Failed integration problem",
      "source": "mistake",
      "subject_id": "uuid",
      "chapter_id": "uuid",
      "topic_id": "uuid",
      "topic_strength": "Medium"
    }
  ],
  "meta": {
    "distribution": {
      "Weak": 2,
      "Medium": 1,
      "Strong": 0,
      "percentages": {
        "Weak": 67,
        "Medium": 33,
        "Strong": 0
      }
    }
  }
}
```

### 5. Get Shuffle Questions (User with Only Self-Added)
```bash
curl -X GET http://localhost:3000/api/shuffle/questions \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "mistake_id": "uuid",
      "question_text": "Practice differential equation",
      "source": "self_added",
      "subject_id": "uuid",
      "chapter_id": "uuid",
      "topic_id": "uuid",
      "topic_strength": "Strong"
    }
  ],
  "meta": {
    "distribution": {
      "Weak": 0,
      "Medium": 0,
      "Strong": 1,
      "percentages": {
        "Weak": 0,
        "Medium": 0,
        "Strong": 100
      }
    }
  }
}
```

### 6. Get Shuffle Questions (No Questions Available)
```bash
curl -X GET http://localhost:3000/api/shuffle/questions \
  -H "Authorization: Bearer <new-user-token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [],
  "message": "No questions available for shuffle"
}
```

### 7. Get Shuffle Stats
```bash
curl -X GET http://localhost:3000/api/shuffle/stats \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_questions": 15,
    "mistake_questions": 12,
    "self_added_questions": 3,
    "weak_topics": 8,
    "medium_topics": 4,
    "strong_topics": 3
  }
}
```

### 8. Validation Errors

#### Invalid Limit (Too Low)
```bash
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=0" \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Limit must be at least 1
```

#### Invalid Limit (Too High)
```bash
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=25" \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Limit cannot exceed 20
```

#### Invalid Limit (Not Number)
```bash
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=abc" \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Limit must be a number
```

### 9. Security Tests

#### Access Without Token
```bash
curl -X GET http://localhost:3000/api/shuffle/questions
# Expected: 401 - Access token required
```

#### Access With Invalid Token
```bash
curl -X GET http://localhost:3000/api/shuffle/questions \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 - Invalid or expired token
```

### 10. Randomization Test

#### Test Different Order on Consecutive Calls
```bash
# First call
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=3" \
  -H "Authorization: Bearer <token>" > response1.json

# Second call (should return different order)
curl -X GET "http://localhost:3000/api/shuffle/questions?limit=3" \
  -H "Authorization: Bearer <token>" > response2.json

# Compare results - order should be different
```

## Database State Verification

### Check User's Questions for Shuffle
```sql
SELECT 
  m.id as mistake_id,
  m.question_text,
  m.source,
  m.topic_id,
  COALESCE(th.strength_level, 'Strong') as topic_strength
FROM mistake_vault_entries m
LEFT JOIN topic_heatmap th ON m.topic_id = th.topic_id AND m.user_id = th.user_id
WHERE m.user_id = 'your-user-id'
ORDER BY 
  CASE 
    WHEN COALESCE(th.strength_level, 'Strong') = 'Weak' THEN 1
    WHEN COALESCE(th.strength_level, 'Strong') = 'Medium' THEN 2
    ELSE 3
  END,
  RANDOM()
LIMIT 10;
```

### Verify Source Distribution
```sql
SELECT 
  source,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM mistake_vault_entries
WHERE user_id = 'your-user-id'
GROUP BY source;
```

### Verify Strength Distribution
```sql
SELECT 
  COALESCE(th.strength_level, 'Strong') as strength_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM mistake_vault_entries m
LEFT JOIN topic_heatmap th ON m.topic_id = th.topic_id AND m.user_id = th.user_id
WHERE m.user_id = 'your-user-id'
GROUP BY th.strength_level
ORDER BY 
  CASE 
    WHEN COALESCE(th.strength_level, 'Strong') = 'Weak' THEN 1
    WHEN COALESCE(th.strength_level, 'Strong') = 'Medium' THEN 2
    ELSE 3
  END;
```