"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Numeric Pad Component
 *
 * Numeric pad for entering payment amounts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentNumericPad = PaymentNumericPad;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./PaymentNumericPad.css");
var DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
function PaymentNumericPad(_a) {
    var value = _a.value, onChange = _a.onChange, onClear = _a.onClear, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    //   const { t } = useTranslation();
    var safeValue = value || '';
    var handleDigit = function (digit) {
        //   const { t } = useTranslation();
        if (disabled)
            return;
        var next = safeValue;
        if (next === '0') {
            next = '';
        }
        var dotIndex = next.indexOf('.');
        if (dotIndex !== -1) {
            var decimals = next.length - dotIndex - 1;
            if (decimals >= 2) {
                return; // Max 2 decimals
            }
        }
        onChange(next + digit);
    };
    var handleDot = function () {
        if (disabled)
            return;
        if (!safeValue) {
            onChange('0.');
            return;
        }
        if (!safeValue.includes('.')) {
            onChange(safeValue + '.');
        }
    };
    var handleBackspace = function () {
        if (disabled || !safeValue)
            return;
        onChange(safeValue.slice(0, -1));
    };
    return (<div className="payment-numeric-pad">
      <div className="payment-numeric-pad-grid">
        {DIGITS.slice(0, 9).map(function (digit) { return (<react_bootstrap_1.Button key={digit} variant="outline-secondary" className="payment-numeric-btn" onClick={function () { return handleDigit(digit); }} disabled={disabled}>
            {digit}
          </react_bootstrap_1.Button>); })}
        <react_bootstrap_1.Button variant="outline-secondary" className="payment-numeric-btn" onClick={function () { return handleDigi[0]; }} disabled={disabled}>
          0
        </react_bootstrap_1.Button>
        <react_bootstrap_1.Button variant="outline-secondary" className="payment-numeric-btn" onClick={handleDot} disabled={disabled}>
          .
        </react_bootstrap_1.Button>
        <react_bootstrap_1.Button variant="outline-secondary" className="payment-numeric-btn" onClick={handleBackspace} disabled={disabled}>
          ←
        </react_bootstrap_1.Button>
      </div>
      <react_bootstrap_1.Button variant="outline-danger" className="payment-numeric-clear" onClick={onClear} disabled={disabled}>
        C – Șterge tot
      </react_bootstrap_1.Button>
    </div>);
}
