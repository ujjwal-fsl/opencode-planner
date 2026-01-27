const Joi = require('joi');

const scheduleRevisionSchema = Joi.object({
  topic_id: Joi.string().uuid().required().messages({
    'string.guid': 'Topic ID must be a valid UUID',
    'any.required': 'Topic ID is required',
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required().messages({
    'any.only': 'Difficulty must be one of: easy, medium, hard',
    'any.required': 'Difficulty is required',
  }),
});

const validateScheduleRevision = (req, res, next) => {
  const { error } = scheduleRevisionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateScheduleRevision };