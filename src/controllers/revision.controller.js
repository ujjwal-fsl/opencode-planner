const RevisionService = require('../services/revision.service');
const StreakService = require('../services/streak.service');

class RevisionController {
  static async scheduleRevision(req, res) {
    try {
      const userId = req.userId;
      const { topic_id, difficulty } = req.body;

      const result = await RevisionService.scheduleRevision(userId, topic_id, difficulty);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Revision scheduled successfully',
        });
      } else {
        if (result.message.includes('not found')) {
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
      console.error('Schedule revision controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getRevisionSlots(req, res) {
    try {
      const userId = req.userId;
      const includeCompleted = req.query.include === 'all';
      
      const result = await RevisionService.getRevisionSlots(userId, includeCompleted);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Revision slots retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get revision slots controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async completeRevision(req, res) {
    try {
      const userId = req.userId;
      const { slotId } = req.params;

      // Validate slotId format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(slotId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid revision slot ID format',
        });
      }

      const result = await RevisionService.completeRevision(userId, slotId);

      if (result.success) {
        // Record streak activity after successful revision completion
        await StreakService.logActivity(userId, 'revision');
        
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Revision marked as completed',
        });
      } else {
        if (result.message.includes('not found')) {
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
      console.error('Complete revision controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getPendingSlots(req, res) {
    try {
      const userId = req.userId;
      const result = await RevisionService.getPendingRevisionSlots(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Pending revision slots retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get pending slots controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getRevisionStats(req, res) {
    try {
      const userId = req.userId;
      const result = await RevisionService.getRevisionStats(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Revision stats retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get revision stats controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = RevisionController;