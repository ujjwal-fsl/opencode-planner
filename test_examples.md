# API Test Examples for Mistake Vault

## Test Cases

### 1. Create Mistake (source = "mistake")
```bash
curl -X POST http://localhost:3000/api/mistakes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is the integral of 2x?",
    "source": "mistake",
    "mistake_type": "Calculation",
    "subject_id": "550e8400-e29b-41d4-a716-446655440001",
    "chapter_id": "660e8400-e29b-41d4-a716-446655440003",
    "topic_id": "770e8400-e29b-41d4-a716-446655440011",
    "notes": "Forgot constant of integration"
  }'
```

### 2. Create Self-Added Question (source = "self_added")
```bash
curl -X POST http://localhost:3000/api/mistakes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Solve: dy/dx = 3x^2",
    "source": "self_added",
    "subject_id": "550e8400-e29b-41d4-a716-446655440001",
    "chapter_id": "660e8400-e29b-41d4-a716-446655440003",
    "topic_id": "770e8400-e29b-41d4-a716-446655440010",
    "notes": "Practice problem for differentiation"
  }'
```

### 3. Validation Error - Missing mistake_type
```bash
curl -X POST http://localhost:3000/api/mistakes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is 2+2?",
    "source": "mistake",
    "subject_id": "550e8400-e29b-41d4-a716-446655440001",
    "chapter_id": "660e8400-e29b-41d4-a716-446655440001"
  }'
# Expected: 400 - Mistake type is required when source is "mistake"
```

### 4. Validation Error - Self-added with mistake_type
```bash
curl -X POST http://localhost:3000/api/mistakes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Practice problem",
    "source": "self_added",
    "mistake_type": "Concept",
    "subject_id": "550e8400-e29b-41d4-a716-446655440001",
    "chapter_id": "660e8400-e29b-41d4-a716-446655440001"
  }'
# Expected: 400 - Mistake type must be null when source is "self_added"
```

### 5. Get All Mistakes
```bash
curl -X GET "http://localhost:3000/api/mistakes?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

### 6. Get Single Mistake
```bash
curl -X GET http://localhost:3000/api/mistakes/<mistake-id> \
  -H "Authorization: Bearer <token>"
```

### 7. Update Mistake
```bash
curl -X PUT http://localhost:3000/api/mistakes/<mistake-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Updated question text",
    "notes": "Updated notes with better explanation"
  }'
```

### 8. Delete Mistake
```bash
curl -X DELETE http://localhost:3000/api/mistakes/<mistake-id> \
  -H "Authorization: Bearer <token>"
```

### 9. Authorization Error - Access Without Token
```bash
curl -X GET http://localhost:3000/api/mistakes
# Expected: 401 - Access token required
```

### 10. Not Found Error
```bash
curl -X GET http://localhost:3000/api/mistakes/invalid-uuid \
  -H "Authorization: Bearer <token>"
# Expected: 400 - Invalid mistake ID format
```