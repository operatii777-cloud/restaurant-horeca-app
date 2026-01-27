import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { StatCard } from '@/shared/components/StatCard';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { TableFilter } from '@/shared/components/TableFilter';
import { useMenuProducts } from '@/modules/menu/hooks/useMenuProducts';
import { useMenuCategories } from '@/modules/menu/hooks/useMenuCategories';
import { MenuProductModal } from '@/modules/menu/components/MenuProductModal';
import { BulkPriceModal } from '@/modules/menu/components/BulkPriceModal';
import { ProductDependenciesModal } from '@/modules/menu/components/ProductDependenciesModal';
import { CloneProductModal } from '@/modules/menu/components/CloneProductModal';
import { PriceHistoryModal } from '@/modules/menu/components/PriceHistoryModal';
// Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { httpClient } from '@/shared/api/httpClient';
import type { MenuProduct } from '@/types/menu';
import './MenuManagementPage.css';

type FeedbackState =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

export function MenuManagementPage() {
  const [quickFilter, setQuickFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<MenuProduct[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [dependenciesModalOpen, setDependenciesModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [priceHistoryModalOpen, setPriceHistoryModalOpen] = useState(false);
  // Removed: messagesModalOpen - mesageria internă este acum un modul separat

  const navigate = useNavigate();
  const { products, analytics, loading, error, refetch } = useMenuProducts(categoryFilter || undefined);
  const { categories, error: categoriesError, refetch: refetchCategories } = useMenuCategories();
  const {
    mutate: deleteProduct,
    loading: deleting,
    error: deleteError,
    reset: resetDeleteError,
  } = useApiMutation<{ message?: string }>();

  const columnDefs = useMemo<ColDef<MenuProduct>[]>(() => {
    return [
      {
        field: 'category',
        headerName: 'Categorie',
        width: 180,
        sortable: true,
        filter: true,
        pinned: 'left',
      },
      {
        field: 'name',
        headerName: 'Produs',
        flex: 1,
        minWidth: 220,
        sortable: true,
        filter: true,
        cellRenderer: (params: ICellRendererParams<MenuProduct, string>) => {
          const name = params.value ?? '';
          const nameEn = params.data?.name_en;
          if (!nameEn) {
            return name;
          }
          return `${name} / ${nameEn}`;
        },
      },
      {
        field: 'price',
        headerName: 'Preț (RON)',
        width: 140,
        sortable: true,
        filter: true,
        valueFormatter: (params: ValueFormatterParams<MenuProduct, number>) => {
          const price = Number(params.value ?? 0);
          return price.toLocaleString('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2,
          });
        },
      },
      {
        field: 'is_sellable',
        headerName: 'Vânzare',
        width: 120,
        sortable: true,
        filter: true,
        valueFormatter: (params: ValueFormatterParams<MenuProduct, unknown>) => {
          const value = params.value;
          const interpreted = value === 1 || value === true || value === '1';
          return interpreted ? 'Activ' : 'Inactiv';
        },
        cellClass: (params: CellClassParams<MenuProduct, unknown>) => {
          const value = params.value;
          const interpreted = value === 1 || value === true || value === '1';
          return interpreted ? 'cell-active' : 'cell-inactive';
        },
      },
      {
        field: 'allergens',
        headerName: 'Alergeni (RO)',
        flex: 1,
        minWidth: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'allergens_en',
        headerName: 'Alergeni (EN)',
        flex: 1,
        minWidth: 200,
        sortable: true,
        filter: true,
      },
    ];
  }, []);

  const handleCategoryFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(event.target.value);
  };

  useEffect(() => {
    setSelectedProducts([]);
  }, [categoryFilter]);

  const handleSelectionChange = useCallback((selected: MenuProduct[]) => {
    setSelectedProducts(selected);
  }, []);

  const primarySelectedProduct = selectedProducts[0] ?? null;
  const selectedProductCount = selectedProducts.length;
  const selectedProductIds = useMemo(() => selectedProducts.map((product) => product.id), [selectedProducts]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedProducts([]);
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-l edita.' });
      return;
    }
    setModalMode('edit');
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenRecipeEditor = () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs înainte de a deschide editorul de rețete.' });
      return;
    }

    navigate(`/recipes?productId=${primarySelectedProduct.id}`, {
      state: {
        from: '/menu',
        productId: primarySelectedProduct.id,
        productName: primarySelectedProduct.name,
      },
    });
  };

  const handleOpenBulkModal = () => {
    if (!selectedProductIds.length) {
      setFeedback({ type: 'error', message: 'Selectează cel puțin un produs pentru schimbare de preț.' });
      return;
    }
    setBulkModalOpen(true);
  };

  const handleOpenDependencies = () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-i analiza dependențele.' });
      return;
    }
    setDependenciesModalOpen(true);
  };

  const handleOpenClone = () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs pentru clonare.' });
      return;
    }
    setFeedback(null);
    setCloneModalOpen(true);
  };

  const handleOpenPriceHistory = () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-i vizualiza istoricul de preț.' });
      return;
    }
    setFeedback(null);
    setPriceHistoryModalOpen(true);
  };

  // Removed: handleOpenMessages - mesageria internă este acum un modul separat în navigation menu

  const handleExport = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (categoryFilter) {
      params.set('category', categoryFilter);
    }

    const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
    const exportUrl = `${baseUrl}/api/catalog/products/export?${params.toString()}`;

    window.open(exportUrl, '_blank', 'noopener');
    setFeedback({ type: 'success', message: 'Export inițiat. Fișierul CSV va fi descărcat în curând.' });
  };

  const handleDelete = async () => {
    if (!primarySelectedProduct || selectedProductCount !== 1) {
      setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-l șterge.' });
      return;
    }

    const confirmed = window.confirm(`Ștergi produsul "${primarySelectedProduct.name}"?`);
    if (!confirmed) {
      return;
    }

    const response = await deleteProduct({
      url: `/api/admin/products/${primarySelectedProduct.id}`,
      method: 'delete',
    });

    if (response !== null) {
      resetDeleteError();
      setFeedback({ type: 'success', message: response?.message ?? 'Produs șters cu succes.' });
      setSelectedProducts([]);
      await refetch();
      await refetchCategories();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSaved = async (message: string) => {
    setModalOpen(false);
    setFeedback({ type: 'success', message });
    setSelectedProducts([]);
    await refetch();
    await refetchCategories();
    resetDeleteError();
  };

  const hasToolbarErrors = Boolean(error || categoriesError || deleteError || feedback?.type === 'error');
  const pageReady = !loading && products.length > 0;

  return (
    <div className="menu-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
      <header className="menu-management-header">
        <div>
          <h1>Gestionare meniu</h1>
          <p>
            Portare React + AG Grid a modulului master &quot;Gestionare Meniu&quot;, sincronizat cu centralizatorul Catalog Produse și editorul de
            rețete.
          </p>
        </div>
        <div className="menu-management-actions">
          <button type="button" onClick={refetch}>
            🔄 Reîncarcă
          </button>
        </div>
      </header>

      <section className="menu-management-hero">
        <div className="menu-management-hero__intro">
          <div className="menu-management-chips">
            <span className="menu-chip menu-chip--primary">Master CRUD modul v3</span>
            <span className="menu-chip">AG Grid + SmartForm</span>
            <span className="menu-chip">Legat de Catalog & Rețete</span>
          </div>
          <h2>Meniul activ al locației</h2>
          <p>
            Editează rapid produsele servite în meniul clienților, sincronizează traducerile și pornește editorul de rețete sau fișe tehnice pentru
            actualizări de cost.
          </p>
        </div>

        <div className="menu-management-stats">
          <StatCard
            title="Produse listate"
            helper="Număr total în meniul curent"
            value={`${analytics.totalProducts}`}
            trendLabel="Doar la pachet"
            trendValue={`${analytics.takeoutOnlyCount}`}
            trendDirection={analytics.takeoutOnlyCount > 0 ? 'up' : 'flat'}
            icon={<span>🍽️</span>}
          />
          <StatCard
            title="Preț mediu"
            helper="Pe produs listat"
            value={`${analytics.averagePrice.toFixed(2)} RON`}
            trendLabel="Opțiuni vegetariene"
            trendValue={`${analytics.vegetarianCount}`}
            trendDirection={analytics.vegetarianCount > 0 ? 'up' : 'flat'}
            icon={<span>💶</span>}
          />
          <StatCard
            title="Produse picante"
            helper="Marcaj intern pentru alergeni"
            value={`${analytics.spicyCount}`}
            trendLabel="Top categorie"
            trendValue={analytics.topCategories[0] ? `${analytics.topCategories[0].raw} items` : 'N/A'}
            trendDirection={analytics.topCategories.length > 0 ? 'up' : 'flat'}
            icon={<span>🌶️</span>}
          />
        </div>

        <div className="menu-management-analytics">
          <article className="menu-analytics-card">
            <header>
              <span>Top prețuri din meniu</span>
              <span className="menu-analytics-helper">RON / produs</span>
            </header>
            <MiniBarChart
              data={
                analytics.topPricedProducts.length
                  ? analytics.topPricedProducts
                  : [
                      { label: 'Fără date', value: 0 },
                      { label: 'Adaugă produse', value: 0 },
                    ]
              }
            />
          </article>

          <article className="menu-analytics-card">
            <header>
              <span>Distribuție pe categorii</span>
              <span className="menu-analytics-helper">% din total</span>
            </header>
            <MiniDonutChart
              data={
                analytics.topCategories.length
                  ? analytics.topCategories.map((entry) => ({ name: entry.name, value: entry.value, color: entry.color }))
                  : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]
              }
            />
            <ul className="menu-analytics-legend">
              {analytics.topCategories.length === 0 ? (
                <li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true" />
                  <div>
                    <strong>Fără date disponibile</strong>
                    <small>Adaugă produse pentru a vedea distribuția.</small>
                  </div>
                  <strong>100%</strong>
                </li>
              ) : (
                analytics.topCategories.map((entry) => (
                  <li key={entry.name}>
                    <span style={{ backgroundColor: entry.color }} aria-hidden="true" />
                    <div>
                      <strong>{entry.name}</strong>
                      <small>{entry.raw} produse</small>
                    </div>
                    <strong>{entry.value}%</strong>
                  </li>
                ))
              )}
            </ul>
          </article>
        </div>
      </section>

      <div className="menu-management-toolbar">
        <div className="menu-management-filters">
          <TableFilter
            value={quickFilter}
            onChange={setQuickFilter}
            placeholder="Caută produs după nume, categorie sau alergeni"
            aria-label="Filtru rapid produse meniu"
          />
          <div className="menu-management-filter-select">
            <label htmlFor="menu-category-filter">Categorie</label>
            <select id="menu-category-filter" value={categoryFilter} onChange={handleCategoryFilterChange}>
              <option value="">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="menu-management-selection">
          {selectedProductCount === 0
            ? 'Selectează produse din tabel pentru acțiuni în masă.'
            : `${selectedProductCount} produs(e) selectate.`}
        </div>

        <div className="menu-management-buttons">
          <button type="button" className="menu-management-button menu-management-button--primary" onClick={handleOpenCreate}>
            ➕ Adaugă produs
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenEdit} disabled={!primarySelectedProduct}>
            ✏️ Editează
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenRecipeEditor} disabled={!primarySelectedProduct}>
            👨‍🍳 Editor rețetă
          </button>
          <button
            type="button"
            className="menu-management-button"
            onClick={handleOpenDependencies}
            disabled={!primarySelectedProduct}
          >
            🔗 Dependențe
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenClone} disabled={!primarySelectedProduct}>
            🧬 Clonează
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenPriceHistory} disabled={!primarySelectedProduct}>
            📈 Istoric preț
          </button>
          {/* Removed: Buton "Mesaj intern" - mutat în navigation menu bar ca serviciu independent */}
          <button
            type="button"
            className="menu-management-button"
            onClick={handleOpenBulkModal}
            disabled={selectedProductCount === 0}
          >
            💱 Schimbare preț
          </button>
          <button type="button" className="menu-management-button" onClick={handleExport}>
            📤 Export CSV
          </button>
          <button
            type="button"
            className="menu-management-button menu-management-button--danger"
            onClick={handleDelete}
            disabled={!primarySelectedProduct || deleting}
          >
            🗑️ Șterge
          </button>
        </div>
      </div>

      <div className="menu-management-feedback">
        {feedback ? <InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Atenție'} message={feedback.message} /> : null}
        {error ? <InlineAlert variant="error" title="Eroare produse" message={error} /> : null}
        {categoriesError ? <InlineAlert variant="error" title="Eroare categorii" message={categoriesError} /> : null}
        {deleteError ? <InlineAlert variant="error" title="Eroare ștergere" message={deleteError} /> : null}
        {!hasToolbarErrors ? null : <div className="menu-management-spacer" />}
      </div>

      <section className="menu-management-grid">
        <DataGrid<MenuProduct>
          columnDefs={columnDefs}
          rowData={products}
          loading={loading}
          quickFilterText={quickFilter}
          height="70vh"
          rowSelection="multiple"
          onSelectedRowsChange={handleSelectionChange}
        />
      </section>

      <MenuProductModal
        open={modalOpen}
        mode={modalMode}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
        categories={categories}
        product={modalMode === 'edit' ? primarySelectedProduct ?? undefined : undefined}
      />

      <BulkPriceModal
        open={bulkModalOpen}
        productCount={selectedProductCount}
        productIds={selectedProductIds}
        onClose={() => setBulkModalOpen(false)}
        onApplied={async (updatedCount, newPrice, newVatRate) => {
          setBulkModalOpen(false);
          setSelectedProducts([]);
          setFeedback({
            type: 'success',
            message: `Au fost actualizate ${updatedCount} produse${newPrice !== undefined ? ` la ${newPrice} RON` : ''}${
              newVatRate !== undefined ? ` și TVA ${newVatRate}%` : ''
            }.`,
          });
          await refetch();
          await refetchCategories();
        }}
      />

      <ProductDependenciesModal
        open={dependenciesModalOpen}
        product={primarySelectedProduct}
        onClose={() => setDependenciesModalOpen(false)}
      />

      <CloneProductModal
        open={cloneModalOpen}
        product={primarySelectedProduct}
        onClose={() => setCloneModalOpen(false)}
        onCloned={async ({ newName }) => {
          setCloneModalOpen(false);
          setFeedback({ type: 'success', message: `Produs clonat cu succes: “${newName}”.` });
          setSelectedProducts([]);
          await refetch();
          await refetchCategories();
        }}
      />

      <PriceHistoryModal open={priceHistoryModalOpen} product={primarySelectedProduct} onClose={() => setPriceHistoryModalOpen(false)} />

      {/* Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu */}
    </div>
  );
}

