/**
 * ENTERPRISE API RESPONSE UTILITIES
 * 
 * Standardized response format following REST best practices
 * Used by top-tier applications like Stripe, Twilio, and Shopify
 */

/**
 * Success response with data
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} options - Additional options
 */
function success(res, data, options = {}) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  // Add pagination if provided
  if (options.pagination) {
    response.pagination = {
      page: options.pagination.page || 1,
      limit: options.pagination.limit || 50,
      total: options.pagination.total || 0,
      totalPages: Math.ceil((options.pagination.total || 0) / (options.pagination.limit || 50)),
      hasMore: (options.pagination.page || 1) < Math.ceil((options.pagination.total || 0) / (options.pagination.limit || 50))
    };
  }
  
  // Add metadata if provided
  if (options.meta) {
    response.meta = options.meta;
  }
  
  // Add links for HATEOAS
  if (options.links) {
    response.links = options.links;
  }
  
  return res.status(options.status || 200).json(response);
}

/**
 * Created response (201)
 */
function created(res, data, options = {}) {
  return success(res, data, { ...options, status: 201 });
}

/**
 * No content response (204)
 */
function noContent(res) {
  return res.status(204).end();
}

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {Error|string} error - Error object or message
 * @param {Object} options - Additional options
 */
function error(res, error, options = {}) {
  const statusCode = options.status || 500;
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = options.code || getErrorCode(statusCode);
  
  const response = {
    success: false,
    error: {
      message: errorMessage,
      code: errorCode,
      ...(options.details && { details: options.details }),
      ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
    },
    timestamp: new Date().toISOString(),
    requestId: res.req?.requestId
  };
  
  // Add help link for common errors
  if (ERROR_HELP_LINKS[errorCode]) {
    response.error.helpUrl = ERROR_HELP_LINKS[errorCode];
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Bad request response (400)
 */
function badRequest(res, message, details = null) {
  return error(res, message, { status: 400, code: 'BAD_REQUEST', details });
}

/**
 * Unauthorized response (401)
 */
function unauthorized(res, message = 'Authentication required') {
  return error(res, message, { status: 401, code: 'UNAUTHORIZED' });
}

/**
 * Forbidden response (403)
 */
function forbidden(res, message = 'Access denied') {
  return error(res, message, { status: 403, code: 'FORBIDDEN' });
}

/**
 * Not found response (404)
 */
function notFound(res, resource = 'Resource') {
  return error(res, `${resource} not found`, { status: 404, code: 'NOT_FOUND' });
}

/**
 * Conflict response (409)
 */
function conflict(res, message) {
  return error(res, message, { status: 409, code: 'CONFLICT' });
}

/**
 * Validation error response (422)
 */
function validationError(res, errors) {
  return error(res, 'Validation failed', { 
    status: 422, 
    code: 'VALIDATION_ERROR',
    details: Array.isArray(errors) ? errors : [errors]
  });
}

/**
 * Too many requests response (429)
 */
function tooManyRequests(res, retryAfter = 60) {
  res.setHeader('Retry-After', retryAfter);
  return error(res, 'Too many requests', { 
    status: 429, 
    code: 'RATE_LIMITED',
    details: { retryAfter }
  });
}

/**
 * Internal server error response (500)
 */
function serverError(res, err) {
  console.error('[SERVER_ERROR]', err);
  return error(res, 'Internal server error', { status: 500, code: 'INTERNAL_ERROR' });
}

/**
 * Service unavailable response (503)
 */
function serviceUnavailable(res, message = 'Service temporarily unavailable') {
  return error(res, message, { status: 503, code: 'SERVICE_UNAVAILABLE' });
}

/**
 * Get error code from status
 */
function getErrorCode(status) {
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    503: 'SERVICE_UNAVAILABLE'
  };
  return codes[status] || 'UNKNOWN_ERROR';
}

/**
 * Help links for common errors
 */
const ERROR_HELP_LINKS = {
  'UNAUTHORIZED': '/api-docs#authentication',
  'FORBIDDEN': '/api-docs#permissions',
  'RATE_LIMITED': '/api-docs#rate-limiting',
  'VALIDATION_ERROR': '/api-docs#validation',
  'MODULE_NOT_LICENSED': '/pricing'
};

/**
 * Async handler wrapper for Express routes
 * Automatically catches async errors and passes them to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Central error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId
  });
  
  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.code || getErrorCode(statusCode);
  let message = err.message || 'An unexpected error occurred';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    errorCode = 'CONSTRAINT_VIOLATION';
    message = 'Data constraint violation';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'External service unavailable';
  }
  
  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred. Please try again later.';
  }
  
  return error(res, message, {
    status: statusCode,
    code: errorCode,
    details: err.details
  });
}

/**
 * 404 handler middleware
 */
function notFoundHandler(req, res) {
  return notFound(res, `Endpoint ${req.method} ${req.path}`);
}

module.exports = {
  // Response helpers
  success,
  created,
  noContent,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  tooManyRequests,
  serverError,
  serviceUnavailable,
  
  // Middleware
  asyncHandler,
  errorHandler,
  notFoundHandler
};

