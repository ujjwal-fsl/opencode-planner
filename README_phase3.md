# Mistake Vault API Documentation

## Phase 3 Complete: Mistake Vault CRUD System

### 🔐 Authentication
All Mistake Vault endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Create Mistake
```
POST /api/mistakes
```

**Request Body:**
```json
{
  "question_text": "What is the derivative of x^2?",
  "source": "mistake",
  "mistake_type": "Calculation",
  "subject_id": "uuid",
  "chapter_id": "uuid",
  "topic_id": "uuid",
  "notes": "Forgot the power rule",
  "screenshot_url": "https://example.com/screenshot.png"
}
```

#### Get All Mistakes
```
GET /api/mistakes?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mistakes": [
      {
        "id": "uuid",
        "question_text": "...",
        "source": "mistake",
        "mistake_type": "Calculation",
        "subject_id": "uuid",
        "chapter_id": "uuid",
        "topic_id": "uuid",
        "notes": "...",
        "screenshot_url": "...",
        "saved_at": "2024-01-26T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Get Single Mistake
```
GET /api/mistakes/:id
```

#### Update Mistake
```
PUT /api/mistakes/:id
```

#### Delete Mistake
```
DELETE /api/mistakes/:id
```

### ✅ Validation Rules

#### Required Fields:
- `question_text` (string, max 10,000 chars)
- `source` (enum: "mistake" | "self_added")
- `subject_id` (UUID)
- `chapter_id` (UUID)

#### Optional Fields:
- `topic_id` (UUID, nullable)
- `notes` (string, max 2,000 chars, nullable)
- `screenshot_url` (URL, nullable)

#### Source/Mistake Type Logic:
- `source = "mistake"` → `mistake_type` required (enum: "Concept" | "Calculation" | "Misread" | "Trap")
- `source = "self_added"` → `mistake_type` must be `null`

### 🔒 Security Features
- User-scoped queries (only own mistakes accessible)
- Input validation with detailed error messages
- UUID format validation for IDs
- SQL injection protection
- Ownership verification for update/delete

### 📁 File Structure
```
src/
├── models/
│   └── mistake.model.js      # Database queries
├── services/
│   └── mistake.service.js    # Business logic
├── controllers/
│   └── mistake.controller.js # HTTP handlers
├── middleware/
│   └── mistakeValidation.js  # Input validation
├── routes/
│   └── mistake.routes.js     # Route definitions
```

### 🧪 Test Cases Covered
- ✅ Create mistake with source="mistake" → mistake_type required
- ✅ Create self-added question → mistake_type must be null
- ✅ Update another user's mistake → 403 forbidden
- ✅ Missing required fields → 400 bad request
- ✅ Invalid enum values → 400 bad request
- ✅ Invalid UUID format → 400 bad request
- ✅ Pagination with limit/offset
- ✅ Ownership verification on all operations

Rock-solid Mistake Vault implementation ready for production.