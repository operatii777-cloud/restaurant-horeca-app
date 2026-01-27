/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Vouchers Routes (logic migrated)
 * Original: routes/vouchers.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/vouchers.controller');

router.get('/', controller.getVouchers);
router.get('/:id', controller.getVoucherById);
router.post('/', controller.createVoucher);
router.put('/:id', controller.updateVoucher);
router.delete('/:id', controller.deleteVoucher);
router.post('/validate', controller.validateVoucher);
router.post('/use', controller.useVoucher);

module.exports = router;
