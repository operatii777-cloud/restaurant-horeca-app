"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Amount Input Component
 *
 * Numeric pad + quick amount buttons
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAmountInput = PaymentAmountInput;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PaymentNumericPad_1 = require("./PaymentNumericPad");
require("./PaymentAmountInput.css");
function PaymentAmountInput(_a) {
    var value = _a.value, remainingAmount = _a.remainingAmount, onChange = _a.onChange, onExact = _a.onExact, onClear = _a.onClear, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(value), localValue = _c[0], setLocalValue = _c[1];
    var handleValueChange = function (newValue) {
        //   const { t } = useTranslation();
        setLocalValue(newValue);
        onChange(newValue);
    };
    var handleExact = function () {
        var exactAmount = remainingAmount.toFixed(2);
        setLocalValue(exactAmount);
        onChange(exactAmount);
        onExact();
    };
    var handleClear = function () {
        setLocalValue('');
        onChange('');
        onClear();
    };
    var parseAmount = function () {
        if (!localValue)
            return 0;
        var normalized = localValue.replace(',', '.');
        var parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    };
    var amount = parseAmount();
    var isValid = amount > 0 && amount <= remainingAmount;
    return (<div className="payment-amount-input">
      <div className="payment-amount-header">
        <label className="payment-amount-label">"suma plata"</label>
        <div className="payment-amount-remaining">"Rămas:"<strong>{remainingAmount.toFixed(2)} RON</strong>
        </div>
      </div>

      <div className="payment-amount-display">
        <react_bootstrap_1.Form.Control type="text" className="payment-amount-field" value={localValue} onChange={function (e) {
            var raw = e.target.value;
            var normalized = raw.replace(',', '.');
            if (/^[0-9]*[.]?[0-9]*$/.test(normalized) || normalized === '') {
                handleValueChange(normalized);
            }
        }} disabled={disabled} placeholder="0.00" inputMode="decimal"/>
        <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={handleExact} disabled={disabled || remainingAmount <= 0} className="payment-amount-exact-btn">
          Exact
        </react_bootstrap_1.Button>
      </div>

      {amount > 0 && !isValid && (<div className="payment-amount-error">
          {amount > remainingAmount
                ? "Suma dep\u0103\u0219e\u0219te r\u0103masul (".concat(remainingAmount.toFixed(2), " RON)")
                : 'Sumă invalidă'}
        </div>)}

      <PaymentNumericPad_1.PaymentNumericPad value={localValue} onChange={handleValueChange} onClear={handleClear} disabled={disabled}/>
    </div>);
}
