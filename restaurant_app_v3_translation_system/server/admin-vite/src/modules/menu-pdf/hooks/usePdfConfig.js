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
exports.usePdfConfig = usePdfConfig;
// import { useTranslation } from '@/i18n/I18nContext';
// hooks/usePdfConfig.ts
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
function usePdfConfig(type) {
    var _this = this;
    var _a = (0, react_1.useState)(null), config = _a[0], setConfig = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var fetchConfig = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, mappedConfig, err_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/menu/pdf/builder/config?type=".concat(type))];
                case 2:
                    response = _a.sent();
                    if (response.data.success && response.data.categories) {
                        mappedConfig = {
                            type: (response.data.type || type),
                            categories: response.data.categories.map(function (cat) { return ({
                                id: cat.id,
                                category_name: cat.category_name,
                                display_in_pdf: cat.display_in_pdf === 1 || cat.display_in_pdf === true,
                                order_index: cat.order_index || 0,
                                page_break_after: cat.page_break_after === 1 || cat.page_break_after === true,
                                header_image: cat.header_image || null,
                                products: (cat.products || []).map(function (prod) { return ({
                                    id: prod.id || prod.product_id,
                                    product_id: prod.product_id || prod.id,
                                    name: prod.name,
                                    price: prod.price || 0,
                                    display_in_pdf: prod.display_in_pdf === 1 || prod.display_in_pdf === true,
                                    custom_order: prod.custom_order || null,
                                }); }),
                            }); }),
                        };
                        setConfig(mappedConfig);
                    }
                    else {
                        throw new Error('Configurația nu a putut fi încărcată');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    message = err_1 instanceof Error ? err_1.message : 'Eroare la încărcarea configurației';
                    setError(message);
                    setConfig(null);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [type]);
    var updateCategories = (0, react_1.useCallback)(function (categories) { return __awaiter(_this, void 0, void 0, function () {
        var backendCategories, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    backendCategories = categories.map(function (c) { return ({
                        id: c.id,
                        display_in_pdf: c.display_in_pdf ? 1 : 0,
                        order_index: c.order_index || 0,
                        page_break_after: c.page_break_after ? 1 : 0,
                    }); });
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/menu/pdf/builder/config/categories', { categories: backendCategories })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchConfig()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    throw err_2 instanceof Error ? err_2 : new Error('Eroare la actualizarea categoriilor');
                case 4: return [2 /*return*/];
            }
        });
    }); }, [fetchConfig]);
    var updateProducts = (0, react_1.useCallback)(function (products) { return __awaiter(_this, void 0, void 0, function () {
        var backendProducts, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    backendProducts = products.map(function (p) { return ({
                        product_id: p.product_id || p.id,
                        display_in_pdf: p.display_in_pdf ? 1 : 0,
                        custom_order: p.custom_order || null,
                    }); });
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/menu/pdf/builder/config/products', { products: backendProducts })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchConfig()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    throw err_3 instanceof Error ? err_3 : new Error('Eroare la actualizarea produselor');
                case 4: return [2 /*return*/];
            }
        });
    }); }, [fetchConfig]);
    var uploadImage = (0, react_1.useCallback)(function (categoryId, file) { return __awaiter(_this, void 0, void 0, function () {
        var formData, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formData = new FormData();
                    formData.append('image', file);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/menu/pdf/builder/upload-category-image/".concat(categoryId), formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetchConfig()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    throw err_4 instanceof Error ? err_4 : new Error('Eroare la upload-ul imaginii');
                case 5: return [2 /*return*/];
            }
        });
    }); }, [fetchConfig]);
    var deleteImage = (0, react_1.useCallback)(function (categoryId) { return __awaiter(_this, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/menu/pdf/builder/delete-category-image/".concat(categoryId))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchConfig()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _a.sent();
                    throw err_5 instanceof Error ? err_5 : new Error('Eroare la ștergerea imaginii');
                case 4: return [2 /*return*/];
            }
        });
    }); }, [fetchConfig]);
    var regenerate = (0, react_1.useCallback)(function (regenerateType) { return __awaiter(_this, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/menu/pdf/builder/regenerate', { type: regenerateType })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchConfig()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_6 = _a.sent();
                    throw err_6 instanceof Error ? err_6 : new Error('Eroare la regenerarea PDF-urilor');
                case 4: return [2 /*return*/];
            }
        });
    }); }, [fetchConfig]);
    return {
        config: config,
        loading: loading,
        error: error,
        refetch: fetchConfig,
        updateCategories: updateCategories,
        updateProducts: updateProducts,
        uploadImage: uploadImage,
        deleteImage: deleteImage,
        regenerate: regenerate,
    };
}
