"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Method Selector Component
 *
 * Clean UI for selecting payment method (cash, card, voucher)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodSelector = PaymentMethodSelector;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./PaymentMethodSelector.css");
var PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'voucher', label: 'Voucher', icon: '🎫' },
    { id: 'protocol', label: 'Protocol', icon: '📋' },
    { id: 'degustare', label: 'Degustare', icon: '🍷' },
];
function PaymentMethodSelector(_a) {
    var selectedMethod = _a.selectedMethod, onChange = _a.onChange, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    //   const { t } = useTranslation();
    return (<div className="payment-method-selector">
      <label className="payment-method-label">Metodă de plată</label>
      <div className="payment-method-buttons">
        {PAYMENT_METHODS.map(function (method) {
            var isSelected = selectedMethod === method.id;
            return (<react_bootstrap_1.Button key={method.id} variant={isSelected ? 'primary' : 'outline-primary'} size="lg" className={"payment-method-btn ".concat(isSelected ? 'selected' : '')} onClick={function () { return !disabled && onChange(method.id); }} disabled={disabled}>
              <span className="payment-method-icon">{method.icon}</span>
              <span className="payment-method-label-text">{method.label}</span>
            </react_bootstrap_1.Button>);
        })}
      </div>
    </div>);
}
