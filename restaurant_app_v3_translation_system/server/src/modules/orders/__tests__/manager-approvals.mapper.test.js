/**
 * Fixture test — T-CL-018 mapping against real void/discount rows
 * (triggered by Claude terminal verification, 2026-08-05, then cleaned).
 *
 * Run: node src/modules/orders/__tests__/manager-approvals.mapper.test.js
 */
const assert = require('assert');
const { mapVoidRow, mapDiscountRow } = require('../manager-approvals.mapper');

const REAL_VOID = {
  id: 13,
  order_id: 10057,
  reason: 'test - Claude terminal verification',
  voided_by: 'ospatar1',
  voided_at: '2026-08-05 20:27:40',
  order_total: 28,
  order_status_before: 'pending',
  approved_by_id: 1,
  approved_by_username: 'admin',
};

const REAL_DISCOUNT = {
  id: 2,
  order_id: 10058,
  discount_percent: 10,
  discount_amount: 0,
  client_name: null,
  initiated_by: 'ospatar1',
  approved_by_id: 1,
  approved_by_username: 'admin',
  created_at: '2026-08-05 20:28:07',
};

const voidMapped = mapVoidRow(REAL_VOID);
assert.deepStrictEqual(voidMapped, {
  id: 13,
  type: 'void',
  orderId: 10057,
  amount: 28,
  reasonOrPercent: 'test - Claude terminal verification',
  initiatedBy: 'ospatar1',
  approvedById: 1,
  approvedByUsername: 'admin',
  at: '2026-08-05 20:27:40',
});

const discountMapped = mapDiscountRow(REAL_DISCOUNT);
assert.deepStrictEqual(discountMapped, {
  id: 2,
  type: 'discount',
  orderId: 10058,
  amount: 0,
  reasonOrPercent: '10%',
  initiatedBy: 'ospatar1',
  approvedById: 1,
  approvedByUsername: 'admin',
  at: '2026-08-05 20:28:07',
});

console.log('OK manager-approvals.mapper fixtures (void id=13, discount id=2)');
