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
exports.StockAdjustModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
require("./StockAdjustModal.css");
// Funcție helper pentru conversie unități
function convertUnit(quantity, fromUnit, toUnit) {
    if (!quantity || !fromUnit || !toUnit || fromUnit === toUnit)
        return quantity;
    // Conversii pentru greutăți (kg ↔ gr)
    if ((fromUnit === 'kg' && toUnit === 'gr') || (fromUnit === 'gr' && toUnit === 'kg')) {
        return fromUnit === 'kg' ? quantity * 1000 : quantity / 1000;
    }
    // Conversii pentru volume (l ↔ ml)
    if ((fromUnit === 'l' && toUnit === 'ml') || (fromUnit === 'ml' && toUnit === 'l')) {
        return fromUnit === 'l' ? quantity * 1000 : quantity / 1000;
    }
    return quantity;
}
// Detectează unități compatibile pentru un ingredient
function getCompatibleUnits(ingredientUnit) {
    if (ingredientUnit === 'kg')
        return ['kg', 'gr'];
    if (ingredientUnit === 'gr')
        return ['gr', 'kg'];
    if (ingredientUnit === 'l')
        return ['l', 'ml'];
    if (ingredientUnit === 'ml')
        return ['ml', 'l'];
    return [ingredientUnit]; // buc sau alte unități fără conversie
}
var StockAdjustModal = function (_a) {
    var open = _a.open, ingredient = _a.ingredient, onClose = _a.onClose, onUpdated = _a.onUpdated;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)('set'), operation = _b[0], setOperation = _b[1];
    var _c = (0, react_1.useState)(0), quantity = _c[0], setQuantity = _c[1];
    var _d = (0, react_1.useState)(''), inputUnit = _d[0], setInputUnit = _d[1];
    var _e = (0, react_1.useState)('Ajustare manuală'), reason = _e[0], setReason = _e[1];
    var _f = (0, react_1.useState)(false), submitting = _f[0], setSubmitting = _f[1];
    var _g = (0, react_1.useState)(null), feedback = _g[0], setFeedback = _g[1];
    var resetState = (0, react_1.useCallback)(function () {
        setOperation('set');
        setQuantity(0);
        setInputUnit((ingredient === null || ingredient === void 0 ? void 0 : ingredient.unit) || 'buc');
        setReason('Ajustare manuală');
        setFeedback(null);
    }, [ingredient]);
    // Actualizează inputUnit când se schimbă ingredientul
    (0, react_1.useEffect)(function () {
        if (ingredient === null || ingredient === void 0 ? void 0 : ingredient.unit) {
            setInputUnit(ingredient.unit);
        }
    }, [ingredient]);
    var handleClose = (0, react_1.useCallback)(function () {
        if (submitting)
            return;
        resetState();
        onClose();
    }, [onClose, resetState, submitting]);
    var currentStock = (0, react_1.useMemo)(function () { var _a; return (_a = ingredient === null || ingredient === void 0 ? void 0 : ingredient.current_stock) !== null && _a !== void 0 ? _a : 0; }, [ingredient]);
    var handleSubmit = (0, react_1.useCallback)(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var response, successMessage, error_1, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    if (!ingredient)
                        return [2 /*return*/];
                    if (quantity < 0) {
                        setFeedback({ type: 'error', message: 'Cantitatea trebuie să fie un număr pozitiv.' });
                        return [2 /*return*/];
                    }
                    setSubmitting(true);
                    setFeedback(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/admin/ingredients/".concat(ingredient.id, "/update-stock"), {
                            quantity: quantity,
                            operation: operation,
                            reason: reason,
                            input_unit: inputUnit, // Trimite unitatea introdusă
                        })];
                case 2:
                    response = _b.sent();
                    successMessage = 'Stocul a fost ajustat cu succes.';
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.conversion) {
                        successMessage = "Stocul a fost ajustat: ".concat(response.data.conversion.input, " \u2192 ").concat(response.data.conversion.converted);
                    }
                    setFeedback({ type: 'success', message: successMessage });
                    return [4 /*yield*/, onUpdated()];
                case 3:
                    _b.sent();
                    resetState();
                    onClose();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la ajustarea stocului:', error_1);
                    message = error_1 instanceof Error ? error_1.message : 'Nu s-a putut ajusta stocul.';
                    setFeedback({ type: 'error', message: message });
                    return [3 /*break*/, 6];
                case 5:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [ingredient, quantity, operation, reason, onUpdated, resetState, onClose]);
    if (!open || !ingredient) {
        return null;
    }
    return (<div className="stock-adjust-modal" role="dialog" aria-modal="true" aria-labelledby="stock-adjust-title">
      <div className="stock-adjust-modal__backdrop" onClick={handleClose} aria-hidden="true"/>
      <div className="stock-adjust-modal__content">
        <header className="stock-adjust-modal__header">
          <div>
            <h2 id="stock-adjust-title">⚖️ Ajustează stocul</h2>
            <p>
              Ingredient: <strong>{ingredient.name}</strong> · Stoc curent:' '
              <strong>{currentStock}</strong> {ingredient.unit}
            </p>
          </div>
          <button type="button" className="stock-adjust-modal__close" onClick={handleClose} aria-label="Închide">
            ×
          </button>
        </header>

        <form className="stock-adjust-modal__form" onSubmit={handleSubmit}>
          <div className="stock-adjust-modal__field-group">
            <label className="stock-adjust-modal__label">Tip ajustare</label>
            <div className="stock-adjust-modal__radio-group">
              <label>
                <input type="radio" name="operation" value="set" checked={operation === 'set'} onChange={function () { return setOperation('set'); }}/>seteaza valoare exacta</label>
              <label>
                <input type="radio" name="operation" value="increase" checked={operation === 'increase'} onChange={function () { return setOperation('increase'); }}/>adauga la stoc</label>
              <label>
                <input type="radio" name="operation" value="decrease" checked={operation === 'decrease'} onChange={function () { return setOperation('decrease'); }}/>scade din stoc</label>
            </div>
          </div>

          <div className="stock-adjust-modal__field-group">
            <label className="stock-adjust-modal__label" htmlFor="stock-adjust-quantity">
              Cantitate
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input id="stock-adjust-quantity" type="number" min={0} step="0.01" required value={quantity} onChange={function (event) { return setQuantity(Number(event.target.value)); }} style={{ flex: '1 1 auto', fontSize: '24px', padding: '12px', minWidth: '200px', height: '50px' }}/>
              <select value={inputUnit} onChange={function (e) { return setInputUnit(e.target.value); }} style={{
            padding: '10px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            cursor: 'pointer',
        }}>
                {getCompatibleUnits(ingredient.unit).map(function (unit) { return (<option key={unit} value={unit}>
                    {unit}
                  </option>); })}
              </select>
            </div>
            {inputUnit !== ingredient.unit && quantity > 0 && (<div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                = {convertUnit(quantity, inputUnit, ingredient.unit).toFixed(2)} {ingredient.unit}
              </div>)}
          </div>

          <label className="stock-adjust-modal__label" htmlFor="stock-adjust-reason">
            Motiv (opțional)
          </label>
          <input id="stock-adjust-reason" type="text" value={reason} onChange={function (event) { return setReason(event.target.value); }} placeholder="ajustare manuala"/>

          {feedback ? (<InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Eroare'} message={feedback.message}/>) : null}

          <footer className="stock-adjust-modal__footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={submitting}>Anulează</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se aplică…' : 'Aplică ajustarea'}
            </button>
          </footer>
        </form>
      </div>
    </div>);
};
exports.StockAdjustModal = StockAdjustModal;
