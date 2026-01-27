const MistakeModel = require('../models/mistake.model');

class MistakeService {
  static async createMistake(userId, mistakeData) {
    try {
      const mistake = await MistakeModel.create(userId, mistakeData);
      return {
        success: true,
        data: mistake,
      };
    } catch (error) {
      console.error('Create mistake error:', error);
      return {
        success: false,
        message: 'Failed to create mistake',
        error: error.message,
      };
    }
  }

  static async getMistakes(userId, limit = 50, offset = 0) {
    try {
      const mistakes = await MistakeModel.findByUserId(userId, limit, offset);
      const total = await MistakeModel.countByUserId(userId);
      
      return {
        success: true,
        data: {
          mistakes,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      };
    } catch (error) {
      console.error('Get mistakes error:', error);
      return {
        success: false,
        message: 'Failed to retrieve mistakes',
        error: error.message,
      };
    }
  }

  static async getMistakeById(userId, mistakeId) {
    try {
      const mistake = await MistakeModel.findById(userId, mistakeId);
      
      if (!mistake) {
        return {
          success: false,
          message: 'Mistake not found',
        };
      }

      return {
        success: true,
        data: mistake,
      };
    } catch (error) {
      console.error('Get mistake error:', error);
      return {
        success: false,
        message: 'Failed to retrieve mistake',
        error: error.message,
      };
    }
  }

  static async updateMistake(userId, mistakeId, updateData) {
    try {
      const exists = await MistakeModel.exists(userId, mistakeId);
      
      if (!exists) {
        return {
          success: false,
          message: 'Mistake not found',
        };
      }

      const updatedMistake = await MistakeModel.update(userId, mistakeId, updateData);
      
      if (!updatedMistake) {
        return {
          success: false,
          message: 'Failed to update mistake',
        };
      }

      return {
        success: true,
        data: updatedMistake,
      };
    } catch (error) {
      console.error('Update mistake error:', error);
      return {
        success: false,
        message: 'Failed to update mistake',
        error: error.message,
      };
    }
  }

  static async deleteMistake(userId, mistakeId) {
    try {
      const exists = await MistakeModel.exists(userId, mistakeId);
      
      if (!exists) {
        return {
          success: false,
          message: 'Mistake not found',
        };
      }

      const deleted = await MistakeModel.delete(userId, mistakeId);
      
      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete mistake',
        };
      }

      return {
        success: true,
        message: 'Mistake deleted successfully',
      };
    } catch (error) {
      console.error('Delete mistake error:', error);
      return {
        success: false,
        message: 'Failed to delete mistake',
        error: error.message,
      };
    }
  }

  static validateMistakeOwnership(userId, mistakeId) {
    return MistakeModel.exists(userId, mistakeId);
  }
}

module.exports = MistakeService;