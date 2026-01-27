import { useMemo } from 'react';
// import { useTranslation } from '@/i18n/I18nContext';
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
//   const { t } = useTranslation();
  // ✅ Folosește ingredient_catalog (catalog activ) în loc de ingredients (legacy)
  const endpoint = useMemo(() => `/api/ingredient-catalog${showHidden ? '?show_hidden=true' : ''}`, [showHidden]);
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



