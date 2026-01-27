/**
 * PHASE PRODUCTION-READY - Centralized Error Handler
 * 
 * Error handling centralizat pentru toate modulele
 */

const { logger } = require('./logger');
const appLogger = logger.child('ERROR_HANDLER');

/**
 * Standard error codes
 */
const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Business logic errors (422)
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  
  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

/**
 * Custom AppError class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || ERROR_CODES.INTERNAL_ERROR;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create validation error
 */
function createValidationError(message, details = null) {
  return new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
}

/**
 * Create not found error
 */
function createNotFoundError(resource, id = null) {
  const message = id 
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;
  return new AppError(message, 404, ERROR_CODES.NOT_FOUND);
}

/**
 * Create business rule violation error
 */
function createBusinessRuleError(message, details = null) {
  return new AppError(message, 422, ERROR_CODES.BUSINESS_RULE_VIOLATION, details);
}

/**
 * Create insufficient stock error
 */
function createInsufficientStockError(ingredientName, required, available, unit) {
  return new AppError(
    `Insufficient stock for ${ingredientName}. Required: ${required} ${unit}, Available: ${available} ${unit}`,
    422,
    ERROR_CODES.INSUFFICIENT_STOCK,
    { ingredientName, required, available, unit }
  );
}

/**
 * Express error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  if (err.isOperational) {
    appLogger.warn('Operational error', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      path: req.path,
      method: req.method
    });
  } else {
    appLogger.error('Unexpected error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Send error response
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || ERROR_CODES.INTERNAL_ERROR
    }
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development' && err.details) {
    response.error.details = err.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Async handler wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Try-catch wrapper for async functions
 */
async function tryCatch(fn, errorMessage = 'Operation failed') {
  try {
    return await fn();
  } catch (error) {
    appLogger.error(errorMessage, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  ERROR_CODES,
  AppError,
  createValidationError,
  createNotFoundError,
  createBusinessRuleError,
  createInsufficientStockError,
  errorHandler,
  asyncHandler,
  tryCatch
};

