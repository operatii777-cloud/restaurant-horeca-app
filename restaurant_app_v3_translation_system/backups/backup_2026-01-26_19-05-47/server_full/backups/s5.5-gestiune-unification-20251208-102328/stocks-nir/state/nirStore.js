import { create } from "zustand";

const generateLineId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nir-line-${Date.now()}-${Math.random()}`);

const createEmptyLine = () => ({
  id: generateLineId(),
  ingredient_id: null,
  quantity: 0,
  unit_price: 0,
  tva_percent: 9,
  total_line: 0,
});

const computeTotals = (lines) => {
  const totals = lines.reduce(
    (acc, line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unit_price) || 0;
      const tvaPercent = Number(line.tva_percent) || 0;
      const lineTotal = quantity * unitPrice;
      const lineTva = lineTotal * (tvaPercent / 100);
      acc.total_value += lineTotal;
      acc.total_tva += lineTva;
      return acc;
    },
    { total_value: 0, total_tva: 0, grand_total: 0 },
  );
  totals.grand_total = totals.total_value + totals.total_tva;
  return totals;
};

const normalizeLine = (line) => {
  const quantity = Number(line?.quantity) || 0;
  const unitPrice = Number(line?.unit_price) || 0;
  const tvaPercent = Number(line?.tva_percent) || 0;
  return {
    id: line?.id || line?.line_id || generateLineId(),
    ingredient_id: line?.ingredient_id ?? null,
    quantity,
    unit_price: unitPrice,
    tva_percent: tvaPercent,
    total_line: Number(line?.total_line) || quantity * unitPrice,
  };
};

const createValidationState = () => ({
  headerErrors: {},
  lineErrors: {},
  generalErrors: [],
  warnings: [],
});

const initialState = {
  header: {
    supplier_id: "",
    document_number: "",
    document_date: "",
    notes: "",
  },
  lines: [],
  totals: { total_value: 0, total_tva: 0, grand_total: 0 },
  validation: createValidationState(),
};

export const useNirStore = create((set, get) => ({
  ...initialState,
  setHeader: (field, value) =>
    set((state) => ({
      header: {
        ...state.header,
        [field]: value,
      },
    })),
  addLine: () =>
    set((state) => {
      const lines = [...state.lines, createEmptyLine()];
      const totals = computeTotals(lines);
      return {
        lines,
        totals,
      };
    }),
  updateLine: (lineId, field, value) =>
    set((state) => {
      const lines = state.lines.map((line) => {
        if (line.id !== lineId) return line;
        const updatedLine = {
          ...line,
          [field]: value,
        };
        if (field === "quantity" || field === "unit_price") {
          const qty = Number(field === "quantity" ? value : updatedLine.quantity) || 0;
          const price = Number(field === "unit_price" ? value : updatedLine.unit_price) || 0;
          updatedLine.total_line = qty * price;
        }
        return updatedLine;
      });
      const totals = computeTotals(lines);
      return {
        lines,
        totals,
      };
    }),
  removeLine: (lineId) =>
    set((state) => {
      const filtered = state.lines.filter((line) => line.id !== lineId);
      const lines = filtered.length ? filtered : [createEmptyLine()];
      const totals = computeTotals(lines);
      return {
        lines,
        totals,
      };
    }),
  setLines: (lines) =>
    set(() => {
      const normalized = lines.length ? lines.map(normalizeLine) : [createEmptyLine()];
      const totals = computeTotals(normalized);
      return {
        lines: normalized,
        totals,
      };
    }),
  recalcTotals: () =>
    set((state) => ({
      totals: (() => {
        const totals = computeTotals(state.lines);
        totals.grand_total = totals.total_value + totals.total_tva;
        return totals;
      })(),
    })),
  reset: () =>
    set(() => ({
      header: { ...initialState.header },
      lines: [],
      totals: { total_value: 0, total_tva: 0, grand_total: 0 },
      validation: createValidationState(),
    })),
  loadFromPayload: (payload) => {
    const headerPayload = payload?.header ?? payload ?? {};
    const header = {
      supplier_id: headerPayload?.supplier_id ?? headerPayload?.supplierId ?? "",
      document_number: headerPayload?.document_number ?? headerPayload?.documentNumber ?? "",
      document_date: headerPayload?.document_date ?? headerPayload?.documentDate ?? "",
      notes: headerPayload?.notes ?? "",
    };
    const rawLines = Array.isArray(payload?.lines) ? payload.lines : payload?.header?.lines ?? [];
    const lines = rawLines.length ? rawLines.map(normalizeLine) : [createEmptyLine()];
    const totals = computeTotals(lines);
    totals.grand_total = totals.total_value + totals.total_tva;
    set({
      header,
      lines,
      totals: computeTotals(lines),
      validation: createValidationState(),
    });
  },
  setValidation: (validationResult) =>
    set(() => ({
      validation: {
        headerErrors: validationResult?.headerErrors ?? {},
        lineErrors: validationResult?.lineErrors ?? {},
        generalErrors: validationResult?.generalErrors ?? [],
        warnings: validationResult?.warnings ?? [],
      },
    })),
  clearValidation: () =>
    set(() => ({
      validation: createValidationState(),
    })),
  getState: () => get(),
}));
