/**
 * ENTERPRISE MODULE - Webhooks Routes
 * 
 * Handles webhook subscription and management
 */

const express = require('express');
const router = express.Router();
const webhookService = require('./webhook.service');
const { dbPromise } = require('../../../database');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/webhooks
 * Create webhook subscription
 */
router.post('/', [
  body('url').isURL().withMessage('Valid URL is required'),
  body('events').isArray().withMessage('Events must be an array'),
  body('events.*').isString().withMessage('Each event must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { url, events, secret } = req.body;
    const userId = req.user?.id || null;
    
    const webhook = await webhookService.createWebhook({
      url,
      events,
      secret,
      userId
    });
    
    res.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret
      }
    });
  } catch (error) {
    console.error('[Webhooks] Create error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create webhook'
    });
  }
});

/**
 * GET /api/webhooks
 * List webhooks
 */
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const userId = req.user?.id;
    
    let query = 'SELECT id, url, events, active, created_at FROM webhooks WHERE 1=1';
    const params = [];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    db.all(query, params, (err, webhooks) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch webhooks'
        });
      }
      
      res.json({
        success: true,
        webhooks: webhooks.map(w => ({
          ...w,
          events: JSON.parse(w.events || '[]')
        }))
      });
    });
  } catch (error) {
    console.error('[Webhooks] List error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list webhooks'
    });
  }
});

/**
 * DELETE /api/webhooks/:id
 * Delete webhook
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    db.run('DELETE FROM webhooks WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete webhook'
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Webhook not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Webhook deleted successfully'
      });
    });
  } catch (error) {
    console.error('[Webhooks] Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete webhook'
    });
  }
});

/**
 * GET /api/webhooks/:id/deliveries
 * Get webhook delivery history
 */
router.get('/:id/deliveries', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const deliveries = await webhookService.getDeliveryHistory(id, limit);
    
    res.json({
      success: true,
      deliveries
    });
  } catch (error) {
    console.error('[Webhooks] Get deliveries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery history'
    });
  }
});

/**
 * POST /api/webhooks/test
 * Test webhook delivery
 */
router.post('/test', [
  body('url').isURL().withMessage('Valid URL is required'),
  body('event').isString().withMessage('Event is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { url, event, secret } = req.body;
    
    // Create temporary webhook for testing
    const webhook = {
      id: 0,
      url,
      secret: secret || 'test_secret',
      events: [event]
    };
    
    const result = await webhookService.deliverWebhook(webhook, event, {
      test: true,
      message: 'This is a test webhook'
    });
    
    res.json({
      success: true,
      statusCode: result.status,
      message: 'Webhook delivered successfully'
    });
  } catch (error) {
    console.error('[Webhooks] Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test webhook'
    });
  }
});

module.exports = router;

