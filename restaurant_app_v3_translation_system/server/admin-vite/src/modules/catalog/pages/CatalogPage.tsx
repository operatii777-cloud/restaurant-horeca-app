import React from 'react';
// import { useTranslation } from '@/i18n/I18nContext';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import type {
  ColDef,
  CellClickedEvent,
  RowDoubleClickedEvent,
  GridReadyEvent,
  RowDragEndEvent,
  GridApi,
} from 'ag-grid-community';
import { StatCard } from '@/shared/components/StatCard';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { TableFilter } from '@/shared/components/TableFilter';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { CatalogProduct, CatalogCategory } from '@/types/catalog';
import { ProductEditorModal } from '@/modules/catalog/components/ProductEditorModal';
import { CategoryTreePanel } from '@/modules/catalog/components/CategoryTreePanel';
import { CategoryModal } from '@/modules/catalog/components/CategoryModal';
import { CategoryDeleteModal } from '@/modules/catalog/components/CategoryDeleteModal';
import { CloneProductModal } from '@/modules/menu/components/CloneProductModal';
import { BulkPriceModal } from '@/modules/menu/components/BulkPriceModal';
import { PriceHistoryModal } from '@/modules/menu/components/PriceHistoryModal';
import { ProductMessagesModal } from '@/modules/menu/components/ProductMessagesModal';
import type { MenuProduct } from '@/types/menu';
import { httpClient } from '@/shared/api/httpClient';
import './CatalogPage.css';

const formatPrice = (value?: number) =>
  value === null || value === undefined ? '-' : `${value.toFixed(2)} RON`;

const palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899'];

const arraysEqual = (first: number[], second: number[]) =>
  first.length === second.length && first.every((value, index) => value === second[index]);

type FeedbackState =
  | {
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
    }
  | null;

type ChefSummary = {
  productId: number;
  name: string;
  price: number;
  costPrice: number | null;
  marginValue: number | null;
  marginPercent: number | null;
  allergens: string[];
  ingredients: string[];
  hasRecipe: boolean;
  costLastUpdated?: string | null;
  recipe?: { id: number; version?: number | null; updated_at?: string | null } | null;
  portion?: { quantity: number | null; unit: string | null } | null;
};

const parseToArray = (value?: unknown): string[] => {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry)))
      .filter((entry) => entry.length > 0);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry)))
          .filter((entry) => entry.length > 0);
      }
    } catch {
      // fall through to splitting
    }
    return trimmed
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [String(value)];
};

const describeAllergens = (value?: unknown) => {
  const entries = parseToArray(value);
  if (!entries.length) {
    return 'Fără alergeni declarați';
  }
  return entries.join(', ');
};

const computeMargin = (price?: number, cost?: number | null) => {
  if (price === undefined || price === null) {
    return { value: null, percent: null };
  }
  if (cost === null || cost === undefined) {
    return { value: null, percent: null };
  }
  const marginValue = Number((price - cost).toFixed(2));
  const marginPercent = price !== 0 ? Number(((marginValue / price) * 100).toFixed(2)) : null;
  return { value: marginValue, percent: marginPercent };
};

