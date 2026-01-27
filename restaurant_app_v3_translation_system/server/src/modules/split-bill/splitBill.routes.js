/**
 * Split Bill Routes
 */

const express = require('express');
const router = express.Router();
const splitBillController = require('./splitBill.controller');

// GET /api/split-bill/order/:orderId/status
router.get('/order/:orderId/status', splitBillController.getPaymentStatus.bind(splitBillController));

// POST /api/split-bill/order/:orderId/pay
router.post('/order/:orderId/pay', splitBillController.processGroupPayment.bind(splitBillController));

module.exports = router;

