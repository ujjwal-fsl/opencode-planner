# Spaced Revision System API Documentation

## Phase 6 Complete: Passive Revision Scheduling

### 🔐 Authentication
All Revision endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Schedule Revision
```
POST /api/revision/schedule
```

**Request Body:**
```json
{
  "topic_id": "uuid",
  "difficulty": "easy | medium | hard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "uuid",
    "user_id": "uuid",
    "topic_id": "uuid",
    "slot_type": "easy_7d",
    "scheduled_for": "2026-02-02",
    "completed": false,
    "created_at": "2026-01-26T10:00:00Z"
  },
  "message": "Revision scheduled successfully"
}
```

#### Get Revision Slots
```
GET /api/revision/slots?include=all
```

**Response (Default - Pending Only):**
```json
{
  "success": true,
  "data": [
    {
      "revision_id": "uuid",
      "topic_id": "uuid",
      "topic_name": "Thermodynamics",
      "chapter_name": "Thermodynamics",
      "subject_name": "Physics",
      "scheduled_for": "2026-01-27",
      "slot_type": "medium_3d",
      "completed": false
    }
  ],
  "message": "Revision slots retrieved successfully"
}
```

#### Get Pending Slots Only
```
GET /api/revision/slots/pending
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "revision_id": "uuid",
      "topic_id": "uuid",
      "topic_name": "Kinematics",
      "scheduled_for": "2026-01-27",
      "slot_type": "hard_tom"
    }
  ],
  "message": "Pending revision slots retrieved successfully"
}
```

#### Complete Revision
```
POST /api/revision/complete/:slotId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revision_id": "uuid",
    "completed": true,
    "updated_at": "2026-01-26T10:00:00Z"
  },
  "message": "Revision marked as completed"
}
```

#### Get Revision Stats
```
GET /api/revision/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 3,
    "completed": 12
  },
  "message": "Revision stats retrieved successfully"
}
```

### ⚙️ Scheduling Rules

#### Difficulty to Slot Type Mapping
- **easy** → `easy_7d` (7 days from today)
- **medium** → `medium_3d` (3 days from today)
- **hard** → `hard_tom` (tomorrow)

#### Slot Behavior
- **Write-once**: Slots can only be marked as completed
- **No auto-scheduling**: User must explicitly schedule new revisions
- **Duplicate prevention**: No two pending slots for same topic/date
- **Passive system**: Only acts when triggered by user

### 📊 Database Schema

#### RevisionSlot Table
```sql
CREATE TABLE revision_slots (
    revision_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    slot_type VARCHAR(20) NOT NULL,
    scheduled_for DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

#### Constraints
- `slot_type IN ('easy_7d', 'medium_3d', 'hard_tom')`
- `scheduled_for >= CURRENT_DATE`
- Unique constraint on `(user_id, topic_id, scheduled_for)` where `completed = FALSE`

### 🔒 Security Features
- User-scoped queries (only own revision slots)
- UUID format validation for IDs
- Ownership verification for completion actions
- SQL injection protection

### 📁 File Structure
```
src/
├── models/
│   └── revisionSlot.model.js     # Revision slot operations
├── services/
│   └── revision.service.js       # Scheduling logic
├── controllers/
│   └── revision.controller.js    # HTTP handlers
├── middleware/
│   └── revisionValidation.js      # Input validation
└── routes/
    └── revision.routes.js        # Route definitions
```

### 🧪 Test Cases Covered
- ✅ Schedule revision: easy → +7 days
- ✅ Schedule revision: medium → +3 days
- ✅ Schedule revision: hard → +1 day
- ✅ Fetch pending slots only (exclude completed)
- ✅ Complete a slot → disappears from pending list
- ✅ Try completing another user's slot → 403 forbidden
- ✅ Invalid topic_id → 404 not found
- ✅ Invalid difficulty → 400 bad request
- ✅ Duplicate scheduling prevention
- ✅ Revision stats calculation

### 🔄 System Behavior

#### Revision Lifecycle
1. User studies a topic → triggers scheduling
2. System creates revision slot with calculated due date
3. User views pending revisions on dashboard
4. User completes revision when ready
5. Slot marked as completed (no automatic rescheduling)
6. User can schedule new revision after studying again

#### Passive Design
- No background jobs required
- No automatic rescheduling
- User-controlled scheduling and completion
- Simple, predictable behavior

Spaced Revision V1 ready with user-controlled scheduling.