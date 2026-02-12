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
exports.useDailyMenuData = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var initialLoading = {
    products: false,
    current: false,
    schedules: false,
    exceptions: false,
};
var initialErrors = {
    products: null,
    current: null,
    schedules: null,
    exceptions: null,
};
var useDailyMenuData = function () {
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(null), currentMenu = _b[0], setCurrentMenu = _b[1];
    var _c = (0, react_1.useState)([]), schedules = _c[0], setSchedules = _c[1];
    var _d = (0, react_1.useState)([]), exceptions = _d[0], setExceptions = _d[1];
    var _e = (0, react_1.useState)(initialLoading), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(initialErrors), errors = _f[0], setErrors = _f[1];
    var fetchProducts = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, payload, parsed, error_1, message_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { products: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/menu')];
                case 2:
                    response = _a.sent();
                    payload = response.data;
                    parsed = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.products)
                        ? payload.products
                        : Array.isArray(payload)
                            ? payload
                            : [];
                    setProducts(parsed);
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { products: null })); });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    message_1 = error_1 instanceof Error ? error_1.message : 'Nu am putut încărca produsele disponibile.';
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { products: message_1 })); });
                    setProducts([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { products: false })); });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchCurrentMenu = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2, axiosError, message_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { current: true })); });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/daily-menu')];
                case 2:
                    response = _c.sent();
                    setCurrentMenu(response.data);
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { current: null })); });
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _c.sent();
                    axiosError = error_2;
                    if (((_a = axiosError === null || axiosError === void 0 ? void 0 : axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        setCurrentMenu(null);
                        setErrors(function (prev) { return (__assign(__assign({}, prev), { current: null })); });
                    }
                    else {
                        message_2 = (_b = axiosError === null || axiosError === void 0 ? void 0 : axiosError.message) !== null && _b !== void 0 ? _b : 'Nu am putut încărca meniul zilei.';
                        setErrors(function (prev) { return (__assign(__assign({}, prev), { current: message_2 })); });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { current: false })); });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchSchedules = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, payload, error_3, message_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { schedules: true })); });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/daily-menu/schedule')];
                case 2:
                    response = _c.sent();
                    payload = Array.isArray(response.data) ? response.data : (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.schedules) !== null && _b !== void 0 ? _b : [];
                    setSchedules(payload);
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { schedules: null })); });
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _c.sent();
                    message_3 = error_3 instanceof Error ? error_3.message : 'Nu am putut încărca programările.';
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { schedules: message_3 })); });
                    setSchedules([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { schedules: false })); });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchExceptions = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, payload, error_4, message_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { exceptions: true })); });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/daily-menu/exceptions')];
                case 2:
                    response = _c.sent();
                    payload = Array.isArray(response.data) ? response.data : (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.exceptions) !== null && _b !== void 0 ? _b : [];
                    setExceptions(payload);
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { exceptions: null })); });
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _c.sent();
                    message_4 = error_4 instanceof Error ? error_4.message : 'Nu am putut încărca excepțiile.';
                    setErrors(function (prev) { return (__assign(__assign({}, prev), { exceptions: message_4 })); });
                    setExceptions([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(function (prev) { return (__assign(__assign({}, prev), { exceptions: false })); });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void fetchProducts();
        void fetchCurrentMenu();
        void fetchSchedules();
        void fetchExceptions();
    }, [fetchProducts, fetchCurrentMenu, fetchSchedules, fetchExceptions]);
    return {
        products: products,
        currentMenu: currentMenu,
        schedules: schedules,
        exceptions: exceptions,
        loading: loading,
        errors: errors,
        refreshProducts: fetchProducts,
        refreshCurrentMenu: fetchCurrentMenu,
        refreshSchedules: fetchSchedules,
        refreshExceptions: fetchExceptions,
    };
};
exports.useDailyMenuData = useDailyMenuData;
