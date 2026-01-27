const express = require('express');
const StreakController = require('../controllers/streak.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const { validateActivityType } = require('../middleware/streakValidation');

const router = express.Router();

router.use(protectedRoutes);

// Main endpoints
router.post('/activity', validateActivityType, StreakController.logActivity);
router.get('/current', StreakController.getCurrentStreak);

// Stats endpoint
router.get('/stats', StreakController.getStreakStats);

module.exports = router;