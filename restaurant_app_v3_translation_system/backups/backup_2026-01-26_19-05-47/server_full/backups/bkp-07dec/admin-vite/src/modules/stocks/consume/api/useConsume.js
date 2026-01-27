import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { httpClient } from "@/shared/api/httpClient";

export function useConsumeList() {
  const { data, loading, error, refetch } = useApiQuery("/api/admin/consumption-notes");
  return {
    consumptionNotes: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
  };
}

export function useConsume(id) {
  const endpoint = id ? `/api/admin/consumption-notes/${id}` : null;
  const { data, loading, error, refetch } = useApiQuery(endpoint);
  return {
    consumptionNote: data ?? null,
    loading,
    error,
    refetch,
  };
}

export async function saveConsume(payload) {
  const response = await httpClient.post("/api/admin/consumption-notes", payload);
  return response.data;
}

export async function deleteConsume(id) {
  if (!id) {
    return;
  }
  const response = await httpClient.delete(`/api/admin/consumption-notes/${id}`);
  return response.data;
}

