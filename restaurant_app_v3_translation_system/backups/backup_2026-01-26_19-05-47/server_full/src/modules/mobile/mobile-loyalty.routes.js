/**
 * MOBILE APP LOYALTY ROUTES
 */

const express = require('express');
const router = express.Router();
const loyaltyController = require('./mobile-loyalty.controller');

// Middleware de autentificare pentru mobile app
function checkAuth(req, res, next) {
  // Extrage email-ul din token, body sau query
  // Pentru mobile app, token-ul este în header Authorization sau în body
  const authHeader = req.headers.authorization;
  let customerEmail = null;
  
  // Încearcă să extragă din token (dacă e implementat JWT)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // TODO: Decode JWT token pentru a extrage customer_email
    // Pentru moment, folosim email-ul din body sau query
  }
  
  // Extrage din body sau query
  customerEmail = req.body.customer_email || req.query.customer_email || req.user?.email;
  
  // Pentru endpoints GET, email-ul poate fi în query
  if (!customerEmail && req.method === 'GET') {
    customerEmail = req.query.customer_email;
  }
  
  // Setează req.user pentru controller-e
  req.user = {
    id: req.body.user_id || req.query.user_id || 1,
    email: customerEmail,
  };
  
  next();
}

// Points
router.get('/points', checkAuth, loyaltyController.getPoints);
router.post('/add-points', checkAuth, loyaltyController.addPoints);

// Vouchers
router.get('/vouchers', checkAuth, loyaltyController.getVouchers);
router.post('/use-voucher', checkAuth, loyaltyController.useVoucher);

module.exports = router;
