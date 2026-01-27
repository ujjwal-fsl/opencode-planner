const pool = require('../config/database');

class TopicHeatMapModel {
  static async upsert(userId, topicId, mistakeFreq, redoSuccessRate, strengthLevel) {
    const query = `
      INSERT INTO topic_heatmap (user_id, topic_id, mistake_freq, redo_success_rate, strength_level)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, topic_id)
      DO UPDATE SET
        mistake_freq = EXCLUDED.mistake_freq,
        redo_success_rate = EXCLUDED.redo_success_rate,
        strength_level = EXCLUDED.strength_level,
        last_calculated = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, topic_id, mistake_freq, redo_success_rate, strength_level, last_calculated
    `;

    const values = [userId, topicId, mistakeFreq, redoSuccessRate, strengthLevel];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT 
        th.id,
        th.topic_id,
        th.mistake_freq,
        th.redo_success_rate,
        th.strength_level,
        th.last_calculated,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM topic_heatmap th
      JOIN topics t ON th.topic_id = t.id
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE th.user_id = $1
      ORDER BY s.name, c.name, t.name
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByUserIdAndTopicId(userId, topicId) {
    const query = `
      SELECT 
        th.id,
        th.topic_id,
        th.mistake_freq,
        th.redo_success_rate,
        th.strength_level,
        th.last_calculated,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM topic_heatmap th
      JOIN topics t ON th.topic_id = t.id
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE th.user_id = $1 AND th.topic_id = $2
    `;

    const result = await pool.query(query, [userId, topicId]);
    return result.rows[0];
  }

  static async getTopicDetailsWithoutHeatMap(userId, topicId) {
    const query = `
      SELECT 
        t.id as topic_id,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name,
        0 as mistake_freq,
        0.00 as redo_success_rate,
        'Strong' as strength_level
      FROM topics t
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE t.id = $1
    `;

    const result = await pool.query(query, [topicId]);
    return result.rows[0];
  }

  static async getAllTopicsForUser(userId) {
    const query = `
      SELECT DISTINCT
        t.id as topic_id,
        t.name as topic_name,
        c.name as chapter_name,
        s.name as subject_name
      FROM topics t
      JOIN chapters c ON t.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN topic_heatmap th ON t.id = th.topic_id AND th.user_id = $1
      ORDER BY s.name, c.name, t.name
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async deleteByUserId(userId) {
    const query = 'DELETE FROM topic_heatmap WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  static async deleteByTopicId(topicId) {
    const query = 'DELETE FROM topic_heatmap WHERE topic_id = $1';
    const result = await pool.query(query, [topicId]);
    return result.rowCount;
  }

  static async exists(userId, topicId) {
    const query = `
      SELECT 1
      FROM topic_heatmap
      WHERE user_id = $1 AND topic_id = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, topicId]);
    return result.rows.length > 0;
  }
}

module.exports = TopicHeatMapModel;