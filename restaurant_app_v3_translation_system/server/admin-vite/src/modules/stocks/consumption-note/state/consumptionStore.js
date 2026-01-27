import { create } from "zustand";

export const useConsumptionStore = create(() => ({
  header: {},
  lines: [],
}));
