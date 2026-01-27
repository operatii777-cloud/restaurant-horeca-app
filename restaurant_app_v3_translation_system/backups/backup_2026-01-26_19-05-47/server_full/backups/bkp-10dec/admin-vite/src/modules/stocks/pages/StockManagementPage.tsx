import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import type { StockSummary } from '@/types/stocks';
import { StockIngredientsTab } from '@/modules/stocks/tabs/StockIngredientsTab';
import { StockFinishedProductsTab } from '@/modules/stocks/tabs/StockFinishedProductsTab';
import { StockHiddenIngredientsTab } from '@/modules/stocks/tabs/StockHiddenIngredientsTab';
import { StockRecipesTab } from '@/modules/stocks/tabs/StockRecipesTab';
import './StockManagementPage.css';

type StockTabKey = 'ingredients' | 'finished' | 'recipes' | 'hidden';

const TABS: Array<{ key: StockTabKey; label: string; emoji: string }> = [
  { key: 'ingredients', label: 'Ingrediente', emoji: '🥬' },
  { key: 'finished', label: 'Produse finite', emoji: '🍽️' },
  { key: 'recipes', label: 'Rețete & F.T.P.', emoji: '📋' },
  { key: 'hidden', label: 'Ingrediente ascunse', emoji: '👻' },
];

export const StockManagementPage = () => {
  const [activeTab, setActiveTab] = useState<StockTabKey>('ingredients');
  const [pageReady, setPageReady] = useState(false);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleSummaryPatch = useCallback((patch: Partial<StockSummary>) => {
    setSummary((prev) => {
      const base: StockSummary = prev ?? {
        totalIngredients: 0,
        activeIngredients: 0,
        hiddenIngredients: 0,
        lowStockIngredients: 0,
        finishedProductsWithStock: 0,
        autoManagedProducts: 0,
      };
      return { ...base, ...patch };
    });
    setPageReady(true);
  }, []);

  const handleGlobalFeedback = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ type, message });
  }, []);

  const tabHeader = useMemo(
    () => (
      <div className="stock-management-tablist" role="tablist" aria-label="Gestionare stocuri tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={classNames({ 'is-active': activeTab === tab.key })}
            onClick={() => setActiveTab(tab.key)}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>
    ),
    [activeTab],
  );

  return (
    <div className="stock-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
      <header className="stock-management-header">
        <div>
          <h1>Gestionare stocuri – Admin V4</h1>
          <p>Monitorizează și actualizează ingredientele, produsele finite și recepțiile în timp real.</p>
        </div>
        <div className="stock-management-header__tags">
          <span>Integrare directă cu NIR, trasabilitate și rețete</span>
          <span>Actualizare automată la comenzi și recepții</span>
          <span>Fluxuri 100% compatibile cu versiunea clasică</span>
        </div>

        {summary && (
          <div className="stock-management-summary">
            <StatCard
              title="Ingrediente active"
              helper="Disponibile în gestiune"
              value={`${summary.activeIngredients} / ${summary.totalIngredients}`}
              icon={<span>✅</span>}
            />
            <StatCard
              title="Ingrediente ascunse"
              helper="Marcate neinventariabile"
              value={`${summary.hiddenIngredients}`}
              icon={<span>👻</span>}
            />
            <StatCard
              title="Alerte stoc"
              helper="Sub prag minim"
              value={`${summary.lowStockIngredients}`}
              trendDirection={summary.lowStockIngredients > 0 ? 'down' : 'flat'}
              trendLabel={summary.lowStockIngredients > 0 ? 'Necesită acțiune' : 'OK'}
              icon={<span>⚠️</span>}
            />
            <StatCard
              title="Produse finite monitorizate"
              helper="Configurate cu stoc"
              value={`${summary.finishedProductsWithStock}`}
              icon={<span>🍽️</span>}
              footer={<span>{summary.autoManagedProducts} automate</span>}
            />
          </div>
        )}

        {tabHeader}
      </header>

      <section className={classNames('stock-management-content', { 'stock-management-content--no-padding': activeTab === 'recipes' })}>
        {feedback ? (
          <div style={{ marginBottom: 16 }}>
            <InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : feedback.type === 'error' ? 'Eroare' : 'Info'} message={feedback.message} />
          </div>
        ) : null}

        {activeTab === 'ingredients' && (
          <StockIngredientsTab onSummary={handleSummaryPatch} onFeedback={handleGlobalFeedback} />
        )}
        {activeTab === 'finished' && (
          <StockFinishedProductsTab onSummary={handleSummaryPatch} onFeedback={handleGlobalFeedback} />
        )}
        {activeTab === 'recipes' && <StockRecipesTab />}
        {activeTab === 'hidden' && <StockHiddenIngredientsTab onFeedback={handleGlobalFeedback} />}
      </section>
    </div>
  );
};
