import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/shared/api/httpClient";

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "ALL") {
    params.append("type", filters.type);
  }
  if (filters.ingredient_id) {
    params.append("ingredient_id", filters.ingredient_id);
  }
  if (filters.date_from) {
    params.append("date_from", filters.date_from);
  }
  if (filters.date_to) {
    params.append("date_to", filters.date_to);
  }
  if (filters.supplier) {
    params.append("supplier", filters.supplier);
  }
  if (filters.document_number) {
    params.append("document_number", filters.document_number);
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const fetchStockMoves = async (filters) => {
  const qs = buildQueryString(filters);
  const response = await httpClient.get(`/api/admin/stock-moves"Qs"`);
  return response.data;
};

const useStockMoves = (filters) =>
  useQuery({
    queryKey: ["stock-moves", filters],
    queryFn: () => fetchStockMoves(filters),
    keepPreviousData: true,
  });

export default useStockMoves;
