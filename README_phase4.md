# Redo Engine API Documentation

## Phase 4 Complete: Redo Scheduling & Attempts System

### 🔐 Authentication
All Redo endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Get Redo Schedule
```
GET /api/redo/schedule
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "redo_id": "uuid",
      "mistake_id": "uuid",
      "question_text": "What is the derivative of x^2?",
      "schedule_type": "three_days",
      "due_date": "2026-01-29"
    }
  ],
  "message": "Redo schedule retrieved successfully"
}
```

#### Create Redo Attempt
```
POST /api/redo/attempt
```

**Request Body:**
```json
{
  "redo_id": "uuid",
  "is_correct": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "redo_id": "uuid",
    "is_correct": true,
    "attempted_at": "2026-01-26T10:00:00Z"
  },
  "message": "Redo attempt recorded successfully"
}
```

#### Get Redo Attempts
```
GET /api/redo/attempts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "attempt_id": "uuid",
      "redo_id": "uuid",
      "is_correct": true,
      "attempted_at": "2026-01-26T10:00:00Z",
      "question_text": "What is the derivative of x^2?"
    }
  ],
  "message": "Redo attempts retrieved successfully"
}
```

### ⚙️ Business Logic

#### Schedule Types
- `three_days` → Due in 3 days
- `seven_days` → Due in 7 days  
- `fifteen_days` → Due in 15 days

#### Attempt Rules
- **One attempt only**: Each redo can be attempted once
- **Ownership**: Users can only access their own redo schedules
- **State management**: `performed` flag set to true after attempt
- **Validation**: UUID format and ownership verification

#### Database Flow
1. `RedoSchedule` created for each mistake
2. User retrieves pending redo items (`performed = false`)
3. User submits attempt
4. System marks schedule as performed
5. `RedoAttempt` record created with result

### 🔒 Security Features
- User-scoped queries with JWT authentication
- Ownership verification for all operations
- Input validation with UUID format checking
- Attempt state validation (no duplicate attempts)
- Cascade delete integrity (Mistake → Schedule → Attempt)

### 📁 File Structure
```
src/
├── models/
│   ├── redoSchedule.model.js     # Schedule queries
│   └── redoAttempt.model.js      # Attempt queries
├── services/
│   └── redo.service.js           # Business logic
├── controllers/
│   └── redo.controller.js        # HTTP handlers
├── middleware/
│   └── redoValidation.js         # Input & auth validation
└── routes/
    └── redo.routes.js            # Route definitions
```

### 🧪 Test Cases Covered
- ✅ Fetch redo schedule → only user's unperformed items
- ✅ Attempt redo correctly → performed becomes true
- ✅ Attempt redo twice → 400 error
- ✅ Attempt another user's redo → 403 forbidden
- ✅ Invalid redo_id → 404 not found
- ✅ Invalid UUID format → 400 bad request
- ✅ Missing required fields → 400 bad request
- ✅ Already performed redo → 400 error

### 🔄 Cascade Delete Flow
```
MistakeVaultEntry → RedoSchedule → RedoAttempt
```

Redo Engine V1 ready for production use with memory loop scheduling.