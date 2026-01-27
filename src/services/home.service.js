const pool = require('../config/database');
const { UserModel } = require('../models/streak.model');

class HomeService {
  static async getHomeData(userId) {
    try {
      // Get redo_today data
      const redoToday = await this.getRedoToday(userId);
      
      // Get revision_today data
      const revisionToday = await this.getRevisionToday(userId);
      
      // Get current streak
      const currentStreak = await this.getCurrentStreak(userId);
      
      return {
        success: true,
        data: {
          redo_today: redoToday,
          revision_today: revisionToday,
          current_streak: currentStreak,
        },
        message: 'Home data retrieved successfully',
      };
    } catch (error) {
      console.error('Get home data error:', error);
      return {
        success: false,
        message: 'Failed to retrieve home data',
        error: error.message,
      };
    }
  }

  static async getRedoToday(userId) {
    const query = `
      SELECT 
        rs.id as redo_id,
        rs.mistake_id,
        m.question_text,
        rs.schedule_type,
        rs.due_date
      FROM redo_schedule rs
      JOIN mistake_vault_entries m ON rs.mistake_id = m.id
      WHERE m.user_id = $1 
        AND rs.performed = false 
        AND rs.due_date = CURRENT_DATE
      ORDER BY rs.due_date ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getRevisionToday(userId) {
    const query = `
      SELECT 
        rs.revision_id,
        rs.topic_id,
        t.name as topic_name,
        rs.scheduled_for,
        rs.slot_type
      FROM revision_slots rs
      JOIN topics t ON rs.topic_id = t.id
      WHERE rs.user_id = $1 
        AND rs.completed = false 
        AND rs.scheduled_for = CURRENT_DATE
      ORDER BY rs.scheduled_for ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getCurrentStreak(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return 0;
    }
    
    return user.streak_count || 0;
  }
}

module.exports = HomeService;