const pool = require('../config/database');

class RedoScheduleModel {
  static async create(mistakeId, scheduleType) {
    const dueDate = this.calculateDueDate(scheduleType);
    
    const query = `
      INSERT INTO redo_schedule (mistake_id, schedule_type, due_date, performed)
      VALUES ($1, $2, $3, false)
      RETURNING id as redo_id, mistake_id, schedule_type, due_date, performed
    `;

    const result = await pool.query(query, [mistakeId, scheduleType, dueDate]);
    return result.rows[0];
  }

  static findByUserId(userId) {
    const query = `
      SELECT 
        rs.id as redo_id,
        rs.mistake_id,
        rs.schedule_type,
        rs.due_date,
        rs.performed,
        m.question_text
      FROM redo_schedule rs
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE m.user_id = $1 AND rs.performed = false
      ORDER BY rs.due_date ASC
    `;

    return pool.query(query, [userId]);
  }

  static findById(redoId) {
    const query = `
      SELECT 
        rs.id as redo_id,
        rs.mistake_id,
        rs.schedule_type,
        rs.due_date,
        rs.performed,
        m.user_id,
        m.question_text
      FROM redo_schedule rs
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE rs.id = $1
    `;

    return pool.query(query, [redoId]);
  }

  static findByIdAndUser(userId, redoId) {
    const query = `
      SELECT 
        rs.id as redo_id,
        rs.mistake_id,
        rs.schedule_type,
        rs.due_date,
        rs.performed,
        m.question_text
      FROM redo_schedule rs
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE rs.id = $1 AND m.user_id = $2
    `;

    return pool.query(query, [redoId, userId]);
  }

  static markAsPerformed(redoId) {
    const query = `
      UPDATE redo_schedule
      SET performed = true
      WHERE id = $1
      RETURNING id as redo_id, performed
    `;

    return pool.query(query, [redoId]);
  }

  static calculateDueDate(scheduleType) {
    const today = new Date();
    let daysToAdd;

    switch (scheduleType) {
      case 'three_days':
        daysToAdd = 3;
        break;
      case 'seven_days':
        daysToAdd = 7;
        break;
      case 'fifteen_days':
        daysToAdd = 15;
        break;
      default:
        throw new Error('Invalid schedule type');
    }

    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysToAdd);
    return dueDate.toISOString().split('T')[0];
  }

  static isPerformed(redoId) {
    const query = `
      SELECT performed
      FROM redo_schedule
      WHERE id = $1
    `;

    return pool.query(query, [redoId]);
  }
}

module.exports = RedoScheduleModel;