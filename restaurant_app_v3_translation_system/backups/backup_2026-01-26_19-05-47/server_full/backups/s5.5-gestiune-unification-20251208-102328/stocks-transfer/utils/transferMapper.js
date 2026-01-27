export const toTransferPayload = (state = {}) => {
  const header = state.header || {};
  const lines = Array.isArray(state.lines) ? state.lines : [];
  return {
    header: {
      id: header.id ?? null,
      document_number: header.document_number,
      document_date: header.document_date,
      source_location: header.source_location,
      target_location: header.target_location,
      responsible: header.responsible,
      notes: header.notes || "",
    },
    lines: lines.map((l) => ({
      ingredient_id: l.ingredient_id,
      unit: l.unit,
      quantity: Number(l.quantity || 0),
    })),
  };
};

export const fromTransferPayload = (payload = {}) => {
  const header = payload.header || {};
  const lines =
    Array.isArray(payload.lines) && payload.lines.length
      ? payload.lines.map((l) => ({
          ingredient_id: l.ingredient_id ?? null,
          ingredient_name: l.ingredient_name ?? "",
          unit: l.unit ?? "",
          quantity: Number(l.quantity || 0),
          cost_unit: Number(l.cost_unit || 0),
          value_total: Number(l.value_total || 0),
        }))
      : [];
  const totals =
    payload.totals ||
    {
      total_value: lines.reduce((s, l) => s + (Number(l.value_total || 0) || 0), 0),
    };
  return { header, lines, totals };
};


