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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogPage = void 0;
var react_1 = require("react");
// import { useTranslation } from '@/i18n/I18nContext';
var react_2 = require("react");
var react_router_dom_1 = require("react-router-dom");
var dompurify_1 = require("dompurify");
var StatCard_1 = require("@/shared/components/StatCard");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var TableFilter_1 = require("@/shared/components/TableFilter");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var ProductEditorModal_1 = require("@/modules/catalog/components/ProductEditorModal");
var CategoryTreePanel_1 = require("@/modules/catalog/components/CategoryTreePanel");
var CategoryModal_1 = require("@/modules/catalog/components/CategoryModal");
var CategoryDeleteModal_1 = require("@/modules/catalog/components/CategoryDeleteModal");
var CloneProductModal_1 = require("@/modules/menu/components/CloneProductModal");
var BulkPriceModal_1 = require("@/modules/menu/components/BulkPriceModal");
var PriceHistoryModal_1 = require("@/modules/menu/components/PriceHistoryModal");
var ProductMessagesModal_1 = require("@/modules/menu/components/ProductMessagesModal");
var httpClient_1 = require("@/shared/api/httpClient");
require("./CatalogPage.css");
var formatPrice = function (value) {
    return value === null || value === undefined ? '-' : "".concat(value.toFixed(2), " RON");
};
var palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899'];
var arraysEqual = function (first, second) {
    return first.length === second.length && first.every(function (value, index) { return value === second[index]; });
};
var parseToArray = function (value) {
    if (value === null || value === undefined) {
        return [];
    }
    if (Array.isArray(value)) {
        return value
            .map(function (entry) { return (typeof entry === 'string' ? entry.trim() : String(entry)); })
            .filter(function (entry) { return entry.length > 0; });
    }
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (!trimmed) {
            return [];
        }
        try {
            var parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(function (entry) { return (typeof entry === 'string' ? entry.trim() : String(entry)); })
                    .filter(function (entry) { return entry.length > 0; });
            }
        }
        catch (_a) {
            // fall through to splitting
        }
        return trimmed
            .split(/[,\n]/)
            .map(function (entry) { return entry.trim(); })
            .filter(function (entry) { return entry.length > 0; });
    }
    return [String(value)];
};
var describeAllergens = function (value) {
    var entries = parseToArray(value);
    if (!entries.length) {
        return 'Fără alergeni declarați';
    }
    return entries.join(', ');
};
var computeMargin = function (price, cost) {
    if (price === undefined || price === null) {
        return { value: null, percent: null };
    }
    if (cost === null || cost === undefined) {
        return { value: null, percent: null };
    }
    var marginValue = Number((price - cost).toFixed(2));
    var marginPercent = price !== 0 ? Number(((marginValue / price) * 100).toFixed(2)) : null;
    return { value: marginValue, percent: marginPercent };
};
var findCategoryById = function (categories, id) {
    if (id === null) {
        return null;
    }
    for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
        var category = categories_1[_i];
        if (category.id === id) {
            return category;
        }
        if (category.children && category.children.length > 0) {
            var found = findCategoryById(category.children, id);
            if (found) {
                return found;
            }
        }
    }
    return null;
};
var CatalogPage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    //   const { t } = useTranslation();
    // Page load time debug (fixed calculation)
    var pageLoadStart = performance.now();
    (0, react_2.useEffect)(function () {
        var pageLoadEnd = performance.now();
        var loadTime = Math.round(pageLoadEnd - pageLoadStart);
        console.log("\u26A1 Page load time: ".concat(loadTime, "ms"));
    }, []);
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _m = (0, react_2.useState)(''), quickFilter = _m[0], setQuickFilter = _m[1];
    var _o = (0, react_2.useState)(false), editorOpen = _o[0], setEditorOpen = _o[1];
    var _p = (0, react_2.useState)(null), editingProduct = _p[0], setEditingProduct = _p[1];
    var _q = (0, react_2.useState)([]), selectedProducts = _q[0], setSelectedProducts = _q[1];
    var _r = (0, react_2.useState)(null), feedback = _r[0], setFeedback = _r[1];
    var _s = (0, react_2.useState)(false), cloneModalOpen = _s[0], setCloneModalOpen = _s[1];
    var _t = (0, react_2.useState)(false), priceHistoryModalOpen = _t[0], setPriceHistoryModalOpen = _t[1];
    var _u = (0, react_2.useState)(false), messagesModalOpen = _u[0], setMessagesModalOpen = _u[1];
    var _v = (0, react_2.useState)(false), bulkModalOpen = _v[0], setBulkModalOpen = _v[1];
    var _w = (0, react_2.useState)(null), selectedCategoryId = _w[0], setSelectedCategoryId = _w[1];
    var _x = (0, react_2.useState)(true), showOnlyActive = _x[0], setShowOnlyActive = _x[1];
    var _y = (0, react_2.useState)(false), chefView = _y[0], setChefView = _y[1];
    var _z = (0, react_2.useState)(false), deletingProducts = _z[0], setDeletingProducts = _z[1];
    var _0 = (0, react_2.useState)(false), reorderMode = _0[0], setReorderMode = _0[1];
    var _1 = (0, react_2.useState)(false), reorderSaving = _1[0], setReorderSaving = _1[1];
    var _2 = (0, react_2.useState)(null), rowDataOverride = _2[0], setRowDataOverride = _2[1];
    var _3 = (0, react_2.useState)(null), pendingOrder = _3[0], setPendingOrder = _3[1];
    var gridApiRef = (0, react_2.useRef)(null);
    var _4 = (0, react_2.useState)(null), chefSummary = _4[0], setChefSummary = _4[1];
    var _5 = (0, react_2.useState)(false), chefSummaryLoading = _5[0], setChefSummaryLoading = _5[1];
    var _6 = (0, react_2.useState)(null), chefSummaryError = _6[0], setChefSummaryError = _6[1];
    var _7 = (0, react_2.useState)({
        open: false,
        mode: 'create',
        category: null,
        parentId: null,
    }), categoryModalState = _7[0], setCategoryModalState = _7[1];
    var _8 = (0, react_2.useState)({
        open: false,
        category: null,
    }), categoryDeleteState = _8[0], setCategoryDeleteState = _8[1];
    var _9 = (0, react_2.useState)(null), deleteCategoryError = _9[0], setDeleteCategoryError = _9[1];
    var _10 = (0, react_2.useState)(false), categoryActionLoading = _10[0], setCategoryActionLoading = _10[1];
    var chefViewActive = chefView && !reorderMode;
    var _11 = (0, useApiQuery_1.useApiQuery)('/api/catalog/categories/tree'), categoriesData = _11.data, categoriesLoading = _11.loading, categoriesError = _11.error, refetchCategories = _11.refetch;
    var categories = (0, react_2.useMemo)(function () { return categoriesData !== null && categoriesData !== void 0 ? categoriesData : []; }, [categoriesData]);
    var selectedCategory = (0, react_2.useMemo)(function () { return findCategoryById(categories, selectedCategoryId); }, [categories, selectedCategoryId]);
    var productsEndpoint = (0, react_2.useMemo)(function () {
        var params = new URLSearchParams();
        if (selectedCategory === null || selectedCategory === void 0 ? void 0 : selectedCategory.name) {
            params.set('category', selectedCategory.name);
        }
        if (showOnlyActive) {
            params.set('is_active', '1');
        }
        var query = params.toString();
        return "/api/catalog/products".concat(query ? "?".concat(query) : '');
    }, [selectedCategory === null || selectedCategory === void 0 ? void 0 : selectedCategory.name, showOnlyActive]);
    var _12 = (0, useApiQuery_1.useApiQuery)(productsEndpoint), data = _12.data, loading = _12.loading, error = _12.error, refetch = _12.refetch;
    var isPageReady = !loading && !categoriesLoading && (data !== null || error !== null);
    var rowData = (0, react_2.useMemo)(function () { return data !== null && data !== void 0 ? data : []; }, [data]);
    var displayedRowData = reorderMode && rowDataOverride ? rowDataOverride : rowData;
    var originalOrderIds = (0, react_2.useMemo)(function () { return rowData.map(function (item) { return item.id; }); }, [rowData]);
    var reorderDirty = reorderMode && pendingOrder !== null && !arraysEqual(pendingOrder, originalOrderIds);
    (0, react_2.useEffect)(function () {
        if (!reorderMode) {
            setRowDataOverride(null);
            setPendingOrder(null);
            return;
        }
        setRowDataOverride(rowData);
        setPendingOrder(rowData.map(function (item) { return item.id; }));
    }, [reorderMode, rowData]);
    var actionColumn = (0, react_2.useMemo)(function () { return ({
        headerName: 'Acțiuni',
        colId: 'actions',
        width: 130,
        pinned: 'right',
        sortable: false,
        filter: false,
        valueGetter: function () { return 'Editează →'; },
        cellClass: 'catalog-grid__action-cell',
    }); }, []);
    var baseColumnDefs = (0, react_2.useMemo)(function () { return [
        {
            field: 'name',
            headerName: 'Produs',
            minWidth: 220,
            cellDataType: 'text',
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
        },
        {
            field: 'category',
            headerName: 'Categorie',
            minWidth: 160,
        },
        {
            field: 'price',
            headerName: 'Preț vânzare',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatPrice(Number(value));
            },
            cellDataType: 'number',
        },
        {
            field: 'vat_rate',
            headerName: 'TVA %',
            width: 120,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value !== null && value !== undefined ? "".concat(value, "%") : '-');
            },
        },
        {
            field: 'unit',
            headerName: 'Unitate',
            width: 120,
        },
        {
            field: 'preparation_section',
            headerName: 'Secțiune prep.',
            minWidth: 150,
        },
        {
            field: 'for_sale',
            headerName: 'Activ',
            width: 110,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value ? 'Da' : 'Nu');
            },
        },
        {
            field: 'has_recipe',
            headerName: 'Rețetă',
            width: 110,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value ? 'Da' : 'Nu');
            },
        },
    ]; }, []);
    var chefColumnDefs = (0, react_2.useMemo)(function () { return [
        {
            field: 'cost_price',
            headerName: 'Cost rețetă',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value === null || value === undefined ? '—' : formatPrice(Number(value)));
            },
            tooltipValueGetter: function (_a) {
                var value = _a.value;
                return value === null || value === undefined ? 'Cost necunoscut' : "Cost re\u021Bet\u0103: ".concat(formatPrice(Number(value)));
            },
        },
        {
            headerName: 'Marjă',
            colId: 'margin',
            width: 140,
            valueGetter: function (_a) {
                var _b;
                var data = _a.data;
                var _c = computeMargin(data === null || data === void 0 ? void 0 : data.price, (_b = data === null || data === void 0 ? void 0 : data.cost_price) !== null && _b !== void 0 ? _b : null), value = _c.value, percent = _c.percent;
                if (value === null || percent === null) {
                    return '—';
                }
                return "".concat(formatPrice(value), " (").concat(percent, "%)");
            },
            cellClass: 'catalog-grid__margin-cell',
        },
        {
            field: 'allergens',
            headerName: 'Alergeni',
            minWidth: 200,
            valueGetter: function (_a) {
                var _b;
                var data = _a.data;
                return describeAllergens((_b = data === null || data === void 0 ? void 0 : data.allergens) !== null && _b !== void 0 ? _b : data === null || data === void 0 ? void 0 : data.allergens_computed);
            },
            tooltipValueGetter: function (_a) {
                var _b;
                var data = _a.data;
                return describeAllergens((_b = data === null || data === void 0 ? void 0 : data.allergens) !== null && _b !== void 0 ? _b : data === null || data === void 0 ? void 0 : data.allergens_computed);
            },
        },
    ]; }, []);
    var reorderColumn = (0, react_2.useMemo)(function () { return ({
        headerName: '',
        colId: 'row-reorder',
        width: 60,
        pinned: 'left',
        lockPosition: true,
        suppressMenu: true,
        suppressMovable: true,
        rowDrag: true,
        cellRenderer: function () { return react_1.default.createElement('span', {
            className: 'catalog-drag-handle',
            'aria-hidden': 'true'
        }, '↕'); },
        cellClass: 'catalog-grid__drag-cell',
        headerClass: 'catalog-grid__drag-header',
    }); }, []);
    var columnDefs = (0, react_2.useMemo)(function () {
        var core = __spreadArray([], baseColumnDefs, true);
        var extended = chefViewActive ? __spreadArray(__spreadArray(__spreadArray([], core, true), chefColumnDefs, true), [actionColumn], false) : __spreadArray(__spreadArray([], core, true), [actionColumn], false);
        return reorderMode ? __spreadArray([reorderColumn], extended, true) : extended;
    }, [actionColumn, baseColumnDefs, chefColumnDefs, chefViewActive, reorderColumn, reorderMode]);
    var rowClassRules = (0, react_2.useMemo)(function () { return ({
        'catalog-row--no-recipe': function (params) { var _a; return chefViewActive && !((_a = params.data) === null || _a === void 0 ? void 0 : _a.has_recipe); },
        'catalog-row--low-margin': function (params) {
            var _a, _b, _c;
            if (!chefViewActive) {
                return false;
            }
            var price = Number((_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.price) !== null && _b !== void 0 ? _b : 0);
            var cost = (_c = params.data) === null || _c === void 0 ? void 0 : _c.cost_price;
            if (cost === null || cost === undefined) {
                return false;
            }
            return price - Number(cost) <= 0;
        },
    }); }, [chefViewActive]);
    var gridOptions = (0, react_2.useMemo)(function () { return ({
        rowHeight: 54,
        headerHeight: 46,
        suppressScrollOnNewData: true,
        rowClassRules: rowClassRules,
        rowDragManaged: reorderMode,
        suppressMoveWhenRowDragging: reorderMode,
        // AG Grid v32.2+: suppressRowClickSelection replaced by rowSelection.enableClickSelection
    }); }, [reorderMode, rowClassRules]);
    var handleAddProduct = (0, react_2.useCallback)(function () {
        setEditingProduct(null);
        setEditorOpen(true);
    }, []);
    var handleEditProduct = (0, react_2.useCallback)(function (productToEdit) {
        if (!productToEdit)
            return;
        setEditingProduct(productToEdit);
        setEditorOpen(true);
    }, []);
    var handleSelectionChange = (0, react_2.useCallback)(function (selected) {
        setSelectedProducts(selected);
    }, []);
    var handleCellClicked = (0, react_2.useCallback)(function (event) {
        if (event.colDef.colId === 'actions' && event.data) {
            handleEditProduct(event.data);
        }
    }, [handleEditProduct]);
    var handleRowDoubleClicked = (0, react_2.useCallback)(function (event) {
        if (event.data) {
            handleEditProduct(event.data);
        }
    }, [handleEditProduct]);
    var totalProducts = rowData.length;
    var activeProducts = rowData.filter(function (item) { return item.for_sale; }).length;
    var inactiveProducts = totalProducts - activeProducts;
    var withRecipe = rowData.filter(function (item) { return item.has_recipe; }).length;
    var withoutRecipe = totalProducts - withRecipe;
    var avgPrice = rowData.reduce(function (sum, item) { var _a; return sum + ((_a = item.price) !== null && _a !== void 0 ? _a : 0); }, 0) / (totalProducts || 1);
    var actionsDisabled = reorderMode;
    var reorderCategoryName = (_a = selectedCategory === null || selectedCategory === void 0 ? void 0 : selectedCategory.name) !== null && _a !== void 0 ? _a : 'categoria selectată';
    var chefStats = (0, react_2.useMemo)(function () {
        if (!chefViewActive) {
            return null;
        }
        var withCost = rowData.filter(function (item) { return item.cost_price !== null && item.cost_price !== undefined; }).length;
        var lowMargin = rowData.filter(function (item) {
            var _a, _b;
            if (item.cost_price === null || item.cost_price === undefined) {
                return false;
            }
            var margin = Number((_a = item.price) !== null && _a !== void 0 ? _a : 0) - Number((_b = item.cost_price) !== null && _b !== void 0 ? _b : 0);
            return margin <= 0;
        }).length;
        var missingRecipeCount = rowData.filter(function (item) { return !item.has_recipe; }).length;
        return {
            total: rowData.length,
            withCost: withCost,
            lowMargin: lowMargin,
            missingRecipe: missingRecipeCount,
        };
    }, [chefViewActive, rowData]);
    var formatDateTime = (0, react_2.useCallback)(function (value) {
        if (!value) {
            return null;
        }
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleString('ro-RO', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }, []);
    var selectedProduct = (_b = selectedProducts[0]) !== null && _b !== void 0 ? _b : null;
    var fallbackAllergens = (0, react_2.useMemo)(function () { var _a; return parseToArray((_a = selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.allergens) !== null && _a !== void 0 ? _a : selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.allergens_computed); }, [selectedProduct]);
    var allergensForPanel = ((_c = chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.allergens) === null || _c === void 0 ? void 0 : _c.length) ? chefSummary.allergens : fallbackAllergens;
    var ingredientsForPanel = ((_d = chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.ingredients) === null || _d === void 0 ? void 0 : _d.length) ? chefSummary.ingredients : parseToArray(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.ingredients);
    var chefMarginText = chefSummary && chefSummary.marginValue !== null && chefSummary.marginPercent !== null
        ? "".concat(formatPrice(Number(chefSummary.marginValue)), " (").concat(chefSummary.marginPercent, "%)")
        : '—';
    var selectedMenuProduct = (0, react_2.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (!selectedProduct) {
            return undefined;
        }
        return {
            id: selectedProduct.id,
            name: selectedProduct.name,
            category: (_a = selectedProduct.category) !== null && _a !== void 0 ? _a : 'Nespecificat',
            price: Number((_b = selectedProduct.price) !== null && _b !== void 0 ? _b : 0),
            vat_rate: (_c = selectedProduct.vat_rate) !== null && _c !== void 0 ? _c : null,
            unit: (_d = selectedProduct.unit) !== null && _d !== void 0 ? _d : null,
            preparation_section: (_e = selectedProduct.preparation_section) !== null && _e !== void 0 ? _e : null,
            is_sellable: (_g = (_f = selectedProduct.for_sale) !== null && _f !== void 0 ? _f : selectedProduct.is_active) !== null && _g !== void 0 ? _g : true,
            is_active: (_j = (_h = selectedProduct.is_active) !== null && _h !== void 0 ? _h : selectedProduct.for_sale) !== null && _j !== void 0 ? _j : true,
            has_recipe: (_k = selectedProduct.has_recipe) !== null && _k !== void 0 ? _k : false,
            stock_management: (_l = selectedProduct.stock_management) !== null && _l !== void 0 ? _l : null,
            image_url: (_m = selectedProduct.image_url) !== null && _m !== void 0 ? _m : null,
        };
    }, [selectedProduct]);
    var handleOpenClone = (0, react_2.useCallback)(function () {
        if (!selectedMenuProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs din catalog pentru a-l clona.' });
            return;
        }
        setFeedback(null);
        setCloneModalOpen(true);
    }, [selectedMenuProduct]);
    var handleOpenPriceHistory = (0, react_2.useCallback)(function () {
        if (!selectedMenuProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a-i vizualiza istoricul de preț.' });
            return;
        }
        setFeedback(null);
        setPriceHistoryModalOpen(true);
    }, [selectedMenuProduct]);
    var handleOpenMessages = (0, react_2.useCallback)(function () {
        if (!selectedMenuProduct) {
            setFeedback({ type: 'warning', message: 'Selectează un produs pentru a trimite o alertă internă.' });
            return;
        }
        setFeedback(null);
        setMessagesModalOpen(true);
    }, [selectedMenuProduct]);
    var handleOpenBulkPrice = (0, react_2.useCallback)(function () {
        if (!selectedProducts.length) {
            setFeedback({ type: 'warning', message: 'Selectează cel puțin un produs pentru actualizare în masă.' });
            return;
        }
        setFeedback(null);
        setBulkModalOpen(true);
    }, [selectedProducts]);
    var handleExport = (0, react_2.useCallback)(function () {
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
    // Handler pentru "Meniu digital sincronizat"
    var handleDigitalMenu = (0, react_2.useCallback)(function () {
        navigate('/menu');
    }, [navigate]);
    // Handler pentru "Rețete + costuri automat"
    var handleRecipes = (0, react_2.useCallback)(function () {
        navigate('/recipes');
    }, [navigate]);
    // Handler pentru "Export PDF / QR Instant"
    var handleExportPDF = (0, react_2.useCallback)(function () {
        var _a;
        var baseUrl = ((_a = httpClient_1.httpClient.defaults.baseURL) !== null && _a !== void 0 ? _a : '').replace(/\/$/, '');
        var exportUrl = "".concat(baseUrl, "/api/exports/menu/pdf");
        window.open(exportUrl, '_blank', 'noopener');
        setFeedback({
            type: 'success',
            message: 'Export PDF meniu inițiat. Verifică folderul de descărcări.',
        });
    }, []);
    var handleDeleteProducts = (0, react_2.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, message;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!selectedProducts.length) {
                        setFeedback({ type: 'warning', message: 'Selectează produse pentru ștergere.' });
                        return [2 /*return*/];
                    }
                    if (!window.confirm("Sigur dore\u0219ti s\u0103 \u0219tergi ".concat(selectedProducts.length, " produs(e)?"))) {
                        return [2 /*return*/];
                    }
                    setDeletingProducts(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, Promise.all(selectedProducts.map(function (product) { return httpClient_1.httpClient.delete("/api/catalog/products/".concat(product.id)); }))];
                case 2:
                    _d.sent();
                    setFeedback({ type: 'success', message: "".concat(selectedProducts.length, " produs(e) eliminate din catalog.") });
                    setSelectedProducts([]);
                    return [4 /*yield*/, refetch()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _d.sent();
                    message = (_c = (_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : (err_1 instanceof Error ? err_1.message : 'Nu am putut șterge produsele selectate.');
                    setFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setDeletingProducts(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [selectedProducts, refetch]);
    var handleRowDragEnd = (0, react_2.useCallback)(function (event) {
        var newOrderData = [];
        event.api.forEachNodeAfterFilterAndSort(function (node) {
            if (node.data) {
                newOrderData.push(node.data);
            }
        });
        if (newOrderData.length > 0) {
            setRowDataOverride(__spreadArray([], newOrderData, true));
            setPendingOrder(newOrderData.map(function (item) { return item.id; }));
        }
    }, []);
    var handleGridReady = (0, react_2.useCallback)(function (event) {
        gridApiRef.current = event.api;
    }, []);
    var handleCancelReorder = (0, react_2.useCallback)(function () {
        var _a;
        setReorderMode(false);
        setReorderSaving(false);
        setRowDataOverride(null);
        setPendingOrder(null);
        (_a = gridApiRef.current) === null || _a === void 0 ? void 0 : _a.refreshClientSideRowModel('everything');
        refetch();
    }, [refetch]);
    var handleToggleReorder = (0, react_2.useCallback)(function () {
        if (reorderMode) {
            handleCancelReorder();
            return;
        }
        if (!selectedCategory) {
            setFeedback({
                type: 'warning',
                message: 'Selectează o categorie din panoul din stânga pentru a organiza produsele.',
            });
            return;
        }
        if (rowData.length < 2) {
            setFeedback({ type: 'warning', message: 'Sunt necesare cel puțin două produse pentru a schimba ordinea.' });
            return;
        }
        setReorderMode(true);
        setRowDataOverride(rowData);
        setPendingOrder(rowData.map(function (item) { return item.id; }));
    }, [handleCancelReorder, reorderMode, rowData, selectedCategory]);
    var handleSaveReorder = (0, react_2.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2, message;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!selectedCategory) {
                        setFeedback({ type: 'warning', message: 'Selectează o categorie înainte de a salva ordinea.' });
                        return [2 /*return*/];
                    }
                    if (!pendingOrder || !reorderDirty) {
                        setFeedback({ type: 'info', message: 'Nu există modificări de salvat pentru ordinea produselor.' });
                        return [2 /*return*/];
                    }
                    setReorderSaving(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/catalog/products/reorder', {
                            category: selectedCategory.name,
                            ordered_ids: pendingOrder,
                        })];
                case 2:
                    _d.sent();
                    setFeedback({
                        type: 'success',
                        message: "Ordinea produselor din categoria \u201E".concat(selectedCategory.name, "\u201D a fost actualizat\u0103."),
                    });
                    setReorderMode(false);
                    setRowDataOverride(null);
                    setPendingOrder(null);
                    return [4 /*yield*/, refetch()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _d.sent();
                    message = (_c = (_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : (err_2 instanceof Error ? err_2.message : 'Nu am putut salva ordinea produselor.');
                    setFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setReorderSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [pendingOrder, refetch, reorderDirty, selectedCategory]);
    var fetchChefSummary = (0, react_2.useCallback)(function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, payload, err_3, message;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    setChefSummaryLoading(true);
                    setChefSummaryError(null);
                    _r.label = 1;
                case 1:
                    _r.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/catalog/products/".concat(productId, "/chef-summary"))];
                case 2:
                    response = _r.sent();
                    payload = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : response.data;
                    if (!payload) {
                        throw new Error('Răspuns invalid de la server.');
                    }
                    setChefSummary({
                        productId: (_c = payload.product_id) !== null && _c !== void 0 ? _c : productId,
                        name: (_d = payload.name) !== null && _d !== void 0 ? _d : '',
                        price: Number((_e = payload.price) !== null && _e !== void 0 ? _e : 0),
                        costPrice: (_f = payload.cost_price) !== null && _f !== void 0 ? _f : null,
                        marginValue: (_g = payload.margin_value) !== null && _g !== void 0 ? _g : null,
                        marginPercent: (_h = payload.margin_percent) !== null && _h !== void 0 ? _h : null,
                        hasRecipe: Boolean(payload.has_recipe),
                        allergens: parseToArray((_j = payload.allergens) !== null && _j !== void 0 ? _j : payload.allergens_computed),
                        ingredients: parseToArray(payload.ingredients),
                        costLastUpdated: (_k = payload.cost_last_updated) !== null && _k !== void 0 ? _k : null,
                        recipe: (_l = payload.recipe) !== null && _l !== void 0 ? _l : null,
                        portion: (_m = payload.portion) !== null && _m !== void 0 ? _m : null,
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _r.sent();
                    console.error('Catalog vizualizare chef error', err_3);
                    message = (_q = (_p = (_o = err_3.response) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.error) !== null && _q !== void 0 ? _q : (err_3 instanceof Error ? err_3.message : 'Nu am putut încărca datele pentru Vizualizare chef.');
                    setChefSummaryError(message);
                    setChefSummary(null);
                    return [3 /*break*/, 5];
                case 4:
                    setChefSummaryLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleChefRefresh = (0, react_2.useCallback)(function () {
        var _a;
        if ((_a = selectedProducts[0]) === null || _a === void 0 ? void 0 : _a.id) {
            fetchChefSummary(selectedProducts[0].id);
        }
        else if (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) {
            fetchChefSummary(selectedProduct.id);
        }
    }, [fetchChefSummary, selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id, selectedProducts]);
    var handleCategorySelect = (0, react_2.useCallback)(function (category) {
        setSelectedCategoryId(category ? category.id : null);
    }, []);
    var handleOpenCreateCategory = (0, react_2.useCallback)(function (parentId) {
        setCategoryModalState({
            open: true,
            mode: 'create',
            category: null,
            parentId: parentId,
        });
    }, []);
    var handleOpenEditCategory = (0, react_2.useCallback)(function (category) {
        var _a;
        setCategoryModalState({
            open: true,
            mode: 'edit',
            category: category,
            parentId: (_a = category.parent_id) !== null && _a !== void 0 ? _a : null,
        });
    }, []);
    var closeCategoryModal = (0, react_2.useCallback)(function () {
        setCategoryModalState(function (prev) { return (__assign(__assign({}, prev), { open: false, category: null })); });
    }, []);
    var openDeleteCategoryModal = (0, react_2.useCallback)(function (category) {
        setDeleteCategoryError(null);
        setCategoryDeleteState({ open: true, category: category });
    }, []);
    var closeDeleteCategoryModal = (0, react_2.useCallback)(function () {
        setCategoryDeleteState({ open: false, category: null });
        setDeleteCategoryError(null);
    }, []);
    var handleCategorySubmit = (0, react_2.useCallback)(function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        var err_4, message;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setCategoryActionLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 8, 9, 10]);
                    if (!(categoryModalState.mode === 'edit' && categoryModalState.category)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/catalog/categories/".concat(categoryModalState.category.id), payload)];
                case 2:
                    _d.sent();
                    setFeedback({ type: 'success', message: "Categoria \u201E".concat(payload.name, "\u201D a fost actualizat\u0103.") });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/catalog/categories', payload)];
                case 4:
                    _d.sent();
                    setFeedback({ type: 'success', message: "Categoria \u201E".concat(payload.name, "\u201D a fost creat\u0103.") });
                    _d.label = 5;
                case 5: return [4 /*yield*/, refetchCategories()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, refetch()];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 8:
                    err_4 = _d.sent();
                    message = (_c = (_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : (err_4 instanceof Error ? err_4.message : 'Nu am putut salva categoria.');
                    setFeedback({ type: 'error', message: message });
                    throw new Error(message);
                case 9:
                    setCategoryActionLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [categoryModalState, refetchCategories, refetch]);
    var handleConfirmDeleteCategory = (0, react_2.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_5, message;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!categoryDeleteState.category) {
                        return [2 /*return*/];
                    }
                    setCategoryActionLoading(true);
                    setDeleteCategoryError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/catalog/categories/".concat(categoryDeleteState.category.id))];
                case 2:
                    _d.sent();
                    setFeedback({
                        type: 'success',
                        message: "Categoria \u201E".concat(categoryDeleteState.category.name, "\u201D a fost \u0219tears\u0103."),
                    });
                    if (selectedCategoryId === categoryDeleteState.category.id) {
                        setSelectedCategoryId(null);
                    }
                    closeDeleteCategoryModal();
                    return [4 /*yield*/, refetchCategories()];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, refetch()];
                case 4:
                    _d.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_5 = _d.sent();
                    message = (_c = (_b = (_a = err_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : (err_5 instanceof Error ? err_5.message : 'Nu am putut șterge categoria.');
                    setDeleteCategoryError(message);
                    setFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 7];
                case 6:
                    setCategoryActionLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [categoryDeleteState, selectedCategoryId, closeDeleteCategoryModal, refetchCategories, refetch]);
    (0, react_2.useEffect)(function () {
        if (selectedCategoryId !== null) {
            var exists = findCategoryById(categories, selectedCategoryId);
            if (!exists) {
                setSelectedCategoryId(null);
            }
        }
    }, [categories, selectedCategoryId]);
    (0, react_2.useEffect)(function () {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            var currentUrl = new URL(window.location.href);
            if (currentUrl.searchParams.get("chef view") === '1') {
                setChefView(true);
            }
        }
        catch (error) {
            console.warn('Catalog Nu am putut analiza parametrul chef_view:', error);
        }
    }, []);
    (0, react_2.useEffect)(function () {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            var currentUrl = new URL(window.location.href);
            if (chefView) {
                currentUrl.searchParams.set('chef_view', '1');
            }
            else {
                currentUrl.searchParams.delete('chef_view');
            }
            window.history.replaceState({}, '', "".concat(currentUrl.pathname).concat(currentUrl.search).concat(currentUrl.hash));
        }
        catch (error) {
            console.warn('Catalog Nu am putut actualiza parametrul chef_view:', error);
        }
    }, [chefView]);
    (0, react_2.useEffect)(function () {
        if (chefViewActive && (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id)) {
            if ((chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.productId) !== selectedProduct.id && !chefSummaryLoading) {
                fetchChefSummary(selectedProduct.id);
            }
        }
        else {
            setChefSummary(null);
            setChefSummaryError(null);
            setChefSummaryLoading(false);
        }
    }, [chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.productId, chefSummaryLoading, chefViewActive, fetchChefSummary, selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id]);
    var categoryDistribution = (0, react_2.useMemo)(function () {
        if (totalProducts === 0) {
            return [];
        }
        var map = new Map();
        rowData.forEach(function (item) {
            var _a;
            if (!item.category)
                return;
            map.set(item.category, ((_a = map.get(item.category)) !== null && _a !== void 0 ? _a : 0) + 1);
        });
        var entries = Array.from(map.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 6);
        return entries.map(function (_a, index) {
            var name = _a[0], count = _a[1];
            return ({
                name: name,
                value: Number(((count / totalProducts) * 100).toFixed(1)),
                raw: count,
                color: palette[index % palette.length],
            });
        });
    }, [rowData, totalProducts]);
    var topPricedProducts = (0, react_2.useMemo)(function () {
        return rowData
            .filter(function (item) { return item.price; })
            .sort(function (a, b) { var _a, _b; return ((_a = b.price) !== null && _a !== void 0 ? _a : 0) - ((_b = a.price) !== null && _b !== void 0 ? _b : 0); })
            .slice(0, 6)
            .map(function (product) {
            var _a, _b;
            return ({
                label: product.name.length > 10 ? "".concat(product.name.slice(0, 9), "\u2026") : product.name,
                value: Number((_b = (_a = product.price) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !== null && _b !== void 0 ? _b : 0),
            });
        });
    }, [rowData]);
    var defaultLegend = totalProducts === 0
        ? []
        : categoryDistribution.map(function (entry) { return (__assign(__assign({}, entry), { display: "".concat(entry.value, "%") })); });
    return (<div className="catalog-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: dompurify_1.default.sanitize(JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Admin',
                        item: '/admin',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Catalog produse',
                        item: '/catalog',
                    },
                ],
            })),
        }}/>
      <section className="catalog-hero">
        <div className="catalog-hero__info">
          <div className="catalog-hero__labels">
            <button type="button" className="catalog-chip catalog-chip--primary catalog-chip--clickable" onClick={handleDigitalMenu} title="navigheaza la pagina meniu digital">
              Meniu digital sincronizat
            </button>
            <button type="button" className="catalog-chip catalog-chip--clickable" onClick={handleRecipes} title="navigheaza la pagina retete">
              Rețete + costuri automat
            </button>
            <button type="button" className="catalog-chip catalog-chip--clickable" onClick={handleExportPDF} title="exporta meniul in format pdf">
              Export PDF / QR Instant
            </button>
          </div>
          <h2>catalog produse si meniuri active</h2>
          <p>
            Gestionezi dintr-un singur loc meniurile, prețurile și traducerile pentru toate canalele (digital, PDF, QR,
            meniuri tipărite). Integrarea cu AG Grid îți oferă filtrare, sortare și export Excel fără efort.
          </p>
        </div>

        <div className="catalog-hero__stats">
          <StatCard_1.StatCard title="Produse active" helper="Disponibile în meniurile curente" value={"".concat(activeProducts)} trendLabel="Fără rețetă" trendValue={"".concat(withoutRecipe)} trendDirection={withoutRecipe > 0 ? 'down' : 'up'} icon={<span>🍽️</span>}/>

          <StatCard_1.StatCard title="pret mediu vanzare" helper="Bazat pe toate produsele active" value={"".concat(avgPrice.toFixed(2), " RON")} trendLabel="Produse inactive" trendValue={"".concat(inactiveProducts)} trendDirection={inactiveProducts > 0 ? 'flat' : 'up'} icon={<span>💶</span>}/>

          <StatCard_1.StatCard title="retete sincronizate" helper="Calcul cost/porție și alergeni" value={"".concat(withRecipe, " produse")} trendLabel="Actualizate ultimele 7 zile" trendValue={"".concat(Math.min(withRecipe, 12), " items")} trendDirection="up" icon={<span>🧾</span>} footer={<button type="button" className="catalog-link-button">
                Vezi produse fără rețetă →
              </button>}/>
        </div>

        <div className="catalog-hero__analytics">
          <div className="catalog-analytics-card">
            <header>
              <span className="catalog-analytics-title">top preturi produse active</span>
              <span className="catalog-analytics-helper">RON / produs</span>
            </header>
            <MiniBarChart_1.MiniBarChart data={topPricedProducts} valueFormat={function (value) { return "".concat(value.toFixed(0)); }} tooltipFormatter={function (value) { return ["".concat(value.toFixed(2), " RON"), 'Preț']; }}/>
          </div>

          <div className="catalog-analytics-card">
            <header>
              <span className="catalog-analytics-title">distributie pe categorii</span>
              <span className="catalog-analytics-helper">% din catalog</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={defaultLegend.length
            ? defaultLegend.map(function (item) { return ({ name: item.name, value: item.value, color: item.color }); })
            : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]}/>
            <ul className="catalog-legend">
              {defaultLegend.length === 0 ? (<li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true"/>
                  <span>fara date disponibile</span>
                  <strong>100%</strong>
                </li>) : (defaultLegend.map(function (item) { return (<li key={item.name}>
                    <span style={{ backgroundColor: item.color }} aria-hidden="true"/>
                    <span>{item.name}</span>
                    <strong>
                      {item.display}
                      <small>{item.raw} produse</small>
                    </strong>
                  </li>); }))}
            </ul>
          </div>
        </div>
      </section>

      <div className="catalog-body">
        <CategoryTreePanel_1.CategoryTreePanel categories={categories} selectedCategoryId={selectedCategoryId} loading={categoriesLoading} onSelectCategory={handleCategorySelect} onCreateCategory={handleOpenCreateCategory} onEditCategory={handleOpenEditCategory} onDeleteCategory={openDeleteCategoryModal} onRefresh={refetchCategories}/>

        <div className="catalog-main">
          <section className="catalog-toolbar" aria-label="Filtre catalog">
            <div className="catalog-toolbar__left">
              <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder="cauta produs dupa nume categorie sectiune de prepa" aria-label="Filtru rapid catalog" disabled={reorderMode}/>
              <div className="catalog-toggle-group">
                <label>
                  <input type="checkbox" data-qa="catalog-chef-toggle" checked={chefView} onChange={function (event) { return setChefView(event.target.checked); }} disabled={reorderMode}/>' '
                  Vizualizare chef (cost + alergeni)
                </label>
                <label>
                  <input type="checkbox" data-qa="catalog-active-toggle" checked={showOnlyActive} onChange={function (event) { return setShowOnlyActive(event.target.checked); }} disabled={reorderMode}/>' '
                  Doar produse active
                </label>
              </div>
            </div>
            <div className="catalog-toolbar__actions">
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={function () { return refetch(); }}>
                ⟳ Reîmprospătează datele
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost">
                🗂️ Importă din template
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleToggleReorder} disabled={(!reorderMode && (!selectedCategory || rowData.length < 2 || loading)) ||
            (reorderMode && reorderSaving)}>
                {reorderMode ? '❌ Ieșire mod organizare' : '↕️ Ordonează produse'}
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleOpenBulkPrice} disabled={actionsDisabled || selectedProducts.length === 0}>
                🔁 Actualizează preț / TVA
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleOpenClone} disabled={actionsDisabled || !selectedMenuProduct}>
                🧬 Clonează produs
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleOpenPriceHistory} disabled={actionsDisabled || !selectedMenuProduct}>
                📈 Istoric preț
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleOpenMessages} disabled={actionsDisabled || !selectedMenuProduct}>
                💬 Trimite alertă
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleDeleteProducts} disabled={actionsDisabled || selectedProducts.length === 0 || deletingProducts}>
                🗑️ Șterge produse
              </button>
              <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleExport}>
                📤 Export CSV
              </button>
              <button type="button" className="catalog-btn catalog-btn--primary" onClick={handleAddProduct}>
                ➕ Adaugă produs
              </button>
            </div>
          </section>

          {reorderMode ? (<div className="catalog-reorder-banner" role="status" aria-live="polite">
              <div>
                <strong>Mod organizare activ</strong>
                <p>
                  Trage rândurile pentru a schimba ordinea produselor din categoria „{reorderCategoryName}”. Salvează
                  modificările pentru a actualiza meniurile și PDF-urile.
                </p>
              </div>
              <div className="catalog-reorder-banner__actions">
                <button type="button" className="catalog-btn catalog-btn--primary" onClick={handleSaveReorder} disabled={reorderSaving || !reorderDirty}>
                  {reorderSaving ? 'Se salvează…' : '💾 Salvează ordinea'}
                </button>
                <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleCancelReorder} disabled={reorderSaving}>Renunță</button>
              </div>
            </div>) : null}

          <div className="catalog-feedback">
            {feedback ? (<InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Informație'} message={feedback.message}/>) : null}
            {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}
            {categoriesError ? <InlineAlert_1.InlineAlert variant="error" title="Categorie" message={categoriesError}/> : null}
          </div>

          <section className="catalog-grid-panel">
            <header>
              <div>
                <h3>lista completa de produse</h3>
                <p>{"".concat(totalProducts, " produse gestionate \u00B7 ").concat(withRecipe, " cu re\u021Bet\u0103")}</p>
              </div>
              <div className="catalog-selection">
                {selectedProduct
            ? "Produs selectat: ".concat(selectedProduct.name)
            : selectedProducts.length > 1
                ? "".concat(selectedProducts.length, " produse selectate pentru ac\u021Biuni \u00EEn mas\u0103.")
                : 'Selectează produse din tabel pentru acțiuni rapide (bulk preț, clonare, istoric, alertă).'}
              </div>
              <div className="catalog-grid-actions">
                <button type="button" className="catalog-btn catalog-btn--outline">
                  Export Excel
                </button>
                <button type="button" className="catalog-btn catalog-btn--outline">
                  Export PDF meniuri
                </button>
                <button type="button" className="catalog-btn catalog-btn--outline">genereaza qr</button>
              </div>
            </header>
            <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={displayedRowData} loading={loading} quickFilterText={quickFilter} height="60vh" rowSelection="multiple" gridOptions={gridOptions} onGridReady={handleGridReady} agGridProps={{
            onCellClicked: handleCellClicked,
            onRowDoubleClicked: handleRowDoubleClicked,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
            rowDragManaged: reorderMode,
            suppressMoveWhenRowDragging: reorderMode,
            rowSelection: reorderMode ? { mode: 'multiRow', enableClickSelection: false } : undefined,
            onRowDragEnd: reorderMode ? handleRowDragEnd : undefined,
        }} onSelectedRowsChange={handleSelectionChange}/>
          </section>

          <section className="catalog-secondary">
            {chefViewActive ? (<article className="catalog-secondary__card catalog-chef-panel" aria-live="polite">
                <header>
                  <div>
                    <span>Vizualizare chef</span>
                    <strong>{selectedProduct ? selectedProduct.name : 'Selectează un produs'}</strong>
                  </div>
                  <div className="catalog-chef-panel__header-actions">
                    <button type="button" className="catalog-btn catalog-btn--ghost" onClick={handleChefRefresh} disabled={!selectedProduct || chefSummaryLoading}>
                      ⟳ Reîmprospătează
                    </button>
                  </div>
                </header>

                {chefStats ? (<ul className="catalog-chef-panel__stats">
                    <li>
                      <span>cu cost calculat</span>
                      <strong>
                        {chefStats.withCost}/{chefStats.total}
                      </strong>
                    </li>
                    <li>
                      <span>retete lipsa</span>
                      <strong>{chefStats.missingRecipe}</strong>
                    </li>
                    <li>
                      <span>Marjă ≤ 0</span>
                      <strong>{chefStats.lowMargin}</strong>
                    </li>
                  </ul>) : null}

                <div className="catalog-chef-panel__metrics">
                  <div>
                    <span>cost reteta</span>
                    <strong>
                      {(chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.costPrice) !== null && (chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.costPrice) !== undefined
                ? formatPrice(Number(chefSummary.costPrice))
                : '—'}
                    </strong>
                    {(chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.costLastUpdated) ? (<small>Actualizat: {formatDateTime(chefSummary.costLastUpdated)}</small>) : null}
                  </div>
                  <div>
                    <span>Marjă</span>
                    <strong>{chefMarginText}</strong>
                  </div>
                  <div>
                    <span>status reteta</span>
                    <strong>{((_e = chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.hasRecipe) !== null && _e !== void 0 ? _e : selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.has_recipe) ? 'Completă' : 'Lipsește'}</strong>
                    {((_f = chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.recipe) === null || _f === void 0 ? void 0 : _f.updated_at) ? (<small>Ultima actualizare: {formatDateTime(chefSummary.recipe.updated_at)}</small>) : null}
                  </div>
                  <div>
                    <span>alergeni monitorizati</span>
                    <strong>{allergensForPanel.length ? allergensForPanel.length : '—'}</strong>
                  </div>
                </div>

                <div className="catalog-chef-panel__details">
                  {!selectedProduct ? (<p>selecteaza un produs din tabel pentru a vedea cost</p>) : chefSummaryLoading ? (<p>se incarca detaliile pentru chef</p>) : chefSummaryError ? (<InlineAlert_1.InlineAlert variant="error" message={chefSummaryError}/>) : (<>
                      <div className="catalog-chef-panel__chips">
                        {allergensForPanel.length ? (allergensForPanel.map(function (allergen) { return (<span key={allergen} className="catalog-chef-badge">
                              {allergen}
                            </span>); })) : (<span className="catalog-chef-panel__muted">fara alergeni declarati</span>)}
                      </div>
                      <div className="catalog-chef-panel__list">
                        <span>Ingrediente cheie</span>
                        {ingredientsForPanel.length ? (<ul>
                            {ingredientsForPanel.slice(0, 6).map(function (ingredient) { return (<li key={ingredient}>{ingredient}</li>); })}
                          </ul>) : (<p className="catalog-chef-panel__muted">nu exista ingrediente detaliate</p>)}
                      </div>
                      {(chefSummary === null || chefSummary === void 0 ? void 0 : chefSummary.portion) ? (<p className="catalog-chef-panel__muted">
                          Porție standard: {(_g = chefSummary.portion.quantity) !== null && _g !== void 0 ? _g : 'n/a'} {(_h = chefSummary.portion.unit) !== null && _h !== void 0 ? _h : ''}
                        </p>) : null}
                    </>)}
                </div>
              </article>) : null}

            <article className="catalog-secondary__card">
              <header>
                <span>Meniuri digitale</span>
                <button type="button" className="catalog-link-button">
                  Deschide manager meniuri →
                </button>
              </header>
              <ul>
                <li>
                  <strong>Română</strong>
                  <span>Synchronizat · 2 PDF-uri active</span>
                </li>
                <li>
                  <strong>Engleză</strong>
                  <span>in curs de actualizare</span>
                </li>
                <li>
                  <strong>QRCodes</strong>
                  <span>3 locații generate</span>
                </li>
              </ul>
            </article>

            <article className="catalog-secondary__card">
              <header>
                <span>fluxuri automate</span>
                <button type="button" className="catalog-link-button">
                  Configurează workflow →
                </button>
              </header>
              <ul>
                <li>
                  <strong>Sync GPT Bridge</strong>
                  <span>Online · modul Safe</span>
                </li>
                <li>
                  <strong>Regenerare PDF</strong>
                  <span>Programat zilnic 03:00</span>
                </li>
                <li>
                  <strong>actualizare preturi</strong>
                  <span>Ultima modificare acum 15 min</span>
                </li>
              </ul>
            </article>
          </section>
        </div>
      </div>

      <ProductEditorModal_1.ProductEditorModal open={editorOpen} product={editingProduct} onClose={function () { return setEditorOpen(false); }} onSaved={function () { return refetch(); }}/>

      <CloneProductModal_1.CloneProductModal open={cloneModalOpen} product={selectedMenuProduct} onClose={function () { return setCloneModalOpen(false); }} onCloned={function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var newName = _b.newName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setCloneModalOpen(false);
                        setFeedback({ type: 'success', message: "Produsul \u201C".concat(newName, "\u201D a fost clonat \u00EEn catalog.") });
                        setSelectedProducts([]);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <PriceHistoryModal_1.PriceHistoryModal open={priceHistoryModalOpen} product={selectedMenuProduct} onClose={function () { return setPriceHistoryModalOpen(false); }}/>

      <ProductMessagesModal_1.ProductMessagesModal open={messagesModalOpen} product={selectedMenuProduct} onClose={function () { return setMessagesModalOpen(false); }} onMessageSent={function (message) {
            setFeedback({ type: 'success', message: message });
        }}/>

      <BulkPriceModal_1.BulkPriceModal open={bulkModalOpen} productCount={selectedProducts.length} productIds={selectedProducts.map(function (item) { return item.id; })} onClose={function () { return setBulkModalOpen(false); }} onApplied={function (updatedCount, newPrice, newVatRate) { return __awaiter(void 0, void 0, void 0, function () {
            var parts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parts = ["Au fost actualizate ".concat(updatedCount, " produse.")];
                        if (typeof newPrice === 'number') {
                            parts.push("Pre\u021B nou: ".concat(newPrice.toFixed(2), " RON."));
                        }
                        if (typeof newVatRate === 'number') {
                            parts.push("TVA nou: ".concat(newVatRate, "%"));
                        }
                        setFeedback({ type: 'success', message: parts.join(' ') });
                        setBulkModalOpen(false);
                        setSelectedProducts([]);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <CategoryModal_1.CategoryModal open={categoryModalState.open} categories={categories} initialCategory={categoryModalState.mode === 'edit' ? (_j = categoryModalState.category) !== null && _j !== void 0 ? _j : undefined : undefined} parentId={categoryModalState.mode === 'create' ? categoryModalState.parentId : null} onClose={closeCategoryModal} onSubmit={handleCategorySubmit}/>

      <CategoryDeleteModal_1.CategoryDeleteModal open={categoryDeleteState.open} categoryName={(_k = categoryDeleteState.category) === null || _k === void 0 ? void 0 : _k.name} productCount={(_l = categoryDeleteState.category) === null || _l === void 0 ? void 0 : _l.product_count} loading={categoryActionLoading} error={deleteCategoryError} onClose={closeDeleteCategoryModal} onConfirm={handleConfirmDeleteCategory}/>
    </div>);
};
exports.CatalogPage = CatalogPage;
