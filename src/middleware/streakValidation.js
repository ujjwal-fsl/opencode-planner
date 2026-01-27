const Joi = require('joi');

const activityTypeSchema = Joi.string().valid('redo', 'revision', 'shuffle').required().messages({
  'string.base': 'Activity type must be a string',
  'any.only': 'Activity type must be one of: redo, revision, shuffle',
  'any.required': 'Activity type is required',
});

const validateActivityType = (req, res, next) => {
  const { error } = activityTypeSchema.validate(req.body.activity_type || req.query.activity_type);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateActivityType };