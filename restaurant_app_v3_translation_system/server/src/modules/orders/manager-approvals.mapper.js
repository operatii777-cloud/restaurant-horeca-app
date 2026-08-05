/**
 * T-CL-018 — pure mappers for manager-approvals journal rows.
 * Kept separate from Express so fixture tests can run without DB/server.
 *
 * Real Windows schema columns (from live void/discount rows, 2026-08-05):
 *   order_voids: id, order_id, reason, voided_by, voided_at, order_total,
 *                order_status_before, approved_by_id, approved_by_username
 *   discount_approval_log: id, order_id, discount_percent, discount_amount,
 *                client_name, initiated_by, approved_by_id, approved_by_username, created_at
 */

function firstDefined(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null) return v;
  }
  return null;
}

/**
 * @param {object} row raw order_voids row
 * @returns {{ id, type:'void', orderId, amount, reasonOrPercent, initiatedBy, approvedById, approvedByUsername, at }}
 */
function mapVoidRow(row) {
  return {
    id: row.id,
    type: 'void',
    orderId: firstDefined(row.order_id, row.orderId),
    amount: Number(firstDefined(row.order_total, row.amount, row.total, 0)),
    reasonOrPercent: firstDefined(row.reason, row.reason_or_percent, '') || '',
    initiatedBy: firstDefined(row.voided_by, row.initiated_by, row.initiated_by_name),
    approvedById: firstDefined(row.approved_by_id, row.approved_by),
    approvedByUsername: firstDefined(row.approved_by_username, row.approved_by_name, '') || '',
    at: firstDefined(row.voided_at, row.approved_at, row.created_at, row.at),
  };
}

/**
 * @param {object} row raw discount_approval_log row
 */
function mapDiscountRow(row) {
  const percent = firstDefined(row.discount_percent, row.discount_value, null);
  const reason =
    firstDefined(row.reason_or_percent, row.reason, null) ??
    (percent != null ? `${percent}%` : '');

  return {
    id: row.id,
    type: 'discount',
    orderId: firstDefined(row.order_id, row.orderId),
    amount: Number(firstDefined(row.discount_amount, row.amount, 0)),
    reasonOrPercent: reason,
    initiatedBy: firstDefined(row.initiated_by, row.initiated_by_name),
    approvedById: firstDefined(row.approved_by_id, row.approved_by),
    approvedByUsername: firstDefined(row.approved_by_username, row.approved_by_name, '') || '',
    at: firstDefined(row.created_at, row.approved_at, row.at),
  };
}

module.exports = { mapVoidRow, mapDiscountRow };
