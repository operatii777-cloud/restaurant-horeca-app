"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceOrderModal = TraceOrderModal;
// import { useTranslation } from '@/i18n/I18nContext';
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./TraceOrderModal.css");
function TraceOrderModal(_a) {
    var _b, _c;
    var open = _a.open, orderId = _a.orderId, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var endpoint = open && orderId ? "/api/admin/orders/".concat(orderId, "/traceability") : null;
    var _d = (0, useApiQuery_1.useApiQuery)(endpoint), data = _d.data, loading = _d.loading, error = _d.error;
    return (<Modal_1.Modal isOpen={open} onClose={onClose} size="lg" title={orderId ? "Detalii comand\u0103 #".concat(orderId) : 'Detalii comandă'} description="Verifică traseul complet al comenzilor și ingredientelor folosite.">
      {loading ? <p className="trace-order__loading">"se incarca detaliile"</p> : null}
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
      {!loading && (data === null || data === void 0 ? void 0 : data.order) ? (<div className="trace-order__content">
          <section>
            <h3>"informatii comanda"</h3>
            <ul>
              <li>
                <span>Data & ora:</span>
                <strong>{new Date(data.order.timestamp).toLocaleString('ro-RO')}</strong>
              </li>
              <li>
                <span>Client:</span>
                <strong>{data.order.client_identifier || 'Walk-in'}</strong>
              </li>
              <li>
                <span>Tip comanda:</span>
                <strong>{data.order.type}</strong>
              </li>
              <li>
                <span>Status:</span>
                <strong>{data.order.status}</strong>
              </li>
              <li>
                <span>plată</span>
                <strong>{data.order.is_paid ? 'Achitată' : 'Neachitată'}</strong>
              </li>
              <li>
                <span>Total:</span>
                <strong>{data.order.total ? "".concat(data.order.total.toFixed(2), " RON") : '-'}</strong>
              </li>
            </ul>
          </section>

          <section>
            <h3>Produse comandate</h3>
            <ul className="trace-order__list">
              {(_b = data.items) === null || _b === void 0 ? void 0 : _b.map(function (item) { return (<li key={"".concat(item.product_id, "-").concat(item.name)}>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} buc</span>
                </li>); })}
            </ul>
          </section>

          <section>
            <h3>Ingredient → Lot utilizat</h3>
            <ul className="trace-order__list">
              {(_c = data.batches) === null || _c === void 0 ? void 0 : _c.map(function (batch, index) { return (<li key={"".concat(batch.batch_number, "-index")}>
                  <div>
                    <strong>{batch.ingredient_name}</strong>
                    <span>Lot: {batch.batch_number}</span>
                  </div>
                  <span>{batch.quantity_used} unități</span>
                </li>); })}
            </ul>
          </section>
        </div>) : null}
    </Modal_1.Modal>);
}
