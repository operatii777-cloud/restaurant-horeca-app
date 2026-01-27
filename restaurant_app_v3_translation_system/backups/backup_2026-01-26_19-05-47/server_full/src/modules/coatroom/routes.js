/**
 * ENTERPRISE MODULE
 * Phase: E7 - Coatroom Routes (logic migrated)
 * Original: routes/coatroom.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/coatroom.controller');

router.get('/tickets', controller.getTickets);
router.get('/tickets/:code', controller.getTicketByCode);
router.post('/checkin', controller.checkIn);
router.post('/checkout', controller.checkOut);
router.post('/mark-lost', controller.markLost);
router.get('/stats', controller.getStats);

module.exports = router;
