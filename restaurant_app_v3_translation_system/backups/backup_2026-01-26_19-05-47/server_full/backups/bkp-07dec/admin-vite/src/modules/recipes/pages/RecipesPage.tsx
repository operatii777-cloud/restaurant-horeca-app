import { useCallback, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { StatCard } from '@/shared/components/StatCard';
import { TableFilter } from '@/shared/components/TableFilter';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useRecipesSummary } from '@/modules/recipes/hooks/useRecipesSummary';
import { RecipeEditorModal } from '@/modules/recipes/components/RecipeEditorModal';
import { RecipeScalingModal } from '@/modules/recipes/components/RecipeScalingModal';
import type { RecipeProductSummary } from '@/types/recipes';
import type { MenuProduct } from '@/types/menu';
import { CloneProductModal } from '@/modules/menu/components/CloneProductModal';
import { PriceHistoryModal } from '@/modules/menu/components/PriceHistoryModal';
// Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu
import { httpClient } from '@/shared/api/httpClient';
import './RecipesPage.css';

type FeedbackState =
  | {
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }
  | null;

export function RecipesPage() {
  const { products, stats, loading, error, refetch } = useRecipesSummary();
  const [quickFilter, setQuickFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<RecipeProductSummary | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [scalingModalOpen, setScalingModalOpen] = useState(false);  // ✅ Scaling modal
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [priceHistoryModalOpen, setPriceHistoryModalOpen] = useState(false);
  // Removed: messagesModalOpen - mesageria internă este acum un modul separat

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      if (product.product_category) {
        set.add(product.product_category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ro-RO'));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) {
      return products;
    }
    return products.filter((product) => product.product_category === categoryFilter);
  }, [products, categoryFilter]);

  const columnDefs = useMemo<ColDef<RecipeProductSummary>[]>(() => {
    return [
      {
        field: 'product_name',
        headerName: 'Produs',
        flex: 1,
        minWidth: 220,
      },
      {
        field: 'product_category',
        headerName: 'Categorie',
        width: 160,
      },
      {
        field: 'recipe_count',
        headerName: 'Ingrediente',
        width: 120,
        valueFormatter: (params) => {
          const count = Number(params.value ?? 0);
          return count > 0 ? `${count} ingrediente` : 'Fără rețetă';
        },
        cellClass: (params) => {
          const count = Number(params.value ?? 0);
          return count > 0 ? 'cell-active' : 'cell-inactive';
        },
      },
    ];
  }, []);

  const selectedMenuProduct: MenuProduct | undefined = useMemo(() => {
    if (!selectedProduct) {
      return undefined;
    }

    return {
      id: selectedProduct.product_id,
      name: selectedProduct.product_name,
      category: selectedProduct.product_category ?? 'Nespecificat',
      price: 0,
      has_recipe: selectedProduct.recipe_count > 0,
    };
  }, [selectedProduct]);

  const handleSelectionChange = (selected: RecipeProductSummary[]) => {
    setSelectedProduct(selected[0] ?? null);
  };

  const handleOpenEditor = () => {
    if (!selectedProduct) {
      setFeedback({ type: 'error', message: 'Selectează un produs pentru a edita rețeta.' });
      return;
    }
    setEditorOpen(true);
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
  };

  const handleEditorSaved = async (message: string) => {
    setFeedback({ type: 'success', message });
    setEditorOpen(false);
    setSelectedProduct(null);
    await refetch();
  };

  const handleOpenClone = useCallback(() => {
    if (!selectedMenuProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a-l clona.' });
      return;
    }
    setFeedback(null);
    setCloneModalOpen(true);
  }, [selectedMenuProduct]);

  const handleOpenPriceHistory = useCallback(() => {
    if (!selectedMenuProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a vedea istoricul de preț.' });
      return;
    }
    setFeedback(null);
    setPriceHistoryModalOpen(true);
  }, [selectedMenuProduct]);
  
  // ✅ SĂPTĂMÂNA 1 - ZIUA 3: Handler pentru scaling modal
  const handleOpenScaling = useCallback(() => {
    if (!selectedProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a scala rețeta.' });
      return;
    }
    setFeedback(null);
    setScalingModalOpen(true);
  }, [selectedProduct]);

  // Removed: handleOpenMessages - mesageria internă este acum un modul separat în navigation menu

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

  const totalProducts = stats.total;
  const withRecipe = stats.withRecipe;
  const withoutRecipe = stats.withoutRecipe;

  const feedbackTitle = feedback
    ? feedback.type === 'success'
      ? 'Succes'
      : feedback.type === 'error'
        ? 'Eroare'
        : feedback.type === 'info'
          ? 'Informație'
          : 'Atenție'
    : undefined;

  return (
    <div className="recipes-page" data-page-ready={totalProducts > 0 ? 'true' : 'false'}>
      <header className="recipes-header">
        <div>
          <h1>Rețete & Fişe Tehnice</h1>
          <p>Gestionează ingredientele, ambalajele și calculele HACCP pentru fiecare produs din meniu.</p>
        </div>
        <div className="recipes-header-actions">
          <button type="button" className="recipes-button recipes-button--ghost" onClick={() => refetch()} disabled={loading}>
            🔄 Reîmprospătează
          </button>
          <button type="button" className="recipes-button recipes-button--ghost" onClick={handleExport}>
            📤 Export catalog
          </button>
          {/* Removed: Buton "Mesaj intern" - mutat în navigation menu bar ca serviciu independent */}
          <button type="button" className="recipes-button recipes-button--ghost" onClick={handleOpenPriceHistory} disabled={!selectedMenuProduct}>
            📈 Istoric preț
          </button>
          <button type="button" className="recipes-button recipes-button--ghost" onClick={handleOpenClone} disabled={!selectedMenuProduct}>
            🧬 Clonează
          </button>
          <button type="button" className="recipes-button recipes-button--secondary" onClick={handleOpenScaling} disabled={!selectedProduct}>
            📊 Scalează rețeta
          </button>
          <button type="button" className="recipes-button" onClick={handleOpenEditor} disabled={!selectedProduct}>
            🧾 Editează rețeta
          </button>
        </div>
      </header>

      <section className="recipes-stats">
        <StatCard
          title="Produse totale"
          helper="gestionați în meniul activ"
          value={String(totalProducts)}
          icon={<span>📋</span>}
          trendLabel="Cu rețetă"
          trendValue={`${withRecipe}`}
          trendDirection="up"
        />
        <StatCard
          title="Rețete definite"
          helper="produse cu rețetă completă"
          value={`${withRecipe}`}
          icon={<span>🥣</span>}
          trendLabel="Fără rețetă"
          trendValue={`${withoutRecipe}`}
          trendDirection={withoutRecipe > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Acoperire rețete"
          helper="mai multe rețete = costuri controlate"
          value={totalProducts > 0 ? `${Math.round((withRecipe / totalProducts) * 100)}%` : '0%'}
          icon={<span>📊</span>}
          trendLabel="Total produse"
          trendValue={`${totalProducts}`}
          trendDirection="up"
        />
      </section>

      <section className="recipes-toolbar">
        <TableFilter
          value={quickFilter}
          onChange={setQuickFilter}
          placeholder="Caută după nume produs..."
          aria-label="Filtru rapid rețete"
        />
        <div className="recipes-toolbar-filter">
          <label htmlFor="recipes-category">Categorie</label>
          <select
            id="recipes-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">Toate categoriile</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      {feedback ? <InlineAlert variant={feedback.type} title={feedbackTitle} message={feedback.message} /> : null}
      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
      <div className="recipes-selection">
        {selectedProduct
          ? `Produs selectat: ${selectedProduct.product_name}`
          : 'Selectează un produs din tabel pentru acțiuni rapide (clonare, export alertă, istoric preț).'}
      </div>

      <section className="recipes-grid">
        <DataGrid<RecipeProductSummary>
          columnDefs={columnDefs}
          rowData={filteredProducts}
          loading={loading}
          quickFilterText={quickFilter}
          height="65vh"
          rowSelection="single"
          onSelectedRowsChange={handleSelectionChange}
        />
      </section>

      <RecipeEditorModal open={editorOpen} product={selectedProduct} onClose={handleEditorClose} onSaved={handleEditorSaved} />
      
      {/* ✅ SĂPTĂMÂNA 1 - ZIUA 3: Scaling Modal */}
      <RecipeScalingModal
        open={scalingModalOpen}
        product={selectedProduct ? {
          id: selectedProduct.product_id,
          name: selectedProduct.product_name,
          servings: 1  // TODO: Fetch servings from product
        } : null}
        onClose={() => setScalingModalOpen(false)}
      />

      <CloneProductModal
        open={cloneModalOpen}
        product={selectedMenuProduct}
        onClose={() => setCloneModalOpen(false)}
        onCloned={async ({ newName }) => {
          setCloneModalOpen(false);
          setFeedback({ type: 'success', message: `Produsul “${newName}” a fost clonat cu succes.` });
          setSelectedProduct(null);
          await refetch();
        }}
      />

      <PriceHistoryModal
        open={priceHistoryModalOpen}
        product={selectedMenuProduct}
        onClose={() => setPriceHistoryModalOpen(false)}
      />

      {/* Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu */}
    </div>
  );
}

