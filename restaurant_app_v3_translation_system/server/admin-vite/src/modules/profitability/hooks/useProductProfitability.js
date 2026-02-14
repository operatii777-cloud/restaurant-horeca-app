"use strict";
/**
 * S14 - Hook pentru Product Profitability
 * Fetch și transformă datele din /api/cogs/product-profitability
 */
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
exports.useProductProfitability = void 0;
var react_1 = require("react");
var profitabilityApi_1 = require("../api/profitabilityApi");
var profitabilityMappers_1 = require("../utils/profitabilityMappers");
var useProductProfitability = function (filters) {
    if (filters === void 0) { filters = {}; }
    var _a = (0, react_1.useState)([]), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var products, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, profitabilityApi_1.getProductProfitability)(filters)];
                case 2:
                    products = _c.sent();
                    setData(products);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('Error fetching product profitability:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea datelor');
                    setData([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filters.dateFrom, filters.dateTo, filters.productId, filters.categoryCode]);
    (0, react_1.useEffect)(function () {
        fetchData();
    }, [fetchData]);
    var tableRows = (0, profitabilityMappers_1.mapProductProfitabilityToTable)(data);
    var barChartData = (0, profitabilityMappers_1.mapProductProfitabilityToBarChart)(data, 10);
    // Calculează statistici
    var stats = {
        totalProducts: data.length,
        avgFoodCostPercent: data.length > 0
            ? data.reduce(function (sum, p) { return sum + (p.foodCostPercent || 0); }, 0) / data.length
            : 0,
        avgMarginPercent: data.length > 0
            ? data.reduce(function (sum, p) { return sum + (p.marginPercent || 0); }, 0) / data.length
            : 0,
        totalRevenue: data.reduce(function (sum, p) { return sum + (p.revenue || 0); }, 0),
        totalProfit: data.reduce(function (sum, p) { return sum + (p.profit || 0); }, 0),
        alertsCount: data.filter(function (p) { return (p.foodCostPercent || 0) > 35; }).length,
    };
    return {
        data: data,
        tableRows: tableRows,
        barChartData: barChartData,
        loading: loading,
        error: error,
        refetch: fetchData,
        stats: stats,
    };
};
exports.useProductProfitability = useProductProfitability;
