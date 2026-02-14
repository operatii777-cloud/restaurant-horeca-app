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
exports.StockFinishedProductsTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
var RecipeEditorModal_1 = require("@/modules/recipes/components/RecipeEditorModal");
var FinishedProductModal_1 = require("@/modules/stocks/components/FinishedProductModal");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./StockFinishedProductsTab.css");
var isTrue = function (value) { return value === true || value === 1 || value === '1'; };
var StockFinishedProductsTab = function (_a) {
    var onSummary = _a.onSummary, onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _b = (0, useApiQuery_1.useApiQuery)('/api/stocks/finished-products'), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var products = (0, react_1.useMemo)(function () {
        if (Array.isArray(data))
            return data;
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            return data.data;
        if (data && typeof data === 'object' && 'products' in data && Array.isArray(data.products))
            return data.products;
        return [];
    }, [data]);
    var decoratedProducts = (0, react_1.useMemo)(function () {
        return products.map(function (product) {
            var _a, _b;
            var current = Number((_a = product.current_stock) !== null && _a !== void 0 ? _a : 0);
            var minimum = Number((_b = product.min_stock) !== null && _b !== void 0 ? _b : 0);
            var stockStatus = product.stock_status;
            if (!stockStatus) {
                if (current <= 0) {
                    stockStatus = 'out';
                }
                else if (minimum > 0 && current <= minimum * 0.2) {
                    stockStatus = 'critical';
                }
                else if (minimum > 0 && current <= minimum) {
                    stockStatus = 'low';
                }
                else {
                    stockStatus = 'ok';
                }
            }
            return __assign(__assign({}, product), { stock_status: stockStatus });
        });
    }, [products]);
    var _c = (0, react_1.useState)(''), quickFilter = _c[0], setQuickFilter = _c[1];
    var _d = (0, react_1.useState)(false), editorOpen = _d[0], setEditorOpen = _d[1];
    var _e = (0, react_1.useState)(null), editingProductId = _e[0], setEditingProductId = _e[1];
    var _f = (0, react_1.useState)(null), recipeModalProduct = _f[0], setRecipeModalProduct = _f[1];
    (0, react_1.useEffect)(function () {
        // Only update summary when we have actual data (not during loading/error states)
        if (!loading && !error) {
            var autoManaged = decoratedProducts.filter(function (item) { return isTrue(item.is_auto_managed); }).length;
            onSummary({
                finishedProductsWithStock: decoratedProducts.length,
                autoManagedProducts: autoManaged,
            });
        }
    }, [decoratedProducts, onSummary, loading, error]);
    var columnDefs = (0, react_1.useMemo)(function () { return [
        {
            headerName: 'Produs',
            field: 'product_name',
            minWidth: 220,
            valueGetter: function (_a) {
                var data = _a.data;
                return (data === null || data === void 0 ? void 0 : data.product_name) || (data === null || data === void 0 ? void 0 : data.name) || 'Produs necunoscut';
            },
        },
        {
            headerName: 'Categorie',
            field: 'category',
            minWidth: 160,
        },
        {
            headerName: 'Preț (RON)',
            field: 'price',
            width: 140,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value === null || value === undefined ? '-' : Number(value).toFixed(2));
            },
        },
        {
            headerName: 'Stoc curent',
            field: 'current_stock',
            width: 140,
        },
        {
            headerName: 'Stoc minim',
            field: 'min_stock',
            width: 130,
        },
        {
            headerName: 'Stoc maxim',
            field: 'max_stock',
            width: 130,
        },
        {
            headerName: 'Auto',
            field: 'is_auto_managed',
            width: 110,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (isTrue(value) ? 'Da' : 'Nu');
            },
        },
        {
            headerName: 'Status',
            field: 'stock_status',
            width: 130,
            valueFormatter: function (_a) {
                var value = _a.value;
                return value === 'out' ? 'Epuizat' : value === 'critical' ? 'Critic' : value === 'low' ? 'Scăzut' : 'OK';
            },
        },
        {
            headerName: 'Acțiuni',
            colId: 'actions',
            width: 220,
            pinned: 'right',
            cellRenderer: function () { return (<div className="stock-finished__row-actions">
            <button data-action="edit">📝 Editare</button>
            <button data-action="recipe">📋 Rețetă</button>
            <button data-action="delete">🗑️ Șterge</button>
          </div>); },
        },
    ]; }, []);
    var refreshData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, refetch()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var handleAdd = (0, react_1.useCallback)(function () {
        setEditingProductId(null);
        setEditorOpen(true);
    }, []);
    var handleCellClicked = (0, react_1.useCallback)(function (event) {
        var _a, _b, _c, _d, _e;
        if (!event.data || event.colDef.colId !== 'actions')
            return;
        var domEvent = event.event;
        if (!domEvent)
            return;
        var target = (_a = domEvent.target) === null || _a === void 0 ? void 0 : _a.closest('button[data-action]');
        var action = target === null || target === void 0 ? void 0 : target.getAttribute('data-action');
        if (!action)
            return;
        if (action === 'edit') {
            setEditingProductId(event.data.product_id);
            setEditorOpen(true);
        }
        else if (action === 'recipe') {
            setRecipeModalProduct({
                product_id: event.data.product_id,
                product_name: (_c = (_b = event.data.product_name) !== null && _b !== void 0 ? _b : event.data.name) !== null && _c !== void 0 ? _c : 'Produs fără nume',
                product_category: (_d = event.data.category) !== null && _d !== void 0 ? _d : 'Nespecificat',
                recipe_count: Number((_e = event.data.recipe_count) !== null && _e !== void 0 ? _e : 0),
            });
        }
        else if (action === "delete") {
            if (confirm('Sigur dorești să ștergi stocul configurat pentru acest produs finit?')) {
                httpClient_1.httpClient
                    .delete("/api/stock/finished-products/".concat(event.data.product_id))
                    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                onFeedback('Stocul produsului finit a fost eliminat.', 'success');
                                return [4 /*yield*/, refreshData()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (error) {
                    console.error('❌ Eroare la ștergerea produsului finit:', error);
                    var message = error instanceof Error ? error.message : 'Nu s-a putut șterge stocul produsului.';
                    onFeedback(message, 'error');
                });
            }
        }
    }, [onFeedback, refreshData]);
    return (<div className="stock-finished">
      <div className="stock-finished__toolbar">
        <div className="stock-finished__toolbar-left">
          <input type="search" className="stock-finished__search" placeholder="cauta produs dupa nume sau categorie" value={quickFilter} onChange={function (event) { return setQuickFilter(event.target.value); }}/>
        </div>
        <div className="stock-finished__toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={refreshData}>
            🔄 Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAdd}>
            ➕ Adaugă produs finit
          </button>
        </div>
      </div>

      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={decoratedProducts} loading={loading} quickFilterText={quickFilter} height="60vh" agGridProps={{
            onCellClicked: handleCellClicked,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.product_id) ? params.data.product_id.toString() : ''); },
        }}/>

      <FinishedProductModal_1.FinishedProductModal open={editorOpen} productId={editingProductId} onClose={function () { return setEditorOpen(false); }} onSaved={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setEditorOpen(false);
                        return [4 /*yield*/, refreshData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <RecipeEditorModal_1.RecipeEditorModal open={recipeModalProduct !== null} product={recipeModalProduct} onClose={function () { return setRecipeModalProduct(null); }} onSaved={function (message) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onFeedback(message, 'success');
                        setRecipeModalProduct(null);
                        return [4 /*yield*/, refreshData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>
    </div>);
};
exports.StockFinishedProductsTab = StockFinishedProductsTab;
