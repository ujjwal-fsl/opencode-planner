const express = require('express');
const ShuffleController = require('../controllers/shuffle.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const { validateLimit } = require('../middleware/shuffleValidation');

const router = express.Router();

router.use(protectedRoutes);

// Main shuffle endpoint
router.get('/questions', validateLimit, ShuffleController.getShuffleQuestions);

// Stats endpoint
router.get('/stats', ShuffleController.getShuffleStats);

module.exports = router;