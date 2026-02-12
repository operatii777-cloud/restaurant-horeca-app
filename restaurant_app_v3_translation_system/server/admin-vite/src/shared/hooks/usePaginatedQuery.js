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
exports.usePaginatedQuery = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var DEFAULT_PAGE_SIZE = 25;
var normalizeData = function (payload) {
    if (!payload)
        return [];
    if (Array.isArray(payload))
        return payload;
    if (payload.data && Array.isArray(payload.data))
        return payload.data;
    if (payload.items && Array.isArray(payload.items))
        return payload.items;
    return [];
};
var usePaginatedQuery = function (_a) {
    var endpoint = _a.endpoint, _b = _a.initialPage, initialPage = _b === void 0 ? 1 : _b, _c = _a.initialPageSize, initialPageSize = _c === void 0 ? DEFAULT_PAGE_SIZE : _c, initialParams = _a.initialParams;
    var _d = (0, react_1.useState)([]), data = _d[0], setData = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(initialPage), page = _g[0], setPage = _g[1];
    var _h = (0, react_1.useState)(initialPageSize), pageSize = _h[0], setPageSize = _h[1];
    var _j = (0, react_1.useState)(0), total = _j[0], setTotal = _j[1];
    var _k = (0, react_1.useState)(0), totalPages = _k[0], setTotalPages = _k[1];
    var _l = (0, react_1.useState)((initialParams !== null && initialParams !== void 0 ? initialParams : {})), params = _l[0], setParamsState = _l[1];
    var normalisedEndpoint = (0, react_1.useMemo)(function () { var _a; return (_a = endpoint === null || endpoint === void 0 ? void 0 : endpoint.trim()) !== null && _a !== void 0 ? _a : null; }, [endpoint]);
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, payload, extracted, meta, err_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!normalisedEndpoint) {
                        setData([]);
                        setTotal(0);
                        setTotalPages(0);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get(normalisedEndpoint, {
                            params: __assign({ page: page, pageSize: pageSize }, params),
                        })];
                case 2:
                    response = _a.sent();
                    payload = response.data;
                    extracted = normalizeData(payload);
                    setData(extracted);
                    if (payload && !Array.isArray(payload)) {
                        meta = payload;
                        setTotal(typeof meta.total === 'number' ? meta.total : extracted.length);
                        setTotalPages(typeof meta.totalPages === 'number'
                            ? meta.totalPages
                            : Math.max(1, Math.ceil((typeof meta.total === 'number' ? meta.total : extracted.length) / pageSize)));
                    }
                    else {
                        setTotal(extracted.length);
                        setTotalPages(1);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('usePaginatedQuery Request failed:', err_1);
                    message = err_1 instanceof Error ? err_1.message : 'Eroare necunoscută';
                    setError(message);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [normalisedEndpoint, page, pageSize, params]);
    (0, react_1.useEffect)(function () {
        fetchData();
    }, [fetchData]);
    var refresh = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchData()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [fetchData]);
    var updateParams = (0, react_1.useCallback)(function (updater) {
        setPage(1);
        setParamsState(function (current) { return updater(current); });
    }, []);
    var updatePageSize = (0, react_1.useCallback)(function (nextSize) {
        setPage(1);
        setPageSize(nextSize);
    }, []);
    return {
        data: data,
        loading: loading,
        error: error,
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: totalPages,
        params: params,
        setPage: setPage,
        setPageSize: updatePageSize,
        setParams: updateParams,
        refresh: refresh,
    };
};
exports.usePaginatedQuery = usePaginatedQuery;
