"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - Payment Amount Input Component
 *
 * Input for payment amount with validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAmountInput = PaymentAmountInput;
var react_1 = require("react");
require("./PaymentAmountInput.css");
function PaymentAmountInput(_a) {
    var totalAmount = _a.totalAmount, alreadyPaid = _a.alreadyPaid, defaultAmount = _a.defaultAmount, onAmountChange = _a.onAmountChange;
    //   const { t } = useTranslation();
    var remaining = totalAmount - alreadyPaid;
    var _b = (0, react_1.useState)(defaultAmount !== undefined ? defaultAmount.toFixed(2) : remaining.toFixed(2)), amount = _b[0], setAmount = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    (0, react_1.useEffect)(function () {
        var numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Suma trebuie să fie un număr pozitiv');
        }
        else if (numAmount > remaining + 0.01) {
            setError("Suma dep\u0103\u0219e\u0219te restul de plat\u0103 (".concat(remaining.toFixed(2), " RON)"));
        }
        else {
            setError(null);
            onAmountChange(numAmount);
        }
    }, [amount, remaining, onAmountChange]);
    var handleQuickAmount = function (percent) {
        //   const { t } = useTranslation();
        var quickAmount = (remaining * percent) / 100;
        setAmount(quickAmount.toFixed(2));
    };
    return (<div className="payment-amount-input">
      <label className="payment-amount-label">"suma de plata"<span className="payment-amount-remaining">
          (Rest: {remaining.toFixed(2)} RON)
        </span>
      </label>
      <div className="payment-amount-input-group">
        <input type="number" step="0.01" min="0.01" max={remaining + 0.01} value={amount} onChange={function (e) { return setAmount(e.target.value); }} className={"payment-amount-field ".concat(error ? 'error' : '')} placeholder="0.00"/>
        <span className="payment-amount-currency">RON</span>
      </div>
      {error && <div className="payment-amount-error">{error}</div>}
      <div className="payment-amount-quick">
        <button type="button" className="payment-amount-quick-btn" onClick={function () { return handleQuickAmount(25); }}>
          25%
        </button>
        <button type="button" className="payment-amount-quick-btn" onClick={function () { return handleQuickAmount(50); }}>
          50%
        </button>
        <button type="button" className="payment-amount-quick-btn" onClick={function () { return handleQuickAmount(100); }}>
          100%
        </button>
      </div>
    </div>);
}
