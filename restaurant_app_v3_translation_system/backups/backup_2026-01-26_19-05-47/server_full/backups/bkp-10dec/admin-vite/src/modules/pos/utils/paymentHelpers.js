export function computePaidTotal(payments) {
  return (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function computeRemaining(total, payments) {
  const t = Number(total || 0);
  const paid = computePaidTotal(payments);
  const rem = t - paid;
  return rem > 0 ? Math.round(rem * 100) / 100 : 0;
}

export function canFiscalize(order, payments) {
  const remaining = computeRemaining(order?.total || 0, payments);
  return remaining === 0;
}


