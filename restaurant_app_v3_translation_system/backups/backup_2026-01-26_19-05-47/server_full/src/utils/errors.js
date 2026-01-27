/**
 * PHASE E9.6 - Error System v2
 * 
 * Enterprise error factory and standardized error responses.
 * Supports ANAF-friendly error format.
 */

/**
 * Error Types
 */
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.details = details;
  }
}

class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
    this.code = 'UNAUTHORIZED';
    this.statusCode = 401;
  }
}

class PermissionError extends Error {
  constructor(message = 'Insufficient permissions', required = null) {
    super(message);
    this.name = 'PermissionError';
    this.code = 'PERMISSION_DENIED';
    this.statusCode = 403;
    this.required = required;
  }
}

class BusinessLogicError extends Error {
  constructor(message, code = 'BUSINESS_LOGIC_ERROR', details = {}) {
    super(message);
    this.name = 'BusinessLogicError';
    this.code = code;
    this.statusCode = 400;
    this.details = details;
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.code = 'DATABASE_ERROR';
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

class NotFoundError extends Error {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
    this.resource = resource;
    this.id = id;
  }
}

/**
 * Error Factory
 */
function createError(type, message, details = {}) {
  const errorClasses = {
    ValidationError,
    AuthError,
    PermissionError,
    BusinessLogicError,
    DatabaseError,
    NotFoundError
  };
  
  const ErrorClass = errorClasses[type] || Error;
  return new ErrorClass(message, details);
}

/**
 * Format error response (ANAF-friendly)
 */
function formatErrorResponse(error, req = null) {
  const response = {
    success: false,
    status: 'error',
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Internal server error'
  };
  
  // Add details if available
  if (error.details) {
    response.details = error.details;
  }
  
  // Add required permission if PermissionError
  if (error instanceof PermissionError && error.required) {
    response.required = error.required;
  }
  
  // Add resource info if NotFoundError
  if (error instanceof NotFoundError) {
    response.resource = error.resource;
    if (error.id) {
      response.id = error.id;
    }
  }
  
  // Add request context in development
  if (process.env.NODE_ENV === 'development' && req) {
    response.request = {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body
    };
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
}

/**
 * Get status code from error
 */
function getStatusCode(error) {
  if (error.statusCode) {
    return error.statusCode;
  }
  
  if (error instanceof ValidationError) return 400;
  if (error instanceof AuthError) return 401;
  if (error instanceof PermissionError) return 403;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof BusinessLogicError) return 400;
  if (error instanceof DatabaseError) return 500;
  
  return 500;
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error('❌ [ERROR HANDLER]', {
    code: err.code || 'UNKNOWN',
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });
  
  // Format response
  const response = formatErrorResponse(err, req);
  const statusCode = getStatusCode(err);
  
  res.status(statusCode).json(response);
}

module.exports = {
  ValidationError,
  AuthError,
  PermissionError,
  BusinessLogicError,
  DatabaseError,
  NotFoundError,
  createError,
  formatErrorResponse,
  getStatusCode,
  errorHandler
};

