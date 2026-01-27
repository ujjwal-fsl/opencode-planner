// API Routes Structure
// Updated with naming consistency and endpoint refinements

const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: 'POST /api/auth/register',
    LOGIN: 'POST /api/auth/login',
    LOGOUT: 'POST /api/auth/logout',
  },

  // Mistake Vault
  MISTAKES: {
    LIST: 'GET /api/mistakes',
    CREATE: 'POST /api/mistakes',
    UPDATE: 'PUT /api/mistakes/:id',
    DELETE: 'DELETE /api/mistakes/:id',
  },

  // Redo
  REDO: {
    SCHEDULE: 'GET /api/redo/schedule',
    ATTEMPT: 'POST /api/redo/attempt',  // Changed from POST /api/redo/:mistakeId/attempt
  },

  // Revision
  REVISION: {
    SLOTS: 'GET /api/revision/slots',
    COMPLETE: 'POST /api/revision/complete/:slotId',
    SCHEDULE: 'POST /api/revision/schedule',
  },

  // Heat Map
  HEATMAP: {
    TOPICS: 'GET /api/heatmap/topics',
    TOPIC_DETAIL: 'GET /api/heatmap/topic/:topicId',
  },

  // Shuffle
  SHUFFLE: {
    QUESTIONS: 'GET /api/shuffle/questions',  // Removed attempt endpoint
  },

  // Streak
  STREAK: {
    CURRENT: 'GET /api/streak/current',
    ACTIVITY: 'POST /api/streak/activity',
  },
};

// RedoAttempt payload structure
const REDO_ATTEMPT_PAYLOAD = {
  redo_id: "uuid",  // References redo_id instead of mistakeId in URL
  is_correct: true
};

module.exports = { API_ROUTES, REDO_ATTEMPT_PAYLOAD };