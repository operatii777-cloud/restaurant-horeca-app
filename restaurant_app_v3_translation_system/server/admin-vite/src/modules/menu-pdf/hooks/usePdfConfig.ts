// import { useTranslation } from '@/i18n/I18nContext';
// hooks/usePdfConfig.ts
import { useState, useCallback } from 'react';
import { httpClient } from '@/shared/api/httpClient';

export type PdfMenuType = 'food' | 'drinks';

export interface PdfCategory {
  id: number;
  category_name: string;
  display_in_pdf: boolean;
  order_index: number;
  page_break_after: boolean;
  header_image?: string | null;
  products: PdfProduct[];
}

export interface PdfProduct {
  id: number;
  product_id: number;
  name: string;
  price: number;
  display_in_pdf: boolean;
  custom_order?: number | null;
}

export interface PdfConfig {
  type: PdfMenuType;
  categories: PdfCategory[];
  lastRegenerated?: string;
}

export interface UsePdfConfigResult {
  config: PdfConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCategories: (categories: Partial<PdfCategory>[]) => Promise<void>;
  updateProducts: (products: Partial<PdfProduct>[]) => Promise<void>;
  uploadImage: (categoryId: number, file: File) => Promise<void>;
  deleteImage: (categoryId: number) => Promise<void>;
  regenerate: (type: PdfMenuType | 'all') => Promise<void>;
}

export function usePdfConfig(type: PdfMenuType): UsePdfConfigResult {
  const [config, setConfig] = useState<PdfConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<{ success: boolean; type?: string; categories?: PdfCategory[] }>(
        `/api/menu/pdf/builder/config?type="Type"`
      );
      
      if (response.data.success && response.data.categories) {
        // Map backend structure to frontend structure
        const mappedConfig: PdfConfig = {
          type: (response.data.type || type) as PdfMenuType,
          categories: response.data.categories.map((cat: any) => ({
            id: cat.id,
            category_name: cat.category_name,
            display_in_pdf: cat.display_in_pdf === 1 || cat.display_in_pdf === true,
            order_index: cat.order_index || 0,
            page_break_after: cat.page_break_after === 1 || cat.page_break_after === true,
            header_image: cat.header_image || null,
            products: (cat.products || []).map((prod: any) => ({
              id: prod.id || prod.product_id,
              product_id: prod.product_id || prod.id,
              name: prod.name,
              price: prod.price || 0,
              display_in_pdf: prod.display_in_pdf === 1 || prod.display_in_pdf === true,
              custom_order: prod.custom_order || null,
            })),
          })),
        };
        setConfig(mappedConfig);
      } else {
        throw new Error('Configurația nu a putut fi încărcată');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare la încărcarea configurației';
      setError(message);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const updateCategories = useCallback(async (categories: Partial<PdfCategory>[]) => {
    try {
      // Map frontend structure to backend structure
      const backendCategories = categories.map((c) => ({
        id: c.id,
        display_in_pdf: c.display_in_pdf ? 1 : 0,
        order_index: c.order_index || 0,
        page_break_after: c.page_break_after ? 1 : 0,
      }));
      await httpClient.post('/api/menu/pdf/builder/config/categories', { categories: backendCategories });
      await fetchConfig();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la actualizarea categoriilor');
    }
  }, [fetchConfig]);

  const updateProducts = useCallback(async (products: Partial<PdfProduct>[]) => {
    try {
      // Map frontend structure to backend structure
      const backendProducts = products.map((p) => ({
        product_id: p.product_id || p.id,
        display_in_pdf: p.display_in_pdf ? 1 : 0,
        custom_order: p.custom_order || null,
      }));
      await httpClient.post('/api/menu/pdf/builder/config/products', { products: backendProducts });
      await fetchConfig();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la actualizarea produselor');
    }
  }, [fetchConfig]);

  const uploadImage = useCallback(async (categoryId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      await httpClient.post(`/api/menu/pdf/builder/upload-category-image/${categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchConfig();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la upload-ul imaginii');
    }
  }, [fetchConfig]);

  const deleteImage = useCallback(async (categoryId: number) => {
    try {
      await httpClient.delete(`/api/menu/pdf/builder/delete-category-image/${categoryId}`);
      await fetchConfig();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la ștergerea imaginii');
    }
  }, [fetchConfig]);

  const regenerate = useCallback(async (regenerateType: PdfMenuType | 'all') => {
    try {
      await httpClient.post('/api/menu/pdf/builder/regenerate', { type: regenerateType });
      await fetchConfig();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Eroare la regenerarea PDF-urilor');
    }
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateCategories,
    updateProducts,
    uploadImage,
    deleteImage,
    regenerate,
  };
}


