const Joi = require('joi');

const limitSchema = Joi.number().integer().min(1).max(20).default(10).messages({
  'number.base': 'Limit must be a number',
  'number.integer': 'Limit must be an integer',
  'number.min': 'Limit must be at least 1',
  'number.max': 'Limit cannot exceed 20',
});

const validateLimit = (req, res, next) => {
  const { limit } = req.query;
  
  if (limit !== undefined) {
    const { error } = limitSchema.validate(parseInt(limit));
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
  }
  
  next();
};

module.exports = { validateLimit };