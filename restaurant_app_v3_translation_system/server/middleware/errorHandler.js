// Error Handler Middleware
// Purpose: Centralized error handling for Express
// Created: 21 Oct 2025, 21:20
// Part of: BATCH #4 - Middleware

/**
 * Custom Application Error
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error Handler Middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log error
    console.error(`[${new Date().toISOString()}] ERROR:`, {
        statusCode: err.statusCode,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    if (process.env.NODE_ENV !== 'production') {
        console.error('Stack:', err.stack);
    }

    // Operational errors (expected) - send details to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            timestamp: err.timestamp
        });
    }

    // Programming errors (bugs) - don't leak details
    return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please contact support.',
        timestamp: new Date().toISOString()
    });
};

/**
 * Async handler wrapper
 * Eliminates try-catch in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        404
    );
    next(error);
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    notFoundHandler
};

// Example usage:
// const { asyncHandler, AppError } = require('./middleware/errorHandler');
//
// router.get('/users/:id', asyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//         throw new AppError('User not found', 404);
//     }
//     res.json({ success: true, data: user });
// }));

