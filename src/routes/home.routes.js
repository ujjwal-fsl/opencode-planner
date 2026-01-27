const express = require('express');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const HomeController = require('../controllers/home.controller');

const router = express.Router();

// GET /api/home - Get home command center data
router.get('/', protectedRoutes, HomeController.getHomeData);

module.exports = router;