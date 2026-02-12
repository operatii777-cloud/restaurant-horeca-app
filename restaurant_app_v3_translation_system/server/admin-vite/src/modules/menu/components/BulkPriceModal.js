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
exports.BulkPriceModal = BulkPriceModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
require("./BulkPriceModal.css");
function BulkPriceModal(_a) {
    var _this = this;
    var open = _a.open, productCount = _a.productCount, productIds = _a.productIds, onClose = _a.onClose, onApplied = _a.onApplied;
    //   const { t } = useTranslation();
    var _b = (0, useApiMutation_1.useApiMutation)(), mutate = _b.mutate, loading = _b.loading, error = _b.error, reset = _b.reset;
    var _c = (0, react_1.useState)(''), newPrice = _c[0], setNewPrice = _c[1];
    var _d = (0, react_1.useState)(''), newVatRate = _d[0], setNewVatRate = _d[1];
    var _e = (0, react_1.useState)('admin'), changedBy = _e[0], setChangedBy = _e[1];
    var _f = (0, react_1.useState)(null), localError = _f[0], setLocalError = _f[1];
    (0, react_1.useEffect)(function () {
        if (open) {
            reset();
            setLocalError(null);
            setNewPrice('');
            setNewVatRate('');
            setChangedBy('admin');
        }
    }, [open, reset]);
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var payload, response, newPrice_1, newVatRate_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    setLocalError(null);
                    if (!productIds.length) {
                        setLocalError('Selectează cel puțin un produs pentru actualizare.');
                        return [2 /*return*/];
                    }
                    if (newPrice.trim() === '' && newVatRate.trim() === '') {
                        setLocalError('Completează fie noul preț, fie noua cotă TVA (sau ambele).');
                        return [2 /*return*/];
                    }
                    payload = {
                        product_ids: productIds,
                        changed_by: changedBy || 'admin',
                    };
                    if (newPrice.trim() !== '') {
                        payload.new_price = Number(newPrice);
                    }
                    if (newVatRate.trim() !== '') {
                        payload.new_vat_rate = Number(newVatRate);
                    }
                    return [4 /*yield*/, mutate({
                            url: '/api/catalog/products/bulk-price-change',
                            method: 'put',
                            data: payload,
                        })];
                case 1:
                    response = _b.sent();
                    if (response !== null) {
                        newPrice_1 = payload.new_price !== undefined ? Number(payload.new_price) : undefined;
                        newVatRate_1 = payload.new_vat_rate !== undefined ? Number(payload.new_vat_rate) : undefined;
                        onApplied((_a = response.updated_count) !== null && _a !== void 0 ? _a : productIds.length, newPrice_1, newVatRate_1);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} title="schimbare pret in masa" description={"Vor fi actualizate ".concat(productCount, " produse selectate.")} size="md" onClose={onClose}>
      {localError ? <InlineAlert_1.InlineAlert variant="warning" title="verifica datele" message={localError}/> : null}
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <form className="bulk-price-form" onSubmit={handleSubmit}>
        <label className="bulk-price-field">
          <span>Preț nou (RON)</span>
          <input type="number" min="0" step="0.1" value={newPrice} onChange={function (event) { return setNewPrice(event.target.value); }} placeholder="lasa gol pentru a pastra pretul"/>
        </label>

        <label className="bulk-price-field">
          <span>TVA nou (%)</span>
          <input type="number" min="0" max="100" step="1" value={newVatRate} onChange={function (event) { return setNewVatRate(event.target.value); }} placeholder="lasa gol pentru a pastra cota existenta"/>
        </label>

        <label className="bulk-price-field">
          <span>Operator (opțional)</span>
          <input type="text" value={changedBy} onChange={function (event) { return setChangedBy(event.target.value); }} placeholder="ex super admin"/>
        </label>

        <footer className="bulk-price-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading}>
            {loading ? 'Se aplică…' : 'Aplică modificările'}
          </button>
        </footer>
      </form>
    </Modal_1.Modal>);
}
