const pool = require('../config/database');

class MistakeModel {
  static async create(userId, mistakeData) {
    const {
      question_text,
      source,
      mistake_type,
      subject_id,
      chapter_id,
      topic_id,
      notes,
      screenshot_url
    } = mistakeData;

    const query = `
      INSERT INTO mistake_vault_entries (
        user_id, question_text, source, mistake_type, 
        subject_id, chapter_id, topic_id, notes, screenshot_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, question_text, source, mistake_type, 
                subject_id, chapter_id, topic_id, notes, 
                screenshot_url, created_at as saved_at
    `;

    const values = [
      userId,
      question_text,
      source,
      mistake_type,
      subject_id,
      chapter_id,
      topic_id || null,
      notes || null,
      screenshot_url || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT id, question_text, source, mistake_type,
             subject_id, chapter_id, topic_id, notes,
             screenshot_url, created_at as saved_at
      FROM mistake_vault_entries
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async findById(userId, mistakeId) {
    const query = `
      SELECT id, question_text, source, mistake_type,
             subject_id, chapter_id, topic_id, notes,
             screenshot_url, created_at as saved_at
      FROM mistake_vault_entries
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [mistakeId, userId]);
    return result.rows[0];
  }

  static async update(userId, mistakeId, updateData) {
    const {
      question_text,
      source,
      mistake_type,
      subject_id,
      chapter_id,
      topic_id,
      notes,
      screenshot_url
    } = updateData;

    const query = `
      UPDATE mistake_vault_entries
      SET question_text = $1,
          source = $2,
          mistake_type = $3,
          subject_id = $4,
          chapter_id = $5,
          topic_id = $6,
          notes = $7,
          screenshot_url = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING id, question_text, source, mistake_type,
                subject_id, chapter_id, topic_id, notes,
                screenshot_url, created_at as saved_at
    `;

    const values = [
      question_text,
      source,
      mistake_type,
      subject_id,
      chapter_id,
      topic_id || null,
      notes || null,
      screenshot_url || null,
      mistakeId,
      userId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(userId, mistakeId) {
    const query = `
      DELETE FROM mistake_vault_entries
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [mistakeId, userId]);
    return result.rowCount > 0;
  }

  static async countByUserId(userId) {
    const query = `
      SELECT COUNT(*) as total
      FROM mistake_vault_entries
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].total);
  }

  static async exists(userId, mistakeId) {
    const query = `
      SELECT 1
      FROM mistake_vault_entries
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [mistakeId, userId]);
    return result.rows.length > 0;
  }
}

module.exports = MistakeModel;