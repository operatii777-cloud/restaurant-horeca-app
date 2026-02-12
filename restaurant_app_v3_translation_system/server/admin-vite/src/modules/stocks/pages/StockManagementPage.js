"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockManagementPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var StatCard_1 = require("@/shared/components/StatCard");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var HelpButton_1 = require("@/shared/components/HelpButton");
var StockIngredientsTab_1 = require("@/modules/stocks/tabs/StockIngredientsTab");
var StockFinishedProductsTab_1 = require("@/modules/stocks/tabs/StockFinishedProductsTab");
var StockHiddenIngredientsTab_1 = require("@/modules/stocks/tabs/StockHiddenIngredientsTab");
var StockRecipesTab_1 = require("@/modules/stocks/tabs/StockRecipesTab");
var LocationSwitcher_1 = require("@/modules/layout/components/LocationSwitcher");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./StockManagementPage.css");
var TABS = [
    { key: 'ingredients', label: 'Ingrediente', emoji: 'fas fa-leaf' },
    { key: 'finished', label: 'Produse finite', emoji: 'fas fa-utensils' },
    { key: 'recipes', label: 'Rețete & F.T.P.', emoji: 'fas fa-scroll' },
    { key: 'hidden', label: 'Ingrediente ascunse', emoji: 'fas fa-ghost' },
];
var StockManagementPage = function () {
    // const { t } = useTranslation();
    var theme = (0, ThemeContext_1.useTheme)().theme;
    var _a = (0, react_1.useState)('ingredients'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), pageReady = _b[0], setPageReady = _b[1];
    var _c = (0, react_1.useState)(null), summary = _c[0], setSummary = _c[1];
    var _d = (0, react_1.useState)(null), feedback = _d[0], setFeedback = _d[1];
    var handleSummaryPatch = (0, react_1.useCallback)(function (patch) {
        setSummary(function (prev) {
            var base = prev !== null && prev !== void 0 ? prev : {
                totalIngredients: 0,
                activeIngredients: 0,
                hiddenIngredients: 0,
                lowStockIngredients: 0,
                finishedProductsWithStock: 0,
                autoManagedProducts: 0,
            };
            return __assign(__assign({}, base), patch);
        });
        setPageReady(true);
    }, []);
    var handleGlobalFeedback = (0, react_1.useCallback)(function (message, type) {
        if (type === void 0) { type = 'info'; }
        setFeedback({ type: type, message: message });
    }, []);
    var tabHeader = (0, react_1.useMemo)(function () { return (<div className="stock-management-tablist" role="tablist" aria-label="Tab-uri gestionare stocuri">
        {TABS.map(function (tab) { return (<button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} className={(0, classnames_1.default)({ 'is-active': activeTab === tab.key })} onClick={function () { return setActiveTab(tab.key); }}>
            <i className={"".concat(tab.emoji, " me-2")} aria-hidden="true"></i>
            {tab.label}
          </button>); })}
      </div>); }, [activeTab]);
    return (<div className="stock-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
      <header className="stock-management-header">
        <div className="d-flex justify-content-between align-items-start w-100">
          <div>
            <h1 className="h2 fw-bold mb-2 lh-1" style={{ color: theme.text, margin: 0 }}>
              Gestionare stocuri – Admin V4
            </h1>
            <p className="small lh-base m-0" style={{ color: theme.textMuted }}>Monitorizează și actualizează ingredientele produselor.</p>
          </div>
          <HelpButton_1.HelpButton title="Ajutor gestionare stocuri" content={<div>
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
              </div>}/>
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
          <LocationSwitcher_1.LocationSwitcher />
        </div>

        {summary && (<div className="stock-management-summary">
            <StatCard_1.StatCard title="Ingrediente active" helper="Disponibile în gestiune" value={"".concat(summary.activeIngredients, " / ").concat(summary.totalIngredients)} icon={<i className="fas fa-check-circle text-success"></i>}/>
            <StatCard_1.StatCard title="Ingrediente ascunse" helper="Marcate neinventariabile" value={"".concat(summary.hiddenIngredients)} icon={<i className="fas fa-ghost text-muted"></i>}/>
            <StatCard_1.StatCard title="Alerte stoc" helper="Sub prag minim" value={"".concat(summary.lowStockIngredients)} trendDirection={summary.lowStockIngredients > 0 ? 'down' : 'flat'} trendLabel={summary.lowStockIngredients > 0 ? 'Necesită acțiune' : 'OK'} icon={<i className="fas fa-exclamation-triangle text-warning"></i>}/>
            <StatCard_1.StatCard title="Produse finite monitorizate" helper="Configurate cu stoc" value={"".concat(summary.finishedProductsWithStock)} icon={<i className="fas fa-utensils text-primary"></i>} footer={<span>{summary.autoManagedProducts} automate</span>}/>
          </div>)}

        {tabHeader}
      </header>

      <section className={(0, classnames_1.default)('stock-management-content', { 'stock-management-content--no-padding': activeTab === 'recipes' })}>
        {feedback ? (<div className="mb-3">
            <InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : feedback.type === 'error' ? 'Eroare' : 'Info'} message={feedback.message}/>
          </div>) : null}

        {activeTab === 'ingredients' && (<StockIngredientsTab_1.StockIngredientsTab onSummary={handleSummaryPatch} onFeedback={handleGlobalFeedback}/>)}
        {activeTab === 'finished' && (<StockFinishedProductsTab_1.StockFinishedProductsTab onSummary={handleSummaryPatch} onFeedback={handleGlobalFeedback}/>)}
        {activeTab === 'recipes' && <StockRecipesTab_1.StockRecipesTab />}
        {activeTab === 'hidden' && <StockHiddenIngredientsTab_1.StockHiddenIngredientsTab onFeedback={handleGlobalFeedback}/>}
      </section>
    </div>);
};
exports.StockManagementPage = StockManagementPage;
