import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/shared/api/httpClient";

export function useTransferList(filters = {}) {
  return useQuery({
    queryKey: ["transfers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);
      if (filters.source_location) params.append("source_location", filters.source_location);
      if (filters.target_location) params.append("target_location", filters.target_location);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await httpClient.get(`/api/admin/transfers${qs}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    keepPreviousData: true,
  });
}

export function useTransfer(id) {
  return useQuery({
    queryKey: ["transfer", id],
    queryFn: async () => {
      const res = await httpClient.get(`/api/admin/transfers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export async function saveTransfer(payload) {
  const res = await httpClient.post("/api/admin/transfers", payload);
  return res.data;
}

export async function deleteTransfer(id) {
  const res = await httpClient.delete(`/api/admin/transfers/:id`.replace(":id", String(id)));
  return res.data;
}


