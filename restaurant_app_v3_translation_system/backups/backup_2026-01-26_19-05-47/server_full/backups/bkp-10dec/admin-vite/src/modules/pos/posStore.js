import { create } from "zustand";

export const usePosStore = create((set, get) => ({
  order: null,           // order data (id, table, items, totals)
  payments: [],          // payments list
  fiscalReceipt: null,   // fiscal receipt object if exists
  loading: false,
  error: null,

  setOrder: (order) => set({ order }),
  addPayment: (payment) => set({ payments: [...get().payments, payment] }),
  setPayments: (arr) => set({ payments: Array.isArray(arr) ? arr : [] }),
  setFiscalReceipt: (fr) => set({ fiscalReceipt: fr || null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ order: null, payments: [], fiscalReceipt: null, loading: false, error: null }),
}));


