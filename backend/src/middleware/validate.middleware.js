const { ApiResponse } = require('../utils/response');
const { wordSchema } = require('../api/dictionary/validation/dictionary.schema');
const Joi = require('joi');
const { ValidationError } = require('../utils/errors');
const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Check if it's a Zod schema
      if (typeof schema.parse === 'function') {
        schema.parse(req.body);
      } else {
        // Assume it's a Joi schema
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
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map(err => err.message)
          .join(', ');
        return ApiResponse.error(res, errorMessage, 400);
      }
      if (error instanceof ValidationError) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  };
};

const validateWord = (req, res, next) => {
  const { error } = wordSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }
  next();
};

module.exports = { validate, validateWord }; 