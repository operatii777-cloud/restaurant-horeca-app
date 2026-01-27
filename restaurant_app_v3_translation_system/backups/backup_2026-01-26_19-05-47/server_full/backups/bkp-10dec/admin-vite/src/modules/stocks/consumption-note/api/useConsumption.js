export function useConsumptionList() {
  return { data: [], isLoading: false, error: null };
}

export function useConsumptionMutations() {
  return {
    create: async () => undefined,
    update: async () => undefined,
  };
}
