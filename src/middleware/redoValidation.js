const Joi = require('joi');
const RedoScheduleModel = require('../models/redoSchedule.model');
const RedoAttemptModel = require('../models/redoAttempt.model');

const redoAttemptSchema = Joi.object({
  redo_id: Joi.string().uuid().required().messages({
    'string.guid': 'Redo ID must be a valid UUID',
    'any.required': 'Redo ID is required',
  }),
  is_correct: Joi.boolean().required().messages({
    'boolean.base': 'is_correct must be a boolean',
    'any.required': 'is_correct is required',
  }),
});

const validateRedoAttempt = (req, res, next) => {
  const { error } = redoAttemptSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

const validateRedoId = async (req, res, next) => {
  const { redo_id } = req.body;
  
  if (!redo_id) {
    return res.status(400).json({
      success: false,
      message: 'Redo ID is required',
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(redo_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid redo ID format',
    });
  }

  try {
    const redoResult = await RedoScheduleModel.findById(redo_id);
    
    if (redoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Redo schedule not found',
      });
    }

    const redo = redoResult.rows[0];
    
    if (redo.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: redo does not belong to this user',
      });
    }

    if (redo.performed) {
      return res.status(400).json({
        success: false,
        message: 'Redo has already been performed',
      });
    }

    const attemptExists = await RedoAttemptModel.exists(redo_id);
    
    if (attemptExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Redo has already been attempted',
      });
    }

    req.redoData = redo;
    next();
  } catch (error) {
    console.error('Redo validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation',
    });
  }
};

const validateRedoOwnership = async (req, res, next) => {
  const userId = req.userId;
  
  try {
    const redoSchedules = await RedoScheduleModel.findByUserId(userId);
    req.userRedoSchedules = redoSchedules.rows;
    next();
  } catch (error) {
    console.error('Redo ownership validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate redo ownership',
    });
  }
};

module.exports = {
  validateRedoAttempt,
  validateRedoId,
  validateRedoOwnership,
};