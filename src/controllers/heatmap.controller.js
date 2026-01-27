const HeatMapService = require('../services/heatmap.service');

class HeatMapController {
  static async getTopicsHeatMap(req, res) {
    try {
      const userId = req.userId;
      const result = await HeatMapService.getHeatMapForUser(userId);

      if (result === null || result === undefined) {
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve heatmap data',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Topic heatmap retrieved successfully',
      });
    } catch (error) {
      console.error('Get topics heatmap controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getTopicHeatMap(req, res) {
    try {
      const userId = req.userId;
      const { topicId } = req.params;

      // Validate topicId format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID format',
        });
      }

      const result = await HeatMapService.getHeatMapForTopic(userId, topicId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Topic heatmap retrieved successfully',
      });
    } catch (error) {
      console.error('Get topic heatmap controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async triggerHeatMapUpdate(req, res) {
    try {
      // This endpoint is for manual triggering/testing
      const HeatMapJob = require('../jobs/heatmap.job');
      const result = await HeatMapJob.triggerUpdate();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            totalUsers: result.totalUsers,
            results: result.results,
          },
          message: 'HeatMap update completed successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'HeatMap update failed',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Trigger heatmap update controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async triggerUserHeatMapUpdate(req, res) {
    try {
      const userId = req.userId;
      const HeatMapJob = require('../jobs/heatmap.job');
      const result = await HeatMapJob.runHeatMapUpdateForUser(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            topicsProcessed: result.topicsProcessed,
          },
          message: 'User HeatMap update completed successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'User HeatMap update failed',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Trigger user heatmap update controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = HeatMapController;