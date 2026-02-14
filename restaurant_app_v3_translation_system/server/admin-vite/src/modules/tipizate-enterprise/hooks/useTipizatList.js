"use strict";
/**
 * PHASE S5.7 - useTipizatList Hook
 * Enterprise list hook for all tipizate documents
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
exports.useTipizatList = useTipizatList;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var tipizateApi_1 = require("../api/tipizateApi");
var tipizate_config_1 = require("../config/tipizate.config");
var tipizateStore_1 = require("../store/tipizateStore");
function useTipizatList(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var type = _a.type, _f = _a.initialFilters, initialFilters = _f === void 0 ? {} : _f;
    var store = (0, tipizateStore_1.useTipizateStore)();
    // Load filters from store or use initial
    var storeFilters = store.filters[type] || {};
    var _g = (0, react_1.useState)(storeFilters || initialFilters), filters = _g[0], setFiltersState = _g[1];
    var _h = (0, react_1.useState)(0), page = _h[0], setPage = _h[1];
    var _j = (0, react_1.useState)(store.ui.pageSize || 50), pageSize = _j[0], setPageSize = _j[1];
    // Sync filters with store
    (0, react_1.useEffect)(function () {
        if (Object.keys(filters).length > 0) {
            store.setFilters(type, filters);
        }
    }, [filters, type, store]);
    // Check cache first
    var cachedData = store.listCache[type];
    var query = (0, react_query_1.useQuery)({
        queryKey: ['tipizate', type, 'list', filters, page, pageSize, store.reloadToken],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: page + 1, // API expects 1-based
                            pageSize: pageSize,
                        };
                        if (filters.fromDate) {
                            params.from = filters.fromDate;
                        }
                        if (filters.toDate) {
                            params.to = filters.toDate;
                        }
                        if (filters.status) {
                            params.status = filters.status;
                        }
                        if (filters.locationId) {
                            params.locationId = filters.locationId;
                        }
                        return [4 /*yield*/, tipizateApi_1.tipizateApi.list(type, params)];
                    case 1:
                        data = _a.sent();
                        // Cache the result
                        store.setListCache(type, { data: data, timestamp: Date.now() });
                        return [2 /*return*/, data];
                }
            });
        }); },
        staleTime: 30000, // 30 seconds
        initialData: cachedData === null || cachedData === void 0 ? void 0 : cachedData.data,
    });
    var setFilters = function (newFilters) {
        setFiltersState(newFilters || {});
        setPage(0); // Reset to first page when filters change
        store.setFilters(type, newFilters || {});
    };
    var refetch = function () {
        query.refetch();
    };
    // Handle both array and paginated response
    var rows = Array.isArray(query.data) ? query.data : ((_b = query.data) === null || _b === void 0 ? void 0 : _b.items) || ((_c = query.data) === null || _c === void 0 ? void 0 : _c.data) || [];
    var total = ((_d = query.data) === null || _d === void 0 ? void 0 : _d.total) || ((_e = query.data) === null || _e === void 0 ? void 0 : _e.count) || rows.length;
    return {
        type: type,
        name: (0, tipizate_config_1.nameFor)(type),
        filters: filters,
        setFilters: setFilters,
        rows: rows,
        isLoading: query.isLoading,
        error: query.error,
        refetch: refetch,
        pagination: {
            page: page,
            pageSize: pageSize,
            total: total,
        },
        setPage: setPage,
        setPageSize: setPageSize,
    };
}
