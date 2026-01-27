const UserModel = require('../models/User');
const JwtUtils = require('../utils/jwt');

class AuthService {
  static async register(email, password) {
    try {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const user = await UserModel.create(email, password);
      const token = JwtUtils.generateToken({ userId: user.id, email: user.email });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async login(email, password) {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await UserModel.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = JwtUtils.generateToken({ userId: user.id, email: user.email });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = JwtUtils.verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static logout() {
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}

module.exports = AuthService;