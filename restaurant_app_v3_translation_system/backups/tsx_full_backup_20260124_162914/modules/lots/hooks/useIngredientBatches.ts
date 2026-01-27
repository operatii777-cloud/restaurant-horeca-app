// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { IngredientBatch } from '@/types/inventory';

type UseIngredientBatchesResult = {
  batches: IngredientBatch[];
  loading: boolean;
  error: string | null;
  selectedBatchId: number | null;
  selectedBatch: IngredientBatch | null;
  setSelectedBatchId: (batchId: number | null) => void;
  refresh: () => Promise<void>;
};

export const useIngredientBatches = (ingredientId: number | null): UseIngredientBatchesResult => {
  const endpoint = ingredientId ? `/api/admin/inventory/batches/${ingredientId}` : null;

  const {
    data,
    loading,
    error,
    refetch,
  } = useApiQuery<IngredientBatch[]>(endpoint);

  const batches = useMemo(() => data ?? [], [data]);

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedBatchId(null);
  }, [ingredientId]);

  useEffect(() => {
    if (!batches.length) {
      if (selectedBatchId !== null) {
        setSelectedBatchId(null);
      }
      return;
    }

    setSelectedBatchId((previous) => {
      if (previous && batches.some((batch) => batch.id === previous)) {
        return previous;
      }
      return batches[0]?.id ?? null;
    });
  }, [batches, selectedBatchId]);

  const selectedBatch = useMemo(
    () => (selectedBatchId ? batches.find((batch) => batch.id === selectedBatchId) ?? null : null),
    [batches, selectedBatchId],
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, []);

  return {
    batches,
    loading,
    error,
    selectedBatchId,
    selectedBatch,
    setSelectedBatchId,
    refresh,
  };
};


