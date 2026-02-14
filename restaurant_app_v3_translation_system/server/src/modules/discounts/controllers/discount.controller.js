/**
 * DISCOUNT CONTROLLER
 * REST API endpoints for discount management
 * Data: 14 Februarie 2026
 */

const discountService = require('../services/discount.service');

class DiscountController {
  
  /**
   * GET /api/discounts
   * Get all discount definitions
   */
  async getAllDiscounts(req, res) {
    try {
      const filters = {
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
        type: req.query.type,
        applies_to: req.query.applies_to
      };
      
      const discounts = await discountService.getAllDiscounts(filters);
      res.json({ success: true, data: discounts });
    } catch (error) {
      console.error('Error getting discounts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/discounts/:id
   * Get discount by ID
   */
  async getDiscountById(req, res) {
    try {
      const { id } = req.params;
      const discount = await discountService.getDiscountById(id);
      
      if (!discount) {
        return res.status(404).json({ success: false, error: 'Discount not found' });
      }
      
      res.json({ success: true, data: discount });
    } catch (error) {
      console.error('Error getting discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/discounts
   * Create new discount
   */
  async createDiscount(req, res) {
    try {
      const discount = await discountService.createDiscount(req.body);
      res.status(201).json({ success: true, data: discount });
    } catch (error) {
      console.error('Error creating discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * PUT /api/discounts/:id
   * Update discount
   */
  async updateDiscount(req, res) {
    try {
      const { id } = req.params;
      const discount = await discountService.updateDiscount(id, req.body);
      res.json({ success: true, data: discount });
    } catch (error) {
      console.error('Error updating discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * DELETE /api/discounts/:id
   * Delete discount
   */
  async deleteDiscount(req, res) {
    try {
      const { id } = req.params;
      await discountService.deleteDiscount(id);
      res.json({ success: true, message: 'Discount deleted successfully' });
    } catch (error) {
      console.error('Error deleting discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/discounts/apply-item
   * Apply discount to order item
   */
  async applyItemDiscount(req, res) {
    try {
      const { orderItemId, discountId, userId } = req.body;
      const result = await discountService.applyItemDiscount(orderItemId, discountId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error applying item discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/discounts/apply-order
   * Apply discount to entire order
   */
  async applyOrderDiscount(req, res) {
    try {
      const { orderId, discountId, userId } = req.body;
      const result = await discountService.applyOrderDiscount(orderId, discountId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error applying order discount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/discounts/applicable
   * Get applicable discounts for context
   */
  async getApplicableDiscounts(req, res) {
    try {
      const context = {
        productId: req.query.productId ? parseInt(req.query.productId) : null,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : null,
        orderTotal: req.query.orderTotal ? parseFloat(req.query.orderTotal) : null
      };
      
      const discounts = await discountService.getApplicableDiscounts(context);
      res.json({ success: true, data: discounts });
    } catch (error) {
      console.error('Error getting applicable discounts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new DiscountController();
