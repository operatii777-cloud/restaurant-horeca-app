import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { httpClient } from "@/shared/api/httpClient";

export function useInventoryList() {
  const { data, loading, error, refetch } = useApiQuery("/api/inventory/sessions");
  return {
    inventories: data?.sessions || [],
    loading,
    error,
    refetch,
  };
}

export function useInventory(id) {
  const endpoint = id ? `/api/inventory/session/${id}` : null;
  const { data, loading, error, refetch } = useApiQuery(endpoint);
  return {
    inventory: data ?? null,
    loading,
    error,
    refetch,
  };
}

export async function saveInventory(payload) {
  const response = await httpClient.post("/api/admin/inventories", payload);
  return response.data;
}

export async function deleteInventory(id) {
  if (!id) return;
  const response = await httpClient.delete(`/api/inventory/session/${id}`);
  return response.data;
}
export function useInventorySessions() {
  return { data: [], isLoading: false, error: null };
}

export async function finalizeInventory(id) {
  if (!id) return;
  const response = await httpClient.post(`/api/inventory/finalize/${id}`);
  return response.data;
}

export function useInventoryActions() {
  return {
    start: async () => undefined,
    finalize: finalizeInventory,
  };
}
