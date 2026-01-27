const { StreakLogModel, UserModel } = require('../models/streak.model');

class StreakService {
  static async logActivity(userId, activityType) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if activity already logged for today
      const existingActivity = await StreakLogModel.findByUserIdAndDate(userId, today);
      
      if (existingActivity) {
        // Activity already logged today, return current streak without changes
        const currentStreak = await UserModel.getCurrentStreak(userId);
        return {
          success: true,
          data: {
            current_streak: currentStreak,
            already_logged_today: true,
          },
          message: 'Activity already logged for today',
        };
      }

      // Get last activity to determine streak logic
      const lastActivity = await StreakLogModel.findLastActivity(userId);
      let newStreakCount;

      if (!lastActivity) {
        // First activity ever
        newStreakCount = 1;
        await UserModel.incrementStreakCount(userId);
      } else {
        // Calculate if streak continues
        const lastActivityDate = new Date(lastActivity.activity_date);
        const todayDate = new Date(today);
        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);

        if (lastActivityDate.getTime() === yesterdayDate.getTime()) {
          // Yesterday had activity → streak continues
          const incremented = await UserModel.incrementStreakCount(userId);
          newStreakCount = incremented.streak_count;
        } else {
          // Gap detected → streak resets to 1
          const reset = await UserModel.resetStreakCount(userId);
          newStreakCount = reset.streak_count;
        }
      }

      // Log today's activity
      await StreakLogModel.create(userId, activityType, today);

      return {
        success: true,
        data: {
          current_streak: newStreakCount,
          already_logged_today: false,
          activity_logged: {
            activity_type: activityType,
            activity_date: today,
          },
        },
        message: 'Activity logged successfully',
      };
    } catch (error) {
      console.error('Log activity error:', error);
      return {
        success: false,
        message: 'Failed to log activity',
        error: error.message,
      };
    }
  }

  static async getCurrentStreak(userId) {
    try {
      const user = await UserModel.getStreakWithCalculatedValue(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: {
          current_streak: user.current_streak,
          cached_streak: user.cached_streak,
          last_active_date: user.last_active_date,
        },
        message: 'Current streak retrieved successfully',
      };
    } catch (error) {
      console.error('Get current streak error:', error);
      return {
        success: false,
        message: 'Failed to retrieve current streak',
        error: error.message,
      };
    }
  }

  static async getStreakStats(userId) {
    try {
      const currentStreak = await this.getCurrentStreak(userId);
      const recentActivities = await StreakLogModel.getActivityStats(userId, 30);
      const totalActivities = await StreakLogModel.countByUserId(userId);

      return {
        success: true,
        data: {
          current_streak: currentStreak.data.current_streak,
          last_active_date: currentStreak.data.last_active_date,
          total_activities: totalActivities,
          recent_30_days: recentActivities,
          activity_breakdown: this.formatActivityBreakdown(recentActivities),
        },
        message: 'Streak stats retrieved successfully',
      };
    } catch (error) {
      console.error('Get streak stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve streak stats',
        error: error.message,
      };
    }
  }

  static formatActivityBreakdown(activities) {
    const breakdown = {
      redo: 0,
      revision: 0,
      shuffle: 0,
      total_days: 0,
    };

    activities.forEach(activity => {
      breakdown[activity.activity_type] = activity.count;
      breakdown.total_days = Math.max(breakdown.total_days, activity.active_days);
    });

    return breakdown;
  }

  static validateActivityType(activityType) {
    const validTypes = ['redo', 'revision', 'shuffle'];
    return validTypes.includes(activityType);
  }

  static async validateUserStreakState(userId) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return {
          valid: false,
          message: 'User not found',
        };
      }

      // Check if streak needs recalculation
      const today = new Date();
      const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;
      
      if (!lastActive) {
        return {
          valid: true,
          needs_reset: true,
          message: 'No previous activity',
        };
      }

      const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (daysDiff > 1) {
        return {
          valid: true,
          needs_reset: true,
          message: 'Streak broken due to inactivity',
        };
      }

      return {
        valid: true,
        needs_reset: false,
        message: 'Streak is current',
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }
}

module.exports = StreakService;