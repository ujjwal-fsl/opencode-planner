const MistakeService = require('../services/mistake.service');

class MistakeController {
  static async createMistake(req, res) {
    try {
      const userId = req.userId;
      const result = await MistakeService.createMistake(userId, req.body);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Mistake created successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Create mistake controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getMistakes(req, res) {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);

      const result = await MistakeService.getMistakes(userId, limit, offset);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Mistakes retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get mistakes controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getMistakeById(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const result = await MistakeService.getMistakeById(userId, id);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Mistake retrieved successfully',
        });
      } else {
        if (result.message === 'Mistake not found') {
          res.status(404).json({
            success: false,
            message: result.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: result.message,
          });
        }
      }
    } catch (error) {
      console.error('Get mistake controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async updateMistake(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const result = await MistakeService.updateMistake(userId, id, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Mistake updated successfully',
        });
      } else {
        if (result.message === 'Mistake not found') {
          res.status(404).json({
            success: false,
            message: result.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: result.message,
          });
        }
      }
    } catch (error) {
      console.error('Update mistake controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async deleteMistake(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const result = await MistakeService.deleteMistake(userId, id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        if (result.message === 'Mistake not found') {
          res.status(404).json({
            success: false,
            message: result.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: result.message,
          });
        }
      }
    } catch (error) {
      console.error('Delete mistake controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = MistakeController;