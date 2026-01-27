import { create } from "zustand";

const generateLineId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `consume-line-${Date.now()}-${Math.random()}`);

const createEmptyHeader = () => ({
  id: null,
  document_number: "",
  document_date: "",
  destination: "",
  reason: "",
  notes: "",
});

const createEmptyLine = () => ({
  id: generateLineId(),
  ingredient_id: null,
  ingredient_name: "",
  quantity: 0,
  tva_percent: 0,
});

const computeTotals = (lines) => {
  return lines.reduce(
    (acc, line) => {
      acc.total_quantity += Number(line.quantity) || 0;
      return acc;
    },
    { total_quantity: 0 },
  );
};

const normalizeLine = (line) => ({
  id: line?.id || generateLineId(),
  ingredient_id: line?.ingredient_id ?? null,
  ingredient_name: line?.ingredient_name ?? "",
  quantity: Number(line?.quantity) || 0,
  tva_percent: Number(line?.tva_percent) || 0,
});

const createValidationState = () => ({
  headerErrors: {},
  lineErrors: {},
  generalErrors: [],
  warnings: [],
});

const initialState = {
  header: createEmptyHeader(),
  lines: [createEmptyLine()],
  totals: { total_quantity: 0 },
  validation: createValidationState(),
};

export const useConsumeStore = create((set, get) => ({
  ...initialState,
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
        return {
          ...line,
          [field]: value,
        };
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
    totals: { total_quantity: 0 },
    validation: createValidationState(),
  }),
  loadFromPayload: (payload) => {
    const header = payload?.header ? { ...createEmptyHeader(), ...payload.header } : createEmptyHeader();
    const lines = Array.isArray(payload?.lines) && payload.lines.length ? payload.lines.map(normalizeLine) : [createEmptyLine()];
    const totals = payload?.totals ?? computeTotals(lines);
    set({
      header,
      lines,
      totals,
      validation: createValidationState(),
    });
  },
  setValidation: (validationResult) =>
    set(() => ({
      validation: validationResult ?? createValidationState(),
    })),
  clearValidation: () =>
    set(() => ({
      validation: createValidationState(),
    })),
  getState: () => get(),
}));

