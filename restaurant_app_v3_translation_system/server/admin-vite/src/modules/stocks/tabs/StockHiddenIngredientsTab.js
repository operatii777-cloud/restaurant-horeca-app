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
exports.StockHiddenIngredientsTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
var IngredientDetailsDrawer_1 = require("@/modules/ingredients/components/IngredientDetailsDrawer");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./StockHiddenIngredientsTab.css");
var StockHiddenIngredientsTab = function (_a) {
    var onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _b = (0, useApiQuery_1.useApiQuery)('/api/ingredients?hidden_only=true'), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var ingredients = (0, react_1.useMemo)(function () { return (Array.isArray(data) ? data : []); }, [data]);
    var _c = (0, react_1.useState)(''), quickFilter = _c[0], setQuickFilter = _c[1];
    var _d = (0, react_1.useState)(false), detailsOpen = _d[0], setDetailsOpen = _d[1];
    var _e = (0, react_1.useState)(null), detailsIngredient = _e[0], setDetailsIngredient = _e[1];
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
            width: 140,
        },
        {
            headerName: 'Stoc minim',
            field: 'min_stock',
            width: 140,
        },
        {
            headerName: 'Acțiuni',
            colId: 'actions',
            width: 180,
            pinned: 'right',
            cellRenderer: function () { return (<div className="stock-hidden__row-actions">
            <button data-action="restore">↩️ Restaurează</button>
            <button data-action="details">🔎 Detalii</button>
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
    var handleCellClicked = (0, react_1.useCallback)(function (event) {
        var _a, _b;
        if (!event.data || event.colDef.colId !== 'actions')
            return;
        var domEvent = event.event;
        if (!domEvent)
            return;
        var action = (_b = (_a = domEvent.target) === null || _a === void 0 ? void 0 : _a.closest('button[data-action]')) === null || _b === void 0 ? void 0 : _b.getAttribute('data-action');
        if (!action)
            return;
        if (action === 'restore') {
            httpClient_1.httpClient
                .patch("/api/ingredients/".concat(event.data.id, "/restore"))
                .then(function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            onFeedback("Ingredientul \"".concat((_a = event.data) === null || _a === void 0 ? void 0 : _a.name, "\" a fost restaurat."), 'success');
                            return [4 /*yield*/, refreshData()];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); })
                .catch(function (error) {
                console.error('❌ Eroare la restaurarea ingredientului:', error);
                var message = error instanceof Error ? error.message : 'Nu s-a putut restaura ingredientul.';
                onFeedback(message, 'error');
            });
        }
        else if (action === 'details') {
            setDetailsIngredient(event.data);
            setDetailsOpen(true);
        }
    }, [onFeedback, refreshData]);
    return (<div className="stock-hidden">
      <div className="stock-hidden__toolbar">
        <input type="search" className="stock-hidden__search" placeholder="cauta ingredient ascuns dupa nume sau categorie" value={quickFilter} onChange={function (event) { return setQuickFilter(event.target.value); }}/>
        <span className="stock-hidden__count">{ingredients.length} ingrediente ascunse</span>
      </div>

      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={ingredients} loading={loading} quickFilterText={quickFilter} height="60vh" agGridProps={{
            onCellClicked: handleCellClicked,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
        }}/>

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
    </div>);
};
exports.StockHiddenIngredientsTab = StockHiddenIngredientsTab;
