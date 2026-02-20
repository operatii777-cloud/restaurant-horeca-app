const express = require('express');
const router = express.Router();

const reservations = [];
const orders = [];
const reviews = [];
const tips = [];
const offers = [];
const gamification = new Map();

// Seed offers
[
  { id: 'OFF-001', title: '20% off Monday Lunch', discount: 0.20, validDays: ['Monday'], minSpend: 50, aiGenerated: true },
  { id: 'OFF-002', title: 'Free Dessert on Birthday', discount: 1.0, validDays: 'birthday', minSpend: 0, aiGenerated: true },
  { id: 'OFF-003', title: 'Loyalty Points x2 This Weekend', discount: 0, pointsMultiplier: 2, validDays: ['Saturday', 'Sunday'], aiGenerated: true },
].forEach(o => offers.push(o));

// POST /api/superapp/reserve - Make reservation
router.post('/reserve', (req, res) => {
  const { guestId, restaurantId, date, time, covers, specialRequests } = req.body;
  if (!guestId || !date || !time) return res.status(400).json({ error: 'guestId, date and time required' });
  const reservation = {
    id: 'RES-' + Date.now(),
    guestId, restaurantId, date, time, covers: covers || 2, specialRequests,
    status: 'CONFIRMED',
    confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  reservations.push(reservation);
  res.json(reservation);
});

// GET /api/superapp/reservations/:guestId - Guest reservations
router.get('/reservations/:guestId', (req, res) => {
  const guestReservations = reservations.filter(r => r.guestId === req.params.guestId);
  res.json({ reservations: guestReservations });
});

// POST /api/superapp/order - Place order
router.post('/order', (req, res) => {
  const { guestId, restaurantId, items, deliveryAddress, channel } = req.body;
  const order = {
    id: 'ORD-' + Date.now(),
    guestId, restaurantId, items,
    deliveryAddress, channel: channel || 'APP',
    status: 'RECEIVED',
    total: (items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
    estimatedTime: 25,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.json(order);
});

// GET /api/superapp/orders/:guestId - Guest orders
router.get('/orders/:guestId', (req, res) => {
  const guestOrders = orders.filter(o => o.guestId === req.params.guestId);
  res.json({ orders: guestOrders });
});

// GET /api/superapp/offers/:guestId - AI personalized offers
router.get('/offers/:guestId', (req, res) => {
  res.json({ offers, aiPersonalized: true, guestId: req.params.guestId });
});

// POST /api/superapp/review - Submit instant review
router.post('/review', (req, res) => {
  const { guestId, restaurantId, orderId, rating, comment, tags } = req.body;
  if (!guestId || !rating) return res.status(400).json({ error: 'guestId and rating required' });
  const review = {
    id: 'REV-' + Date.now(),
    guestId, restaurantId, orderId,
    rating, comment, tags: tags || [],
    createdAt: new Date().toISOString(),
    visible: true,
  };
  reviews.push(review);
  res.json(review);
});

// GET /api/superapp/reviews/:restaurantId - Restaurant reviews
router.get('/reviews/:restaurantId', (req, res) => {
  const restaurantReviews = reviews.filter(r => r.restaurantId === req.params.restaurantId);
  const avg = restaurantReviews.length > 0 ? restaurantReviews.reduce((s, r) => s + r.rating, 0) / restaurantReviews.length : 0;
  res.json({ reviews: restaurantReviews, avgRating: avg.toFixed(1), total: restaurantReviews.length });
});

// POST /api/superapp/tip - Send tip to staff
router.post('/tip', (req, res) => {
  const { guestId, staffId, orderId, amount, message } = req.body;
  if (!guestId || !amount) return res.status(400).json({ error: 'guestId and amount required' });
  const tip = { id: 'TIP-' + Date.now(), guestId, staffId, orderId, amount, message, ts: new Date().toISOString() };
  tips.push(tip);
  res.json(tip);
});

// GET /api/superapp/loyalty/:guestId - Loyalty status
router.get('/loyalty/:guestId', (req, res) => {
  const points = Math.floor(Math.random() * 2000) + 500;
  const tier = points > 2000 ? 'GOLD' : points > 1000 ? 'SILVER' : 'BRONZE';
  res.json({
    guestId: req.params.guestId,
    points,
    tier,
    nextTierPoints: tier === 'BRONZE' ? 1000 - points : tier === 'SILVER' ? 2000 - points : null,
    rewards: [
      { id: 'RWD-1', name: 'Free Coffee', pointsCost: 200, available: points >= 200 },
      { id: 'RWD-2', name: '10% Discount', pointsCost: 500, available: points >= 500 },
      { id: 'RWD-3', name: 'Free Main Course', pointsCost: 1000, available: points >= 1000 },
    ],
  });
});

// GET /api/superapp/gamification/:guestId - Gamification status
router.get('/gamification/:guestId', (req, res) => {
  const gid = req.params.guestId;
  if (!gamification.has(gid)) {
    gamification.set(gid, {
      level: Math.floor(Math.random() * 10) + 1,
      badges: ['First Visit', 'Foodie', 'Weekend Warrior'],
      streak: Math.floor(Math.random() * 14),
      challenges: [
        { name: 'Order 5 different cuisines', progress: 3, target: 5, reward: '500 points' },
        { name: 'Visit 3 locations', progress: 1, target: 3, reward: '300 points' },
      ],
    });
  }
  res.json({ guestId: gid, ...gamification.get(gid) });
});

module.exports = router;
