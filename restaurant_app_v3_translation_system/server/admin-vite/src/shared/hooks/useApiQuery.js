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
exports.useApiQuery = useApiQuery;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
function useApiQuery(endpoint) {
    var _this = this;
    var _a = (0, react_1.useState)(null), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1]; // true inițial pentru a afișa loading state
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var normalisedEndpoint = (0, react_1.useMemo)(function () { var _a; return (_a = endpoint === null || endpoint === void 0 ? void 0 : endpoint.trim()) !== null && _a !== void 0 ? _a : null; }, [endpoint]);
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, payload, extracted, payloadObj, err_1, is404, isExpectedError, message;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!normalisedEndpoint) {
                        setData(null);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get(normalisedEndpoint)];
                case 2:
                    response = _f.sent();
                    payload = response.data;
                    extracted = void 0;
                    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                        payloadObj = payload;
                        if (payloadObj.data !== undefined) {
                            extracted = payloadObj.data;
                        }
                        else if (payloadObj.items !== undefined) {
                            extracted = payloadObj.items;
                        }
                        else if (payloadObj.products !== undefined) {
                            extracted = payloadObj.products;
                        }
                        else if (payloadObj.orders !== undefined) {
                            extracted = payloadObj.orders;
                        }
                        else if (payloadObj.ingredients !== undefined) {
                            extracted = payloadObj.ingredients;
                        }
                        else if (payloadObj.categories !== undefined) {
                            extracted = payloadObj.categories;
                        }
                        else {
                            extracted = payloadObj;
                        }
                    }
                    else {
                        extracted = payload;
                    }
                    setData(extracted);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _f.sent();
                    is404 = ((_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.status) === 404;
                    isExpectedError = is404 || ((_b = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _b === void 0 ? void 0 : _b.status) === 400;
                    if (!isExpectedError) {
                        // Logăm doar erorile neașteptate
                        console.error('useApiQuery Request failed:', err_1);
                    }
                    message = 'Eroare necunoscută';
                    if ((err_1 === null || err_1 === void 0 ? void 0 : err_1.code) === 'ERR_NETWORK' || ((_c = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) === null || _c === void 0 ? void 0 : _c.includes('Network Error')) || ((_d = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) === null || _d === void 0 ? void 0 : _d.includes('ERR_CONNECTION_REFUSED'))) {
                        message = 'Backend-ul nu este disponibil. Verifică dacă serverul rulează.';
                    }
                    else if ((_e = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _e === void 0 ? void 0 : _e.status) {
                        message = "Eroare ".concat(err_1.response.status, ": ").concat(err_1.response.statusText || 'Eroare server');
                    }
                    else if (err_1 instanceof Error) {
                        message = err_1.message || 'Eroare la încărcarea datelor';
                    }
                    setError(message);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [normalisedEndpoint]);
    (0, react_1.useEffect)(function () {
        fetchData();
    }, [fetchData]);
    return {
        data: data,
        loading: loading,
        error: error,
        refetch: fetchData,
    };
}