const findCategoryById = (categories: CatalogCategory[], id: number | null): CatalogCategory | null => {
  if (id === null) {
    return null;
  }

  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

export const CatalogPage = () => {
//   const { t } = useTranslation();
  // Page load time debug (fixed calculation)
  const pageLoadStart = performance.now();
  useEffect(() => {
    const pageLoadEnd = performance.now();
    const loadTime = Math.round(pageLoadEnd - pageLoadStart);
    console.log(`⚡ Page load time: ${loadTime}ms`);
  }, []);
  const navigate = useNavigate();
  const [quickFilter, setQuickFilter] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<CatalogProduct[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [priceHistoryModalOpen, setPriceHistoryModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [chefView, setChefView] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [rowDataOverride, setRowDataOverride] = useState<CatalogProduct[] | null>(null);
  const [pendingOrder, setPendingOrder] = useState<number[] | null>(null);
  const gridApiRef = useRef<GridApi<CatalogProduct> | null>(null);
  const [chefSummary, setChefSummary] = useState<ChefSummary | null>(null);
  const [chefSummaryLoading, setChefSummaryLoading] = useState(false);
  const [chefSummaryError, setChefSummaryError] = useState<string | null>(null);
  const [categoryModalState, setCategoryModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    category: CatalogCategory | null;
    parentId: number | null;
  }>({
    open: false,
    mode: 'create',
    category: null,
    parentId: null,
  });
  const [categoryDeleteState, setCategoryDeleteState] = useState<{ open: boolean; category: CatalogCategory | null }>({
    open: false,
    category: null,
  });
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);
  const chefViewActive = chefView && !reorderMode;

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useApiQuery<CatalogCategory[]>('/api/catalog/categories/tree');

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const selectedCategory = useMemo(
    () => findCategoryById(categories, selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const productsEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory?.name) {
      params.set('category', selectedCategory.name);
    }
    if (showOnlyActive) {
      params.set('is_active', '1');
    }
    const query = params.toString();
    return `/api/catalog/products${query ? `?${query}` : ''}`;
  }, [selectedCategory?.name, showOnlyActive]);

  const { data, loading, error, refetch } = useApiQuery<CatalogProduct[]>(productsEndpoint);
  const isPageReady = !loading && !categoriesLoading && (data !== null || error !== null);

  const rowData = useMemo(() => data ?? [], [data]);
  const displayedRowData = reorderMode && rowDataOverride ? rowDataOverride : rowData;
  const originalOrderIds = useMemo(() => rowData.map((item) => item.id), [rowData]);
  const reorderDirty = reorderMode && pendingOrder !== null && !arraysEqual(pendingOrder, originalOrderIds);

  useEffect(() => {
    if (!reorderMode) {
      setRowDataOverride(null);
      setPendingOrder(null);
      return;
    }
    setRowDataOverride(rowData);
    setPendingOrder(rowData.map((item) => item.id));
  }, [reorderMode, rowData]);

  const actionColumn = useMemo<ColDef<CatalogProduct>>(
    () => ({
      headerName: 'Acțiuni',
      colId: 'actions',
      width: 130,
      pinned: 'right',
      sortable: false,
      filter: false,
      valueGetter: () => 'Editează →',
      cellClass: 'catalog-grid__action-cell',
    }),
    [],
  );

  const baseColumnDefs = useMemo<ColDef<CatalogProduct>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Produs',
        minWidth: 220,
        cellDataType: 'text',
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
      },
      {
        field: 'category',
        headerName: 'Categorie',
        minWidth: 160,
      },
      {
        field: 'price',
        headerName: 'Preț vânzare',
        width: 150,
        valueFormatter: ({ value }) => formatPrice(Number(value)),
        cellDataType: 'number',
      },
      {
        field: 'vat_rate',
        headerName: 'TVA %',
        width: 120,
        valueFormatter: ({ value }) => (value !== null && value !== undefined ? `${value}%` : '-'),
      },
      {
        field: 'unit',
        headerName: 'Unitate',
        width: 120,
      },
      {
        field: 'preparation_section',
        headerName: 'Secțiune prep.',
        minWidth: 150,
      },
      {
        field: 'for_sale',
        headerName: 'Activ',
        width: 110,
        valueFormatter: ({ value }) => (value ? 'Da' : 'Nu'),
      },
      {
        field: 'has_recipe',
        headerName: 'Rețetă',
        width: 110,
        valueFormatter: ({ value }) => (value ? 'Da' : 'Nu'),
      },
    ],
    [],
  );

  const chefColumnDefs = useMemo<ColDef<CatalogProduct>[]>(
    () => [
      {
        field: 'cost_price',
        headerName: 'Cost rețetă',
        width: 150,
        valueFormatter: ({ value }) => (value === null || value === undefined ? '—' : formatPrice(Number(value))),
        tooltipValueGetter: ({ value }) =>
          value === null || value === undefined ? 'Cost necunoscut' : `Cost rețetă: ${formatPrice(Number(value))}`,
      },
      {
        headerName: 'Marjă',
        colId: 'margin',
        width: 140,
        valueGetter: ({ data }) => {
          const { value, percent } = computeMargin(data?.price, data?.cost_price ?? null);
          if (value === null || percent === null) {
            return '—';
          }
          return `${formatPrice(value)} (${percent}%)`;
        },
        cellClass: 'catalog-grid__margin-cell',
      },
      {
        field: 'allergens',
        headerName: 'Alergeni',
        minWidth: 200,
        valueGetter: ({ data }) => describeAllergens(data?.allergens ?? data?.allergens_computed),
        tooltipValueGetter: ({ data }) => describeAllergens(data?.allergens ?? data?.allergens_computed),
      },
    ],
    [],
  );

  const reorderColumn = useMemo<ColDef<CatalogProduct>>(
    () => ({
      headerName: '',
      colId: 'row-reorder',
      width: 60,
      pinned: 'left',
      lockPosition: true,
      suppressMenu: true,
      suppressMovable: true,
      rowDrag: true,
      cellRenderer: () => React.createElement('span', {
        className: 'catalog-drag-handle',
        'aria-hidden': 'true'
      }, '↕'),
      cellClass: 'catalog-grid__drag-cell',
      headerClass: 'catalog-grid__drag-header',
    }),
    [],
  );

  const columnDefs = useMemo<ColDef<CatalogProduct>[]>(() => {
    const core = [...baseColumnDefs];
    const extended = chefViewActive ? [...core, ...chefColumnDefs, actionColumn] : [...core, actionColumn];
    return reorderMode ? [reorderColumn, ...extended] : extended;
  }, [actionColumn, baseColumnDefs, chefColumnDefs, chefViewActive, reorderColumn, reorderMode]);

  const rowClassRules = useMemo(
    () => ({
      'catalog-row--no-recipe': (params: { data?: CatalogProduct }) => chefViewActive && !params.data?.has_recipe,
      'catalog-row--low-margin': (params: { data?: CatalogProduct }) => {
        if (!chefViewActive) {
          return false;
        }
        const price = Number(params.data?.price ?? 0);
        const cost = params.data?.cost_price;
        if (cost === null || cost === undefined) {
          return false;
        }
        return price - Number(cost) <= 0;
      },
    }),
    [chefViewActive],
  );

  const gridOptions = useMemo(
    () => ({
      rowHeight: 54,
      headerHeight: 46,
      suppressScrollOnNewData: true,
      rowClassRules,
      rowDragManaged: reorderMode,
      suppressMoveWhenRowDragging: reorderMode,
      // AG Grid v32.2+: suppressRowClickSelection replaced by rowSelection.enableClickSelection
    }),
    [reorderMode, rowClassRules],
  );

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setEditorOpen(true);
  }, []);

  const handleEditProduct = useCallback((productToEdit: CatalogProduct | null) => {
    if (!productToEdit) return;
    setEditingProduct(productToEdit);
    setEditorOpen(true);
  }, []);

  const handleSelectionChange = useCallback((selected: CatalogProduct[]) => {
    setSelectedProducts(selected);
  }, []);

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<CatalogProduct>) => {
      if (event.colDef.colId === 'actions' && event.data) {
        handleEditProduct(event.data);
      }
    },
    [handleEditProduct],
  );

  const handleRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<CatalogProduct>) => {
      if (event.data) {
        handleEditProduct(event.data);
      }
    },
    [handleEditProduct],
  );

  const totalProducts = rowData.length;
  const activeProducts = rowData.filter((item) => item.for_sale).length;
  const inactiveProducts = totalProducts - activeProducts;
  const withRecipe = rowData.filter((item) => item.has_recipe).length;
  const withoutRecipe = totalProducts - withRecipe;
  const avgPrice = rowData.reduce((sum, item) => sum + (item.price ?? 0), 0) / (totalProducts || 1);
  const actionsDisabled = reorderMode;
  const reorderCategoryName = selectedCategory?.name ?? 'categoria selectată';
  const chefStats = useMemo(() => {
    if (!chefViewActive) {
      return null;
    }
    const withCost = rowData.filter((item) => item.cost_price !== null && item.cost_price !== undefined).length;
    const lowMargin = rowData.filter((item) => {
      if (item.cost_price === null || item.cost_price === undefined) {
        return false;
      }
      const margin = Number(item.price ?? 0) - Number(item.cost_price ?? 0);
      return margin <= 0;
    }).length;
    const missingRecipeCount = rowData.filter((item) => !item.has_recipe).length;
    return {
      total: rowData.length,
      withCost,
      lowMargin,
      missingRecipe: missingRecipeCount,
    };
  }, [chefViewActive, rowData]);

  const formatDateTime = useCallback((value?: string | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('ro-RO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, []);

  const selectedProduct = selectedProducts[0] ?? null;
  const fallbackAllergens = useMemo(
    () => parseToArray(selectedProduct?.allergens ?? selectedProduct?.allergens_computed),
    [selectedProduct],
  );
  const allergensForPanel = chefSummary?.allergens?.length ? chefSummary.allergens : fallbackAllergens;
  const ingredientsForPanel = chefSummary?.ingredients?.length ? chefSummary.ingredients : parseToArray(selectedProduct?.ingredients);
  const chefMarginText =
    chefSummary && chefSummary.marginValue !== null && chefSummary.marginPercent !== null
      ? `${formatPrice(Number(chefSummary.marginValue))} (${chefSummary.marginPercent}%)`
      : '—';

  const selectedMenuProduct: MenuProduct | undefined = useMemo(() => {
    if (!selectedProduct) {
      return undefined;
    }

    return {
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category ?? 'Nespecificat',
      price: Number(selectedProduct.price ?? 0),
      vat_rate: selectedProduct.vat_rate ?? null,
      unit: selectedProduct.unit ?? null,
      preparation_section: selectedProduct.preparation_section ?? null,
      is_sellable: selectedProduct.for_sale ?? selectedProduct.is_active ?? true,
      is_active: selectedProduct.is_active ?? selectedProduct.for_sale ?? true,
      has_recipe: selectedProduct.has_recipe ?? false,
      stock_management: selectedProduct.stock_management ?? null,
      image_url: selectedProduct.image_url ?? null,
    };
  }, [selectedProduct]);

  const handleOpenClone = useCallback(() => {
    if (!selectedMenuProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs din catalog pentru a-l clona.' });
      return;
    }
    setFeedback(null);
    setCloneModalOpen(true);
  }, [selectedMenuProduct]);

  const handleOpenPriceHistory = useCallback(() => {
    if (!selectedMenuProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a-i vizualiza istoricul de preț.' });
      return;
    }
    setFeedback(null);
    setPriceHistoryModalOpen(true);
  }, [selectedMenuProduct]);

  const handleOpenMessages = useCallback(() => {
    if (!selectedMenuProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a trimite o alertă internă.' });
      return;
    }
    setFeedback(null);
    setMessagesModalOpen(true);
  }, [selectedMenuProduct]);

  const handleOpenBulkPrice = useCallback(() => {
    if (!selectedProducts.length) {
      setFeedback({ type: 'warning', message: 'Selectează cel puțin un produs pentru actualizare în masă.' });
      return;
    }
    setFeedback(null);
    setBulkModalOpen(true);
  }, [selectedProducts]);

  const handleExport = useCallback(() => {
    const params = new URLSearchParams({ format: 'csv' });
    const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
    const exportUrl = `${baseUrl}/api/catalog/products/export?${params.toString()}`;

    window.open(exportUrl, '_blank', 'noopener');
    setFeedback({
      type: 'success',
      message: 'Export CSV inițiat. Verifică folderul de descărcări.',
    });
  }, []);

  // Handler pentru "Meniu digital sincronizat"
  const handleDigitalMenu = useCallback(() => {
    navigate('/menu');
  }, [navigate]);

  // Handler pentru "Rețete + costuri automat"
  const handleRecipes = useCallback(() => {
    navigate('/recipes');
  }, [navigate]);

  // Handler pentru "Export PDF / QR Instant"
  const handleExportPDF = useCallback(() => {
    const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
    const exportUrl = `${baseUrl}/api/exports/menu/pdf`;
    window.open(exportUrl, '_blank', 'noopener');
    setFeedback({
      type: 'success',
      message: 'Export PDF meniu inițiat. Verifică folderul de descărcări.',
    });
  }, []);

  const handleDeleteProducts = useCallback(async () => {
    if (!selectedProducts.length) {
      setFeedback({ type: 'warning', message: 'Selectează produse pentru ștergere.' });
      return;
    }

    if (!window.confirm(`Sigur dorești să ștergi ${selectedProducts.length} produs(e)?`)) {
      return;
    }

    setDeletingProducts(true);
    try {
      await Promise.all(selectedProducts.map((product) => httpClient.delete(`/api/catalog/products/${product.id}`)));
      setFeedback({ type: 'success', message: `${selectedProducts.length} produs(e) eliminate din catalog.` });
      setSelectedProducts([]);
      await refetch();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        (err instanceof Error ? err.message : 'Nu am putut șterge produsele selectate.');
      setFeedback({ type: 'error', message });
    } finally {
      setDeletingProducts(false);
    }
  }, [selectedProducts, refetch]);

  const handleRowDragEnd = useCallback((event: RowDragEndEvent<CatalogProduct>) => {
    const newOrderData: CatalogProduct[] = [];
    event.api.forEachNodeAfterFilterAndSort((node) => {
      if (node.data) {
        newOrderData.push(node.data);
      }
    });
    if (newOrderData.length > 0) {
      setRowDataOverride([...newOrderData]);
      setPendingOrder(newOrderData.map((item) => item.id));
    }
  }, []);

  const handleGridReady = useCallback((event: GridReadyEvent<CatalogProduct>) => {
    gridApiRef.current = event.api;
  }, []);

  const handleCancelReorder = useCallback(() => {
    setReorderMode(false);
    setReorderSaving(false);
    setRowDataOverride(null);
    setPendingOrder(null);
    gridApiRef.current?.refreshClientSideRowModel('everything');
    refetch();
  }, [refetch]);

  const handleToggleReorder = useCallback(() => {
    if (reorderMode) {
      handleCancelReorder();
      return;
    }
    if (!selectedCategory) {
      setFeedback({
        type: 'warning',
        message: 'Selectează o categorie din panoul din stânga pentru a organiza produsele.',
      });
      return;
    }
    if (rowData.length < 2) {
      setFeedback({ type: 'warning', message: 'Sunt necesare cel puțin două produse pentru a schimba ordinea.' });
      return;
    }
    setReorderMode(true);
    setRowDataOverride(rowData);
    setPendingOrder(rowData.map((item) => item.id));
  }, [handleCancelReorder, reorderMode, rowData, selectedCategory]);

  const handleSaveReorder = useCallback(async () => {
    if (!selectedCategory) {
      setFeedback({ type: 'warning', message: 'Selectează o categorie înainte de a salva ordinea.' });
      return;
    }
    if (!pendingOrder || !reorderDirty) {
      setFeedback({ type: 'info', message: 'Nu există modificări de salvat pentru ordinea produselor.' });
      return;
    }
    setReorderSaving(true);
    try {
      await httpClient.post('/api/catalog/products/reorder', {
        category: selectedCategory.name,
        ordered_ids: pendingOrder,
      });
      setFeedback({
        type: 'success',
        message: `Ordinea produselor din categoria „${selectedCategory.name}” a fost actualizată.`,
      });
      setReorderMode(false);
      setRowDataOverride(null);
      setPendingOrder(null);
      await refetch();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        (err instanceof Error ? err.message : 'Nu am putut salva ordinea produselor.');
      setFeedback({ type: 'error', message });
    } finally {
      setReorderSaving(false);
    }
  }, [pendingOrder, refetch, reorderDirty, selectedCategory]);

  const fetchChefSummary = useCallback(
    async (productId: number) => {
      setChefSummaryLoading(true);
      setChefSummaryError(null);
      try {
        const response = await httpClient.get(`/api/catalog/products/${productId}/chef-summary`);
        const payload = response.data?.data ?? response.data;
        if (!payload) {
          throw new Error('Răspuns invalid de la server.');
        }
        setChefSummary({
          productId: payload.product_id ?? productId,
          name: payload.name ?? '',
          price: Number(payload.price ?? 0),
          costPrice: payload.cost_price ?? null,
          marginValue: payload.margin_value ?? null,
          marginPercent: payload.margin_percent ?? null,
          hasRecipe: Boolean(payload.has_recipe),
          allergens: parseToArray(payload.allergens ?? payload.allergens_computed),
          ingredients: parseToArray(payload.ingredients),
          costLastUpdated: payload.cost_last_updated ?? null,
          recipe: payload.recipe ?? null,
          portion: payload.portion ?? null,
        });
      } catch (err) {
        console.error('Catalog vizualizare chef error', err);
        const message =
          (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
          (err instanceof Error ? err.message : 'Nu am putut încărca datele pentru Vizualizare chef.');
        setChefSummaryError(message);
        setChefSummary(null);
      } finally {
        setChefSummaryLoading(false);
      }
    },
    [],
  );

  const handleChefRefresh = useCallback(() => {
    if (selectedProducts[0]?.id) {
      fetchChefSummary(selectedProducts[0].id);
    } else if (selectedProduct?.id) {
      fetchChefSummary(selectedProduct.id);
    }
  }, [fetchChefSummary, selectedProduct?.id, selectedProducts]);

  const handleCategorySelect = useCallback((category: CatalogCategory | null) => {
    setSelectedCategoryId(category ? category.id : null);
  }, []);

  const handleOpenCreateCategory = useCallback((parentId: number | null) => {
    setCategoryModalState({
      open: true,
      mode: 'create',
      category: null,
      parentId,
    });
  }, []);

  const handleOpenEditCategory = useCallback((category: CatalogCategory) => {
    setCategoryModalState({
      open: true,
      mode: 'edit',
      category,
      parentId: category.parent_id ?? null,
    });
  }, []);

  const closeCategoryModal = useCallback(() => {
    setCategoryModalState((prev) => ({ ...prev, open: false, category: null }));
  }, []);

  const openDeleteCategoryModal = useCallback((category: CatalogCategory) => {
    setDeleteCategoryError(null);
    setCategoryDeleteState({ open: true, category });
  }, []);

  const closeDeleteCategoryModal = useCallback(() => {
    setCategoryDeleteState({ open: false, category: null });
    setDeleteCategoryError(null);
  }, []);

  const handleCategorySubmit = useCallback(
    async (payload: { name: string; name_en?: string | null; icon?: string | null; parent_id: number | null }) => {
      setCategoryActionLoading(true);
      try {
        if (categoryModalState.mode === 'edit' && categoryModalState.category) {
          await httpClient.put(`/api/catalog/categories/${categoryModalState.category.id}`, payload);
          setFeedback({ type: 'success', message: `Categoria „${payload.name}” a fost actualizată.` });
        } else {
          await httpClient.post('/api/catalog/categories', payload);
          setFeedback({ type: 'success', message: `Categoria „${payload.name}” a fost creată.` });
        }
        await refetchCategories();
        await refetch();
      } catch (err) {
        const message =
          (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
          (err instanceof Error ? err.message : 'Nu am putut salva categoria.');
        setFeedback({ type: 'error', message });
        throw new Error(message);
      } finally {
        setCategoryActionLoading(false);
      }
    },
    [categoryModalState, refetchCategories, refetch],
  );

  const handleConfirmDeleteCategory = useCallback(async () => {
    if (!categoryDeleteState.category) {
      return;
    }

    setCategoryActionLoading(true);
    setDeleteCategoryError(null);
    try {
      await httpClient.delete(`/api/catalog/categories/${categoryDeleteState.category.id}`);
      setFeedback({
        type: 'success',
        message: `Categoria „${categoryDeleteState.category.name}” a fost ștearsă.`,
      });
      if (selectedCategoryId === categoryDeleteState.category.id) {
        setSelectedCategoryId(null);
      }
      closeDeleteCategoryModal();
      await refetchCategories();
      await refetch();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        (err instanceof Error ? err.message : 'Nu am putut șterge categoria.');
      setDeleteCategoryError(message);
      setFeedback({ type: 'error', message });
    } finally {
      setCategoryActionLoading(false);
    }
  }, [categoryDeleteState, selectedCategoryId, closeDeleteCategoryModal, refetchCategories, refetch]);

  useEffect(() => {
    if (selectedCategoryId !== null) {
      const exists = findCategoryById(categories, selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId(null);
      }
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get("chef view") === '1') {
        setChefView(true);
      }
    } catch (error) {
      console.warn('Catalog Nu am putut analiza parametrul chef_view:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const currentUrl = new URL(window.location.href);
      if (chefView) {
        currentUrl.searchParams.set('chef_view', '1');
      } else {
        currentUrl.searchParams.delete('chef_view');
      }
      window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    } catch (error) {
      console.warn('Catalog Nu am putut actualiza parametrul chef_view:', error);
    }
  }, [chefView]);

  useEffect(() => {
    if (chefViewActive && selectedProduct?.id) {
      if (chefSummary?.productId !== selectedProduct.id && !chefSummaryLoading) {
        fetchChefSummary(selectedProduct.id);
      }
    } else {
      setChefSummary(null);
      setChefSummaryError(null);
      setChefSummaryLoading(false);
    }
  }, [chefSummary?.productId, chefSummaryLoading, chefViewActive, fetchChefSummary, selectedProduct?.id]);

  const categoryDistribution = useMemo(() => {
    if (totalProducts === 0) {
      return [];
    }

    const map = new Map<string, number>();
    rowData.forEach((item) => {
      if (!item.category) return;
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    });

    const entries = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return entries.map(([name, count], index) => ({
      name,
      value: Number(((count / totalProducts) * 100).toFixed(1)),
      raw: count,
      color: palette[index % palette.length],
    }));
  }, [rowData, totalProducts]);

  const topPricedProducts = useMemo(
    () =>
      rowData
        .filter((item) => item.price)
        .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        .slice(0, 6)
        .map((product) => ({
          label: product.name.length > 10 ? `${product.name.slice(0, 9)}…` : product.name,
          value: Number(product.price?.toFixed(2) ?? 0),
        })),
    [rowData],
  );

  const defaultLegend =
    totalProducts === 0
      ? []
      : categoryDistribution.map((entry) => ({
          ...entry,
          display: `${entry.value}%`,
        }));

  return (
    <div className="catalog-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Admin',
                item: '/admin',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Catalog produse',
                item: '/catalog',
              },
            ],
          })),
        }}
      />
      <section className="catalog-hero">
        <div className="catalog-hero__info">
          <div className="catalog-hero__labels">
            <button 
              type="button"
              className="catalog-chip catalog-chip--primary catalog-chip--clickable"
              onClick={handleDigitalMenu}
              title="navigheaza la pagina meniu digital"
            >
              Meniu digital sincronizat
            </button>
            <button 
              type="button"
              className="catalog-chip catalog-chip--clickable"
              onClick={handleRecipes}
              title="navigheaza la pagina retete"
            >
              Rețete + costuri automat
            </button>
            <button 
              type="button"
              className="catalog-chip catalog-chip--clickable"
              onClick={handleExportPDF}
              title="exporta meniul in format pdf"
            >
              Export PDF / QR Instant
            </button>
          </div>
          <h2>"catalog produse si meniuri active"</h2>
          <p>
            Gestionezi dintr-un singur loc meniurile, prețurile și traducerile pentru toate canalele (digital, PDF, QR,
            meniuri tipărite). Integrarea cu AG Grid îți oferă filtrare, sortare și export Excel fără efort.
          </p>
        </div>

        <div className="catalog-hero__stats">
          <StatCard
            title="Produse active"
            helper="Disponibile în meniurile curente"
            value={`${activeProducts}`}
            trendLabel="Fără rețetă"
            trendValue={`${withoutRecipe}`}
            trendDirection={withoutRecipe > 0 ? 'down' : 'up'}
            icon={<span>🍽️</span>}
          />

          <StatCard
            title="pret mediu vanzare"
            helper="Bazat pe toate produsele active"
            value={`${avgPrice.toFixed(2)} RON`}
            trendLabel="Produse inactive"
            trendValue={`${inactiveProducts}`}
            trendDirection={inactiveProducts > 0 ? 'flat' : 'up'}
            icon={<span>💶</span>}
          />

          <StatCard
            title="retete sincronizate"
            helper="Calcul cost/porție și alergeni"
            value={`${withRecipe} produse`}
            trendLabel="Actualizate ultimele 7 zile"
            trendValue={`${Math.min(withRecipe, 12)} items`}
            trendDirection="up"
            icon={<span>🧾</span>}
            footer={
              <button type="button" className="catalog-link-button">
                Vezi produse fără rețetă →
              </button>
            }
          />
        </div>

        <div className="catalog-hero__analytics">
          <div className="catalog-analytics-card">
            <header>
              <span className="catalog-analytics-title">"top preturi produse active"</span>
              <span className="catalog-analytics-helper">RON / produs</span>
            </header>
            <MiniBarChart
              data={topPricedProducts}
              valueFormat={(value) => `${value.toFixed(0)}`}
              tooltipFormatter={(value) => [`${value.toFixed(2)} RON`, 'Preț']}
            />
          </div>

          <div className="catalog-analytics-card">
            <header>
              <span className="catalog-analytics-title">"distributie pe categorii"</span>
              <span className="catalog-analytics-helper">% din catalog</span>
            </header>
            <MiniDonutChart
              data={
                defaultLegend.length
                  ? defaultLegend.map((item) => ({ name: item.name, value: item.value, color: item.color }))
                  : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]
              }
            />
            <ul className="catalog-legend">
              {defaultLegend.length === 0 ? (
                <li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true" />
                  <span>"fara date disponibile"</span>
                  <strong>100%</strong>
                </li>
              ) : (
                defaultLegend.map((item) => (
                  <li key={item.name}>
                    <span style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span>{item.name}</span>
                    <strong>
                      {item.display}
                      <small>{item.raw} produse</small>
                    </strong>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <div className="catalog-body">
        <CategoryTreePanel
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          loading={categoriesLoading}
          onSelectCategory={handleCategorySelect}
          onCreateCategory={handleOpenCreateCategory}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={openDeleteCategoryModal}
          onRefresh={refetchCategories}
        />

        <div className="catalog-main">
          <section className="catalog-toolbar" aria-label="Filtre catalog">
            <div className="catalog-toolbar__left">
              <TableFilter
                value={quickFilter}
                onChange={setQuickFilter}
                placeholder="cauta produs dupa nume categorie sectiune de prepa"
                aria-label="Filtru rapid catalog"
                disabled={reorderMode}
              />
              <div className="catalog-toggle-group">
                <label>
                  <input
                    type="checkbox"
                    data-qa="catalog-chef-toggle"
                    checked={chefView}
                    onChange={(event) => setChefView(event.target.checked)}
                    disabled={reorderMode}
                  />' '
                  Vizualizare chef (cost + alergeni)
                </label>
                <label>
                  <input
                    type="checkbox"
                    data-qa="catalog-active-toggle"
                    checked={showOnlyActive}
                    onChange={(event) => setShowOnlyActive(event.target.checked)}
                    disabled={reorderMode}
                  />' '
                  Doar produse active
                </label>
              </div>
            </div>
            <div className="catalog-toolbar__actions">
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={() => refetch()}>
                ⟳ Reîmprospătează datele
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost">
                🗂️ Importă din template
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleToggleReorder}
                disabled={
                  (!reorderMode && (!selectedCategory || rowData.length < 2 || loading)) ||
                  (reorderMode && reorderSaving)
                }
              >
                {reorderMode ? '❌ Ieșire mod organizare' : '↕️ Ordonează produse'}
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleOpenBulkPrice}
                disabled={actionsDisabled || selectedProducts.length === 0}
              >
                🔁 Actualizează preț / TVA
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleOpenClone}
                disabled={actionsDisabled || !selectedMenuProduct}
              >
                🧬 Clonează produs
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleOpenPriceHistory}
                disabled={actionsDisabled || !selectedMenuProduct}
              >
                📈 Istoric preț
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleOpenMessages}
                disabled={actionsDisabled || !selectedMenuProduct}
              >
                💬 Trimite alertă
              </button>
              <button
                type="button"
                className="catalog-btn catalog-btn--ghost"
                onClick={handleDeleteProducts}
                disabled={actionsDisabled || selectedProducts.length === 0 || deletingProducts}
              >
                🗑️ Șterge produse
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleExport}>
                📤 Export CSV
              </button>
              <button type="button" className="catalog-btn catalog-btn--primary" onClick={handleAddProduct}>
                ➕ Adaugă produs
              </button>
            </div>
          </section>

          {reorderMode ? (
            <div className="catalog-reorder-banner" role="status" aria-live="polite">
              <div>
                <strong>Mod organizare activ</strong>
                <p>
                  Trage rândurile pentru a schimba ordinea produselor din categoria „{reorderCategoryName}”. Salvează
                  modificările pentru a actualiza meniurile și PDF-urile.
                </p>
              </div>
              <div className="catalog-reorder-banner__actions">
                <button
                  type="button"
                  className="catalog-btn catalog-btn--primary"
                  onClick={handleSaveReorder}
                  disabled={reorderSaving || !reorderDirty}
                >
                  {reorderSaving ? 'Se salvează…' : '💾 Salvează ordinea'}
                </button>
                <button
                  type="button"
                  className="catalog-btn catalog-btn--ghost"
                  onClick={handleCancelReorder}
                  disabled={reorderSaving}
                >"Renunță"</button>
              </div>
            </div>
          ) : null}

          <div className="catalog-feedback">
            {feedback ? (
              <InlineAlert
                variant={feedback.type}
                title={feedback.type === 'success' ? 'Succes' : 'Informație'}
                message={feedback.message}
              />
            ) : null}
            {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
            {categoriesError ? <InlineAlert variant="error" title="Categorie" message={categoriesError} /> : null}
          </div>

          <section className="catalog-grid-panel">
            <header>
              <div>
                <h3>"lista completa de produse"</h3>
                <p>{`${totalProducts} produse gestionate · ${withRecipe} cu rețetă`}</p>
              </div>
              <div className="catalog-selection">
                {selectedProduct
                  ? `Produs selectat: ${selectedProduct.name}`
                  : selectedProducts.length > 1
                    ? `${selectedProducts.length} produse selectate pentru acțiuni în masă.`
                    : 'Selectează produse din tabel pentru acțiuni rapide (bulk preț, clonare, istoric, alertă).'}
              </div>
              <div className="catalog-grid-actions">
                <button type="button" className="catalog-btn catalog-btn--outline">
                  Export Excel
                </button>
                <button type="button" className="catalog-btn catalog-btn--outline">
                  Export PDF meniuri
                </button>
                <button type="button" className="catalog-btn catalog-btn--outline">"genereaza qr"</button>
              </div>
            </header>
            <DataGrid<CatalogProduct>
              columnDefs={columnDefs}
              rowData={displayedRowData}
              loading={loading}
              quickFilterText={quickFilter}
              height="60vh"
              rowSelection="multiple"
              gridOptions={gridOptions}
              onGridReady={handleGridReady}
              agGridProps={{
                onCellClicked: handleCellClicked,
                onRowDoubleClicked: handleRowDoubleClicked,
                getRowId: (params) => (params.data?.id ? params.data.id.toString() : ''),
                rowDragManaged: reorderMode,
                suppressMoveWhenRowDragging: reorderMode,
                rowSelection: reorderMode ? { mode: 'multiRow', enableClickSelection: false } : undefined,
                onRowDragEnd: reorderMode ? handleRowDragEnd : undefined,
              }}
              onSelectedRowsChange={handleSelectionChange}
            />
          </section>

          <section className="catalog-secondary">
            {chefViewActive ? (
              <article className="catalog-secondary__card catalog-chef-panel" aria-live="polite">
                <header>
                  <div>
                    <span>Vizualizare chef</span>
                    <strong>{selectedProduct ? selectedProduct.name : 'Selectează un produs'}</strong>
                  </div>
                  <div className="catalog-chef-panel__header-actions">
                    <button
                      type="button"
                      className="catalog-btn catalog-btn--ghost"
                      onClick={handleChefRefresh}
                      disabled={!selectedProduct || chefSummaryLoading}
                    >
                      ⟳ Reîmprospătează
                    </button>
                  </div>
                </header>

                {chefStats ? (
                  <ul className="catalog-chef-panel__stats">
                    <li>
                      <span>"cu cost calculat"</span>
                      <strong>
                        {chefStats.withCost}/{chefStats.total}
                      </strong>
                    </li>
                    <li>
                      <span>"retete lipsa"</span>
                      <strong>{chefStats.missingRecipe}</strong>
                    </li>
                    <li>
                      <span>Marjă ≤ 0</span>
                      <strong>{chefStats.lowMargin}</strong>
                    </li>
                  </ul>
                ) : null}

                <div className="catalog-chef-panel__metrics">
                  <div>
                    <span>"cost reteta"</span>
                    <strong>
                      {chefSummary?.costPrice !== null && chefSummary?.costPrice !== undefined
                        ? formatPrice(Number(chefSummary.costPrice))
                        : '—'}
                    </strong>
                    {chefSummary?.costLastUpdated ? (
                      <small>Actualizat: {formatDateTime(chefSummary.costLastUpdated)}</small>
                    ) : null}
                  </div>
                  <div>
                    <span>"Marjă"</span>
                    <strong>{chefMarginText}</strong>
                  </div>
                  <div>
                    <span>"status reteta"</span>
                    <strong>{chefSummary?.hasRecipe ?? selectedProduct?.has_recipe ? 'Completă' : 'Lipsește'}</strong>
                    {chefSummary?.recipe?.updated_at ? (
                      <small>Ultima actualizare: {formatDateTime(chefSummary.recipe.updated_at)}</small>
                    ) : null}
                  </div>
                  <div>
                    <span>"alergeni monitorizati"</span>
                    <strong>{allergensForPanel.length ? allergensForPanel.length : '—'}</strong>
                  </div>
                </div>

                <div className="catalog-chef-panel__details">
                  {!selectedProduct ? (
                    <p>"selecteaza un produs din tabel pentru a vedea cost"</p>
                  ) : chefSummaryLoading ? (
                    <p>"se incarca detaliile pentru chef"</p>
                  ) : chefSummaryError ? (
                    <InlineAlert variant="error" message={chefSummaryError} />
                  ) : (
                    <>
                      <div className="catalog-chef-panel__chips">
                        {allergensForPanel.length ? (
                          allergensForPanel.map((allergen) => (
                            <span key={allergen} className="catalog-chef-badge">
                              {allergen}
                            </span>
                          ))
                        ) : (
                          <span className="catalog-chef-panel__muted">"fara alergeni declarati"</span>
                        )}
                      </div>
                      <div className="catalog-chef-panel__list">
                        <span>Ingrediente cheie</span>
                        {ingredientsForPanel.length ? (
                          <ul>
                            {ingredientsForPanel.slice(0, 6).map((ingredient) => (
                              <li key={ingredient}>{ingredient}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="catalog-chef-panel__muted">"nu exista ingrediente detaliate"</p>
                        )}
                      </div>
                      {chefSummary?.portion ? (
                        <p className="catalog-chef-panel__muted">
                          Porție standard: {chefSummary.portion.quantity ?? 'n/a'} {chefSummary.portion.unit ?? ''}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </article>
            ) : null}

            <article className="catalog-secondary__card">
              <header>
                <span>Meniuri digitale</span>
                <button type="button" className="catalog-link-button">
                  Deschide manager meniuri →
                </button>
              </header>
              <ul>
                <li>
                  <strong>"Română"</strong>
                  <span>Synchronizat · 2 PDF-uri active</span>
                </li>
                <li>
                  <strong>"Engleză"</strong>
                  <span>"in curs de actualizare"</span>
                </li>
                <li>
                  <strong>"QRCodes"</strong>
                  <span>3 locații generate</span>
                </li>
              </ul>
            </article>

            <article className="catalog-secondary__card">
              <header>
                <span>"fluxuri automate"</span>
                <button type="button" className="catalog-link-button">
                  Configurează workflow →
                </button>
              </header>
              <ul>
                <li>
                  <strong>Sync GPT Bridge</strong>
                  <span>Online · modul Safe</span>
                </li>
                <li>
                  <strong>Regenerare PDF</strong>
                  <span>Programat zilnic 03:00</span>
                </li>
                <li>
                  <strong>"actualizare preturi"</strong>
                  <span>Ultima modificare acum 15 min</span>
                </li>
              </ul>
            </article>
          </section>
        </div>
      </div>

      <ProductEditorModal
        open={editorOpen}
        product={editingProduct}
        onClose={() => setEditorOpen(false)}
        onSaved={() => refetch()}
      />

      <CloneProductModal
        open={cloneModalOpen}
        product={selectedMenuProduct}
        onClose={() => setCloneModalOpen(false)}
        onCloned={async ({ newName }) => {
          setCloneModalOpen(false);
          setFeedback({ type: 'success', message: `Produsul “${newName}” a fost clonat în catalog.` });
          setSelectedProducts([]);
          await refetch();
        }}
      />

      <PriceHistoryModal
        open={priceHistoryModalOpen}
        product={selectedMenuProduct}
        onClose={() => setPriceHistoryModalOpen(false)}
      />

      <ProductMessagesModal
        open={messagesModalOpen}
        product={selectedMenuProduct}
        onClose={() => setMessagesModalOpen(false)}
        onMessageSent={(message) => {
          setFeedback({ type: 'success', message });
        }}
      />

      <BulkPriceModal
        open={bulkModalOpen}
        productCount={selectedProducts.length}
        productIds={selectedProducts.map((item) => item.id)}
        onClose={() => setBulkModalOpen(false)}
        onApplied={async (updatedCount, newPrice, newVatRate) => {
          const parts: string[] = [`Au fost actualizate ${updatedCount} produse.`];
          if (typeof newPrice === 'number') {
            parts.push(`Preț nou: ${newPrice.toFixed(2)} RON.`);
          }
          if (typeof newVatRate === 'number') {
            parts.push(`TVA nou: ${newVatRate}%`);
          }
          setFeedback({ type: 'success', message: parts.join(' ') });
          setBulkModalOpen(false);
          setSelectedProducts([]);
          await refetch();
        }}
      />

      <CategoryModal
        open={categoryModalState.open}
        categories={categories}
        initialCategory={categoryModalState.mode === 'edit' ? categoryModalState.category ?? undefined : undefined}
        parentId={categoryModalState.mode === 'create' ? categoryModalState.parentId : null}
        onClose={closeCategoryModal}
        onSubmit={handleCategorySubmit}
      />

      <CategoryDeleteModal
        open={categoryDeleteState.open}
        categoryName={categoryDeleteState.category?.name}
        productCount={categoryDeleteState.category?.product_count}
        loading={categoryActionLoading}
        error={deleteCategoryError}
        onClose={closeDeleteCategoryModal}
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  );
};





