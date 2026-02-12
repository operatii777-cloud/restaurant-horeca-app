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
exports.MenuManagementPage = MenuManagementPage;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var StatCard_1 = require("@/shared/components/StatCard");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var TableFilter_1 = require("@/shared/components/TableFilter");
var CategoryAdvancedFilter_1 = require("@/modules/menu/components/CategoryAdvancedFilter");
var useMenuProducts_1 = require("@/modules/menu/hooks/useMenuProducts");
var useMenuCategories_1 = require("@/modules/menu/hooks/useMenuCategories");
var MenuProductModal_1 = require("@/modules/menu/components/MenuProductModal");
var BulkPriceModal_1 = require("@/modules/menu/components/BulkPriceModal");
var ProductDependenciesModal_1 = require("@/modules/menu/components/ProductDependenciesModal");
var CloneProductModal_1 = require("@/modules/menu/components/CloneProductModal");
var PriceHistoryModal_1 = require("@/modules/menu/components/PriceHistoryModal");
// Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var httpClient_1 = require("@/shared/api/httpClient");
require("./MenuManagementPage.css");
function MenuManagementPage() {
    var _this = this;
    var _a;
    // const { t } = useTranslation();
    var _b = (0, react_1.useState)(''), quickFilter = _b[0], setQuickFilter = _b[1];
    var _c = (0, react_1.useState)(''), categoryFilter = _c[0], setCategoryFilter = _c[1];
    var _d = (0, react_1.useState)('name'), sortBy = _d[0], setSortBy = _d[1];
    var _e = (0, react_1.useState)('asc'), sortOrder = _e[0], setSortOrder = _e[1];
    var _f = (0, react_1.useState)([]), selectedProducts = _f[0], setSelectedProducts = _f[1];
    var _g = (0, react_1.useState)(false), modalOpen = _g[0], setModalOpen = _g[1];
    var _h = (0, react_1.useState)('create'), modalMode = _h[0], setModalMode = _h[1];
    var _j = (0, react_1.useState)(null), feedback = _j[0], setFeedback = _j[1];
    var _k = (0, react_1.useState)(false), bulkModalOpen = _k[0], setBulkModalOpen = _k[1];
    var _l = (0, react_1.useState)(false), dependenciesModalOpen = _l[0], setDependenciesModalOpen = _l[1];
    var _m = (0, react_1.useState)(false), cloneModalOpen = _m[0], setCloneModalOpen = _m[1];
    var _o = (0, react_1.useState)(false), priceHistoryModalOpen = _o[0], setPriceHistoryModalOpen = _o[1];
    // Removed: messagesModalOpen - mesageria internă este acum un modul separat
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _p = (0, useMenuProducts_1.useMenuProducts)(categoryFilter || undefined), products = _p.products, analytics = _p.analytics, loading = _p.loading, error = _p.error, refetch = _p.refetch;
    var _q = (0, useMenuCategories_1.useMenuCategories)(), categories = _q.categories, categoriesError = _q.error, refetchCategories = _q.refetch;
    var _r = (0, useApiMutation_1.useApiMutation)(), deleteProduct = _r.mutate, deleting = _r.loading, deleteError = _r.error, resetDeleteError = _r.reset;
    var columnDefs = (0, react_1.useMemo)(function () {
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
                cellRenderer: function (params) {
                    var _a, _b;
                    var name = (_a = params.value) !== null && _a !== void 0 ? _a : '';
                    var nameEn = (_b = params.data) === null || _b === void 0 ? void 0 : _b.name_en;
                    if (!nameEn) {
                        return name;
                    }
                    return "".concat(name, " / ").concat(nameEn);
                },
            },
            {
                field: 'price',
                headerName: 'Preț (RON)',
                width: 140,
                sortable: true,
                filter: true,
                valueFormatter: function (params) {
                    var _a;
                    var price = Number((_a = params.value) !== null && _a !== void 0 ? _a : 0);
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
                valueFormatter: function (params) {
                    var value = params.value;
                    var interpreted = value === 1 || value === true || value === '1';
                    return interpreted ? 'Activ' : 'Inactiv';
                },
                cellClass: function (params) {
                    var value = params.value;
                    var interpreted = value === 1 || value === true || value === '1';
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
    var handleCategoryFilterChange = function (event) {
        setCategoryFilter(event.target.value);
    };
    (0, react_1.useEffect)(function () {
        setSelectedProducts([]);
    }, [categoryFilter]);
    var handleSelectionChange = (0, react_1.useCallback)(function (selected) {
        setSelectedProducts(selected);
    }, []);
    var primarySelectedProduct = (_a = selectedProducts[0]) !== null && _a !== void 0 ? _a : null;
    var selectedProductCount = selectedProducts.length;
    var selectedProductIds = (0, react_1.useMemo)(function () { return selectedProducts.map(function (product) { return product.id; }); }, [selectedProducts]);
    var handleOpenCreate = function () {
        setModalMode('create');
        setSelectedProducts([]);
        setFeedback(null);
        setModalOpen(true);
    };
    var handleOpenEdit = function () {
        if (!primarySelectedProduct || selectedProductCount !== 1) {
            setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-l edita.' });
            return;
        }
        setModalMode('edit');
        setFeedback(null);
        setModalOpen(true);
    };
    var handleOpenRecipeEditor = function () {
        if (!primarySelectedProduct || selectedProductCount !== 1) {
            setFeedback({ type: 'error', message: 'Selectează un singur produs înainte de a deschide editorul de rețete.' });
            return;
        }
        navigate("/recipes?productId=".concat(primarySelectedProduct.id), {
            state: {
                from: '/menu',
                productId: primarySelectedProduct.id,
                productName: primarySelectedProduct.name,
            },
        });
    };
    var handleOpenBulkModal = function () {
        if (!selectedProductIds.length) {
            setFeedback({ type: 'error', message: 'Selectează cel puțin un produs pentru schimbare de preț.' });
            return;
        }
        setBulkModalOpen(true);
    };
    var handleOpenDependencies = function () {
        if (!primarySelectedProduct || selectedProductCount !== 1) {
            setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-i analiza dependențele.' });
            return;
        }
        setDependenciesModalOpen(true);
    };
    var handleOpenClone = function () {
        if (!primarySelectedProduct || selectedProductCount !== 1) {
            setFeedback({ type: 'error', message: 'Selectează un singur produs pentru clonare.' });
            return;
        }
        setFeedback(null);
        setCloneModalOpen(true);
    };
    var handleOpenPriceHistory = function () {
        if (!primarySelectedProduct || selectedProductCount !== 1) {
            setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-i vizualiza istoricul de preț.' });
            return;
        }
        setFeedback(null);
        setPriceHistoryModalOpen(true);
    };
    // Removed: handleOpenMessages - mesageria internă este acum un modul separat în navigation menu
    var handleExport = function () {
        var _a;
        var params = new URLSearchParams({ format: 'csv' });
        if (categoryFilter) {
            params.set('category', categoryFilter);
        }
        var baseUrl = ((_a = httpClient_1.httpClient.defaults.baseURL) !== null && _a !== void 0 ? _a : '').replace(/\/$/, '');
        var exportUrl = "".concat(baseUrl, "/api/catalog/products/export?").concat(params.toString());
        window.open(exportUrl, '_blank', 'noopener');
        setFeedback({ type: 'success', message: 'Export inițiat. Fișierul CSV va fi descărcat în curând.' });
    };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var confirmed, response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!primarySelectedProduct || selectedProductCount !== 1) {
                        setFeedback({ type: 'error', message: 'Selectează un singur produs pentru a-l șterge.' });
                        return [2 /*return*/];
                    }
                    confirmed = window.confirm("\u0218tergi produsul \"".concat(primarySelectedProduct.name, "\"?"));
                    if (!confirmed) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, deleteProduct({
                            url: "/api/admin/products/".concat(primarySelectedProduct.id),
                            method: "Delete",
                        })];
                case 1:
                    response = _b.sent();
                    if (!(response !== null)) return [3 /*break*/, 4];
                    resetDeleteError();
                    setFeedback({ type: 'success', message: (_a = response === null || response === void 0 ? void 0 : response.message) !== null && _a !== void 0 ? _a : 'Produs șters cu succes.' });
                    setSelectedProducts([]);
                    return [4 /*yield*/, refetch()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, refetchCategories()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleModalClose = function () {
        setModalOpen(false);
    };
    var handleModalSaved = function (message) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setModalOpen(false);
                    setFeedback({ type: 'success', message: message });
                    setSelectedProducts([]);
                    return [4 /*yield*/, refetch()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refetchCategories()];
                case 2:
                    _a.sent();
                    resetDeleteError();
                    return [2 /*return*/];
            }
        });
    }); };
    var hasToolbarErrors = Boolean(error || categoriesError || deleteError || (feedback === null || feedback === void 0 ? void 0 : feedback.type) === 'error');
    var pageReady = !loading && products.length > 0;
    return (<div className="menu-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
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
          <StatCard_1.StatCard title="Produse listate" helper="Număr total în meniul curent" value={"".concat(analytics.totalProducts)} trendLabel="Doar la pachet" trendValue={"".concat(analytics.takeoutOnlyCount)} trendDirection={analytics.takeoutOnlyCount > 0 ? 'up' : 'flat'} icon={<span>🍽️</span>}/>
          <StatCard_1.StatCard title="Preț mediu" helper="Pe produs listat" value={"".concat(analytics.averagePrice.toFixed(2), " RON")} trendLabel="Opțiuni vegetariene" trendValue={"".concat(analytics.vegetarianCount)} trendDirection={analytics.vegetarianCount > 0 ? 'up' : 'flat'} icon={<span>💶</span>}/>
          <StatCard_1.StatCard title="Produse picante" helper="Marcaj intern pentru alergeni" value={"".concat(analytics.spicyCount)} trendLabel="Top categorie" trendValue={analytics.topCategories[0] ? "".concat(analytics.topCategories[0].raw, " items") : 'N/A'} trendDirection={analytics.topCategories.length > 0 ? 'up' : 'flat'} icon={<span>🌶️</span>}/>
        </div>

        <div className="menu-management-analytics">
          <article className="menu-analytics-card">
            <header>
              <span>Top prețuri din meniu</span>
              <span className="menu-analytics-helper">RON / produs</span>
            </header>
            <MiniBarChart_1.MiniBarChart data={analytics.topPricedProducts.length
            ? analytics.topPricedProducts
            : [
                { label: 'Fără date', value: 0 },
                { label: 'Adaugă produse', value: 0 },
            ]}/>
          </article>

          <article className="menu-analytics-card">
            <header>
              <span>${'[distributie_pe_categorii]'}</span>
              <span className="menu-analytics-helper">% din total</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={analytics.topCategories.length
            ? analytics.topCategories.map(function (entry) { return ({ name: entry.name, value: entry.value, color: entry.color }); })
            : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]}/>
            <ul className="menu-analytics-legend">
              {analytics.topCategories.length === 0 ? (<li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true"/>
                  <div>
                    <strong>${'[fara_date_disponibile]'}</strong>
                    <small>${'[adauga_produse_pentru_a_vedea_distributia]'}</small>
                  </div>
                  <strong>100%</strong>
                </li>) : (analytics.topCategories.map(function (entry) { return (<li key={entry.name}>
                    <span style={{ backgroundColor: entry.color }} aria-hidden="true"/>
                    <div>
                      <strong>{entry.name}</strong>
                      <small>{entry.raw} produse</small>
                    </div>
                    <strong>{entry.value}%</strong>
                  </li>); }))}
            </ul>
          </article>
        </div>
      </section>

      <CategoryAdvancedFilter_1.CategoryAdvancedFilter categories={categories} selectedCategory={categoryFilter} sortBy={sortBy} sortOrder={sortOrder} onCategoryChange={function (cat) {
            setCategoryFilter(cat);
        }} onSortChange={function (by, order) {
            setSortBy(by);
            setSortOrder(order);
        }} onClear={function () {
            setCategoryFilter('');
            setSortBy('name');
            setSortOrder('asc');
        }}/>

      <div className="menu-management-toolbar">
        <div className="menu-management-filters">
          <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder={'[cauta_produs_dupa_nume_categorie_sau_alergeni]'} aria-label="Filtru rapid produse meniu"/>
          <div className="menu-management-filter-select">
            <label htmlFor="menu-category-filter">Categorie</label>
            <select id="menu-category-filter" value={categoryFilter} onChange={handleCategoryFilterChange}>
              <option value="">${'[toate_categoriile]'}</option>
              {categories.map(function (category) { return (<option key={category} value={category}>
                  {category}
                </option>); })}
            </select>
          </div>
        </div>

        <div className="menu-management-selection">
          {selectedProductCount === 0
            ? 'Selectează produse din tabel pentru acțiuni în masă.'
            : "".concat(selectedProductCount, " produs(e) selectate.")}
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
          <button type="button" className="menu-management-button" onClick={handleOpenDependencies} disabled={!primarySelectedProduct}>
            🔗 Dependențe
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenClone} disabled={!primarySelectedProduct}>
            🧬 Clonează
          </button>
          <button type="button" className="menu-management-button" onClick={handleOpenPriceHistory} disabled={!primarySelectedProduct}>
            📈 Istoric preț
          </button>
          {/* Removed: Buton "Mesaj intern" - mutat în navigation menu bar ca serviciu independent */}
          <button type="button" className="menu-management-button" onClick={handleOpenBulkModal} disabled={selectedProductCount === 0}>
            💱 Schimbare preț
          </button>
          <button type="button" className="menu-management-button" onClick={handleExport}>
            📤 Export CSV
          </button>
          <button type="button" className="menu-management-button menu-management-button--danger" onClick={handleDelete} disabled={!primarySelectedProduct || deleting}>
            🗑️ Șterge
          </button>
        </div>
      </div>

      <div className="menu-management-feedback">
        {feedback ? <InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Atenție'} message={feedback.message}/> : null}
        {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare produse" message={error}/> : null}
        {categoriesError ? <InlineAlert_1.InlineAlert variant="error" title="Eroare categorii" message={categoriesError}/> : null}
        {deleteError ? <InlineAlert_1.InlineAlert variant="error" title={'[eroare_stergere]'} message={deleteError}/> : null}
        {!hasToolbarErrors ? null : <div className="menu-management-spacer"/>}
      </div>

      <section className="menu-management-grid">
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={products} loading={loading} quickFilterText={quickFilter} height="70vh" rowSelection="multiple" onSelectedRowsChange={handleSelectionChange}/>
      </section>

      <MenuProductModal_1.MenuProductModal open={modalOpen} mode={modalMode} onClose={handleModalClose} onSaved={handleModalSaved} categories={categories} product={modalMode === 'edit' ? primarySelectedProduct !== null && primarySelectedProduct !== void 0 ? primarySelectedProduct : undefined : undefined}/>

      <BulkPriceModal_1.BulkPriceModal open={bulkModalOpen} productCount={selectedProductCount} productIds={selectedProductIds} onClose={function () { return setBulkModalOpen(false); }} onApplied={function (updatedCount, newPrice, newVatRate) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setBulkModalOpen(false);
                        setSelectedProducts([]);
                        setFeedback({
                            type: 'success',
                            message: "Au fost actualizate ".concat(updatedCount, " produse").concat(newPrice !== undefined ? " la ".concat(newPrice, " RON") : '').concat(newVatRate !== undefined ? " \u0219i TVA ".concat(newVatRate, "%") : '', "."),
                        });
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refetchCategories()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <ProductDependenciesModal_1.ProductDependenciesModal open={dependenciesModalOpen} product={primarySelectedProduct} onClose={function () { return setDependenciesModalOpen(false); }}/>

      <CloneProductModal_1.CloneProductModal open={cloneModalOpen} product={primarySelectedProduct} onClose={function () { return setCloneModalOpen(false); }} onCloned={function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var newName = _b.newName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setCloneModalOpen(false);
                        setFeedback({ type: 'success', message: "Produs clonat cu succes: \u201C".concat(newName, "\u201D.") });
                        setSelectedProducts([]);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, refetchCategories()];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <PriceHistoryModal_1.PriceHistoryModal open={priceHistoryModalOpen} product={primarySelectedProduct} onClose={function () { return setPriceHistoryModalOpen(false); }}/>

      {/* Removed: ProductMessagesModal - mesageria internă este acum un modul separat în navigation menu */}
    </div>);
}
