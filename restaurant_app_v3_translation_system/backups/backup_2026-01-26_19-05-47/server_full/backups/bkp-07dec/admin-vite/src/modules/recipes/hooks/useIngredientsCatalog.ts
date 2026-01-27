import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

type IngredientCatalogItem = {
  id: number;
  name: string;
  unit?: string;
  category?: string;
  current_stock?: number;
  min_stock?: number;
  is_hidden?: number | boolean;
};

type IngredientsResponse = {
  success?: boolean;
  ingredients?: IngredientCatalogItem[];
  data?: IngredientCatalogItem[];
};

export function useIngredientsCatalog(showHidden = false) {
  const endpoint = useMemo(() => `/api/ingredients${showHidden ? '?show_hidden=true' : ''}`, [showHidden]);
  const { data, loading, error, refetch } = useApiQuery<IngredientsResponse | IngredientCatalogItem[]>(endpoint);

  const ingredients = useMemo<IngredientCatalogItem[]>(() => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.ingredients)) {
      return data.ingredients;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }, [data]);

  return {
    ingredients,
    loading,
    error,
    refetch,
  };
}


