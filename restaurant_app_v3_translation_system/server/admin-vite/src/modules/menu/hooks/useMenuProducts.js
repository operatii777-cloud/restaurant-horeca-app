"use strict";
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
exports.useMenuProducts = useMenuProducts;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899', '#facc15'];
var buildEndpoint = function (category) {
    if (!category || category.trim() === '') {
        return '/api/admin/menu';
    }
    var searchParams = new URLSearchParams({ category: category.trim() });
    return "/api/admin/menu?".concat(searchParams.toString());
};
var sortProducts = function (products) {
    return __spreadArray([], products, true).sort(function (a, b) {
        var _a, _b, _c, _d, _e, _f;
        var categoryCompare = ((_a = a.category) !== null && _a !== void 0 ? _a : '').localeCompare((_b = b.category) !== null && _b !== void 0 ? _b : '', 'ro-RO', {
            sensitivity: 'base',
        });
        if (categoryCompare !== 0) {
            return categoryCompare;
        }
        var aDisplay = (_c = a.display_order) !== null && _c !== void 0 ? _c : Number.MAX_SAFE_INTEGER;
        var bDisplay = (_d = b.display_order) !== null && _d !== void 0 ? _d : Number.MAX_SAFE_INTEGER;
        if (aDisplay !== bDisplay) {
            return aDisplay - bDisplay;
        }
        return ((_e = a.name) !== null && _e !== void 0 ? _e : '').localeCompare((_f = b.name) !== null && _f !== void 0 ? _f : '', 'ro-RO', { sensitivity: 'base' });
    });
};
var buildAnalytics = function (products) {
    var totalProducts = products.length;
    if (totalProducts === 0) {
        return {
            totalProducts: 0,
            vegetarianCount: 0,
            spicyCount: 0,
            takeoutOnlyCount: 0,
            averagePrice: 0,
            topCategories: [],
            topPricedProducts: [],
        };
    }
    var vegetarianCount = products.filter(function (item) { return item.is_vegetarian === 1 || item.is_vegetarian === true; }).length;
    var spicyCount = products.filter(function (item) { return item.is_spicy === 1 || item.is_spicy === true; }).length;
    var takeoutOnlyCount = products.filter(function (item) { return item.is_takeout_only === 1 || item.is_takeout_only === true; }).length;
    var averagePrice = products.reduce(function (sum, item) {
        var _a;
        var price = Number((_a = item.price) !== null && _a !== void 0 ? _a : 0);
        return sum + (Number.isFinite(price) ? price : 0);
    }, 0) / totalProducts;
    var categoryMap = new Map();
    products.forEach(function (product) {
        var _a, _b;
        var category = (_a = product.category) === null || _a === void 0 ? void 0 : _a.trim();
        if (!category)
            return;
        categoryMap.set(category, ((_b = categoryMap.get(category)) !== null && _b !== void 0 ? _b : 0) + 1);
    });
    var topCategories = Array.from(categoryMap.entries())
        .sort(function (a, b) { return b[1] - a[1]; })
        .slice(0, 6)
        .map(function (_a, index) {
        var name = _a[0], count = _a[1];
        return ({
            name: name,
            raw: count,
            value: Number(((count / totalProducts) * 100).toFixed(1)),
            color: palette[index % palette.length],
        });
    });
    var topPricedProducts = __spreadArray([], products, true).filter(function (item) { return Number.isFinite(item.price); })
        .sort(function (a, b) { var _a, _b; return Number((_a = b.price) !== null && _a !== void 0 ? _a : 0) - Number((_b = a.price) !== null && _b !== void 0 ? _b : 0); })
        .slice(0, 6)
        .map(function (product) {
        var _a, _b;
        return ({
            label: product.name && product.name.length > 16 ? "".concat(product.name.slice(0, 15), "\u2026") : (_a = product.name) !== null && _a !== void 0 ? _a : '',
            value: Number(((_b = product.price) !== null && _b !== void 0 ? _b : 0).toFixed(2)),
        });
    });
    return {
        totalProducts: totalProducts,
        vegetarianCount: vegetarianCount,
        spicyCount: spicyCount,
        takeoutOnlyCount: takeoutOnlyCount,
        averagePrice: Number(averagePrice.toFixed(2)),
        topCategories: topCategories,
        topPricedProducts: topPricedProducts,
    };
};
function useMenuProducts(category) {
    var endpoint = (0, react_1.useMemo)(function () { return buildEndpoint(category); }, [category]);
    var _a = (0, useApiQuery_1.useApiQuery)(endpoint), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var products = (0, react_1.useMemo)(function () {
        if (!Array.isArray(data)) {
            return [];
        }
        return sortProducts(data);
    }, [data]);
    var analytics = (0, react_1.useMemo)(function () { return buildAnalytics(products); }, [products]);
    return {
        products: products,
        analytics: analytics,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
