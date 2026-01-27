const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { validateRegistration, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.register(email, password);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'User registered successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'Login successful',
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const result = AuthService.logout();
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;