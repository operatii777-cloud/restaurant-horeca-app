/**
 * PHASE E9.3 - Base Controller Pattern
 * 
 * Standard controller base class for all modules.
 * Handles HTTP requests/responses and delegates to services.
 */

/**
 * Base Controller Class
 * All module controllers should extend this
 */
class BaseController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Handle async controller methods with error handling
   */
  asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Send success response
   */
  sendSuccess(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send error response
   */
  sendError(res, error, statusCode = 500) {
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR'
    });
  }

  /**
   * Get all records
   */
  getAll = this.asyncHandler(async (req, res) => {
    const filters = req.query;
    const data = await this.service.getAll(filters);
    this.sendSuccess(res, data);
  });

  /**
   * Get record by ID
   */
  getById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await this.service.getById(id);
    this.sendSuccess(res, data);
  });

  /**
   * Create new record
   */
  create = this.asyncHandler(async (req, res) => {
    const data = await this.service.create(req.body);
    this.sendSuccess(res, data, 'Record created successfully', 201);
  });

  /**
   * Update record
   */
  update = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await this.service.update(id, req.body);
    this.sendSuccess(res, data, 'Record updated successfully');
  });

  /**
   * Delete record
   */
  delete = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.service.delete(id);
    this.sendSuccess(res, null, 'Record deleted successfully');
  });
}

module.exports = { BaseController };

