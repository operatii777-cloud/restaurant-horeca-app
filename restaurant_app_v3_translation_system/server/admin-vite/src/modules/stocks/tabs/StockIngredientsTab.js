"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * StockIngredientsTab - Catalog Ingrediente
 * STANDARD: Folosește ExcelPageLayout STANDARD (boogiT-like)
 * Compact: padding 16, gap 12, contrast garantat prin CSS vars
 */
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
exports.StockIngredientsTab = void 0;
var react_1 = require("react");
var TableFilter_1 = require("@/shared/components/TableFilter");
var GridActionsMenu_1 = require("@/shared/components/grid/GridActionsMenu");
var LoadingState_1 = require("@/shared/components/states/LoadingState");
var EmptyState_1 = require("@/shared/components/states/EmptyState");
var ErrorState_1 = require("@/shared/components/states/ErrorState");
var DataGrid_1 = require("@/shared/components/DataGrid");
var ExcelPageLayout_1 = require("@/shared/components/page/ExcelPageLayout");
var IngredientEditorModal_1 = require("@/modules/ingredients/components/IngredientEditorModal");
var IngredientBulkUpdateModal_1 = require("@/modules/ingredients/components/IngredientBulkUpdateModal");
var IngredientDetailsDrawer_1 = require("@/modules/ingredients/components/IngredientDetailsDrawer");
var StockAdjustModal_1 = require("@/modules/stocks/components/StockAdjustModal");
var LowStockDrawer_1 = require("@/modules/stocks/components/LowStockDrawer");
var ExpiringStockDrawer_1 = require("@/modules/stocks/components/ExpiringStockDrawer");
var RiskAlertsDrawer_1 = require("@/modules/stocks/components/RiskAlertsDrawer");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var isTrue = function (value) { return value === true || value === 1 || value === '1'; };
var formatNumber = function (value) {
    return value === null || value === undefined ? '-' : Number(value).toLocaleString('ro-RO', { maximumFractionDigits: 2 });
};
var StockCurrentCell = function (_a) {
    var _b;
    var params = _a.params, onAdjust = _a.onAdjust;
    if (!params.data)
        return <span>-</span>;
    var stockValue = formatNumber(Number((_b = params.data.current_stock) !== null && _b !== void 0 ? _b : 0));
    var unit = params.data.unit || '';
    return (<div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
      <span style={{ flex: 1 }}>{stockValue} {unit}</span>
      <button type="button" onClick={function (e) {
            e.stopPropagation();
            if (params.data) {
                onAdjust(params.data);
            }
        }} title="ajusteaza stoc" style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
            flexShrink: 0,
        }}>
        📝
      </button>
    </div>);
};
var StockIngredientsTab = function (_a) {
    var onSummary = _a.onSummary, onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _b = (0, useApiQuery_1.useApiQuery)('/api/ingredients'), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var ingredients = (0, react_1.useMemo)(function () {
        // useApiQuery extrage deja data din { success: true, data: [...] }
        // Dar verificăm dacă data este array sau obiect
        var result = [];
        if (Array.isArray(data)) {
            result = data;
        }
        else if (data && typeof data === 'object' && "Dată:" in data && Array.isArray(data.data)) {
            // Fallback: dacă data este { data: [...] }
            result = data.data;
        }
        else if (data && typeof data === 'object' && 'ingredients' in data && Array.isArray(data.ingredients)) {
            // Fallback: dacă data este { ingredients: [...] }
            result = data.ingredients;
        }
        console.log('StockIngredientsTab Ingredients data:', {
            rawData: data,
            isArray: Array.isArray(data),
            resultLength: result.length,
            firstItem: result[0]
        });
        return result;
    }, [data]);
    var decoratedIngredients = (0, react_1.useMemo)(function () {
        return ingredients.map(function (ingredient) {
            var _a, _b;
            var current = Number((_a = ingredient.current_stock) !== null && _a !== void 0 ? _a : 0);
            var minimum = Number((_b = ingredient.min_stock) !== null && _b !== void 0 ? _b : 0);
            var stockStatus = ingredient.stock_status;
            if (!stockStatus) {
                if (minimum <= 0 && current > 0) {
                    stockStatus = 'ok';
                }
                else if (current <= 0) {
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
            return __assign(__assign({}, ingredient), { stock_status: stockStatus });
        });
    }, [ingredients]);
    var _c = (0, react_1.useState)(''), quickFilter = _c[0], setQuickFilter = _c[1];
    var _d = (0, react_1.useState)([]), selectedIngredients = _d[0], setSelectedIngredients = _d[1];
    var _e = (0, react_1.useState)(false), editorOpen = _e[0], setEditorOpen = _e[1];
    var _f = (0, react_1.useState)(null), editingIngredient = _f[0], setEditingIngredient = _f[1];
    var _g = (0, react_1.useState)(false), bulkOpen = _g[0], setBulkOpen = _g[1];
    var _h = (0, react_1.useState)(false), detailsOpen = _h[0], setDetailsOpen = _h[1];
    var _j = (0, react_1.useState)(null), detailsIngredient = _j[0], setDetailsIngredient = _j[1];
    var _k = (0, react_1.useState)(false), adjustOpen = _k[0], setAdjustOpen = _k[1];
    var _l = (0, react_1.useState)(null), adjustIngredient = _l[0], setAdjustIngredient = _l[1];
    var _m = (0, react_1.useState)(false), lowStockDrawerOpen = _m[0], setLowStockDrawerOpen = _m[1];
    var _o = (0, react_1.useState)([]), lowStockAlerts = _o[0], setLowStockAlerts = _o[1];
    var _p = (0, react_1.useState)(false), expiringDrawerOpen = _p[0], setExpiringDrawerOpen = _p[1];
    var _q = (0, react_1.useState)([]), expiringAlerts = _q[0], setExpiringAlerts = _q[1];
    var _r = (0, react_1.useState)(false), riskAlertsDrawerOpen = _r[0], setRiskAlertsDrawerOpen = _r[1];
    (0, react_1.useEffect)(function () {
        var total = decoratedIngredients.length;
        var hidden = decoratedIngredients.filter(function (item) { return isTrue(item.is_hidden); }).length;
        var lowStock = decoratedIngredients.filter(function (item) {
            var _a, _b;
            var current = Number((_a = item.current_stock) !== null && _a !== void 0 ? _a : 0);
            var minimum = Number((_b = item.min_stock) !== null && _b !== void 0 ? _b : 0);
            return minimum > 0 && current <= minimum;
        }).length;
        onSummary({
            totalIngredients: total,
            hiddenIngredients: hidden,
            activeIngredients: total - hidden,
            lowStockIngredients: lowStock,
        });
    }, [decoratedIngredients, onSummary]);
    var columnDefs = (0, react_1.useMemo)(function () { return [
        {
            headerName: 'Ingredient',
            field: 'name',
            minWidth: 220,
        },
        {
            headerName: 'Categorie',
            field: 'category',
            minWidth: 160,
        },
        {
            headerName: 'Unitate',
            field: 'unit',
            width: 110,
        },
        {
            headerName: 'Stoc curent',
            field: 'current_stock',
            width: 200,
            cellRenderer: function (params) {
                return react_1.default.createElement(StockCurrentCell, {
                    params: params,
                    onAdjust: function (ingredient) {
                        setAdjustIngredient(ingredient);
                        setAdjustOpen(true);
                    },
                });
            },
        },
        {
            headerName: 'Stoc minim',
            field: 'min_stock',
            width: 140,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(Number(value));
            },
        },
        {
            headerName: 'Cost/unitate',
            field: 'cost_per_unit',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value === null || value === undefined ? '-' : "".concat(Number(value).toFixed(2), " RON"));
            },
        },
        {
            headerName: 'Furnizor',
            field: 'supplier',
            minWidth: 160,
        },
        {
            headerName: 'Energie (kcal)',
            field: 'energy_kcal',
            width: 140,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(value !== null && value !== void 0 ? value : null);
            },
        },
        {
            headerName: 'Proteine (g)',
            field: 'protein',
            width: 130,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(value !== null && value !== void 0 ? value : null);
            },
        },
        {
            headerName: 'Carbohidrați (g)',
            field: 'carbs',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(value !== null && value !== void 0 ? value : null);
            },
        },
        {
            headerName: 'Grăsimi (g)',
            field: 'fat',
            width: 130,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(value !== null && value !== void 0 ? value : null);
            },
        },
        {
            headerName: 'Status stoc',
            field: 'stock_status',
            width: 140,
            valueGetter: function (_a) {
                var _b;
                var data = _a.data;
                return (_b = data === null || data === void 0 ? void 0 : data.stock_status) !== null && _b !== void 0 ? _b : '-';
            },
            cellRenderer: function (_a) {
                var value = _a.value;
                if (!value)
                    return '-';
                var label = value === 'out' ? 'Epuizat' : value === 'low' ? 'Scăzut' : value === 'critical' ? 'Critic' : 'OK';
                return (<span className={"stock-ingredients__badge stock-ingredients__badge--".concat(value)}>
              {label}
            </span>);
            },
        },
        {
            headerName: '',
            colId: 'actions',
            width: 70,
            maxWidth: 70,
            pinned: 'right',
            sortable: false,
            filter: false,
            cellRenderer: function (params) {
                if (!params.data)
                    return '';
                var actions = [
                    {
                        label: 'Vizualizează',
                        icon: '👁️',
                        onClick: function () {
                            setDetailsIngredient(params.data);
                            setDetailsOpen(true);
                        },
                    },
                    {
                        label: 'Editează',
                        icon: '📝',
                        onClick: function () {
                            setEditingIngredient(params.data);
                            setEditorOpen(true);
                        },
                    },
                    {
                        label: 'Ajustează stoc',
                        icon: '⚖️',
                        onClick: function () {
                            setAdjustIngredient(params.data);
                            setAdjustOpen(true);
                        },
                    },
                    {
                        label: 'Șterge',
                        icon: '🗑️',
                        variant: 'danger',
                        onClick: function () {
                            var _a;
                            var ingredientName = ((_a = params.data) === null || _a === void 0 ? void 0 : _a.name) || 'acest ingredient';
                            if (window.confirm("E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi ingredientul \"".concat(ingredientName, "\"?"))) {
                                // TODO: Implement delete
                            }
                        },
                    },
                ];
                return react_1.default.createElement(GridActionsMenu_1.GridActionsMenu, { actions: actions });
            },
        },
    ]; }, [setAdjustIngredient, setAdjustOpen]);
    var handleCellClicked = (0, react_1.useCallback)(function (event) {
        var _a;
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
            setEditingIngredient(event.data);
            setEditorOpen(true);
        }
        else if (action === 'adjust') {
            setAdjustIngredient(event.data);
            setAdjustOpen(true);
        }
        else if (action === 'details') {
            setDetailsIngredient(event.data);
            setDetailsOpen(true);
        }
    }, []);
    var handleRowDoubleClicked = (0, react_1.useCallback)(function (event) {
        if (!event.data)
            return;
        setDetailsIngredient(event.data);
        setDetailsOpen(true);
    }, []);
    var handleAddIngredient = (0, react_1.useCallback)(function () {
        setEditingIngredient(null);
        setEditorOpen(true);
    }, []);
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
    // Filter categories for dropdown
    var categories = (0, react_1.useMemo)(function () {
        var set = new Set();
        decoratedIngredients.forEach(function (item) {
            if (item.category)
                set.add(item.category);
        });
        return Array.from(set).sort(function (a, b) { return a.localeCompare(b, 'ro'); });
    }, [decoratedIngredients]);
    var _s = (0, react_1.useState)('all'), filterCategory = _s[0], setFilterCategory = _s[1];
    var _t = (0, react_1.useState)('all'), filterStatus = _t[0], setFilterStatus = _t[1];
    var filteredIngredients = (0, react_1.useMemo)(function () {
        var filtered = decoratedIngredients;
        if (filterCategory !== 'all') {
            filtered = filtered.filter(function (item) { return item.category === filterCategory; });
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(function (item) {
                if (filterStatus === 'active')
                    return !isTrue(item.is_hidden);
                if (filterStatus === 'hidden')
                    return isTrue(item.is_hidden);
                if (filterStatus === 'low')
                    return item.stock_status === 'low' || item.stock_status === 'critical';
                if (filterStatus === 'out')
                    return item.stock_status === 'out';
                return true;
            });
        }
        return filtered;
    }, [decoratedIngredients, filterCategory, filterStatus]);
    var handleClearFilters = (0, react_1.useCallback)(function () {
        setQuickFilter('');
        setFilterCategory('all');
        setFilterStatus('all');
    }, []);
    // Early returns with states
    if (loading) {
        return <LoadingState_1.LoadingState message="se incarca ingredientele"/>;
    }
    if (error) {
        return <ErrorState_1.ErrorState title="Eroare" message={error} onRetry={function () { return refetch(); }}/>;
    }
    if (decoratedIngredients.length === 0) {
        return (<EmptyState_1.EmptyState title="nu exista ingrediente" message="Adaugă primul ingredient pentru a începe." actionLabel="adauga ingredient" onAction={handleAddIngredient}/>);
    }
    // Header Actions
    var headerActions = (<button type="button" className="excel-button excel-button--primary" onClick={handleAddIngredient}>
      <span>➕</span>
      <span>Adaugă ingredient</span>
    </button>);
    // Toolbar
    var toolbar = (<>
      <TableFilter_1.TableFilter value={quickFilter} onChange={function (value) { return setQuickFilter(value); }} placeholder="cauta ingredient categorie um" aria-label="cautare ingrediente"/>
      <select value={filterCategory} onChange={function (e) { return setFilterCategory(e.target.value); }} className="excel-dropdown">
        <option value="all">Toate categoriile</option>
        {categories.map(function (c) { return (<option key={c} value={c}>
            {c}
          </option>); })}
      </select>
      <select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }} className="excel-dropdown">
        <option value="all">Toate</option>
        <option value="active">Doar active</option>
        <option value="hidden">Ascunse</option>
        <option value="low">Stoc scăzut</option>
        <option value="out">Epuizate</option>
      </select>
      <button type="button" className="excel-button" onClick={handleClearFilters}>
        Reset filtre
      </button>
    </>);
    // Footer
    var footer = (<>
      <div>
        Total ingrediente: <strong>{filteredIngredients.length}</strong>
        {filteredIngredients.length !== decoratedIngredients.length && (<span> (din {decoratedIngredients.length} total)</span>)}
      </div>
      <div>Restaurant App V3 powered by QrOMS</div>
    </>);
    return (<>
      <ExcelPageLayout_1.ExcelPageLayout title="Catalog Ingrediente" subtitle="gestionare completa a ingredientelor si stocurilor" headerActions={headerActions} toolbar={toolbar} footer={footer}>
        <div className="excel-grid-container" style={{ height: 'calc(100vh - 300px)', minHeight: '400px', width: '100%', position: 'relative' }}>
          {filteredIngredients.length > 0 ? (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredIngredients} loading={false} quickFilterText={quickFilter} rowSelection="multiple" height="100%" gridOptions={{
                rowHeight: 44,
                headerHeight: 48,
                animateRows: true,
                rowSelection: {
                    mode: 'multiRow',
                    checkboxes: true,
                    headerCheckbox: true,
                    selectAll: 'filtered',
                },
            }} agGridProps={{
                onCellClicked: handleCellClicked,
                onRowDoubleClicked: handleRowDoubleClicked,
                getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
                onGridReady: function (event) {
                    console.log('StockIngredientsTab Grid ready with', event.api.getDisplayedRowCount(), 'rows');
                },
            }} onSelectedRowsChange={function (rows) {
                setSelectedIngredients(rows);
            }}/>) : (<div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Nu există ingrediente care să corespundă filtrelor</div>)}
        </div>
      </ExcelPageLayout_1.ExcelPageLayout>

      {/* Modals and Drawers */}
      <IngredientEditorModal_1.IngredientEditorModal open={editorOpen} ingredient={editingIngredient} onClose={function () { return setEditorOpen(false); }} onSaved={function () { return __awaiter(void 0, void 0, void 0, function () {
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

      <IngredientBulkUpdateModal_1.IngredientBulkUpdateModal open={bulkOpen} ingredientIds={selectedIngredients.map(function (item) { return item.id; })} onClose={function () { return setBulkOpen(false); }} onApplied={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setBulkOpen(false);
                        setSelectedIngredients([]);
                        return [4 /*yield*/, refreshData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <IngredientDetailsDrawer_1.IngredientDetailsDrawer open={detailsOpen} ingredient={detailsIngredient} initialTab="overview" onClose={function () { return setDetailsOpen(false); }} onVisibilityChanged={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, refreshData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <StockAdjustModal_1.StockAdjustModal open={adjustOpen} ingredient={adjustIngredient} onClose={function () { return setAdjustOpen(false); }} onUpdated={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAdjustOpen(false);
                        return [4 /*yield*/, refreshData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <LowStockDrawer_1.LowStockDrawer open={lowStockDrawerOpen} alerts={lowStockAlerts} onClose={function () { return setLowStockDrawerOpen(false); }}/>

      <ExpiringStockDrawer_1.ExpiringStockDrawer open={expiringDrawerOpen} items={expiringAlerts} onClose={function () { return setExpiringDrawerOpen(false); }}/>

      <RiskAlertsDrawer_1.RiskAlertsDrawer open={riskAlertsDrawerOpen} onClose={function () { return setRiskAlertsDrawerOpen(false); }}/>
    </>);
};
exports.StockIngredientsTab = StockIngredientsTab;
