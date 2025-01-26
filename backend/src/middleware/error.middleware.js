const { logger } = require('../utils/logger');
const { ApiResponse, createErrorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId
  });

  // Handle different types of errors
  switch (err.name) {
    case 'ValidationError':
      return ApiResponse.error(
        res,
        'Validation failed',
        400,
        createErrorResponse(err.errors)
      );

    case 'NotFoundError':
      return ApiResponse.error(
        res,
        err.message || 'Resource not found',
        404
      );

    case 'UnauthorizedError':
      return ApiResponse.error(
        res,
        err.message || 'Unauthorized access',
        401
      );

    case 'ForbiddenError':
      return ApiResponse.error(
        res,
        err.message || 'Access forbidden',
        403
      );

    default:
      return ApiResponse.error(
        res,
        process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
        err.statusCode || 500,
        process.env.NODE_ENV === 'development' ? err.stack : undefined
      );
  }
};

module.exports = { errorHandler }; 