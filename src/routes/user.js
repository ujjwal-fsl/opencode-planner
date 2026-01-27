const express = require('express');
const { protectedRoutes } = require('../middleware/protectedRoutes');

const router = express.Router();

router.get('/profile', protectedRoutes, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          createdAt: req.user.created_at,
        },
      },
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;