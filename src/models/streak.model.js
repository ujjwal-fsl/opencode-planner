const pool = require('../config/database');

class StreakLogModel {
  static async create(userId, activityType, activityDate) {
    const query = `
      INSERT INTO streak_log (user_id, activity_type, activity_date, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (user_id, activity_date) DO NOTHING
      RETURNING streak_id, user_id, activity_type, activity_date, is_active, created_at
    `;

    const result = await pool.query(query, [userId, activityType, activityDate]);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 30) {
    const query = `
      SELECT streak_id, activity_type, activity_date, is_active, created_at
      FROM streak_log
      WHERE user_id = $1
      ORDER BY activity_date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async findByUserIdAndDate(userId, activityDate) {
    const query = `
      SELECT streak_id, activity_type, activity_date, is_active, created_at
      FROM streak_log
      WHERE user_id = $1 AND activity_date = $2
    `;

    const result = await pool.query(query, [userId, activityDate]);
    return result.rows[0];
  }

  static async findLastActivity(userId) {
    const query = `
      SELECT streak_id, activity_type, activity_date, is_active, created_at
      FROM streak_log
      WHERE user_id = $1
      ORDER BY activity_date DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async existsForUserAndDate(userId, activityDate) {
    const query = `
      SELECT 1
      FROM streak_log
      WHERE user_id = $1 AND activity_date = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, activityDate]);
    return result.rows.length > 0;
  }

  static async countByUserId(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM streak_log
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async getActivityStats(userId, days = 30) {
    const query = `
      SELECT 
        activity_type,
        COUNT(*) as count,
        COUNT(DISTINCT activity_date) as active_days
      FROM streak_log
      WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY activity_type
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async deleteByUserId(userId) {
    const query = 'DELETE FROM streak_log WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }
}

class UserModel {
  static async incrementStreakCount(userId) {
    const query = `
      UPDATE users
      SET streak_count = streak_count + 1, last_active_date = CURRENT_DATE
      WHERE id = $1
      RETURNING id, streak_count, last_active_date
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async resetStreakCount(userId) {
    const query = `
      UPDATE users
      SET streak_count = 1, last_active_date = CURRENT_DATE
      WHERE id = $1
      RETURNING id, streak_count, last_active_date
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async updateLastActiveDate(userId) {
    const query = `
      UPDATE users
      SET last_active_date = CURRENT_DATE
      WHERE id = $1
      RETURNING id, last_active_date
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = `
      SELECT id, email, streak_count, last_active_date, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async getCurrentStreak(userId) {
    const query = `
      SELECT streak_count, last_active_date
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    
    // If last_active_date is null or older than yesterday, streak should be 0
    if (!user.last_active_date) {
      return 0;
    }

    const today = new Date();
    const lastActive = new Date(user.last_active_date);
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    // If more than 1 day gap, streak is broken
    if (daysDiff > 1) {
      // Update streak to 0 if it's been more than a day
      await pool.query(
        'UPDATE users SET streak_count = 0 WHERE id = $1',
        [userId]
      );
      return 0;
    }

    return user.streak_count || 0;
  }

  static async getStreakWithCalculatedValue(userId) {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.streak_count as cached_streak,
        u.last_active_date,
        CASE 
          WHEN u.last_active_date IS NULL THEN 0
          WHEN CURRENT_DATE - u.last_active_date > INTERVAL '1 day' THEN 0
          ELSE u.streak_count
        END as current_streak
      FROM users u
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = { StreakLogModel, UserModel };