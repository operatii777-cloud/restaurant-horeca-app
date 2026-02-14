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
exports.useReservations = useReservations;
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var DEFAULT_LIMIT = 5000;
function normaliseFilters(filters) {
    var cleaned = __assign({}, filters);
    if (cleaned.search) {
        cleaned.search = cleaned.search.trim();
    }
    // Elimină statuses dacă este undefined, null sau array gol
    if (!cleaned.statuses || (Array.isArray(cleaned.statuses) && cleaned.statuses.length === 0)) {
        delete cleaned.statuses;
    }
    else if (Array.isArray(cleaned.statuses)) {
        cleaned.statuses = cleaned.statuses.filter(Boolean);
        if (cleaned.statuses.length === 0) {
            delete cleaned.statuses;
        }
    }
    if (!cleaned.tableId) {
        delete cleaned.tableId;
    }
    // Elimină datele goale
    if (!cleaned.startDate) {
        delete cleaned.startDate;
    }
    if (!cleaned.endDate) {
        delete cleaned.endDate;
    }
    return cleaned;
}
function getDefaultFilters() {
    // ✅ Implicit, includem TOATE rezervările (inclusiv cancelled și no_show)
    return {
        includeCancelled: true,
        // NU setăm statuses, startDate sau endDate pentru a vedea TOTUL
    };
}
function useReservations(options) {
    var _this = this;
    var _a;
    if (options === void 0) { options = {}; }
    var _b = (0, react_1.useState)(function () {
        var defaultFilters = getDefaultFilters();
        return __assign(__assign({}, defaultFilters), options.initialFilters);
    }), filters = _b[0], setFiltersState = _b[1];
    var _c = (0, react_1.useState)({
        limit: (_a = options.initialLimit) !== null && _a !== void 0 ? _a : DEFAULT_LIMIT,
        offset: 0,
    }), pagination = _c[0], setPaginationState = _c[1];
    var _d = (0, react_1.useState)([]), reservations = _d[0], setReservations = _d[1];
    var _e = (0, react_1.useState)(null), meta = _e[0], setMeta = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var fetchReservations = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var url, params, shouldIncludeCancelled, fullUrl, response, payload, reservations_1, statusCounts, cancelledOrNoShow, err_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    url = '/api/reservations';
                    params = new URLSearchParams();
                    // Adaugă filtre doar dacă sunt explicit setate (identic cu admin.html)
                    if (filters.startDate) {
                        params.append('date', filters.startDate);
                    }
                    // Adaugă status doar dacă este explicit setat
                    if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
                        params.append('status', filters.statuses.join(','));
                    }
                    if (filters.search)
                        params.append('search', filters.search);
                    if (filters.tableId)
                        params.append('tableId', String(filters.tableId));
                    if (filters.customerPhone)
                        params.append('customerPhone', filters.customerPhone);
                    shouldIncludeCancelled = filters.includeCancelled !== undefined ? filters.includeCancelled : true;
                    params.append('includeCancelled', shouldIncludeCancelled ? 'true' : 'false');
                    params.append('includeAllLocations', 'true');
                    params.append('limit', String(pagination.limit));
                    params.append('offset', String(pagination.offset));
                    console.log('useReservations Parametri pentru TOATE rezervările:', {
                        includeCancelled: shouldIncludeCancelled,
                        includeAllLocations: true,
                        limit: pagination.limit,
                        offset: pagination.offset,
                    });
                    fullUrl = params.toString() ? "".concat(url, "?").concat(params.toString()) : url;
                    console.log('useReservations Fetching (legacy endpoint):', fullUrl);
                    return [4 /*yield*/, httpClient_1.httpClient.get(fullUrl)];
                case 2:
                    response = _a.sent();
                    payload = response.data;
                    reservations_1 = Array.isArray(payload) ? payload : [];
                    console.log('useReservations Loaded reservations (legacy):', reservations_1.length);
                    statusCounts = reservations_1.reduce(function (acc, r) {
                        acc[r.status] = (acc[r.status] || 0) + 1;
                        return acc;
                    }, {});
                    console.log('📊 Status distribution:', statusCounts);
                    // 🔍 DEBUG: Afișează TOATE rezervările pentru a vedea ce lipsește
                    console.log('DEBUG Toate rezervările primite:');
                    reservations_1.forEach(function (r, idx) {
                        console.log("  ".concat(idx + 1, ". ID: ").concat(r.id, ", Nume: ").concat(r.customer_name, ", Status: ").concat(r.status, ", Data: ").concat(r.reservation_date));
                    });
                    cancelledOrNoShow = reservations_1.filter(function (r) { return r.status === 'cancelled' || r.status === 'no_show'; });
                    console.log("\uD83D\uDD0D Rezerv\u0103ri cancelled/no_show: ".concat(cancelledOrNoShow.length));
                    if (cancelledOrNoShow.length > 0) {
                        cancelledOrNoShow.forEach(function (r) {
                            console.log("  - ID: ".concat(r.id, ", Nume: ").concat(r.customer_name, ", Status: ").concat(r.status));
                        });
                    }
                    setReservations(reservations_1);
                    // Legacy endpoint nu returnează meta, deci setăm null
                    setMeta(null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    message = err_1 instanceof Error ? err_1.message : 'Eroare la încărcarea rezervărilor.';
                    setError(message);
                    console.error('useReservations Error:', err_1);
                    setReservations([]);
                    setMeta(null);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filters, pagination]);
    (0, react_1.useEffect)(function () {
        void fetchReservations();
    }, [fetchReservations]);
    var setFilters = (0, react_1.useCallback)(function (next) {
        setFiltersState(function (prev) {
            var resolved = typeof next === 'function' ? next(prev) : next;
            return normaliseFilters(resolved);
        });
        setPaginationState(function (prev) { return (__assign(__assign({}, prev), { offset: 0 })); });
    }, []);
    var updateFilters = (0, react_1.useCallback)(function (partial) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), partial)); });
    }, [setFilters]);
    var setPagination = (0, react_1.useCallback)(function (next) {
        setPaginationState(next);
    }, []);
    return {
        reservations: reservations,
        meta: meta,
        loading: loading,
        error: error,
        filters: filters,
        pagination: pagination,
        refetch: fetchReservations,
        setFilters: setFilters,
        updateFilters: updateFilters,
        setPagination: setPagination,
    };
}
