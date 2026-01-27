const normalizeHeader = (header = {}) => ({
  id: header.id ?? header.consumption_id ?? null,
  document_number: header.document_number ?? "",
  document_date: header.document_date ?? "",
  destination: header.destination ?? "",
  reason: header.reason ?? "",
  notes: header.notes ?? "",
});

const normalizeLines = (lines = []) =>
  lines.map((line) => ({
    id: line.id ?? line.line_id ?? undefined,
    ingredient_id: line.ingredient_id ?? null,
    ingredient_name: line.ingredient_name ?? "",
    quantity: Number(line.quantity) || 0,
    tva_percent: Number(line.tva_percent) || 0,
  }));

export const toConsumePayload = (state) => {
  const header = state?.header ?? {};
  const lines = Array.isArray(state?.lines) ? state.lines : [];
  return {
    header: {
      id: header.id ?? null,
      document_number: header.document_number,
      document_date: header.document_date,
      destination: header.destination,
      reason: header.reason,
      notes: header.notes,
    },
    lines: lines
      .filter((line) => line.ingredient_id && Number(line.quantity) > 0)
      .map((line) => ({
        ingredient_id: line.ingredient_id,
        quantity: Number(line.quantity) || 0,
        tva_percent: Number(line.tva_percent) || 0,
      })),
  };
};

export const fromConsumePayload = (apiPayload = {}) => {
  const header = normalizeHeader(apiPayload.header || apiPayload);
  const lines = normalizeLines(apiPayload.lines || apiPayload.items || []);
  const totals =
    apiPayload.totals ??
    {
      total_quantity: lines.reduce((acc, line) => acc + (Number(line.quantity) || 0), 0),
    };

  return {
    header,
    lines,
    totals,
  };
};

