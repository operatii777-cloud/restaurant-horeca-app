import { create } from "zustand";

const createEmptyHeader = () => ({
  id: null,
  document_number: "",
  document_date: "",
  source_location: "",
  target_location: "",
  responsible: "",
  notes: "",
});

const createEmptyLine = () => ({
  ingredient_id: null,
  ingredient_name: "",
  unit: "",
  quantity: 0,
  cost_unit: 0,
  value_total: 0,
});

export const useTransferStore = create((set, get) => ({
  header: createEmptyHeader(),
  lines: [createEmptyLine()],
  totals: { total_value: 0 },
  validation: { headerErrors: {}, lineErrors: {}, generalErrors: [] },

  setHeader: (field, value) =>
    set((state) => ({
      header: { ...state.header, [field]: value },
    })),

  addLine: () =>
    set((state) => ({
      lines: [...state.lines, createEmptyLine()],
    })),

  updateLine: (index, patch) =>
    set((state) => {
      const lines = [...state.lines];
      lines[index] = { ...lines[index], ...patch };
      return { lines };
    }),

  removeLine: (index) =>
    set((state) => ({
      lines: state.lines.filter((_, i) => i !== index),
    })),

  recalcTotals: () =>
    set((state) => {
      const total_value = (state.lines || []).reduce(
        (sum, l) => sum + (Number(l.value_total || 0) || 0),
        0
      );
      return { totals: { total_value } };
    }),

  reset: () => ({
    header: createEmptyHeader(),
    lines: [createEmptyLine()],
    totals: { total_value: 0 },
    validation: { headerErrors: {}, lineErrors: {}, generalErrors: [] },
  }),

  loadFromPayload: (payload) => {
    const header = payload?.header ? { ...createEmptyHeader(), ...payload.header } : createEmptyHeader();
    const lines =
      Array.isArray(payload?.lines) && payload.lines.length
        ? payload.lines.map((l) => ({
            ingredient_id: l.ingredient_id ?? null,
            ingredient_name: l.ingredient_name ?? "",
            unit: l.unit ?? "",
            quantity: Number(l.quantity || 0),
            cost_unit: Number(l.cost_unit || 0),
            value_total: Number(l.value_total || 0),
          }))
        : [createEmptyLine()];
    set({
      header,
      lines,
      totals: payload?.totals ?? { total_value: lines.reduce((s, l) => s + (Number(l.value_total || 0) || 0), 0) },
      validation: { headerErrors: {}, lineErrors: {}, generalErrors: [] },
    });
  },

  setValidation: (validation) => set({ validation }),
})) ;


