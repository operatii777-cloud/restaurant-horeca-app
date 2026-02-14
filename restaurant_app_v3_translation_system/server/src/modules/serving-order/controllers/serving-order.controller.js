/**
 * SERVING ORDER CONTROLLER
 * REST API endpoints for serving order management
 * Data: 14 Februarie 2026
 */

const servingOrderService = require('../services/serving-order.service');

class ServingOrderController {
  
  /**
   * GET /api/serving-order/groups
   * Get all serving order groups
   */
  async getAllGroups(req, res) {
    try {
      const groups = await servingOrderService.getAllGroups();
      res.json({ success: true, data: groups });
    } catch (error) {
      console.error('Error getting serving order groups:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/serving-order/groups/:id
   * Get group by ID
   */
  async getGroupById(req, res) {
    try {
      const { id } = req.params;
      const group = await servingOrderService.getGroupById(id);
      
      if (!group) {
        return res.status(404).json({ success: false, error: 'Group not found' });
      }
      
      res.json({ success: true, data: group });
    } catch (error) {
      console.error('Error getting group:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/serving-order/groups
   * Create new group
   */
  async createGroup(req, res) {
    try {
      const group = await servingOrderService.createGroup(req.body);
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * PUT /api/serving-order/groups/:id
   * Update group
   */
  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const group = await servingOrderService.updateGroup(id, req.body);
      res.json({ success: true, data: group });
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * DELETE /api/serving-order/groups/:id
   * Delete group
   */
  async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      await servingOrderService.deleteGroup(id);
      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/serving-order/assign-item
   * Assign group to order item
   */
  async assignGroupToItem(req, res) {
    try {
      const { orderItemId, groupId } = req.body;
      const result = await servingOrderService.assignGroupToItem(orderItemId, groupId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error assigning group to item:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/serving-order/order/:orderId/grouped
   * Get order items grouped by serving order
   */
  async getOrderItemsGrouped(req, res) {
    try {
      const { orderId } = req.params;
      const grouped = await servingOrderService.getOrderItemsGrouped(orderId);
      res.json({ success: true, data: grouped });
    } catch (error) {
      console.error('Error getting grouped order items:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ServingOrderController();
