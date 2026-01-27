const Joi = require('joi');

const sourceEnum = ['mistake', 'self_added'];
const mistakeTypeEnum = ['Concept', 'Calculation', 'Misread', 'Trap'];

const createMistakeSchema = Joi.object({
  question_text: Joi.string().required().min(1).max(10000).messages({
    'string.empty': 'Question text is required',
    'string.min': 'Question text cannot be empty',
    'string.max': 'Question text cannot exceed 10,000 characters',
    'any.required': 'Question text is required',
  }),
  source: Joi.string().valid(...sourceEnum).required().messages({
    'any.only': 'Source must be either "mistake" or "self_added"',
    'any.required': 'Source is required',
  }),
  mistake_type: Joi.string().valid(...mistakeTypeEnum).allow(null).when('source', {
    is: 'mistake',
    then: Joi.required().messages({
      'any.required': 'Mistake type is required when source is "mistake"',
    }),
    otherwise: Joi.valid(null).messages({
      'any.only': 'Mistake type must be null when source is "self_added"',
    }),
  }),
  subject_id: Joi.string().uuid().required().messages({
    'string.guid': 'Subject ID must be a valid UUID',
    'any.required': 'Subject ID is required',
  }),
  chapter_id: Joi.string().uuid().required().messages({
    'string.guid': 'Chapter ID must be a valid UUID',
    'any.required': 'Chapter ID is required',
  }),
  topic_id: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Topic ID must be a valid UUID',
  }),
  notes: Joi.string().allow(null, '').max(2000).messages({
    'string.max': 'Notes cannot exceed 2,000 characters',
  }),
  screenshot_url: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Screenshot URL must be a valid URL',
  }),
});

const updateMistakeSchema = Joi.object({
  question_text: Joi.string().min(1).max(10000).messages({
    'string.empty': 'Question text cannot be empty',
    'string.min': 'Question text cannot be empty',
    'string.max': 'Question text cannot exceed 10,000 characters',
  }),
  source: Joi.string().valid(...sourceEnum).messages({
    'any.only': 'Source must be either "mistake" or "self_added"',
  }),
  mistake_type: Joi.string().valid(...mistakeTypeEnum).allow(null).when('source', {
    is: 'mistake',
    then: Joi.required().messages({
      'any.required': 'Mistake type is required when source is "mistake"',
    }),
    otherwise: Joi.valid(null).messages({
      'any.only': 'Mistake type must be null when source is "self_added"',
    }),
  }),
  subject_id: Joi.string().uuid().messages({
    'string.guid': 'Subject ID must be a valid UUID',
  }),
  chapter_id: Joi.string().uuid().messages({
    'string.guid': 'Chapter ID must be a valid UUID',
  }),
  topic_id: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Topic ID must be a valid UUID',
  }),
  notes: Joi.string().allow(null, '').max(2000).messages({
    'string.max': 'Notes cannot exceed 2,000 characters',
  }),
  screenshot_url: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Screenshot URL must be a valid URL',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const validateCreateMistake = (req, res, next) => {
  const { error } = createMistakeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  if (req.body.source === 'self_added' && req.body.mistake_type !== null) {
    return res.status(400).json({
      success: false,
      message: 'Mistake type must be null when source is "self_added"',
    });
  }

  next();
};

const validateUpdateMistake = (req, res, next) => {
  const { error } = updateMistakeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { source, mistake_type } = req.body;
  if (source === 'self_added' && mistake_type !== null && mistake_type !== undefined) {
    return res.status(400).json({
      success: false,
      message: 'Mistake type must be null when source is "self_added"',
    });
  }

  if (source === 'mistake' && (mistake_type === null || mistake_type === undefined)) {
    return res.status(400).json({
      success: false,
      message: 'Mistake type is required when source is "mistake"',
    });
  }

  next();
};

const validateMistakeId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid mistake ID is required',
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid mistake ID format',
    });
  }

  next();
};

module.exports = {
  validateCreateMistake,
  validateUpdateMistake,
  validateMistakeId,
};