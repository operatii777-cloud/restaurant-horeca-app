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
exports.CloneProductModal = CloneProductModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
require("./CloneProductModal.css");
function CloneProductModal(_a) {
    var _this = this;
    var open = _a.open, product = _a.product, onClose = _a.onClose, onCloned = _a.onCloned;
    //   const { t } = useTranslation();
    var _b = (0, useApiMutation_1.useApiMutation)(), mutate = _b.mutate, loading = _b.loading, error = _b.error, reset = _b.reset;
    var _c = (0, react_1.useState)(''), newName = _c[0], setNewName = _c[1];
    var _d = (0, react_1.useState)(null), localError = _d[0], setLocalError = _d[1];
    (0, react_1.useEffect)(function () {
        if (!open) {
            return;
        }
        reset();
        setLocalError(null);
        setNewName((product === null || product === void 0 ? void 0 : product.name) ? "".concat(product.name, " (Copie)") : '');
    }, [open, product === null || product === void 0 ? void 0 : product.name, reset]);
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var trimmedName, response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    setLocalError(null);
                    if (!product) {
                        setLocalError('Selectează mai întâi un produs din tabel.');
                        return [2 /*return*/];
                    }
                    trimmedName = newName.trim();
                    if (trimmedName.length < 3) {
                        setLocalError('Noul nume trebuie să conțină cel puțin 3 caractere.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, mutate({
                            url: "/api/catalog/products/".concat(product.id, "/clone"),
                            method: 'post',
                            data: {
                                new_name: trimmedName,
                            },
                        })];
                case 1:
                    response = _b.sent();
                    if (response !== null) {
                        onCloned({
                            newProductId: (_a = response.new_product_id) !== null && _a !== void 0 ? _a : null,
                            newName: trimmedName,
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title="cloneaza produs" description={product ? "Creezi un duplicat al produsului \u201C".concat(product.name, "\u201D. Po\u021Bi ajusta numele \u00EEnainte de salvare.") : 'Selectează un produs pentru a crea un duplicat.'} size="md">
      {localError ? <InlineAlert_1.InlineAlert variant="warning" title="verifica datele" message={localError}/> : null}
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <form className="clone-product-form" onSubmit={handleSubmit}>
        <label className="clone-product-field">
          <span>"nume produs clonat"</span>
          <input type="text" value={newName} onChange={function (event) { return setNewName(event.target.value); }} placeholder="Ex: Pizza Quattro (Copie)" disabled={!product}/>
        </label>

        <p className="clone-product-hint">
          După salvare, produsul clonat va prelua categoria, prețul, traducerile și rețeta (dacă există) ale produsului original.
        </p>

        <footer className="clone-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading || !product}>
            {loading ? 'Se clonează…' : 'Clonează produsul'}
          </button>
        </footer>
      </form>
    </Modal_1.Modal>);
}
