export function summarizeInventory(items = []) {
  return {
    totalItems: items.length,
    variance: 0,
  };
}
