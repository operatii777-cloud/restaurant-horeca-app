/**
 * PHASE E9.4 - Request Validation Middleware
 * 
 * Input validation using Zod or JOI.
 * Prevents invalid data from reaching controllers.
 */

// Using Zod for validation (lightweight, TypeScript-friendly)
// If Zod is not available, we'll use a simple validation helper

/**
 * Simple validation helper (fallback if Zod not available)
 */
class SimpleValidator {
  static string(value, options = {}) {
    if (typeof value !== 'string') {
      throw new Error(`Expected string, got ${typeof value}`);
    }
    if (options.min && value.length < options.min) {
      throw new Error(`String must be at least ${options.min} characters`);
    }
    if (options.max && value.length > options.max) {
      throw new Error(`String must be at most ${options.max} characters`);
    }
    return value;
  }

  static number(value, options = {}) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error('Expected number');
    }
    if (options.min !== undefined && num < options.min) {
      throw new Error(`Number must be at least ${options.min}`);
    }
    if (options.max !== undefined && num > options.max) {
      throw new Error(`Number must be at most ${options.max}`);
    }
    return num;
  }

  static integer(value, options = {}) {
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new Error('Expected integer');
    }
    if (options.min !== undefined && num < options.min) {
      throw new Error(`Integer must be at least ${options.min}`);
    }
    if (options.max !== undefined && num > options.max) {
      throw new Error(`Integer must be at most ${options.max}`);
    }
    return num;
  }

  static email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return value;
  }

  static required(value) {
    if (value === undefined || value === null || value === '') {
      throw new Error('Field is required');
    }
    return value;
  }

  static optional(value, validator) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return validator(value);
  }

  static array(value, itemValidator) {
    if (!Array.isArray(value)) {
      throw new Error('Expected array');
    }
    return value.map(item => itemValidator(item));
  }
}

/**
 * Validation middleware factory
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const data = { ...req.body, ...req.query, ...req.params };
      const validated = schema(data);
      req.validated = validated;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message
      });
    }
  };
}

/**
 * Sanitize input (anti SQL injection, XSS)
 */
function sanitizeInput(value) {
  if (typeof value === 'string') {
    // Remove potential SQL injection patterns
    value = value.replace(/['";\\]/g, '');
    // Remove potential XSS patterns
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Trim whitespace
    value = value.trim();
  }
  return value;
}

/**
 * Sanitize middleware
 */
function sanitize(req, res, next) {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

/**
 * Recursively sanitize object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Common validation schemas
 */
const commonSchemas = {
  id: (data) => {
    SimpleValidator.required(data.id);
    return SimpleValidator.integer(data.id, { min: 1 });
  },
  
  pagination: (data) => {
    return {
      page: data.page ? SimpleValidator.integer(data.page, { min: 1 }) : 1,
      limit: data.limit ? SimpleValidator.integer(data.limit, { min: 1, max: 100 }) : 20
    };
  },
  
  dateRange: (data) => {
    return {
      startDate: data.startDate ? SimpleValidator.string(data.startDate) : null,
      endDate: data.endDate ? SimpleValidator.string(data.endDate) : null
    };
  }
};

module.exports = {
  SimpleValidator,
  validate,
  sanitize,
  sanitizeInput,
  sanitizeObject,
  commonSchemas
};

