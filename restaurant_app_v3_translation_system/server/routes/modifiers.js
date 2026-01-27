/**
 * MODIFIERS ROUTES - Extras, Toppings, Combos
 * Data: 04 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const modifierService = require('../services/modifier.service');

// ========================================
// MODIFIER GROUPS
// ========================================

/**
 * GET /api/modifiers/groups
 * Get all modifier groups
 */
router.get('/groups', async (req, res) => {
  try {
    const groups = await modifierService.getAllGroups();
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Error fetching modifier groups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/modifiers/groups/:id
 * Get modifier group by ID with items
 */
router.get('/groups/:id', async (req, res) => {
  try {
    const group = await modifierService.getGroupById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error fetching modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/modifiers/groups
 * Create modifier group
 */
router.post('/groups', async (req, res) => {
  try {
    const group = await modifierService.createGroup(req.body);
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error creating modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/modifiers/groups/:id
 * Update modifier group
 */
router.put('/groups/:id', async (req, res) => {
  try {
    const group = await modifierService.updateGroup(req.params.id, req.body);
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error updating modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/modifiers/groups/:id
 * Delete modifier group
 */
router.delete('/groups/:id', async (req, res) => {
  try {
    await modifierService.deleteGroup(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// MODIFIER GROUP ITEMS
// ========================================

/**
 * POST /api/modifiers/groups/:groupId/items
 * Add item to group
 */
router.post('/groups/:groupId/items', async (req, res) => {
  try {
    const item = await modifierService.addItemToGroup(req.params.groupId, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error adding modifier item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/modifiers/items/:id
 * Update modifier item
 */
router.put('/items/:id', async (req, res) => {
  try {
    const item = await modifierService.updateItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating modifier item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/modifiers/items/:id
 * Delete modifier item
 */
router.delete('/items/:id', async (req, res) => {
  try {
    await modifierService.deleteItem(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting modifier item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// PRODUCT MODIFIERS
// ========================================

/**
 * GET /api/modifiers/product/:productId
 * Get modifiers for product
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const modifiers = await modifierService.getModifiersForProduct(req.params.productId);
    res.json({ success: true, data: modifiers });
  } catch (error) {
    console.error('Error fetching product modifiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/modifiers/product/:productId
 * Save product modifiers (replace all)
 */
router.post('/product/:productId', async (req, res) => {
  try {
    const result = await modifierService.saveProductModifiers(
      req.params.productId,
      req.body.modifiers || []
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving product modifiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/modifiers/product/:productId/link/:groupId
 * Link modifier group to product
 */
router.post('/product/:productId/link/:groupId', async (req, res) => {
  try {
    await modifierService.linkGroupToProduct(
      req.params.productId,
      req.params.groupId,
      req.body
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error linking modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/modifiers/product/:productId/unlink/:groupId
 * Unlink modifier group from product
 */
router.delete('/product/:productId/unlink/:groupId', async (req, res) => {
  try {
    await modifierService.unlinkGroupFromProduct(
      req.params.productId,
      req.params.groupId
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking modifier group:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// ORDER MODIFIERS
// ========================================

/**
 * POST /api/modifiers/order-item/:orderItemId
 * Save order item modifiers
 */
router.post('/order-item/:orderItemId', async (req, res) => {
  try {
    await modifierService.saveOrderItemModifiers(
      req.params.orderItemId,
      req.body.modifiers || []
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving order item modifiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/modifiers/order-item/:orderItemId
 * Get order item modifiers
 */
router.get('/order-item/:orderItemId', async (req, res) => {
  try {
    const modifiers = await modifierService.getOrderItemModifiers(req.params.orderItemId);
    res.json({ success: true, data: modifiers });
  } catch (error) {
    console.error('Error fetching order item modifiers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

