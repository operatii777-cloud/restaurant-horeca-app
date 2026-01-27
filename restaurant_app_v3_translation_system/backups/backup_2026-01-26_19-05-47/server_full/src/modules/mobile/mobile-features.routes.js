/**
 * MOBILE APP FEATURES ROUTES
 * 
 * Routes pentru:
 * - Nutritional info
 * - Deals personalizate
 * - Rating system
 * - Referral program
 */

const express = require('express');
const router = express.Router();

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

// Nutritional Info
const nutritionController = require('./mobile-nutrition.controller');
router.get('/products/:id/nutrition', checkAuth, nutritionController.getProductNutrition);
router.get('/products/nutrition/filter', checkAuth, nutritionController.filterProductsByNutrition);

// Deals Personalizate
const dealsController = require('./mobile-deals.controller');
router.get('/deals/personalized', checkAuth, dealsController.getPersonalizedDeals);
router.get('/deals/active', checkAuth, dealsController.getActiveDeals);

// Rating System
const ratingController = require('./mobile-rating.controller');
router.post('/orders/:id/rating', checkAuth, ratingController.submitOrderRating);
router.post('/products/:id/rating', checkAuth, ratingController.submitProductRating);
router.get('/products/:id/ratings', checkAuth, ratingController.getProductRatings);

// Referral Program
const referralController = require('./mobile-referral.controller');
router.post('/referral/generate-code', checkAuth, referralController.generateReferralCode);
router.post('/referral/use', checkAuth, referralController.useReferralCode);
router.get('/referral/stats', checkAuth, referralController.getReferralStats);

// Quick Reorder
const reorderController = require('./mobile-reorder.controller');
router.get('/orders/last', checkAuth, reorderController.getLastOrder);
router.get('/orders/frequent', checkAuth, reorderController.getFrequentOrders);
router.post('/orders/:id/reorder', checkAuth, reorderController.reorderOrder);

// Location Services
const locationController = require('./mobile-location.controller');
router.get('/location/nearest-restaurants', checkAuth, locationController.getNearestRestaurants);
router.post('/location/delivery-availability', checkAuth, locationController.checkDeliveryAvailability);
router.post('/location/geofence-register', checkAuth, locationController.registerGeofence);
router.get('/location/estimate-delivery-time', checkAuth, locationController.estimateDeliveryTime);

module.exports = router;
