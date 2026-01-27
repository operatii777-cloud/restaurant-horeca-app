const normalizeLine = (line) => {
  const stock_system = Number(line?.stock_system) || 0;
  const stock_counted = Number(line?.stock_counted) || 0;
  const diff =
    Number(
      line?.diff ??
        line?.diff_qty ??
        stock_counted - stock_system,
    ) || 0;
  return {
    id: line?.id ?? line?.line_id ?? crypto.randomUUID?.() ?? `inventory-line-${Date.now()}-${Math.random()}`,
    ingredient_id: line?.ingredient_id ?? null,
    ingredient_name: line?.ingredient_name ?? "",
    unit: line?.unit ?? "",
    stock_system,
    stock_counted,
    diff,
  };
};

export const toInventoryPayload = (inventoryState = {}) => {
  const header = inventoryState.header ?? {};
  const lines = Array.isArray(inventoryState.lines) ? inventoryState.lines : [];
  return {
    header: {
      id: header.id ?? null,
      document_number: header.document_number,
      document_date: header.document_date,
      location: header.location,
      responsible: header.responsible,
      notes: header.notes,
    },
    lines: lines
      .filter((line) => line.ingredient_id)
      .map((line) => ({
        ingredient_id: line.ingredient_id,
        unit: line.unit,
        stock_system: Number(line.stock_system) || 0,
        stock_counted: Number(line.stock_counted) || 0,
        diff: Number(line.diff ?? Number(line.stock_counted) - Number(line.stock_system)) || 0,
      })),
  };
};

export const fromInventoryPayload = (apiPayload = {}) => {
  const header = apiPayload.header
    ? {
        id: apiPayload.header.id ?? apiPayload.id ?? null,
        document_number: apiPayload.header.document_number ?? apiPayload.document_number ?? "",
        document_date: apiPayload.header.document_date ?? apiPayload.document_date ?? "",
        location: apiPayload.header.location ?? apiPayload.location ?? "",
        responsible: apiPayload.header.responsible ?? apiPayload.responsible ?? "",
        notes: apiPayload.header.notes ?? apiPayload.notes ?? "",
      }
    : {
        id: apiPayload.id ?? null,
        document_number: apiPayload.document_number ?? "",
        document_date: apiPayload.document_date ?? "",
        location: apiPayload.location ?? "",
        responsible: apiPayload.responsible ?? "",
        notes: apiPayload.notes ?? "",
      };

  const lines =
    Array.isArray(apiPayload.lines) && apiPayload.lines.length
      ? apiPayload.lines.map((line) =>
          normalizeLine({
            ...line,
            diff: line?.diff ?? line?.diff_qty,
            unit: line?.unit ?? line?.ingredient_unit,
          }),
        )
      : [];

  const totals =
    apiPayload.totals ??
    lines.reduce(
      (acc, line) => {
        const diff = Number(line.diff) || 0;
        if (diff > 0) acc.total_positive += diff;
        if (diff < 0) acc.total_negative += diff;
        return acc;
      },
      { total_positive: 0, total_negative: 0 },
    );

  return {
    header,
    lines: lines.length ? lines : [normalizeLine({})],
    totals,
  };
};

