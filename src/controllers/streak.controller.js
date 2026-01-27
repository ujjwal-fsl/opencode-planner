const StreakService = require('../services/streak.service');

class StreakController {
  static async logActivity(req, res) {
    try {
      const userId = req.userId;
      const { activity_type } = req.body;

      // Validate activity type
      if (!StreakService.validateActivityType(activity_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity type. Must be: redo, revision, or shuffle',
        });
      }

      const result = await StreakService.logActivity(userId, activity_type);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Log activity controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getCurrentStreak(req, res) {
    try {
      const userId = req.userId;
      const result = await StreakService.getCurrentStreak(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            current_streak: result.data.current_streak,
            last_active_date: result.data.last_active_date,
          },
          message: result.message,
        });
      } else {
        if (result.message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: result.message,
          });
        } else {
          res.status(500).json({
            success: false,
            message: result.message,
          });
        }
      }
    } catch (error) {
      console.error('Get current streak controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getStreakStats(req, res) {
    try {
      const userId = req.userId;
      const result = await StreakService.getStreakStats(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get streak stats controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = StreakController;