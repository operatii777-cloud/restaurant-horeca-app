// Validator Middleware
// Purpose: Request validation utilities
// Created: 21 Oct 2025, 21:20
// Part of: BATCH #4 - Middleware

const { AppError } = require('./errorHandler');

/**
 * Common validation functions
 */
const validators = {
    /**
     * Check if value is a positive number
     */
    isPositiveNumber: (value) => {
        return typeof value === 'number' && value > 0;
    },

    /**
     * Check if value is a valid price (positive, max 2 decimals)
     */
    isValidPrice: (value) => {
        if (typeof value !== 'number') return false;
        if (value < 0) return false;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
    },

    /**
     * Check if value is a valid Romanian CUI
     */
    isValidCUI: (value) => {
        if (typeof value !== 'string') return false;
        return /^RO\d{6,10}$/.test(value);
    },

    /**
     * Check if value is a valid TVA rate
     */
    isValidTVA: (value) => {
        const validRates = [9, 19, 24];
        return validRates.includes(parseFloat(value));
    },

    /**
     * Check if value is a valid date
     */
    isValidDate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    },

    /**
     * Check if value is a valid email
     */
    isValidEmail: (value) => {
        if (typeof value !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    /**
     * Check if value is a valid phone number
     */
    isValidPhone: (value) => {
        if (typeof value !== 'string') return false;
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        return phoneRegex.test(value) && value.length >= 10;
    },

    /**
     * Check if string is not empty
     */
    isNotEmpty: (value) => {
        return typeof value === 'string' && value.trim().length > 0;
    },

    /**
     * Check if value is within range
     */
    isInRange: (value, min, max) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

/**
 * Validate request body against schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Skip other validations if not required and not provided
            if (!rules.required && (value === undefined || value === null)) {
                continue;
            }

            // Type check
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                    continue;
                }
            }

            // Min length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }

            // Max length
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must be at most ${rules.maxLength} characters`);
            }

            // Min value
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }

            // Max value
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`);
            }

            // Custom validator
            if (rules.validator && !rules.validator(value)) {
                errors.push(rules.message || `${field} is invalid`);
            }

            // Enum check
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return next(new AppError(`Validation failed: ${errors.join('; ')}`, 400));
        }

        next();
    };
};

/**
 * Validate URL parameters
 * @param {Object} schema - Parameter validation schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [param, rules] of Object.entries(schema)) {
            const value = req.params[param];

            if (rules.required && !value) {
                errors.push(`${param} parameter is required`);
                continue;
            }

            if (rules.type === 'number') {
                const num = parseInt(value, 10);
                if (isNaN(num)) {
                    errors.push(`${param} must be a valid number`);
                } else {
                    req.params[param] = num;
                }
            }

            if (rules.validator && !rules.validator(value)) {
                errors.push(rules.message || `${param} is invalid`);
            }
        }

        if (errors.length > 0) {
            return next(new AppError(`Invalid parameters: ${errors.join('; ')}`, 400));
        }

        next();
    };
};

/**
 * Sanitize input (remove potential XSS)
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitize = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove potential XSS
            sanitized[key] = value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        } else if (typeof value === 'object') {
            sanitized[key] = sanitize(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

module.exports = {
    validators,
    validateBody,
    validateParams,
    sanitize
};

// Example usage:
// const { validateBody, validators } = require('./middleware/validator');
//
// router.post('/products', validateBody({
//     name: { required: true, type: 'string', minLength: 3 },
//     price: { required: true, type: 'number', validator: validators.isValidPrice },
//     vat_rate: { required: true, validator: validators.isValidTVA }
// }), async (req, res) => {
//     // req.body is now validated
// });

