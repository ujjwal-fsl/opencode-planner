const HomeService = require('../services/home.service');

class HomeController {
  static async getHomeData(req, res) {
    try {
      const userId = req.userId;
      const result = await HomeService.getHomeData(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Home data retrieved successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Get home data controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = HomeController;