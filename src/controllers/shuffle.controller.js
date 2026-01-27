const ShuffleService = require('../services/shuffle.service');
const StreakService = require('../services/streak.service');

class ShuffleController {
  static async getShuffleQuestions(req, res) {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      // Check if user has any questions
      const hasQuestions = await ShuffleService.validateUserHasQuestions(userId);
      if (hasQuestions.rows.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No questions available for shuffle',
        });
      }

      const result = await ShuffleService.getShuffleQuestions(userId, limit);

      if (result.success) {
        // Record streak activity after successful shuffle questions serve
        await StreakService.logActivity(userId, 'shuffle');
        
        res.status(200).json({
          success: true,
          data: result.data,
          meta: result.meta,
          message: 'Shuffle questions retrieved successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get shuffle questions controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getShuffleStats(req, res) {
    try {
      const userId = req.userId;
      const result = await ShuffleService.getShuffleStats(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Shuffle stats retrieved successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get shuffle stats controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = ShuffleController;