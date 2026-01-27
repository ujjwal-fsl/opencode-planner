# Topic Heat Map API Documentation

## Phase 5 Complete: Heat Map Strength Calculations

### 🔐 Authentication
All HeatMap endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### 📋 Endpoints

#### Get All Topics Heat Map
```
GET /api/heatmap/topics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "topic_id": "uuid",
      "topic_name": "Laws of Motion",
      "chapter_name": "Mechanics",
      "subject_name": "Physics",
      "strength_level": "Weak",
      "mistake_freq": 6,
      "redo_success_rate": 0.33
    }
  ],
  "message": "Topic heatmap retrieved successfully"
}
```

#### Get Single Topic Heat Map
```
GET /api/heatmap/topic/:topicId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic_id": "uuid",
    "topic_name": "Laws of Motion",
    "chapter_name": "Mechanics", 
    "subject_name": "Physics",
    "mistake_freq": 6,
    "redo_success_rate": 0.33,
    "strength_level": "Weak",
    "last_calculated": "2026-01-26T10:00:00Z"
  },
  "message": "Topic heatmap retrieved successfully"
}
```

#### Manual Update Endpoints (Testing)
```
POST /api/heatmap/update        # Update all users
POST /api/heatmap/update/user   # Update current user only
```

### ⚙️ Strength Level Logic

#### V1 Rules (Hardcoded)
- **Weak (🔴)**: `mistake_freq >= 5` AND `redo_success_rate < 0.4`
- **Medium (🟠)**: `mistake_freq >= 3` AND `redo_success_rate < 0.7`  
- **Strong (🟢)**: Everything else

#### Calculations
```
mistake_freq = COUNT(MistakeVaultEntry) for topic
redo_success_rate = COUNT(is_correct=true) ÷ COUNT(all attempts)
```

### 🔄 Background Job

#### Automatic Updates
- **Schedule**: Every 6 hours (configurable)
- **Process**: 
  1. Aggregate mistake counts per topic
  2. Calculate redo success rates per topic  
  3. Apply strength level rules
  4. Upsert to TopicHeatMap table

#### Manual Triggers
```bash
npm run heatmap:update          # Update all users
curl -X POST /api/heatmap/update/user  # Update current user
```

### 📊 Database Schema

#### TopicHeatMap Table
```sql
CREATE TABLE topic_heatmap (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    mistake_freq INTEGER DEFAULT 0,
    redo_success_rate DECIMAL(3,2) DEFAULT 0.00,
    strength_level VARCHAR(20) NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE
);
```

### 🔒 Security Features
- User-scoped queries (only own heatmap data)
- UUID format validation for topic IDs
- Input sanitization and SQL injection protection
- Cascade deletes maintain data integrity

### 📁 File Structure
```
src/
├── models/
│   └── topicHeatMap.model.js    # HeatMap table operations
├── services/
│   └── heatmap.service.js       # Strength calculation logic
├── controllers/
│   └── heatmap.controller.js    # HTTP handlers
├── routes/
│   └── heatmap.routes.js         # Route definitions
└── jobs/
    └── heatmap.job.js            # Background scheduler
```

### 🧪 Test Cases Covered
- ✅ User with no mistakes → all topics = Strong
- ✅ User with mistakes but no redo attempts → success_rate = 0
- ✅ User sees only their own HeatMap
- ✅ Invalid topicId → 404 not found
- ✅ HeatMap updates after new redo attempts
- ✅ Background job processes all users
- ✅ Manual update triggers work correctly

### 🎯 Performance Optimizations
- Cached results in TopicHeatMap table
- No real-time calculations in UI endpoints
- Efficient aggregation queries
- Background processing for bulk updates

HeatMap V1 ready with strength-based topic analysis.