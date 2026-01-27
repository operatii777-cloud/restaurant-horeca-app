// src/modules/production/hooks/useProductionBatches.js
// React Query hooks pentru Production Batches

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  finalizeBatch,
} from "../api/productionApi";

export function useProductionBatches() {
  return useQuery({
    queryKey: ["production-batches"],
    queryFn: listBatches,
  });
}

export function useProductionBatch(id) {
  return useQuery({
    queryKey: ["production-batch", id],
    queryFn: () => getBatch(id),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production-batches"] });
    },
  });
}

export function useUpdateBatch(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateBatch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production-batches"] });
      qc.invalidateQueries({ queryKey: ["production-batch", id] });
    },
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production-batches"] });
    },
  });
}

export function useFinalizeBatch(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => finalizeBatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production-batches"] });
      if (id) {
        qc.invalidateQueries({ queryKey: ["production-batch", id] });
      }
    },
  });
}

