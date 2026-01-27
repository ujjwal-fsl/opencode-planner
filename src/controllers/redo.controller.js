const RedoService = require('../services/redo.service');
const StreakService = require('../services/streak.service');

class RedoController {
  static async getRedoSchedule(req, res) {
    try {
      const userId = req.userId;
      const result = await RedoService.getRedoSchedule(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Redo schedule retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get redo schedule controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async createRedoAttempt(req, res) {
    try {
      const userId = req.userId;
      const { redo_id, is_correct } = req.body;
      
      const result = await RedoService.createRedoAttempt(userId, redo_id, is_correct);

      if (result.success) {
        // Record streak activity after successful redo attempt
        await StreakService.logActivity(userId, 'redo');
        
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Redo attempt recorded successfully',
        });
      } else {
        if (result.message.includes('not found') || result.message.includes('access denied')) {
          res.status(404).json({
            success: false,
            message: result.message,
          });
        } else if (result.message.includes('already performed') || result.message.includes('already attempted')) {
          res.status(400).json({
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
      console.error('Create redo attempt controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getRedoAttempts(req, res) {
    try {
      const userId = req.userId;
      const result = await RedoService.getRedoAttempts(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Redo attempts retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get redo attempts controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = RedoController;