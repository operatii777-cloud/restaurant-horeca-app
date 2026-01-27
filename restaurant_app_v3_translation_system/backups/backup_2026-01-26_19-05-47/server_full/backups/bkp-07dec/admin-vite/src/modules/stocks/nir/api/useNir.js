import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { httpClient } from "@/shared/api/httpClient";

const normalizePayload = (payload) => {
  if (!payload) return payload;
  if (payload.header) {
    const { header, lines = [] } = payload;
    return {
      supplier_id: header.supplier_id,
      document_number: header.document_number,
      document_date: header.document_date,
      notes: header.notes,
      lines,
    };
  }
  return payload;
};

export function useNirList() {
  const { data, loading, error, refetch } = useApiQuery('/api/admin/nir');
  return {
    nirs: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
  };
}

export function useNir(id) {
  const endpoint = id ? `/api/admin/nir/${id}` : null;
  const { data, loading, error, refetch } = useApiQuery(endpoint);
  return {
    nir: data ?? null,
    loading,
    error,
    refetch,
  };
}

export async function saveNir(payload) {
  try {
    const response = await httpClient.post("/api/admin/nir", normalizePayload(payload));
    return response.data;
  } catch (error) {
    console.error("❌ [saveNir] Failed to save NIR:", error);
    throw error;
  }
}

export async function deleteNir(id) {
  if (!id) {
    console.warn('[deleteNir] Missing NIR id');
    return;
  }
  try {
    const response = await httpClient.delete(`/api/admin/nir/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ [deleteNir] Failed to delete NIR:', error);
    throw error;
  }
}
