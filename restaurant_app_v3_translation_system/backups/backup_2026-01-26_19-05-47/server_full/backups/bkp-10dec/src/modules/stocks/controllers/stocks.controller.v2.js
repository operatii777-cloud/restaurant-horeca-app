/**
 * PHASE E9.3 - Stocks Controller (3-Layer Architecture)
 * 
 * HTTP request/response handler for stocks module.
 * Uses service layer for business logic.
 */

const { BaseController } = require('../../../utils/controller.base');
const StocksService = require('../services/stocks.service');

class StocksController extends BaseController {
  constructor() {
    super(new StocksService());
  }

  /**
   * GET /api/stocks
   */
  getStocks = this.asyncHandler(async (req, res) => {
    const filters = {
      category: req.query.category,
      minStock: req.query.minStock ? parseFloat(req.query.minStock) : undefined
    };
    const data = await this.service.getStocks(filters);
    this.sendSuccess(res, data);
  });

  /**
   * GET /api/stocks/alerts/low
   */
  getLowStockAlerts = this.asyncHandler(async (req, res) => {
    const data = await this.service.getLowStockAlerts();
    this.sendSuccess(res, data);
  });

  /**
   * GET /api/stocks/ingredient/:ingredientId
   */
  getIngredientStock = this.asyncHandler(async (req, res) => {
    const { ingredientId } = req.params;
    const data = await this.service.getIngredientStock(ingredientId);
    this.sendSuccess(res, data);
  });

  /**
   * GET /api/stocks/history/:ingredientId
   */
  getStockHistory = this.asyncHandler(async (req, res) => {
    const { ingredientId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const data = await this.service.getStockHistory(ingredientId, limit);
    this.sendSuccess(res, data);
  });

  /**
   * POST /api/stocks/adjust
   */
  adjustStock = this.asyncHandler(async (req, res) => {
    const { ingredient_id, quantity, reason, notes } = req.body;
    
    if (!ingredient_id || quantity === undefined || !reason) {
      return this.sendError(res, new Error('ingredient_id, quantity, and reason are required'), 400);
    }

    const data = await this.service.adjustStock(ingredient_id, quantity, reason, notes);
    this.sendSuccess(res, data, 'Stock adjusted successfully');
  });
}

// Export singleton instance
const controller = new StocksController();
module.exports = {
  getStocks: controller.getStocks.bind(controller),
  getLowStockAlerts: controller.getLowStockAlerts.bind(controller),
  getIngredientStock: controller.getIngredientStock.bind(controller),
  getStockHistory: controller.getStockHistory.bind(controller),
  adjustStock: controller.adjustStock.bind(controller)
};

