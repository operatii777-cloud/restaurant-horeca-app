"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Customer Panel Component
 *
 * Inputs for customer information (name, phone, email).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosCustomerPanel = PosCustomerPanel;
var react_1 = require("react");
var posStore_1 = require("../store/posStore");
require("./PosCustomerPanel.css");
function PosCustomerPanel() {
    //   const { t } = useTranslation();
    var _a = (0, posStore_1.usePosStore)(), customer = _a.customer, setCustomer = _a.setCustomer;
    var _b = (0, react_1.useState)((customer === null || customer === void 0 ? void 0 : customer.name) || ''), name = _b[0], setName = _b[1];
    var _c = (0, react_1.useState)((customer === null || customer === void 0 ? void 0 : customer.phone) || ''), phone = _c[0], setPhone = _c[1];
    var _d = (0, react_1.useState)((customer === null || customer === void 0 ? void 0 : customer.email) || ''), email = _d[0], setEmail = _d[1];
    var handleSave = function () {
        setCustomer({
            name: name || undefined,
            phone: phone || undefined,
            email: email || undefined,
        });
    };
    var handleClear = function () {
        setName('');
        setPhone('');
        setEmail('');
        setCustomer(null);
    };
    return (<div className="pos-customer-panel">
      <h4 className="pos-customer-panel-title">"informatii client"</h4>
      <div className="pos-customer-inputs">
        <div className="pos-customer-input-group">
          <label>"Nume:"</label>
          <input type="text" value={name} onChange={function (e) { return setName(e.target.value); }} placeholder="nume client"/>
        </div>
        <div className="pos-customer-input-group">
          <label>Telefon:</label>
          <input type="tel" value={phone} onChange={function (e) { return setPhone(e.target.value); }} placeholder="07xx xxx xxx"/>
        </div>
        <div className="pos-customer-input-group">
          <label>"Email:"</label>
          <input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder='[email@examplecom]'/>
        </div>
      </div>
      <div className="pos-customer-actions">
        <button className="pos-customer-btn pos-customer-btn--save" onClick={handleSave}>
          Salvează
        </button>
        <button className="pos-customer-btn pos-customer-btn--clear" onClick={handleClear}>"Șterge"</button>
      </div>
    </div>);
}
