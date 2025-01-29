const { ApiResponse } = require('../utils/response');
const { wordSchema } = require('../api/dictionary/validation/dictionary.schema');
const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new ValidationError(errorMessage);
    }

    next();
  };
};

const validateWord = (req, res, next) => {
  const { error } = wordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = { validate, validateWord }; 