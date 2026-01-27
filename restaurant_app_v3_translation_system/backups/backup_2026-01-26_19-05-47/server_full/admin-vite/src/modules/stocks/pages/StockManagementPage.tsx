// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { HelpButton } from '@/shared/components/HelpButton';
import type { StockSummary } from '@/types/stocks';
import { StockIngredientsTab } from '@/modules/stocks/tabs/StockIngredientsTab';
import { StockFinishedProductsTab } from '@/modules/stocks/tabs/StockFinishedProductsTab';
import { StockHiddenIngredientsTab } from '@/modules/stocks/tabs/StockHiddenIngredientsTab';
import { StockRecipesTab } from '@/modules/stocks/tabs/StockRecipesTab';
import { LocationSwitcher } from '@/modules/layout/components/LocationSwitcher';
import { useTheme } from '@/shared/context/ThemeContext';
import './StockManagementPage.css';

type StockTabKey = 'ingredients' | 'finished' | 'recipes' | 'hidden';

const TABS: Array<{ key: StockTabKey; label: string; emoji: string }> = [
  { key: 'ingredients', label: 'Ingrediente', emoji: '🥬' },
  { key: 'finished', label: 'Produse finite', emoji: '🍽️' },
  { key: 'recipes', label: 'Rețete & F.T.P.', emoji: '📋' },
  { key: 'hidden', label: 'Ingrediente ascunse', emoji: '👻' },
];

export const StockManagementPage = () => {
  // const { t } = useTranslation();
  const { theme } = useTheme();
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
      <div className="stock-management-tablist" role="tablist" aria-label="Tab-uri gestionare stocuri">
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
        <div className="d-flex justify-content-between align-items-start w-100">
          <div>
            <h1 className="h2 fw-bold mb-2 lh-1" style={{ color: theme.text, margin: 0 }}>
              Gestionare stocuri – Admin V4
            </h1>
            <p className="small lh-base m-0" style={{ color: theme.textMuted }}>Monitorizează și actualizează ingredientele produselor.</p>
          </div>
          <HelpButton
            title="Ajutor gestionare stocuri"
            content={
              <div>
                <h5>📦 Ce este Gestionarea Stocurilor?</h5>
                <p>
                  Gestionarea stocurilor permite monitorizarea și actualizarea ingredientelor, 
                  produselor finite și recepțiilor în timp real, cu integrare directă cu NIR, 
                  trasabilitate și rețete.
                </p>
                <h5 className="mt-4">📋 Tab-uri disponibile</h5>
                <ul>
                  <li><strong>🥬 Ingrediente</strong> - Gestiunea ingredientelor active</li>
                  <li><strong>🍽️ Produse finite</strong> - Produse finite cu stoc monitorizat</li>
                  <li><strong>📋 Rețete & F.T.P.</strong> - Rețete și Fișe Tehnice de Preparare</li>
                  <li><strong>👻 Ingrediente ascunse</strong> - Ingrediente marcate neinventariabile</li>
                </ul>
                <h5 className="mt-4">🔄 Funcționalități</h5>
                <ul>
                  <li><strong>Actualizare automată</strong> - Stocuri actualizate automat la comenzi și recepții</li>
                  <li><strong>Integrare NIR</strong> - Integrare directă cu Nota de Intrare în Rezervă</li>
                  <li><strong>Trasabilitate</strong> - Urmărire completă a ingredientelor</li>
                  <li><strong>Alerte stoc</strong> - Notificări pentru stocuri sub prag minim</li>
                </ul>
                <div className="alert alert-info mt-4">
                  <strong>💡 Sfat:</strong> Folosește Location Switcher pentru a gestiona stocurile 
                  pe locații diferite.
                </div>
              </div>
            }
          />
        </div>
        <div className="stock-management-header__tags text-muted">
          <span>Integrare directă cu NIR, trasabilitate și rețete</span>
          <span>Actualizare automată la comenzi și recepții</span>
          <span>Fluxuri 100% compatibile cu versiunea clasică</span>
        </div>
        {/* Location Switcher pentru Gestiune */}
        <div className="d-flex align-items-center gap-3 mt-3">
          <span style={{ 
            fontSize: '14px', 
            color: theme.text, 
            fontWeight: 500,
          }}>Locație</span>
          <LocationSwitcher />
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
          <div className="mb-3">
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

