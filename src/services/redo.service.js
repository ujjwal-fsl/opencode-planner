const RedoScheduleModel = require('../models/redoSchedule.model');
const RedoAttemptModel = require('../models/redoAttempt.model');

class RedoService {
  static async getRedoSchedule(userId) {
    try {
      const result = await RedoScheduleModel.findByUserId(userId);
      
      const redoSchedule = result.rows.map(row => ({
        redo_id: row.redo_id,
        mistake_id: row.mistake_id,
        question_text: row.question_text,
        schedule_type: row.schedule_type,
        due_date: row.due_date,
      }));

      return {
        success: true,
        data: redoSchedule,
      };
    } catch (error) {
      console.error('Get redo schedule error:', error);
      return {
        success: false,
        message: 'Failed to retrieve redo schedule',
        error: error.message,
      };
    }
  }

  static async createRedoAttempt(userId, redoId, isCorrect) {
    try {
      const redoResult = await RedoScheduleModel.findByIdAndUser(userId, redoId);
      
      if (redoResult.rows.length === 0) {
        return {
          success: false,
          message: 'Redo schedule not found or access denied',
        };
      }

      const redo = redoResult.rows[0];
      
      if (redo.performed) {
        return {
          success: false,
          message: 'Redo has already been performed',
        };
      }

      const attemptExists = await RedoAttemptModel.exists(redoId);
      if (attemptExists.rows.length > 0) {
        return {
          success: false,
          message: 'Redo has already been attempted',
        };
      }

      await RedoScheduleModel.markAsPerformed(redoId);
      
      const attempt = await RedoAttemptModel.create(redoId, isCorrect);

      return {
        success: true,
        data: attempt,
      };
    } catch (error) {
      console.error('Create redo attempt error:', error);
      return {
        success: false,
        message: 'Failed to create redo attempt',
        error: error.message,
      };
    }
  }

  static async getRedoAttempts(userId) {
    try {
      const result = await RedoAttemptModel.findByUserId(userId);
      
      const attempts = result.rows.map(row => ({
        attempt_id: row.attempt_id,
        redo_id: row.redo_id,
        is_correct: row.is_correct,
        attempted_at: row.attempted_at,
        question_text: row.question_text,
      }));

      return {
        success: true,
        data: attempts,
      };
    } catch (error) {
      console.error('Get redo attempts error:', error);
      return {
        success: false,
        message: 'Failed to retrieve redo attempts',
        error: error.message,
      };
    }
  }

  static async validateRedoAccess(userId, redoId) {
    try {
      const result = await RedoScheduleModel.findByIdAndUser(userId, redoId);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Validate redo access error:', error);
      return false;
    }
  }

  static async isRedoPerformed(redoId) {
    try {
      const result = await RedoScheduleModel.isPerformed(redoId);
      return result.rows.length > 0 && result.rows[0].performed;
    } catch (error) {
      console.error('Check redo performed error:', error);
      return false;
    }
  }

  static async hasRedoBeenAttempted(redoId) {
    try {
      const result = await RedoAttemptModel.exists(redoId);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Check redo attempted error:', error);
      return false;
    }
  }
}

module.exports = RedoService;