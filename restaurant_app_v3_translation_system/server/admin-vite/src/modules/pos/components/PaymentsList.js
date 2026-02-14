"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payments List Component
 *
 * Display list of current payments with remove functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsList = PaymentsList;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./PaymentsList.css");
var METHOD_LABELS = {
    cash: 'Cash',
    card: 'Card',
    voucher: 'Voucher',
    other: 'Altă metodă',
};
var METHOD_ICONS = {
    cash: '💵',
    card: '💳',
    voucher: '🎫',
    other: '💰',
};
function PaymentsList(_a) {
    var payments = _a.payments, onRemove = _a.onRemove, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    //   const { t } = useTranslation();
    if (!payments || payments.length === 0) {
        return (<div className="payments-list-empty">
        <p className="text-muted">"nu exista plati inregistrate"</p>
      </div>);
    }
    var formatTime = function (timestamp) {
        if (!timestamp)
            return '';
        var date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    };
    return (<div className="payments-list">
      <div className="payments-list-header">
        <h5 className="payments-list-title">"plati efectuate"</h5>
        <react_bootstrap_1.Badge bg="primary">{payments.length}</react_bootstrap_1.Badge>
      </div>
      <div className="payments-list-items">
        {payments.map(function (payment) { return (<div key={payment.id} className="payment-item">
            <div className="payment-item-info">
              <div className="payment-item-method">
                <span className="payment-item-icon">{METHOD_ICONS[payment.type] || '💰'}</span>
                <span className="payment-item-label">{METHOD_LABELS[payment.type] || payment.type}</span>
              </div>
              {payment.timestamp && (<div className="payment-item-time">{formatTime(payment.timestamp)}</div>)}
            </div>
            <div className="payment-item-amount">
              {payment.amount.toFixed(2)} RON
            </div>
            <react_bootstrap_1.Button variant="outline-danger" size="sm" className="payment-item-remove" onClick={function () { return onRemove(payment.id); }} disabled={disabled} title="sterge plata">
              <i className="fas fa-trash"></i>
            </react_bootstrap_1.Button>
          </div>); })}
      </div>
    </div>);
}
