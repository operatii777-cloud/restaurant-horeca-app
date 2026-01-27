const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function toNirPayload(nirState = {}) {
  const header = nirState.header ?? {};
  const lines = Array.isArray(nirState.lines) ? nirState.lines : [];

  return {
    header: {
      id: header.id ?? header.nir_id ?? undefined,
      supplier_id: header.supplier_id ?? "",
      document_number: header.document_number ?? "",
      document_date: header.document_date ?? "",
      notes: header.notes ?? "",
    },
    lines: lines.map((line) => ({
      ingredient_id: line.ingredient_id,
      quantity: toNumber(line.quantity, 0),
      unit_price: toNumber(line.unit_price, 0),
      tva_percent: toNumber(line.tva_percent, 0),
    })),
  };
}

export function fromNirPayload(apiPayload = {}) {
  const header = {
    id: apiPayload.id ?? apiPayload.nir_id ?? null,
    supplier_id: apiPayload.supplier_id ?? "",
    document_number: apiPayload.document_number ?? "",
    document_date: apiPayload.document_date ?? "",
    notes: apiPayload.notes ?? "",
  };

  const lines = Array.isArray(apiPayload.lines)
    ? apiPayload.lines.map((line) => ({
        id: line.id ?? line.line_id ?? line.uuid ?? undefined,
        ingredient_id: line.ingredient_id ?? null,
        quantity: toNumber(line.quantity, 0),
        unit_price: toNumber(line.unit_price, 0),
        tva_percent: toNumber(line.tva_percent, 0),
        total_line: toNumber(line.total_line ?? line.quantity * line.unit_price, 0),
      }))
    : [];

  return {
    header,
    lines,
  };
}
