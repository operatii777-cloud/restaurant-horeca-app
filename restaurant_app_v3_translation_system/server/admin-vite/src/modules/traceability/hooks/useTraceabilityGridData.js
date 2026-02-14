"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTraceabilityGridData = exports.getTraceabilityRecordStats = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useSearchFilter_1 = require("@/shared/hooks/useSearchFilter");
var getTraceabilityRecordStats = function (records) {
    if (!records || records.length === 0) {
        return {
            totalRecords: 0,
            paid: 0,
            unpaid: 0,
            totalQuantityUsed: 0,
            uniqueOrders: 0,
            suppliers: 0,
        };
    }
    var paid = records.filter(function (item) { return item.is_paid === true || item.is_paid === 1; }).length;
    var unpaid = records.length - paid;
    var totalQuantityUsed = records.reduce(function (sum, record) { var _a; return sum + ((_a = record.quantity_used) !== null && _a !== void 0 ? _a : 0); }, 0);
    var uniqueOrders = new Set(records.map(function (item) { return item.order_id; })).size;
    var suppliers = new Set(records.map(function (item) { return item.supplier; }).filter(Boolean)).size;
    return {
        totalRecords: records.length,
        paid: paid,
        unpaid: unpaid,
        totalQuantityUsed: totalQuantityUsed,
        uniqueOrders: uniqueOrders,
        suppliers: suppliers,
    };
};
exports.getTraceabilityRecordStats = getTraceabilityRecordStats;
var useTraceabilityGridData = function (searchTerm) {
    var _a = (0, useApiQuery_1.useApiQuery)('/api/ingredients'), ingredientsData = _a.data, ingredientsLoading = _a.loading, ingredientsError = _a.error, refetchIngredients = _a.refetch;
    var ingredients = (0, react_1.useMemo)(function () { return ingredientsData !== null && ingredientsData !== void 0 ? ingredientsData : []; }, [ingredientsData]);
    var selectors = (0, react_1.useMemo)(function () { return [
        function (item) { var _a; return (_a = item.name) !== null && _a !== void 0 ? _a : ''; },
        function (item) { var _a; return (_a = item.category) !== null && _a !== void 0 ? _a : ''; },
        function (item) { var _a; return (_a = item.unit) !== null && _a !== void 0 ? _a : ''; },
        function (item) { var _a; return (_a = item.supplier) !== null && _a !== void 0 ? _a : ''; },
    ]; }, []);
    var filteredIngredients = (0, useSearchFilter_1.useSearchFilter)(ingredients, searchTerm, selectors);
    var stats = (0, react_1.useMemo)(function () {
        var totalIngredients = ingredients.length;
        var trackedWithLots = ingredients.filter(function (ingredient) { var _a; return Number((_a = ingredient.current_stock) !== null && _a !== void 0 ? _a : 0) > 0; }).length;
        var belowSafetyStock = ingredients.filter(function (ingredient) {
            var _a, _b;
            var current = Number((_a = ingredient.current_stock) !== null && _a !== void 0 ? _a : 0);
            var min = Number((_b = ingredient.min_stock) !== null && _b !== void 0 ? _b : 0);
            return min > 0 && current <= min;
        }).length;
        return {
            totalIngredients: totalIngredients,
            trackedWithLots: trackedWithLots,
            belowSafetyStock: belowSafetyStock,
        };
    }, [ingredients]);
    return {
        ingredients: ingredients,
        filteredIngredients: filteredIngredients,
        ingredientsLoading: ingredientsLoading,
        ingredientsError: ingredientsError,
        refetchIngredients: refetchIngredients,
        stats: stats,
    };
};
exports.useTraceabilityGridData = useTraceabilityGridData;
