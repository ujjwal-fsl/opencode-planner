const express = require('express');
const HeatMapController = require('../controllers/heatmap.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');

const router = express.Router();

router.use(protectedRoutes);

// Public endpoints
router.get('/topics', HeatMapController.getTopicsHeatMap);
router.get('/topic/:topicId', HeatMapController.getTopicHeatMap);

// Admin/manual update endpoints (for testing)
router.post('/update', HeatMapController.triggerHeatMapUpdate);
router.post('/update/user', HeatMapController.triggerUserHeatMapUpdate);

module.exports = router;