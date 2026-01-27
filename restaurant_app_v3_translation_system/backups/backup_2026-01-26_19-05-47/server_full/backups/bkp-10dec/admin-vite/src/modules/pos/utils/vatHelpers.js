export function computeVatBreakdown(items) {
  const out = {};
  (items || []).forEach((i) => {
    const rate = (i.vat_rate != null ? Number(i.vat_rate) : (i.tva_percent != null ? Number(i.tva_percent) : 0)) || 0;
    const qty = Number(i.qty || i.quantity || 1);
    const unit = Number(i.unit_price || i.price || 0);
    const lineTotal = i.total != null ? Number(i.total) : (qty * unit);
    const base = lineTotal / (1 + rate / 100);
    const vat = lineTotal - base;
    const key = String(rate);
    if (!out[key]) out[key] = { base: 0, vat: 0 };
    out[key].base += base;
    out[key].vat += vat;
  });
  // round to 2 decimals
  Object.keys(out).forEach(k => {
    out[k].base = Math.round(out[k].base * 100) / 100;
    out[k].vat = Math.round(out[k].vat * 100) / 100;
  });
  return out;
}


