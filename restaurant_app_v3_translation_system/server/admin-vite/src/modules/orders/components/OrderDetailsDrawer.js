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
exports.OrderDetailsDrawer = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var SideDrawer_1 = require("@/shared/components/SideDrawer");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
var orderHelpers_1 = require("@/modules/orders/utils/orderHelpers");
var EFacturaButton_1 = require("./EFacturaButton");
require("./OrderDetailsDrawer.css");
var OrderDetailsDrawer = function (_a) {
    var _b, _c;
    var open = _a.open, order = _a.order, onClose = _a.onClose, onOrderUpdated = _a.onOrderUpdated, onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var items = (0, react_1.useMemo)(function () {
        if (!order)
            return [];
        return (0, orderHelpers_1.parseOrderItems)(order.items);
    }, [order]);
    var orderTotal = (0, react_1.useMemo)(function () { return (order ? (0, orderHelpers_1.calculateOrderTotal)(order) : 0); }, [order]);
    var handleMarkAsPaid = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmed, error_1, message;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!order)
                        return [2 /*return*/];
                    confirmed = window.confirm("Comanda #".concat(order.id, " va fi marcat\u0103 ca achitat\u0103. Continui?"));
                    if (!confirmed) {
                        return [2 /*return*/];
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/visits/close', {
                            tableNumber: (_a = order.table_number) !== null && _a !== void 0 ? _a : null,
                            clientIdentifier: (_b = order.client_identifier) !== null && _b !== void 0 ? _b : '',
                        })];
                case 2:
                    _f.sent();
                    onFeedback("Comanda #".concat(order.id, " a fost marcat\u0103 ca achitat\u0103."), 'success');
                    return [4 /*yield*/, onOrderUpdated()];
                case 3:
                    _f.sent();
                    onClose();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _f.sent();
                    console.error('Eroare la marcarea comenzii ca achitată:', error_1);
                    message = (_e = (_d = (_c = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) !== null && _e !== void 0 ? _e : (error_1 instanceof Error ? error_1.message : 'Nu s-a putut marca comanda ca achitată.');
                    onFeedback(message, 'error');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [onClose, onFeedback, onOrderUpdated, order]);
    if (!order) {
        return null;
    }
    var isPaid = Number(order.is_paid) === 1;
    var isCancelled = order.status === 'cancelled';
    return (<SideDrawer_1.SideDrawer open={open} onClose={onClose} width={620} title={"Detalii Comand\u0103 #".concat(order.id)} description={"Mas\u0103: ".concat((_b = order.table_number) !== null && _b !== void 0 ? _b : '—', " \u2022 Client: ").concat((_c = order.client_identifier) !== null && _c !== void 0 ? _c : 'Anonim')} footer={<div className="order-details-drawer__footer">
          {!isPaid && !isCancelled ? (<button type="button" className="btn btn-primary" onClick={handleMarkAsPaid}>
              💰 Marchează achitată
            </button>) : null}
          <button type="button" className="btn btn-ghost" onClick={onClose}>"Închide"</button>
        </div>}>
      <div className="order-details-drawer__content">
        <section className="order-details-card">
          <h3>"informatii generale"</h3>
          <div className="order-details-card__grid">
            <div>
              <span>Tip:</span>
              <strong>
                {order.type === 'here' ? 'La masă' : order.type === 'takeout' ? 'La pachet' : 'Livrare'}
              </strong>
            </div>
            <div>
              <span>Status:</span>
              <strong>
                <span className={(0, classnames_1.default)('order-status-badge', "order-status-badge--".concat(order.status))} aria-label={"Status ".concat(order.status)}>
                  {order.status.toUpperCase()}
                </span>
              </strong>
            </div>
            <div>
              <span>"Achitată:"</span>
              <strong>{isPaid ? 'Da' : 'Nu'}</strong>
            </div>
            <div>
              <span>"creata la"</span>
              <strong>{(0, orderHelpers_1.formatTimestamp)(order.timestamp)}</strong>
            </div>
            {order.paid_timestamp ? (<div>
                <span>"platita la"</span>
                <strong>{(0, orderHelpers_1.formatTimestamp)(order.paid_timestamp)}</strong>
              </div>) : null}
            {order.delivered_timestamp ? (<div>
                <span>"livrata la"</span>
                <strong>{(0, orderHelpers_1.formatTimestamp)(order.delivered_timestamp)}</strong>
              </div>) : null}
            {order.cancelled_timestamp ? (<div>
                <span>"anulata la"</span>
                <strong>{(0, orderHelpers_1.formatTimestamp)(order.cancelled_timestamp)}</strong>
              </div>) : null}
          </div>
        </section>

        <section className="order-details-card">
          <h3>Produse comandate</h3>
          {items.length === 0 ? (<InlineAlert_1.InlineAlert variant="info" message="Nu există produse înregistrate pentru această comandă."/>) : (<div className="order-details-items">
              {items.map(function (item) {
                var _a, _b, _c, _d, _e;
                return (<div key={item.itemId} className="order-item-row">
                  <div className="order-item-row__info">
                    <span className="order-item-row__name">
                      {item.quantity}x {(_a = item.name) !== null && _a !== void 0 ? _a : 'Produs'}' '
                      {item.isFree ? <span className="order-item-row__free">GRATUIT</span> : null}
                    </span>
                    <span className="order-item-row__meta">
                      Stație: {(_b = item.station) !== null && _b !== void 0 ? _b : '—'} | Status: {((_c = item.status) !== null && _c !== void 0 ? _c : "Pending:").toUpperCase()}
                    </span>
                    {item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0 ? (<ul className="order-item-row__customizations">
                        {item.customizations.map(function (custom, index) {
                            var _a, _b;
                            return (<li key={"".concat(item.itemId, "-custom-\"Index\"")}>
                            + {(_a = custom.option_name) !== null && _a !== void 0 ? _a : 'Opțiune'} ({((_b = custom.extra_price) !== null && _b !== void 0 ? _b : 0).toFixed(2)} RON)
                          </li>);
                        })}
                      </ul>) : null}
                  </div>
                  <div className="order-item-row__price">
                    {(((_d = item.finalPrice) !== null && _d !== void 0 ? _d : 0) * ((_e = item.quantity) !== null && _e !== void 0 ? _e : 1)).toFixed(2)} RON
                  </div>
                </div>);
            })}
            </div>)}
          <div className="order-details-total">
            <span>Total comandă</span>
            <strong>{orderTotal.toFixed(2)} RON</strong>
          </div>
        </section>

        {(order.food_notes || order.drink_notes || order.general_notes || order.cancelled_reason) && (<section className="order-details-card">
            <h3>"note si mentiuni"</h3>
            {order.food_notes ? <p>🍽️ Mâncare: {order.food_notes}</p> : null}
            {order.drink_notes ? <p>🥤 Băuturi: {order.drink_notes}</p> : null}
            {order.general_notes ? <p>📝 Generale: {order.general_notes}</p> : null}
            {order.cancelled_reason ? <InlineAlert_1.InlineAlert variant="warning" message={"Motiv anulare: ".concat(order.cancelled_reason)}/> : null}
          </section>)}

        {/* PHASE S11 - e-Factura Integration */}
        <section className="order-details-card">
          <h3>e-Factura ANAF</h3>
          <EFacturaButton_1.EFacturaButton orderId={order.id} efacturaStatus={order.efacturaStatus} efacturaInvoiceId={order.efacturaInvoiceId} onUpdate={onOrderUpdated}/>
        </section>
      </div>
    </SideDrawer_1.SideDrawer>);
};
exports.OrderDetailsDrawer = OrderDetailsDrawer;
