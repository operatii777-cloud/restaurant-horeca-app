import { create } from "zustand";

const createEmptyHeader = () => ({
  id: null,
  document_number: "",
  document_date: "",
  location: "",
  responsible: "",
  notes: "",
});

const createEmptyLine = () => ({
  ingredient_id: null,
  ingredient_name: "",
  unit: "",
  stock_system: 0,
  stock_counted: 0,
  diff: 0,
});

const computeTotals = (lines) => {
  return lines.reduce(
    (acc, line) => {
      const diff = Number(line.diff) || 0;
      if (diff > 0) acc.total_positive += diff;
      if (diff < 0) acc.total_negative += diff;
      return acc;
    },
    { total_positive: 0, total_negative: 0 },
  );
};

const normalizeLine = (line) => {
  const stock_system = Number(line?.stock_system) || 0;
  const stock_counted = Number(line?.stock_counted) || 0;
  const diff = Number(line?.diff ?? stock_counted - stock_system) || 0;
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

const createValidationState = () => ({
  headerErrors: {},
  lineErrors: {},
  generalErrors: [],
  warnings: [],
});

export const useInventoryStore = create((set, get) => ({
  header: createEmptyHeader(),
  lines: [createEmptyLine()],
  totals: { total_positive: 0, total_negative: 0 },
  validation: createValidationState(),

  setHeader: (field, value) =>
    set((state) => ({
      header: {
        ...state.header,
        [field]: value,
      },
    })),

  setLines: (lines) =>
    set(() => {
      const normalized = lines.length ? lines.map(normalizeLine) : [createEmptyLine()];
      return {
        lines: normalized,
        totals: computeTotals(normalized),
      };
    }),

  updateLine: (lineId, field, value) =>
    set((state) => {
      const lines = state.lines.map((line) => {
        if (line.id !== lineId) return line;
        const next = { ...line, [field]: value };
        const stock_system = Number(field === "stock_system" ? value : next.stock_system) || 0;
        const stock_counted = Number(field === "stock_counted" ? value : next.stock_counted) || 0;
        next.diff = stock_counted - stock_system;
        next.stock_system = stock_system;
        next.stock_counted = stock_counted;
        return next;
      });
      return {
        lines,
        totals: computeTotals(lines),
      };
    }),

  addLine: () =>
    set((state) => {
      const lines = [...state.lines, createEmptyLine()];
      return {
        lines,
        totals: computeTotals(lines),
      };
    }),

  removeLine: (lineId) =>
    set((state) => {
      const remaining = state.lines.filter((line) => line.id !== lineId);
      const lines = remaining.length ? remaining : [createEmptyLine()];
      return {
        lines,
        totals: computeTotals(lines),
      };
    }),

  reset: () => ({
    header: createEmptyHeader(),
    lines: [createEmptyLine()],
    totals: { total_positive: 0, total_negative: 0 },
    validation: createValidationState(),
  }),

  loadFromPayload: (payload) => {
    const header = payload?.header ? { ...createEmptyHeader(), ...payload.header } : createEmptyHeader();
    const lines = Array.isArray(payload?.lines) && payload.lines.length ? payload.lines.map(normalizeLine) : [createEmptyLine()];
    set({
      header,
      lines,
      totals: payload?.totals ?? computeTotals(lines),
      validation: createValidationState(),
    });
  },

  setValidation: (validation) =>
    set(() => ({
      validation: validation ?? createValidationState(),
    })),
  clearValidation: () =>
    set(() => ({
      validation: createValidationState(),
    })),

  getState: () => get(),
}));

