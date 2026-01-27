# Shuffle Practice Mode API Documentation

## Phase 7 Complete: Mixed-Topic Question Shuffle

### 🔐 Authentication
All Shuffle endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Get Shuffle Questions
```
GET /api/shuffle/questions?limit=10
```

**Parameters:**
- `limit` (optional): Number of questions (1-20, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "mistake_id": "uuid",
      "question_text": "What is the derivative of x^2?",
      "source": "mistake",
      "subject_id": "uuid",
      "chapter_id": "uuid",
      "topic_id": "uuid",
      "topic_strength": "Weak"
    },
    {
      "mistake_id": "uuid",
      "question_text": "Solve: dy/dx = 3x^2",
      "source": "self_added",
      "subject_id": "uuid",
      "chapter_id": "uuid",
      "topic_id": "uuid",
      "topic_strength": "Medium"
    }
  ],
  "meta": {
    "requested_limit": "10",
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
  },
  "message": "Shuffle questions retrieved successfully"
}
```

#### Get Shuffle Stats
```
GET /api/shuffle/stats
```

**Response:**
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
  },
  "message": "Shuffle stats retrieved successfully"
}
```

### ⚙️ Priority Distribution Logic

#### Topic Strength Priority
- **Weak Topics**: 60% (highest priority)
- **Medium Topics**: 30% (medium priority)
- **Strong Topics**: 10% (lowest priority)

#### Question Sources
- **Mistake-based**: From `source = "mistake"`
- **Self-added**: From `source = "self_added"`
- **Mixed distribution**: Both sources included automatically

#### Selection Algorithm
1. Group questions by topic strength using TopicHeatMap
2. Apply 60/30/10 priority distribution
3. If insufficient questions in a category, fill from others
4. Randomize final selection order
5. Prevent duplicate mistakes in single response

### 📊 Database Integration

#### Uses Existing Tables
- `mistake_vault_entries`: Question source
- `topic_heatmap`: Strength level lookup

#### Query Optimization
```sql
SELECT m.*, COALESCE(th.strength_level, 'Strong') as topic_strength
FROM mistake_vault_entries m
LEFT JOIN topic_heatmap th ON m.topic_id = th.topic_id
WHERE m.user_id = $1
ORDER BY 
  CASE 
    WHEN th.strength_level = 'Weak' THEN 1
    WHEN th.strength_level = 'Medium' THEN 2
    ELSE 3
  END,
  RANDOM()
```

### 🔒 Security Features
- User-scoped queries (only own mistakes)
- Input validation for limit parameter
- No state storage (fully stateless)
- SQL injection protection

### 📁 File Structure
```
src/
├── services/
│   └── shuffle.service.js       # Question selection logic
├── controllers/
│   └── shuffle.controller.js    # HTTP handlers
├── middleware/
│   └── shuffleValidation.js     # Input validation
└── routes/
    └── shuffle.routes.js         # Route definitions
```

### 🧪 Test Cases Covered
- ✅ User with no mistakes but self_added → returns those
- ✅ User with only mistakes → returns those
- ✅ User with mixed → distribution follows 60/30/10 priority
- ✅ Limit parameter respected (1-20 range)
- ✅ Two consecutive calls give different order
- ✅ Another user cannot access your questions
- ✅ No questions available → empty response
- ✅ Invalid limit → 400 bad request

### 🎯 Performance Features
- **Stateless**: No database writes required
- **Fast**: Single optimized query with ordering
- **Scalable**: Minimal memory footprint
- **Real-time**: No background processing delays

### 🔄 Stateless Design

#### No Persistence
- No session storage
- No question attempt tracking
- No analytics logging
- Fully stateless per request

#### UI Integration
- UI handles correctness tracking
- Mistake questions → send to `/api/redo/attempt`
- Self-added questions → no tracking required
- Shuffle is pure question provider

Shuffle Practice Mode V1 ready with intelligent topic-based question distribution.