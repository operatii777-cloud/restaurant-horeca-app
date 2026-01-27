import { create } from "zustand";

const parseDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

export const useStockMovesStore = create((set, get) => ({
  moves: [],
  filters: {
    type: "ALL",
    ingredient_id: "",
    date_from: "",
    date_to: "",
    supplier: "",
    document_number: "",
  },
  setMoves: (moves) => set({ moves: Array.isArray(moves) ? moves : [] }),
  setFilter: (field, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [field]: value ?? "",
      },
    })),
  filteredMoves: () => {
    const { moves, filters } = get();
    const { type, ingredient_id, date_from, date_to, supplier, document_number } = filters;
    const fromDate = parseDate(date_from);
    const toDate = parseDate(date_to);
    const supplierNeedle = supplier?.toLowerCase?.().trim();
    const documentNeedle = document_number?.toLowerCase?.().trim();

    return (moves || []).filter((move) => {
      if (type && type !== "ALL" && move.type !== type) {
        return false;
      }

      if (ingredient_id && String(move.ingredient_id ?? "") !== String(ingredient_id)) {
        return false;
      }

      if (fromDate) {
        const moveDate = parseDate(move.date);
        if (!moveDate || moveDate < fromDate) {
          return false;
        }
      }

      if (toDate) {
        const moveDate = parseDate(move.date);
        if (!moveDate || moveDate > toDate) {
          return false;
        }
      }

      if (supplierNeedle) {
        const supplierLabel = (
          move.nir_supplier_name ||
          move.consume_destination ||
          move.reference_supplier ||
          ""
        )
          .toString()
          .toLowerCase();
        if (!supplierLabel.includes(supplierNeedle)) {
          return false;
        }
      }

      if (documentNeedle) {
        const docValue = (
          move.nir_document_number ||
          move.consume_document_number ||
          move.reference_document_number ||
          ""
        )
          .toString()
          .toLowerCase();
        if (!docValue.includes(documentNeedle)) {
          return false;
        }
      }

      return true;
    });
  },
}));
