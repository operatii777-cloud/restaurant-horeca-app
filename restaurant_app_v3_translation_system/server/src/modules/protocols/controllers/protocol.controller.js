/**
 * PROTOCOL CONTROLLER
 * REST API endpoints for protocol sales management
 * Data: 14 Februarie 2026
 */

const protocolService = require('../services/protocol.service');

class ProtocolController {
  
  /**
   * GET /api/protocols
   * Get all protocols
   */
  async getAllProtocols(req, res) {
    try {
      const filters = {
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined
      };
      
      const protocols = await protocolService.getAllProtocols(filters);
      res.json({ success: true, data: protocols });
    } catch (error) {
      console.error('Error getting protocols:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/protocols/:id
   * Get protocol by ID
   */
  async getProtocolById(req, res) {
    try {
      const { id } = req.params;
      const protocol = await protocolService.getProtocolById(id);
      
      if (!protocol) {
        return res.status(404).json({ success: false, error: 'Protocol not found' });
      }
      
      res.json({ success: true, data: protocol });
    } catch (error) {
      console.error('Error getting protocol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/protocols
   * Create new protocol
   */
  async createProtocol(req, res) {
    try {
      const protocol = await protocolService.createProtocol(req.body);
      res.status(201).json({ success: true, data: protocol });
    } catch (error) {
      console.error('Error creating protocol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * PUT /api/protocols/:id
   * Update protocol
   */
  async updateProtocol(req, res) {
    try {
      const { id } = req.params;
      const protocol = await protocolService.updateProtocol(id, req.body);
      res.json({ success: true, data: protocol });
    } catch (error) {
      console.error('Error updating protocol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * DELETE /api/protocols/:id
   * Delete protocol
   */
  async deleteProtocol(req, res) {
    try {
      const { id } = req.params;
      await protocolService.deleteProtocol(id);
      res.json({ success: true, message: 'Protocol deleted successfully' });
    } catch (error) {
      console.error('Error deleting protocol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/protocols/:id/apply-to-order
   * Apply protocol to order
   */
  async applyProtocolToOrder(req, res) {
    try {
      const { id } = req.params;
      const { orderId } = req.body;
      
      const result = await protocolService.applyProtocolToOrder(orderId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error applying protocol to order:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/protocols/:id/generate-invoice
   * Generate invoice for protocol
   */
  async generateInvoice(req, res) {
    try {
      const { id } = req.params;
      const { periodStart, periodEnd } = req.body;
      
      const invoice = await protocolService.generateProtocolInvoice(id, periodStart, periodEnd);
      res.json({ success: true, data: invoice });
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/protocols/:id/invoices
   * Get invoices for protocol
   */
  async getProtocolInvoices(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        status: req.query.status
      };
      
      const invoices = await protocolService.getProtocolInvoices(id, filters);
      res.json({ success: true, data: invoices });
    } catch (error) {
      console.error('Error getting protocol invoices:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ProtocolController();
