const pool = require('../config/database');

class RevisionSlotModel {
  static async create(userId, topicId, slotType, scheduledFor) {
    const query = `
      INSERT INTO revision_slots (user_id, topic_id, slot_type, scheduled_for)
      VALUES ($1, $2, $3, $4)
      RETURNING revision_id, user_id, topic_id, slot_type, scheduled_for, completed, created_at
    `;

    const values = [userId, topicId, slotType, scheduledFor];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId, includeCompleted = false) {
    let query = `
      SELECT 
        rs.revision_id,
        rs.topic_id,
        rs.slot_type,
        rs.scheduled_for,
        rs.completed,
        rs.created_at,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM revision_slots rs
      JOIN topics t ON rs.topic_id = t.id
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE rs.user_id = $1
    `;

    const queryParams = [userId];

    if (!includeCompleted) {
      query += ' AND rs.completed = FALSE AND rs.scheduled_for <= CURRENT_DATE';
    }

    query += ' ORDER BY rs.scheduled_for ASC';

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  static async findById(userId, revisionId) {
    const query = `
      SELECT 
        rs.revision_id,
        rs.topic_id,
        rs.slot_type,
        rs.scheduled_for,
        rs.completed,
        rs.created_at,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM revision_slots rs
      JOIN topics t ON rs.topic_id = t.id
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE rs.revision_id = $1 AND rs.user_id = $2
    `;

    const result = await pool.query(query, [revisionId, userId]);
    return result.rows[0];
  }

  static async markAsCompleted(userId, revisionId) {
    const query = `
      UPDATE revision_slots
      SET completed = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE revision_id = $1 AND user_id = $2
      RETURNING revision_id, completed, updated_at
    `;

    const result = await pool.query(query, [revisionId, userId]);
    return result.rows[0];
  }

  static async exists(userId, revisionId) {
    const query = `
      SELECT 1
      FROM revision_slots
      WHERE revision_id = $1 AND user_id = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [revisionId, userId]);
    return result.rows.length > 0;
  }

  static async existsForTopicAndDate(userId, topicId, scheduledFor) {
    const query = `
      SELECT 1
      FROM revision_slots
      WHERE user_id = $1 AND topic_id = $2 AND scheduled_for = $3 AND completed = FALSE
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, topicId, scheduledFor]);
    return result.rows.length > 0;
  }

  static async getPendingSlots(userId) {
    const query = `
      SELECT 
        rs.revision_id,
        rs.topic_id,
        rs.slot_type,
        rs.scheduled_for,
        rs.completed,
        rs.created_at,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM revision_slots rs
      JOIN topics t ON rs.topic_id = t.id
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE rs.user_id = $1 AND rs.completed = FALSE AND rs.scheduled_for <= CURRENT_DATE
      ORDER BY rs.scheduled_for ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async deleteByUserId(userId) {
    const query = 'DELETE FROM revision_slots WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  static async deleteByTopicId(topicId) {
    const query = 'DELETE FROM revision_slots WHERE topic_id = $1';
    const result = await pool.query(query, [topicId]);
    return result.rowCount;
  }

  static countPendingByUserId(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM revision_slots
      WHERE user_id = $1 AND completed = FALSE AND scheduled_for <= CURRENT_DATE
    `;

    return pool.query(query, [userId]);
  }

  // Calculate scheduled date based on difficulty
  static calculateScheduledDate(difficulty) {
    const today = new Date();
    let daysToAdd;

    switch (difficulty) {
      case 'easy':
        daysToAdd = 7;
        break;
      case 'medium':
        daysToAdd = 3;
        break;
      case 'hard':
        daysToAdd = 1;
        break;
      default:
        throw new Error('Invalid difficulty level');
    }

    const scheduledDate = new Date(today);
    scheduledDate.setDate(today.getDate() + daysToAdd);
    return scheduledDate.toISOString().split('T')[0];
  }

  // Convert difficulty to slot_type
  static getSlotType(difficulty) {
    const mapping = {
      'easy': 'easy_7d',
      'medium': 'medium_3d',
      'hard': 'hard_tom'
    };

    const slotType = mapping[difficulty];
    if (!slotType) {
      throw new Error('Invalid difficulty level');
    }

    return slotType;
  }
}

module.exports = RevisionSlotModel;