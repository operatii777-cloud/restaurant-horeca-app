"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipesPage = RecipesPage;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var DataGrid_1 = require("@/shared/components/DataGrid");
var StatCard_1 = require("@/shared/components/StatCard");
var TableFilter_1 = require("@/shared/components/TableFilter");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var HelpButton_1 = require("@/shared/components/HelpButton");
var useRecipesSummary_1 = require("@/modules/recipes/hooks/useRecipesSummary");
var RecipeEditorModal_1 = require("@/modules/recipes/components/RecipeEditorModal");
var RecipeScalingModal_1 = require("@/modules/recipes/components/RecipeScalingModal");
var CreateProductWizard_1 = require("@/modules/recipes/components/CreateProductWizard");
var CloneProductModal_1 = require("@/modules/menu/components/CloneProductModal");
var PriceHistoryModal_1 = require("@/modules/menu/components/PriceHistoryModal");
var FinishedProductModal_1 = require("@/modules/stocks/components/FinishedProductModal");
// Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu
var httpClient_1 = require("@/shared/api/httpClient");
require("./RecipesPage.css");
function RecipesPage() {
    var _this = this;
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, useRecipesSummary_1.useRecipesSummary)(), products = _b.products, stats = _b.stats, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var _c = (0, react_1.useState)(''), quickFilter = _c[0], setQuickFilter = _c[1];
    var _d = (0, react_1.useState)(''), categoryFilter = _d[0], setCategoryFilter = _d[1];
    var _e = (0, react_1.useState)(null), selectedProduct = _e[0], setSelectedProduct = _e[1];
    var _f = (0, react_1.useState)(false), editorOpen = _f[0], setEditorOpen = _f[1];
    var _g = (0, react_1.useState)(false), scalingModalOpen = _g[0], setScalingModalOpen = _g[1]; // ✅ Scaling modal
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, react_1.useState)(false), cloneModalOpen = _j[0], setCloneModalOpen = _j[1];
    var _k = (0, react_1.useState)(false), priceHistoryModalOpen = _k[0], setPriceHistoryModalOpen = _k[1];
    var _l = (0, react_1.useState)(false), finishedProductModalOpen = _l[0], setFinishedProductModalOpen = _l[1];
    var _m = (0, react_1.useState)(false), createWizardOpen = _m[0], setCreateWizardOpen = _m[1];
    // Removed: messagesModalOpen - mesageria internă este acum un modul separat
    var categories = (0, react_1.useMemo)(function () {
        var set = new Set();
        products.forEach(function (product) {
            if (product.product_category) {
                set.add(product.product_category);
            }
        });
        return Array.from(set).sort(function (a, b) { return a.localeCompare(b, 'ro-RO'); });
    }, [products]);
    var filteredProducts = (0, react_1.useMemo)(function () {
        if (!categoryFilter) {
            return products;
        }
        return products.filter(function (product) { return product.product_category === categoryFilter; });
    }, [products, categoryFilter]);
    var columnDefs = (0, react_1.useMemo)(function () {
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
                valueFormatter: function (params) {
                    var _a;
                    var count = Number((_a = params.value) !== null && _a !== void 0 ? _a : 0);
                    return count > 0 ? "".concat(count, " ingrediente") : 'Fără rețetă';
                },
                cellClass: function (params) {
                    var _a;
                    var count = Number((_a = params.value) !== null && _a !== void 0 ? _a : 0);
                    return count > 0 ? 'cell-active' : 'cell-inactive';
                },
            },
        ];
    }, []);
    var selectedMenuProduct = (0, react_1.useMemo)(function () {
        var _a;
        if (!selectedProduct) {
            return undefined;
        }
        return {
            id: selectedProduct.product_id,
            name: selectedProduct.product_name,
            category: (_a = selectedProduct.product_category) !== null && _a !== void 0 ? _a : 'Nespecificat',
            price: 0,
            has_recipe: selectedProduct.recipe_count > 0,
        };
    }, [selectedProduct]);
    var handleSelectionChange = function (selected) {
        var _a;
        console.log('🔍 RecipesPage Selection changed:', selected);
        var product = (_a = selected[0]) !== null && _a !== void 0 ? _a : null;
        setSelectedProduct(product);
        console.log('🔍 RecipesPage Selected product set:', product);
    };
    var handleOpenEditor = function () {
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
    var handleEditorClose = function () {
        setEditorOpen(false);
    };
    var handleEditorSaved = function (message) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFeedback({ type: 'success', message: message });
                    setEditorOpen(false);
                    setSelectedProduct(null);
                    return [4 /*yield*/, refetch()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleOpenClone = (0, react_1.useCallback)(function () {
        if (!selectedMenuProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a-l clona.' });
            return;
        }
        setFeedback(null);
        setCloneModalOpen(true);
    }, [selectedMenuProduct]);
    var handleOpenPriceHistory = (0, react_1.useCallback)(function () {
        if (!selectedMenuProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a vedea istoricul de preț.' });
            return;
        }
        setFeedback(null);
        setPriceHistoryModalOpen(true);
    }, [selectedMenuProduct]);
    // ✅ SĂPTĂMÂNA 1 - ZIUA 3: Handler pentru scaling modal
    var handleOpenScaling = (0, react_1.useCallback)(function () {
        if (!selectedProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a scala rețeta.' });
            return;
        }
        setFeedback(null);
        setScalingModalOpen(true);
    }, [selectedProduct]);
    // ✅ TASK 1: Handler pentru finished product modal
    var handleOpenFinishedProduct = (0, react_1.useCallback)(function () {
        if (!selectedProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a configura stocul produsului finit.' });
            return;
        }
        setFeedback(null);
        setFinishedProductModalOpen(true);
    }, [selectedProduct]);
    // Removed: handleOpenMessages - mesageria internă este acum un modul separat în navigation menu
    var handleExport = (0, react_1.useCallback)(function () {
        var _a;
        var params = new URLSearchParams({ format: 'csv' });
        var baseUrl = ((_a = httpClient_1.httpClient.defaults.baseURL) !== null && _a !== void 0 ? _a : '').replace(/\/$/, '');
        var exportUrl = "".concat(baseUrl, "/api/catalog/products/export?").concat(params.toString());
        window.open(exportUrl, '_blank', 'noopener');
        setFeedback({
            type: 'success',
            message: 'Export CSV inițiat. Verifică folderul de descărcări.',
        });
    }, []);
    var totalProducts = stats.total;
    var withRecipe = stats.withRecipe;
    var withoutRecipe = stats.withoutRecipe;
    var feedbackTitle = feedback
        ? feedback.type === 'success'
            ? 'Succes'
            : feedback.type === 'error'
                ? 'Eroare'
                : feedback.type === 'info'
                    ? 'Informație'
                    : 'Atenție'
        : undefined;
    return (<div className="recipes-page" data-page-ready={totalProducts > 0 ? 'true' : 'false'}>
      <header className="recipes-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h1>Rețete & Fișe Tehnice</h1>
            <p>Gestionează ingredientele, ambalajele și calculele</p>
          </div>
          <HelpButton_1.HelpButton title='ajutor retete & fise tehnice' content={<div>
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
              </div>}/>
        </div>
        <div className="recipes-header-actions">
          <button type="button" className="recipes-button recipes-button--primary" onClick={function () { return setCreateWizardOpen(true); }}>
            ➕ Produs Nou + Rețetă
          </button>
          <button type="button" className="recipes-button recipes-button--ghost" onClick={function () { return refetch(); }} disabled={loading}>
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
        <StatCard_1.StatCard title="Produse totale" helper="gestionați în meniul activ" value={String(totalProducts)} icon={<span>📋</span>} trendLabel="Cu rețetă" trendValue={"".concat(withRecipe)} trendDirection="up"/>
        <StatCard_1.StatCard title="Rețete definite" helper="produse cu rețetă completă" value={"".concat(withRecipe)} icon={<span>🥣</span>} trendLabel="Fără rețetă" trendValue={"".concat(withoutRecipe)} trendDirection={withoutRecipe > 0 ? 'down' : 'up'}/>
        <StatCard_1.StatCard title="Acoperire rețete" helper="mai multe rețete = costuri controlate" value={totalProducts > 0 ? "".concat(Math.round((withRecipe / totalProducts) * 100), "%") : '0%'} icon={<span>📊</span>} trendLabel="Total produse" trendValue={"".concat(totalProducts)} trendDirection="up"/>
      </section>

      <section className="recipes-toolbar">
        <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder="cauta dupa nume produs" aria-label="filtru rapid retete"/>
        <div className="recipes-toolbar-filter">
          <label htmlFor="recipes-category">Categorie</label>
          <select id="recipes-category" value={categoryFilter} onChange={function (event) { return setCategoryFilter(event.target.value); }}>
            <option value="">Toate categoriile</option>
            {categories.map(function (category) { return (<option key={category} value={category}>
                {category}
              </option>); })}
          </select>
        </div>
      </section>

      {feedback ? <InlineAlert_1.InlineAlert variant={feedback.type} title={feedbackTitle} message={feedback.message}/> : null}
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}
      <div className="recipes-selection">
        {selectedProduct
            ? "Produs selectat: ".concat(selectedProduct.product_name)
            : 'Selectează un produs din tabel pentru acțiuni rapide (clonare, export alertă, istoric preț).'}
      </div>

      <section className="recipes-grid">
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredProducts} loading={loading} quickFilterText={quickFilter} height="65vh" rowSelection="single" onSelectedRowsChange={handleSelectionChange} onGridReady={function (event) {
            console.log('RecipesPage Grid ready, total rows:', event.api.getDisplayedRowCount());
            // Enable row selection
            event.api.setGridOption('rowSelection', 'single');
            // Add click handler for double-click to open editor
            event.api.addEventListener('rowDoubleClicked', function (e) {
                console.log('RecipesPage Row double-clicked:', e.data);
                if (e.data) {
                    setSelectedProduct(e.data);
                    setEditorOpen(true);
                }
            });
        }}/>
      </section>

      <RecipeEditorModal_1.RecipeEditorModal open={editorOpen} product={selectedProduct} onClose={handleEditorClose} onSaved={handleEditorSaved}/>

      {/* ✅ SĂPTĂMÂNA 1 - ZIUA 3: Scaling Modal */}
      <RecipeScalingModal_1.RecipeScalingModal open={scalingModalOpen} product={selectedProduct ? {
            id: selectedProduct.product_id,
            name: selectedProduct.product_name,
            servings: selectedProduct.servings || 1
        } : null} onClose={function () { return setScalingModalOpen(false); }}/>

      <CloneProductModal_1.CloneProductModal open={cloneModalOpen} product={selectedMenuProduct} onClose={function () { return setCloneModalOpen(false); }} onCloned={function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var newName = _b.newName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setCloneModalOpen(false);
                        setFeedback({ type: 'success', message: "Produsul \u201C".concat(newName, "\u201D a fost clonat cu succes.") });
                        setSelectedProduct(null);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <PriceHistoryModal_1.PriceHistoryModal open={priceHistoryModalOpen} product={selectedMenuProduct} onClose={function () { return setPriceHistoryModalOpen(false); }}/>

      {/* ✅ TASK 1: Finished Product Modal */}
      <FinishedProductModal_1.FinishedProductModal open={finishedProductModalOpen} productId={(_a = selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.product_id) !== null && _a !== void 0 ? _a : null} onClose={function () { return setFinishedProductModalOpen(false); }} onSaved={function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setFeedback({ type: 'success', message: 'Stocul produsului finit a fost configurat cu succes.' });
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      {/* ✅ TASK 2: Create Product Wizard */}
      <CreateProductWizard_1.CreateProductWizard open={createWizardOpen} onClose={function () { return setCreateWizardOpen(false); }} onComplete={function (productId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setFeedback({ type: 'success', message: "Produsul a fost creat complet cu ID: ".concat(productId) });
                        setCreateWizardOpen(false);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      {/* Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu */}
    </div>);
}
