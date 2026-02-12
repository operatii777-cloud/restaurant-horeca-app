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
exports.FinishedProductModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
require("./FinishedProductModal.css");
var FinishedProductModal = function (_a) {
    var open = _a.open, _b = _a.productId, productId = _b === void 0 ? null : _b, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var isEdit = productId !== null;
    var _c = (0, react_1.useState)([]), catalogProducts = _c[0], setCatalogProducts = _c[1];
    var _d = (0, react_1.useState)(productId), selectedProductId = _d[0], setSelectedProductId = _d[1];
    var _e = (0, react_1.useState)({
        current_stock: 0,
        min_stock: 5,
        max_stock: 100,
        is_auto_managed: true,
    }), formValues = _e[0], setFormValues = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), saving = _g[0], setSaving = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var resetState = (0, react_1.useCallback)(function () {
        setCatalogProducts([]);
        setSelectedProductId(productId !== null && productId !== void 0 ? productId : null);
        setFormValues({ current_stock: 0, min_stock: 5, max_stock: 100, is_auto_managed: true });
        setFeedback(null);
        setLoading(false);
        setSaving(false);
    }, [productId]);
    var handleClose = (0, react_1.useCallback)(function () {
        if (saving)
            return;
        resetState();
        onClose();
    }, [onClose, resetState, saving]);
    (0, react_1.useEffect)(function () {
        if (!open) {
            return;
        }
        var isMounted = true;
        var fetchCatalogProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, payload, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient_1.httpClient.get('/api/catalog/products')];
                    case 1:
                        response = _c.sent();
                        payload = Array.isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.products)
                            ? response.data.products
                            : Array.isArray((_b = response.data) === null || _b === void 0 ? void 0 : _b.data)
                                ? response.data.data
                                : [];
                        if (isMounted) {
                            setCatalogProducts(payload);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('❌ Eroare la încărcarea catalogului de produse:', error_1);
                        if (isMounted) {
                            setFeedback({ type: 'error', message: 'Nu s-a putut încărca lista produselor din meniu.' });
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        var fetchExistingStock = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, stockItem, error_2;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!isEdit || !productId)
                            return [2 /*return*/];
                        setLoading(true);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, httpClient_1.httpClient.get("/api/stock/finished-products/".concat(productId))];
                    case 2:
                        response = _e.sent();
                        stockItem = (_a = response.data) === null || _a === void 0 ? void 0 : _a.product;
                        if (stockItem && isMounted) {
                            setFormValues({
                                current_stock: (_b = stockItem.current_stock) !== null && _b !== void 0 ? _b : 0,
                                min_stock: (_c = stockItem.min_stock) !== null && _c !== void 0 ? _c : 5,
                                max_stock: (_d = stockItem.max_stock) !== null && _d !== void 0 ? _d : 100,
                                is_auto_managed: Boolean(stockItem.is_auto_managed),
                            });
                            setSelectedProductId(stockItem.product_id);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _e.sent();
                        console.error('❌ Eroare la obținerea produsului finit:', error_2);
                        if (isMounted) {
                            setFeedback({ type: 'error', message: 'Nu s-au putut încărca detaliile produsului.' });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (isMounted) {
                            setLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchCatalogProducts();
        fetchExistingStock();
        return function () {
            isMounted = false;
        };
    }, [open, isEdit, productId]);
    var selectedProduct = (0, react_1.useMemo)(function () { return catalogProducts.find(function (item) { return item.id === selectedProductId; }) || null; }, [catalogProducts, selectedProductId]);
    var handleChange = (0, react_1.useCallback)(function (field, value) {
        setFormValues(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    }, []);
    var handleSubmit = (0, react_1.useCallback)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (!selectedProductId) {
                        setFeedback({ type: 'error', message: 'Selectează un produs din meniu.' });
                        return [2 /*return*/];
                    }
                    if (formValues.min_stock < 0 || formValues.max_stock < 0 || formValues.current_stock < 0) {
                        setFeedback({ type: 'error', message: 'Valorile trebuie să fie pozitive.' });
                        return [2 /*return*/];
                    }
                    if (formValues.max_stock < formValues.min_stock) {
                        setFeedback({ type: 'error', message: 'Stocul maxim nu poate fi mai mic decât cel minim.' });
                        return [2 /*return*/];
                    }
                    setSaving(true);
                    setFeedback(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    if (!(isEdit && productId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/stock/finished-products/".concat(productId), {
                            current_stock: formValues.current_stock,
                            min_stock: formValues.min_stock,
                            max_stock: formValues.max_stock,
                            is_auto_managed: formValues.is_auto_managed,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/stock/finished-products', {
                        product_id: selectedProductId,
                        current_stock: formValues.current_stock,
                        min_stock: formValues.min_stock,
                        max_stock: formValues.max_stock,
                        is_auto_managed: formValues.is_auto_managed,
                    })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    setFeedback({ type: 'success', message: 'Stocul produsului finit a fost salvat.' });
                    return [4 /*yield*/, onSaved()];
                case 6:
                    _a.sent();
                    handleClose();
                    return [3 /*break*/, 9];
                case 7:
                    error_3 = _a.sent();
                    console.error('❌ Eroare la salvarea stocului produs finit:', error_3);
                    message = error_3 instanceof Error ? error_3.message : 'Nu s-a putut salva stocul produsului.';
                    setFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 9];
                case 8:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [selectedProductId, formValues, isEdit, productId, onSaved, handleClose]);
    if (!open) {
        return null;
    }
    return (<div className="finished-product-modal" role="dialog" aria-modal="true" aria-labelledby="finished-product-modal-title">
      <div className="finished-product-modal__backdrop" onClick={handleClose} aria-hidden="true"/>
      <div className="finished-product-modal__content">
        <header className="finished-product-modal__header">
          <div>
            <h2 id="finished-product-modal-title">{isEdit ? 'Editează stoc produs finit' : 'Adaugă stoc produs finit'}</h2>
            {selectedProduct ? (<p>
                Produs: <strong>{selectedProduct.name}</strong>
                {selectedProduct.category ? " \u00B7 ".concat(selectedProduct.category) : ''}
                {selectedProduct.price ? " \u00B7 ".concat(selectedProduct.price, " RON") : ''}
              </p>) : (<p>Selectează produsul din meniu pentru a configura stocul.</p>)}
          </div>
          <button type="button" className="finished-product-modal__close" onClick={handleClose} aria-label="Închide">
            ×
          </button>
        </header>

        {feedback ? (<InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Eroare'} message={feedback.message}/>) : null}

        <form className="finished-product-modal__form" onSubmit={handleSubmit}>
          <label className="finished-product-modal__label" htmlFor="finished-product-select">
            Produs din meniu
          </label>
          <select id="finished-product-select" value={selectedProductId !== null && selectedProductId !== void 0 ? selectedProductId : ''} onChange={function (event) { return setSelectedProductId(Number(event.target.value) || null); }} disabled={isEdit} required>
            <option value="">Selectează produs</option>
            {catalogProducts.map(function (product) { return (<option key={product.id} value={product.id}>
                {product.name}
                {product.category ? " \u00B7 ".concat(product.category) : ''}
              </option>); })}
          </select>

          <div className="finished-product-modal__grid">
            <label>
              <span>Stoc curent (buc)</span>
              <input type="number" min={0} step="1" value={formValues.current_stock} onChange={function (event) { return handleChange('current_stock', Number(event.target.value)); }} required/>
            </label>

            <label>
              <span>Stoc minim</span>
              <input type="number" min={0} step="1" value={formValues.min_stock} onChange={function (event) { return handleChange('min_stock', Number(event.target.value)); }} required/>
            </label>

            <label>
              <span>Stoc maxim</span>
              <input type="number" min={0} step="1" value={formValues.max_stock} onChange={function (event) { return handleChange('max_stock', Number(event.target.value)); }} required/>
            </label>
          </div>

          <label className="finished-product-modal__checkbox">
            <input type="checkbox" checked={formValues.is_auto_managed} onChange={function (event) { return handleChange('is_auto_managed', event.target.checked); }}/>
            Stocul este gestionat automat pe baza vânzărilor.
          </label>

          {loading && <p className="finished-product-modal__loading">Se încarcă detaliile produsului...</p>}

          <footer className="finished-product-modal__footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={saving}>Anulează</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Se salvează...' : isEdit ? 'Salvează modificările' : 'Adaugă stoc'}
            </button>
          </footer>
        </form>
      </div>
    </div>);
};
exports.FinishedProductModal = FinishedProductModal;
