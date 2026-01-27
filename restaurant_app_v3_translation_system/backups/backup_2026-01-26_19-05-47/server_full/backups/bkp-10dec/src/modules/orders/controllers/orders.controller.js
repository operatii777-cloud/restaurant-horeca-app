/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/delivery-cancellations.js
 */

const { dbPromise } = require('../../../database');
const { CANCELLATION_REASONS } = require('../../../constants/delivery');

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

async function checkCancellationEligibility(order) {
  const status = order.status;
  const isPlatformOrder = order.platform && order.platform !== 'phone' && order.platform !== 'pos';
  
  if (status === 'pending') {
    return { 
      allowed: true, 
      requiresApproval: false, 
      refundPercent: 100,
      reason: null 
    };
  }
  
  if (status === 'preparing') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 100,
      reason: 'Comanda este în preparare. Necesită aprobare admin.' 
    };
  }
  
  if (status === 'completed' || status === 'ready') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 75,
      reason: 'Comanda este gata. Necesită aprobare admin.' 
    };
  }
  
  if (status === 'assigned' || status === 'picked_up') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 50,
      reason: 'Comanda a fost alocată/preluată de curier. Necesită aprobare admin + motiv detaliat.' 
    };
  }
  
  if (status === 'in_transit' || status === 'delivered') {
    return { 
      allowed: false, 
      requiresApproval: false, 
      refundPercent: 0,
      reason: 'Comanda este în livrare sau a fost deja livrată. Nu poate fi anulată.' 
    };
  }
  
  return { allowed: false, reason: 'Status necunoscut' };
}

function calculateRefund(order, refundPercent) {
  const total = order.total || 0;
  const refund = (total * refundPercent) / 100;
  return Math.round(refund * 100) / 100;
}

// POST /api/orders/:id/cancel-delivery
async function cancelDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const { reason_code, reason_details, refund_method, cancelled_by } = req.body;
    
    if (!reason_code) {
      return res.status(400).json({ error: 'Motivul anulării este obligatoriu' });
    }
    
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    const canCancel = await checkCancellationEligibility(order);
    if (!canCancel.allowed) {
      return res.status(403).json({ 
        error: canCancel.reason,
        requires_approval: canCancel.requiresApproval
      });
    }
    
    const refundAmount = calculateRefund(order, canCancel.refundPercent);
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_cancellations 
        (order_id, cancelled_by, cancelled_by_id, reason_code, reason_details, 
         refund_amount, refund_method, order_status_at_cancellation, 
         courier_id_at_cancellation, requires_approval)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, cancelled_by || 'admin', req.user.id, reason_code, reason_details || null,
        refundAmount, refund_method || 'cash', order.status, order.courier_id,
        canCancel.requiresApproval ? 1 : 0
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (!canCancel.requiresApproval) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders 
          SET status = 'cancelled', 
              cancelled_timestamp = datetime('now'),
              cancelled_reason = ?
          WHERE id = ?
        `, [reason_code, id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      if (order.courier_id && global.io) {
        global.io.to(`courier_${order.courier_id}`).emit('delivery:cancelled', {
          orderId: id, reason: reason_details
        });
      }
    }
    
    if (global.io) {
      global.io.emit('delivery:cancelled', {
        orderId: id,
        reason: reason_code,
        cancelledBy: cancelled_by || 'admin',
        refundAmount
      });
    }
    
    res.json({ 
      success: true,
      refundAmount,
      requiresApproval: canCancel.requiresApproval,
      message: canCancel.requiresApproval 
        ? 'Cerere anulare trimisă spre aprobare'
        : 'Comandă anulată cu succes'
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/cancellations
async function getCancellations(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const db = await dbPromise;
    
    const cancellations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          dc.*,
          o.order_number, o.customer_name, o.total, o.platform
        FROM delivery_cancellations dc
        LEFT JOIN orders o ON dc.order_id = o.id
        ORDER BY dc.cancelled_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, cancellations: cancellations || [] });
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/cancellations/:id/approve
async function approveCancellation(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const cancellation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM delivery_cancellations WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!cancellation) {
      return res.status(404).json({ error: 'Cerere anulare negăsită' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'cancelled', 
            cancelled_timestamp = datetime('now'),
            cancelled_reason = ?
        WHERE id = ?
      `, [cancellation.reason_code, cancellation.order_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_cancellations 
        SET approved_by = ?, approved_at = datetime('now')
        WHERE id = ?
      `, [req.user.id, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Anulare aprobată' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  cancelDelivery,
  getCancellations,
  approveCancellation,
  checkAdminAuth,
};

