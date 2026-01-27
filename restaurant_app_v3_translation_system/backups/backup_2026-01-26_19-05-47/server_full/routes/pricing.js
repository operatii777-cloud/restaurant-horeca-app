/**
 * PRICING ROUTES - API pentru Dynamic Pricing
 * Data: 03 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const PricingService = require('../services/pricing.service');

// GET dynamic price for product
router.get('/dynamic/:productId', async (req, res) => {
  try {
    const { portionId } = req.query;
    
    const pricing = await PricingService.getDynamicPrice(
      parseInt(req.params.productId),
      portionId ? parseInt(portionId) : null
    );
    
    res.json({ success: true, data: pricing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

