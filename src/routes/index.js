const express = require('express');
const { protectedRoutes } = require('../middleware/protectedRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.get('/protected', protectedRoutes, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a protected route',
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

module.exports = router;