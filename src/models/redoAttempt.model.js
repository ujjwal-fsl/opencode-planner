const pool = require('../config/database');

class RedoAttemptModel {
  static async create(redoId, isCorrect) {
    const query = `
      INSERT INTO redo_attempts (redo_id, is_correct, attempted_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id as attempt_id, redo_id, is_correct, attempted_at
    `;

    const result = await pool.query(query, [redoId, isCorrect]);
    return result.rows[0];
  }

  static findByRedoId(redoId) {
    const query = `
      SELECT id as attempt_id, redo_id, is_correct, attempted_at
      FROM redo_attempts
      WHERE redo_id = $1
      ORDER BY attempted_at DESC
    `;

    return pool.query(query, [redoId]);
  }

  static findByUserId(userId) {
    const query = `
      SELECT 
        ra.id as attempt_id,
        ra.redo_id,
        ra.is_correct,
        ra.attempted_at,
        m.question_text
      FROM redo_attempts ra
      JOIN redo_schedule rs ON ra.redo_id = rs.id
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE m.user_id = $1
      ORDER BY ra.attempted_at DESC
    `;

    return pool.query(query, [userId]);
  }

  static exists(redoId) {
    const query = `
      SELECT 1
      FROM redo_attempts
      WHERE redo_id = $1
      LIMIT 1
    `;

    return pool.query(query, [redoId]);
  }

  static countByRedoId(redoId) {
    const query = `
      SELECT COUNT(*) as count
      FROM redo_attempts
      WHERE redo_id = $1
    `;

    return pool.query(query, [redoId]);
  }

  static countByUser(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM redo_attempts ra
      JOIN redo_schedule rs ON ra.redo_id = rs.id
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE m.user_id = $1
    `;

    return pool.query(query, [userId]);
  }

  static hasAttempted(redoId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM redo_attempts WHERE redo_id = $1
      ) as attempted
    `;

    const result = pool.query(query, [redoId]);
    return result;
  }
}

module.exports = RedoAttemptModel;