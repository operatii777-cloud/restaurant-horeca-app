// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { StatCard } from '@/shared/components/StatCard';
import { TableFilter } from '@/shared/components/TableFilter';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { HelpButton } from '@/shared/components/HelpButton';
import { useRecipesSummary } from '@/modules/recipes/hooks/useRecipesSummary';
import { RecipeEditorModal } from '@/modules/recipes/components/RecipeEditorModal';
import { RecipeScalingModal } from '@/modules/recipes/components/RecipeScalingModal';
import { CreateProductWizard } from '@/modules/recipes/components/CreateProductWizard';
import type { RecipeProductSummary } from '@/types/recipes';
import type { MenuProduct } from '@/types/menu';
import { CloneProductModal } from '@/modules/menu/components/CloneProductModal';
import { PriceHistoryModal } from '@/modules/menu/components/PriceHistoryModal';
import { FinishedProductModal } from '@/modules/stocks/components/FinishedProductModal';
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
  //   const { t } = useTranslation();
  const { products, stats, loading, error, refetch } = useRecipesSummary();
  const [quickFilter, setQuickFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<RecipeProductSummary | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [scalingModalOpen, setScalingModalOpen] = useState(false);  // ✅ Scaling modal
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [priceHistoryModalOpen, setPriceHistoryModalOpen] = useState(false);
  const [finishedProductModalOpen, setFinishedProductModalOpen] = useState(false);
  const [createWizardOpen, setCreateWizardOpen] = useState(false);
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
    console.log('🔍 RecipesPage Selection changed:', selected);
    const product = selected[0] ?? null;
    setSelectedProduct(product);
    console.log('🔍 RecipesPage Selected product set:', product);
  };

  const handleOpenEditor = () => {
    console.log('RecipesPage handleOpenEditor called, selectedProduct:', selectedProduct);
    if (!selectedProduct) {
      console.warn('RecipesPage No product selected');
      setFeedback({ type: 'error', message: 'Selectează un produs pentru a edita rețeta.' });
      return;
    }
    console.log('RecipesPage Opening editor for product:', selectedProduct.product_name);
    setEditorOpen(true);
    console.log('RecipesPage editorOpen set to true');
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

  // ✅ TASK 1: Handler pentru finished product modal
  const handleOpenFinishedProduct = useCallback(() => {
    if (!selectedProduct) {
      setFeedback({ type: 'warning', message: 'Selectează un produs pentru a configura stocul produsului finit.' });
      return;
    }
    setFeedback(null);
    setFinishedProductModalOpen(true);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h1>Rețete & Fișe Tehnice</h1>
            <p>Gestionează ingredientele, ambalajele și calculele</p>
          </div>
          <HelpButton
            title='ajutor retete & fise tehnice'
            content={
              <div>
                <h5>📋 Cum să creezi o rețetă?</h5>
                <p>Rețetele definesc ingredientele, cantitățile și procesul de preparare.</p>
                <h5 className="mt-4">📝 Pași pentru crearea unei rețete:</h5>
                <ol>
                  <li><strong>Selectează un produs</strong> - Click pe un produs din tabel pentru a-l selecta</li>
                  <li><strong>Editează rețeta</strong> - Click pe butonul "🧾 Editează rețeta"</li>
                  <li><strong>Adaugă ingrediente</strong> - În modalul de editare, adaugă ingredientele necesare:
                    <ul>
                      <li>Selectează ingredientul din listă</li>
                      <li>Introdu cantitatea necesară</li>
                      <li>Selectează unitatea de măsură (g, kg, ml, l, buc)</li>
                      <li>Specifică dacă ingredientul este opțional</li>
                    </ul>
                  </li>
                  <li><strong>Configurează procesul</strong> - Adaugă instrucțiuni de preparare (opțional)</li>
                  <li><strong>Salvează rețeta</strong> - Click pe "Salvează" pentru a salva modificările</li>
                </ol>
                <h5 className="mt-4">➕ Cum să creezi un produs nou cu rețetă?</h5>
                <ol>
                  <li>Click pe butonul <strong>➕ Produs Nou + Rețetă</strong></li>
                  <li>Completează informațiile produsului (nume, categorie, preț)</li>
                  <li>Adaugă ingredientele în rețetă</li>
                  <li>Salvează produsul și rețeta</li>
                </ol>
                <h5 className="mt-4">📊 Funcționalități disponibile:</h5>
                <ul>
                  <li><strong>🧾 Editează rețeta</strong> - Modifică ingredientele și cantitățile</li>
                  <li><strong>📊 Scalează rețeta</strong> - Ajustează cantitățile pentru porții diferite</li>
                  <li><strong>📦 Produs finit</strong> - Configurează stocul pentru produsul finit</li>
                  <li><strong>🧬 Clonează</strong> - Creează o copie a produsului cu rețeta</li>
                  <li><strong>📈 Istoric preț</strong> - Vezi evoluția prețului produsului</li>
                  <li><strong>📤 Export catalog</strong> - Exportă catalogul în format CSV</li>
                </ul>
                <h5 className="mt-4">💡 Sfaturi importante:</h5>
                <ul>
                  <li>Asigură-te că toate ingredientele sunt definite în stoc</li>
                  <li>Folosește unitățile de măsură corecte (g pentru solide, ml pentru lichide)</li>
                  <li>Verifică dacă cantitățile sunt realiste pentru porții</li>
                  <li>După crearea rețetei poți genera automat fișa tehnică</li>
                </ul>
                <div className="alert alert-info mt-4">
                  <strong>💡 Sfat:</strong> Rețetele complete permit calcularea automată a costurilor,
                  generarea fișelor tehnice și gestionarea eficientă a stocurilor.
                </div>
              </div>
            }
          />
        </div>
        <div className="recipes-header-actions">
          <button type="button" className="recipes-button recipes-button--primary" onClick={() => setCreateWizardOpen(true)}>
            ➕ Produs Nou + Rețetă
          </button>
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
          <button type="button" className="recipes-button recipes-button--secondary" onClick={handleOpenFinishedProduct} disabled={!selectedProduct}>
            📦 Produs finit
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
          placeholder="cauta dupa nume produs"
          aria-label="filtru rapid retete"
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
          onGridReady={(event) => {
            console.log('RecipesPage Grid ready, total rows:', event.api.getDisplayedRowCount());
            // Enable row selection
            event.api.setGridOption('rowSelection', 'single');
            // Add click handler for double-click to open editor
            event.api.addEventListener('rowDoubleClicked', (e) => {
              console.log('RecipesPage Row double-clicked:', e.data);
              if (e.data) {
                setSelectedProduct(e.data as RecipeProductSummary);
                setEditorOpen(true);
              }
            });
          }}
        />
      </section>

      <RecipeEditorModal open={editorOpen} product={selectedProduct} onClose={handleEditorClose} onSaved={handleEditorSaved} />

      {/* ✅ SĂPTĂMÂNA 1 - ZIUA 3: Scaling Modal */}
      <RecipeScalingModal
        open={scalingModalOpen}
        product={selectedProduct ? {
          id: selectedProduct.product_id,
          name: selectedProduct.product_name,
          servings: selectedProduct.servings || 1
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

      {/* ✅ TASK 1: Finished Product Modal */}
      <FinishedProductModal
        open={finishedProductModalOpen}
        productId={selectedProduct?.product_id ?? null}
        onClose={() => setFinishedProductModalOpen(false)}
        onSaved={async () => {
          setFeedback({ type: 'success', message: 'Stocul produsului finit a fost configurat cu succes.' });
          await refetch();
        }}
      />

      {/* ✅ TASK 2: Create Product Wizard */}
      <CreateProductWizard
        open={createWizardOpen}
        onClose={() => setCreateWizardOpen(false)}
        onComplete={async (productId) => {
          setFeedback({ type: 'success', message: `Produsul a fost creat complet cu ID: ${productId}` });
          setCreateWizardOpen(false);
          await refetch();
        }}
      />

      {/* Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu */}
    </div>
  );
}






