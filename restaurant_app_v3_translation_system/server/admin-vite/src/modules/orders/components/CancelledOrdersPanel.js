"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelledOrdersPanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var orderHelpers_1 = require("@/modules/orders/utils/orderHelpers");
require("./CancelledOrdersPanel.css");
/**
 * Parse cancelled order items - handles both array and JSON string formats
 */
function parseCancelledOrderItems(items) {
    if (!items) {
        return [];
    }
    if (Array.isArray(items)) {
        return items;
    }
    if (typeof items === 'string') {
        try {
            var parsed = JSON.parse(items);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (_a) {
            return [];
        }
    }
    return [];
}
var DEFAULT_FILTERS = {
    status: 'cancelled',
    startDate: null,
    endDate: null,
};
function buildQueryString(filters) {
    var params = new URLSearchParams();
    if (filters.startDate) {
        params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
        params.set('endDate', filters.endDate);
    }
    return params.toString();
}
var CancelledOrdersPanel = function (_a) {
    var _b, _c;
    var onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(DEFAULT_FILTERS), filtersDraft = _d[0], setFiltersDraft = _d[1];
    var _e = (0, react_1.useState)(DEFAULT_FILTERS), appliedFilters = _e[0], setAppliedFilters = _e[1];
    var query = (0, react_1.useMemo)(function () {
        var qs = buildQueryString(appliedFilters);
        return qs ? "/api/orders/cancelled?".concat(qs) : '/api/orders/cancelled';
    }, [appliedFilters]);
    var _f = (0, useApiQuery_1.useApiQuery)(query), ordersData = _f.data, loading = _f.loading, error = _f.error, refetch = _f.refetch;
    (0, react_1.useEffect)(function () {
        if (!error) {
            return;
        }
        onFeedback(error, 'error');
    }, [error, onFeedback]);
    var orders = (0, react_1.useMemo)(function () { return (Array.isArray(ordersData) ? ordersData : []); }, [ordersData]);
    var totalValue = (0, react_1.useMemo)(function () {
        if (!orders.length)
            return 0;
        return orders.reduce(function (sum, order) { var _a; return sum + Number((_a = order.total) !== null && _a !== void 0 ? _a : 0); }, 0);
    }, [orders]);
    var handleFilterDraftChange = (0, react_1.useCallback)(function (partial) {
        setFiltersDraft(function (prev) { return (__assign(__assign(__assign({}, prev), partial), { status: 'cancelled' })); });
    }, []);
    var handleApplyFilters = (0, react_1.useCallback)(function () {
        setAppliedFilters(function () { return (__assign(__assign({}, filtersDraft), { status: 'cancelled' })); });
    }, [filtersDraft]);
    var handleResetFilters = (0, react_1.useCallback)(function () {
        setFiltersDraft(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, []);
    var handleQuickRange = (0, react_1.useCallback)(function (range) {
        var now = new Date();
        var start = new Date(now);
        var end = new Date(now);
        if (range === 'today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (range === 'yesterday') {
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(now.getDate() - 1);
            end.setHours(23, 59, 59, 999);
        }
        else if (range === 'week') {
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (range === 'month') {
            start.setMonth(now.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (range === 'all') {
            setFiltersDraft({
                status: 'cancelled',
                startDate: null,
                endDate: null,
            });
            setAppliedFilters({
                status: 'cancelled',
                startDate: null,
                endDate: null,
            });
            return;
        }
        setFiltersDraft({
            status: 'cancelled',
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
        });
        setAppliedFilters({
            status: 'cancelled',
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
        });
    }, []);
    return (<div className="cancelled-orders-panel">
      <div className="cancelled-orders-panel__filters">
        <div className="cancelled-orders-panel__group">
          <label htmlFor="cancelled-start-date">De la</label>
          <input id="cancelled-start-date" type="date" value={(_b = filtersDraft.startDate) !== null && _b !== void 0 ? _b : ''} onChange={function (event) { return handleFilterDraftChange({ startDate: event.target.value || null }); }}/>
        </div>
        <div className="cancelled-orders-panel__group">
          <label htmlFor="cancelled-end-date">Până la</label>
          <input id="cancelled-end-date" type="date" value={(_c = filtersDraft.endDate) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return handleFilterDraftChange({ endDate: event.target.value || null }); }}/>
        </div>
        <div className="cancelled-orders-panel__quick">
          <button type="button" className="btn btn-ghost" onClick={function () { return handleQuickRange('today'); }}>Astăzi</button>
          <button type="button" className="btn btn-ghost" onClick={function () { return handleQuickRange('yesterday'); }}>
            Ieri
          </button>
          <button type="button" className="btn btn-ghost" onClick={function () { return handleQuickRange('week'); }}>
            Ultimele 7 zile
          </button>
          <button type="button" className="btn btn-ghost" onClick={function () { return handleQuickRange('month'); }}>Ultima lună</button>
          <button type="button" className="btn btn-ghost" onClick={function () { return handleQuickRange('all'); }}>Toate</button>
        </div>
        <div className="cancelled-orders-panel__actions">
          <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>Aplică filtre</button>
          <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>Resetează</button>
          <button type="button" className="btn btn-ghost" onClick={function () { return refetch(); }}>Reîmprospătează</button>
        </div>
      </div>

      {loading ? <p>Se încarcă comenzile anulate...</p> : null}
      {!loading && !orders.length ? <InlineAlert_1.InlineAlert variant="info" message="Nu există comenzi anulate pentru filtrul curent."/> : null}

      {!loading && orders.length > 0 ? (<div className="cancelled-orders-summary">
          <span>Total comenzi anulate: <strong>{orders.length}</strong>
          </span>
          <span>Valoare totală pierdută: <strong>{totalValue.toFixed(2)} RON</strong>
          </span>
        </div>) : null}


      <div className="cancelled-orders-list">
        {orders.map(function (order) {
            var _a, _b, _c;
            // Parse items if they come as JSON string from backend
            var items = parseCancelledOrderItems(order.items);
            return (<article key={order.id} className="cancelled-order-card">
              <header className="cancelled-order-card__header">
                <h3>Comanda #{order.id}</h3>
                <span className="cancelled-order-card__badge">ANULATĂ</span>
              </header>
              <div className="cancelled-order-card__meta">
                <p>
                  <strong>Masă:</strong> {(_a = order.table_number) !== null && _a !== void 0 ? _a : '—'}
                </p>
                <p>
                  <strong>Client:</strong> {(_b = order.client_identifier) !== null && _b !== void 0 ? _b : 'Anonim'}
                </p>
                <p>
                  <strong>Data anulării:</strong> {(0, orderHelpers_1.formatTimestamp)(order.cancelled_timestamp)}
                </p>
                {order.cancelled_reason ? (<p>
                    <strong>Motiv:</strong> {order.cancelled_reason}
                  </p>) : null}
                <p>
                  <strong>Valoare:</strong> {Number((_c = order.total) !== null && _c !== void 0 ? _c : 0).toFixed(2)} RON
                </p>
              </div>
              <div className="cancelled-order-card__items">
                <h4>Produse</h4>
                <ul>
                  {items.map(function (item, index) { return (<li key={"".concat(order.id, "-item-").concat(index)}>
                      {item.quantity}x {item.name}
                      {item.customizations && item.customizations.length > 0 ? (<span className="cancelled-order-card__customizations">
                          {' ('}
                          {item.customizations.map(function (custom) { return custom.option_name; }).join(', ')}
                          {')'}
                        </span>) : null}
                    </li>); })}
                </ul>
              </div>
            </article>);
        })}
      </div>
    </div>);
};
exports.CancelledOrdersPanel = CancelledOrdersPanel;
