"use strict";
/**
 * S14 - Profitability Mappers
 * Transformă datele S13 API în formate pentru UI (charts, tables, KPI cards)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAlerts = exports.computeKpiBlocks = exports.mapProductProfitabilityToTable = exports.mapProductProfitabilityToBarChart = exports.mapCategoryProfitabilityToPie = exports.mapDailySummaryToChartData = void 0;
/**
 * Mapează daily summary în format pentru line chart
 */
var mapDailySummaryToChartData = function (summary) {
    return summary.map(function (item) { return ({
        label: new Date(item.day).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
        }),
        revenue: item.revenue || 0,
        cogs: item.cogsTotal || 0,
        profit: item.profit || 0,
        foodCostPercent: item.foodCostPercent || 0,
        marginPercent: item.marginPercent || 0,
    }); });
};
exports.mapDailySummaryToChartData = mapDailySummaryToChartData;
var mapCategoryProfitabilityToPie = function (categories) {
    return categories.map(function (cat) { return ({
        name: cat.categoryName || cat.categoryCode || 'Necategorizat',
        value: cat.revenue || 0,
        revenue: cat.revenue || 0,
        cogs: cat.cogsTotal || 0,
        profit: cat.profit || 0,
        foodCostPercent: cat.foodCostPercent || 0,
    }); });
};
exports.mapCategoryProfitabilityToPie = mapCategoryProfitabilityToPie;
var mapProductProfitabilityToBarChart = function (products, limit) {
    if (limit === void 0) { limit = 10; }
    return products
        .sort(function (a, b) { return (b.profit || 0) - (a.profit || 0); })
        .slice(0, limit)
        .map(function (product) { return ({
        name: product.productName,
        revenue: product.revenue || 0,
        profit: product.profit || 0,
        foodCostPercent: product.foodCostPercent || 0,
    }); });
};
exports.mapProductProfitabilityToBarChart = mapProductProfitabilityToBarChart;
/**
 * Mapează product profitability în format pentru AG Grid
 */
var mapProductProfitabilityToTable = function (products) {
    return products.map(function (product) { return ({
        productId: product.productId,
        productName: product.productName,
        category: product.category || 'Necategorizat',
        quantity: product.quantity || 0,
        revenue: product.revenue || 0,
        cogsTotal: product.cogsTotal || 0,
        profit: product.profit || 0,
        foodCostPercent: product.foodCostPercent || 0,
        marginPercent: product.marginPercent || 0,
    }); });
};
exports.mapProductProfitabilityToTable = mapProductProfitabilityToTable;
/**
 * Calculează KPI blocks din daily summary
 */
var computeKpiBlocks = function (summary) {
    var totalRevenue = summary.reduce(function (sum, item) { return sum + (item.revenue || 0); }, 0);
    var totalCogs = summary.reduce(function (sum, item) { return sum + (item.cogsTotal || 0); }, 0);
    var grossProfit = totalRevenue - totalCogs;
    var avgFoodCostPercent = summary.length > 0
        ? summary.reduce(function (sum, item) { return sum + (item.foodCostPercent || 0); }, 0) / summary.length
        : 0;
    var avgMarginPercent = summary.length > 0
        ? summary.reduce(function (sum, item) { return sum + (item.marginPercent || 0); }, 0) / summary.length
        : 0;
    // Compară cu perioada anterioară (simplificat - ar putea fi îmbunătățit)
    var prevPeriodRevenue = summary.length > 7 ? summary.slice(0, -7).reduce(function (sum, item) { return sum + (item.revenue || 0); }, 0) : 0;
    var revenueTrend = prevPeriodRevenue > 0
        ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue * 100).toFixed(1)
        : '0';
    return {
        totalRevenue: {
            title: 'Total Revenue',
            value: "".concat(totalRevenue.toFixed(2), " RON"),
            subtitle: "".concat(summary.length, " zile"),
            trend: {
                value: "".concat(revenueTrend, "%"),
                isPositive: parseFloat(revenueTrend) >= 0,
            },
            color: 'blue',
        },
        totalCogs: {
            title: 'Total COGS',
            value: "".concat(totalCogs.toFixed(2), " RON"),
            subtitle: 'Costul mărfii vândute',
            color: 'orange',
        },
        grossProfit: {
            title: 'Gross Profit',
            value: "".concat(grossProfit.toFixed(2), " RON"),
            subtitle: 'Profit brut',
            color: 'green',
        },
        avgFoodCostPercent: {
            title: 'Food Cost %',
            value: "".concat(avgFoodCostPercent.toFixed(1), "%"),
            subtitle: 'Medie perioadă',
            color: avgFoodCostPercent > 35 ? 'red' : avgFoodCostPercent > 30 ? 'orange' : 'green',
        },
        avgMarginPercent: {
            title: 'Margin %',
            value: "".concat(avgMarginPercent.toFixed(1), "%"),
            subtitle: 'Medie perioadă',
            color: avgMarginPercent < 50 ? 'orange' : 'green',
        },
    };
};
exports.computeKpiBlocks = computeKpiBlocks;
/**
 * Generează alerts din datele de profitabilitate
 */
var computeAlerts = function (products, categories, dailySummary) {
    var alerts = [];
    // Alerts pentru produse cu food cost > 40%
    products
        .filter(function (p) { return (p.foodCostPercent || 0) > 40; })
        .slice(0, 5)
        .forEach(function (product) {
        var _a;
        alerts.push({
            type: 'high_food_cost',
            severity: 'danger',
            title: 'Food Cost Ridicat',
            message: "".concat(product.productName, " are food cost ").concat((_a = product.foodCostPercent) === null || _a === void 0 ? void 0 : _a.toFixed(1), "%"),
            productId: product.productId,
        });
    });
    // Alerts pentru produse cu marjă < 20%
    products
        .filter(function (p) { return (p.marginPercent || 0) < 20 && (p.revenue || 0) > 0; })
        .slice(0, 3)
        .forEach(function (product) {
        var _a;
        alerts.push({
            type: 'low_margin',
            severity: 'warning',
            title: 'Marjă Scăzută',
            message: "".concat(product.productName, " are marj\u0103 ").concat((_a = product.marginPercent) === null || _a === void 0 ? void 0 : _a.toFixed(1), "%"),
            productId: product.productId,
        });
    });
    // Alerts pentru categorii cu food cost ridicat
    categories
        .filter(function (c) { return (c.foodCostPercent || 0) > 40; })
        .forEach(function (category) {
        var _a;
        alerts.push({
            type: 'category_alert',
            severity: 'warning',
            title: 'Categorie cu Food Cost Ridicat',
            message: "".concat(category.categoryName, " are food cost ").concat((_a = category.foodCostPercent) === null || _a === void 0 ? void 0 : _a.toFixed(1), "%"),
            categoryCode: category.categoryCode,
        });
    });
    // Alerts pentru spike-uri COGS (zile cu food cost > 50%)
    dailySummary
        .filter(function (d) { return (d.foodCostPercent || 0) > 50; })
        .forEach(function (day) {
        var _a;
        alerts.push({
            type: 'spike_cogs',
            severity: 'danger',
            title: 'Spike COGS',
            message: "Ziua ".concat(day.day, " are food cost ").concat((_a = day.foodCostPercent) === null || _a === void 0 ? void 0 : _a.toFixed(1), "%"),
            day: day.day,
        });
    });
    return alerts;
};
exports.computeAlerts = computeAlerts;
