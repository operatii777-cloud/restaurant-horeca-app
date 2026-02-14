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
exports.ActiveOrdersPanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var StatCard_1 = require("@/shared/components/StatCard");
var orderHelpers_1 = require("@/modules/orders/utils/orderHelpers");
require("./ActiveOrdersPanel.css");
var VIEW_MODE_STORAGE_KEY = 'admin_v4_orders_view_mode';
function aggregateVisitItems(visit) {
    //   const { t } = useTranslation();
    var map = new Map();
    visit.allItems.forEach(function (item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var key = (_a = item.name) !== null && _a !== void 0 ? _a : item.itemId;
        if (!map.has(key)) {
            map.set(key, {
                name: (_b = item.name) !== null && _b !== void 0 ? _b : 'Produs',
                quantity: (_c = item.quantity) !== null && _c !== void 0 ? _c : 0,
                total: ((_e = (_d = item.finalPrice) !== null && _d !== void 0 ? _d : item.price) !== null && _e !== void 0 ? _e : 0) * ((_f = item.quantity) !== null && _f !== void 0 ? _f : 0),
            });
            return;
        }
        var current = map.get(key);
        current.quantity += (_g = item.quantity) !== null && _g !== void 0 ? _g : 0;
        current.total += ((_j = (_h = item.finalPrice) !== null && _h !== void 0 ? _h : item.price) !== null && _j !== void 0 ? _j : 0) * ((_k = item.quantity) !== null && _k !== void 0 ? _k : 0);
    });
    return Array.from(map.values()).sort(function (a, b) { return b.total - a.total; });
}
function buildQuickRange(range) {
    var now = new Date();
    var start = new Date(now);
    var end = new Date(now);
    if (range === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'week') {
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'month') {
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'all') {
        return { startDate: null, endDate: null };
    }
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}
var ActiveOrdersPanel = function (_a) {
    var _b, _c;
    var orders = _a.orders, loading = _a.loading, filtersDraft = _a.filtersDraft, onFilterDraftChange = _a.onFilterDraftChange, onApplyFilters = _a.onApplyFilters, onResetFilters = _a.onResetFilters, onRefresh = _a.onRefresh, onExport = _a.onExport, onSelectOrder = _a.onSelectOrder, onMarkVisitPaid = _a.onMarkVisitPaid;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(null), activeRange = _d[0], setActiveRange = _d[1];
    var _e = (0, react_1.useState)(false), exporting = _e[0], setExporting = _e[1];
    var _f = (0, react_1.useState)(null), processingVisit = _f[0], setProcessingVisit = _f[1];
    var _g = (0, react_1.useState)(function () {
        if (typeof window === 'undefined') {
            return 'grid';
        }
        var stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        return stored === 'cards' ? 'cards' : 'grid';
    }), viewMode = _g[0], setViewMode = _g[1];
    (0, react_1.useEffect)(function () {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }, [viewMode]);
    var activeOrders = (0, react_1.useMemo)(function () { return orders.filter(function (order) { return order.status !== 'cancelled'; }); }, [orders]);
    var visits = (0, react_1.useMemo)(function () { return (0, orderHelpers_1.groupOrdersByVisit)(activeOrders); }, [activeOrders]);
    var summary = (0, react_1.useMemo)(function () { return (0, orderHelpers_1.summariseOrders)(activeOrders); }, [activeOrders]);
    var columnDefs = (0, react_1.useMemo)(function () {
        return [
            {
                headerName: 'ID',
                field: 'id',
                width: 110,
                sortable: true,
            },
            {
                headerName: 'Masă',
                field: 'table_number',
                width: 120,
                valueFormatter: function (_a) {
                    var value = _a.value, data = _a.data;
                    if (!data)
                        return '';
                    if (value === null || value === undefined) {
                        return data.type === 'takeout' ? 'La pachet' : '—';
                    }
                    return "Masa ".concat(value);
                },
            },
            {
                headerName: 'Client',
                field: 'client_identifier',
                minWidth: 150,
                flex: 1,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return value || 'Anonim';
                },
            },
            {
                headerName: 'Tip',
                field: 'type',
                width: 130,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return (0, orderHelpers_1.formatOrderType)(value !== null && value !== void 0 ? value : 'here');
                },
            },
            {
                headerName: 'Creată la',
                field: 'timestamp',
                width: 190,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return value ? (0, orderHelpers_1.formatTimestamp)(String(value)) : '—';
                },
            },
            {
                headerName: 'Status',
                field: 'status',
                width: 140,
                cellRenderer: function (_a) {
                    var value = _a.value;
                    var status = String(value || '').toLowerCase();
                    return "<span class=\"order-status-badge order-status-badge--".concat(status, "\">").concat(status.toUpperCase(), "</span>");
                },
            },
            {
                headerName: 'Achitată',
                field: 'is_paid',
                width: 120,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return Number(value !== null && value !== void 0 ? value : 0) === 1 ? 'Da' : 'Nu';
                },
                cellClassRules: {
                    'text-success': function (params) { return Number(params.value) === 1; },
                    'text-danger': function (params) { return Number(params.value) === 0; },
                },
            },
            {
                headerName: 'Total',
                field: 'total',
                width: 140,
                type: 'rightAligned',
                valueGetter: function (_a) {
                    var data = _a.data;
                    return (data ? (0, orderHelpers_1.calculateOrderTotal)(data) : 0);
                },
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return "".concat(Number(value !== null && value !== void 0 ? value : 0).toFixed(2), " RON");
                },
            },
            {
                headerName: 'Produse',
                field: 'items',
                flex: 1.2,
                minWidth: 240,
                valueFormatter: function (_a) {
                    var data = _a.data;
                    if (!data)
                        return '';
                    var items = (0, orderHelpers_1.parseOrderItems)(data.items);
                    if (!items.length)
                        return '—';
                    return items
                        .slice(0, 3)
                        .map(function (item) { var _a; return "".concat(item.quantity, "x ").concat((_a = item.name) !== null && _a !== void 0 ? _a : 'Produs'); })
                        .join(', ');
                },
            },
            {
                headerName: 'Acțiuni',
                colId: 'actions',
                width: 150,
                pinned: 'right',
                cellRenderer: function (_a) {
                    var data = _a.data;
                    if (!data)
                        return '';
                    var isPaid = Number(data.is_paid) === 1;
                    return "\n            <div class=\"orders-grid__row-actions\">\n              <button type=\"button\" data-action=\"details\" title=\"Vezi detalii\">\uD83D\uDC41\uFE0F</button>\n              ".concat(!isPaid ? "<button type=\"button\" data-action=\"mark-paid\" title=\"Marcheaz\u0103 ca achitat\u0103\">\uD83D\uDCB0</button>" : '', "\n            </div>\n          ");
                },
            },
        ];
    }, []);
    var handleGridCellClicked = (0, react_1.useCallback)(function (event) {
        var _a, _b, _c;
        if (!event.data) {
            return;
        }
        if (event.colDef.colId === 'actions') {
            var target = (_a = event.event) === null || _a === void 0 ? void 0 : _a.target;
            if (!target)
                return;
            var button = target.closest('button[data-action]');
            if (!button)
                return;
            var action = button.dataset.action;
            if (action === 'details') {
                onSelectOrder(event.data);
            }
            else if (action === 'mark-paid') {
                void onMarkVisitPaid((_b = event.data.table_number) !== null && _b !== void 0 ? _b : null, (_c = event.data.client_identifier) !== null && _c !== void 0 ? _c : null);
            }
            return;
        }
        onSelectOrder(event.data);
    }, [onMarkVisitPaid, onSelectOrder]);
    var handleQuickRange = (0, react_1.useCallback)(function (range) {
        var next = buildQuickRange(range);
        setActiveRange(range);
        var nextFilters = __assign(__assign({}, filtersDraft), { startDate: next.startDate, endDate: next.endDate });
        onFilterDraftChange(nextFilters);
        onApplyFilters(nextFilters);
    }, [filtersDraft, onApplyFilters, onFilterDraftChange]);
    var handleExport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 2, 3]);
                    setExporting(true);
                    return [4 /*yield*/, onExport()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    setExporting(false);
                    return [7 /*endfinally*/];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [onExport]);
    var handleMarkVisit = (0, react_1.useCallback)(function (visit) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setProcessingVisit(visit.key);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onMarkVisitPaid(visit.tableNumber, (_a = visit.clientIdentifier) !== null && _a !== void 0 ? _a : null)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setProcessingVisit(null);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [onMarkVisitPaid]);
    return (<div className="orders-active-panel">
      <div className="orders-filters">
        <div className="orders-filters__row">
          <div className="orders-filters__status">
            <span>Status</span>
            <div className="orders-filters__status-buttons">
              {[
            { key: 'all', label: 'Toate' },
            { key: 'unpaid', label: 'Neachitate' },
            { key: 'paid', label: 'Achitate' },
        ].map(function (item) { return (<button key={item.key} type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': filtersDraft.status === item.key })} onClick={function () {
                onFilterDraftChange({ status: item.key });
                onApplyFilters(__assign(__assign({}, filtersDraft), { status: item.key }));
            }}>
                  {item.label}
                </button>); })}
            </div>
          </div>

          <div className="orders-filters__range">
            <label htmlFor="orders-start-date">De la</label>
            <input id="orders-start-date" type="date" value={(_b = filtersDraft.startDate) !== null && _b !== void 0 ? _b : ''} onChange={function (event) { return onFilterDraftChange({ startDate: event.target.value || null }); }}/>
            <label htmlFor="orders-end-date">Până la</label>
            <input id="orders-end-date" type="date" value={(_c = filtersDraft.endDate) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return onFilterDraftChange({ endDate: event.target.value || null }); }}/>
          </div>

          <div className="orders-filters__quick">
            {['today', 'yesterday', 'week', 'month', 'all'].map(function (range) { return (<button key={range} type="button" className={(0, classnames_1.default)('btn btn-ghost', { 'is-active': activeRange === range })} onClick={function () { return handleQuickRange(range); }}>
                {range === 'today'
                ? 'Astăzi'
                : range === 'yesterday'
                    ? 'Ieri'
                    : range === 'week'
                        ? 'Ultima săptămână'
                        : range === 'month'
                            ? 'Ultima lună'
                            : 'Toate'}
              </button>); })}
          </div>
        </div>

        <div className="orders-filters__actions">
          <button type="button" className="btn btn-primary" onClick={function () { return onApplyFilters(); }}>Aplicare Filtre</button>
          <button type="button" className="btn btn-ghost" onClick={onResetFilters}>Resetează</button>
          <button type="button" className="btn btn-ghost" onClick={function () { return onRefresh(); }}>Reîmprospătează</button>
          <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Se exportă...' : 'Export CSV'}
          </button>
          <div className="orders-filters__view-toggle" role="group" aria-label="mod afisare">
            <button type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': viewMode === 'grid' })} onClick={function () { return setViewMode('grid'); }}>
              Tabel
            </button>
            <button type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': viewMode === 'cards' })} onClick={function () { return setViewMode('cards'); }}>
              Vizite
            </button>
          </div>
        </div>
      </div>

      <div className="orders-summary">
        <StatCard_1.StatCard title="Comenzi totale" helper="Rezultate pentru filtrul curent" value={"".concat(summary.totalOrders)} icon={<span>📦</span>}/>
        <StatCard_1.StatCard title="valoare totala" helper="Suma comenzilor" value={(0, orderHelpers_1.formatCurrency)(summary.totalAmount)} icon={<span>💰</span>}/>
        <StatCard_1.StatCard title="Neachitate" helper={"".concat(summary.unpaidOrders, " comenzi")} value={(0, orderHelpers_1.formatCurrency)(summary.unpaidValue)} trendDirection={summary.unpaidOrders > 0 ? 'up' : 'flat'} trendLabel={summary.unpaidOrders > 0 ? 'Necesită acțiune' : 'OK'} icon={<span>⚠️</span>}/>
        <StatCard_1.StatCard title="Achitate" helper={"".concat(summary.paidOrders, " comenzi")} value={(0, orderHelpers_1.formatCurrency)(summary.paidValue)} icon={<span>✅</span>}/>
      </div>

      {viewMode === 'grid' ? (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={activeOrders} loading={loading} height="62vh" agGridProps={{
                rowSelection: { mode: 'singleRow', enableClickSelection: false },
                getRowId: function (params) { return (params.data ? String(params.data.id) : ''); },
                onCellClicked: handleGridCellClicked,
            }}/>) : null}

      {viewMode === 'cards' ? (<div className="orders-visits">
          {!loading && visits.length === 0 ? (<InlineAlert_1.InlineAlert variant="info" message="Nu există comenzi pentru filtrul selectat."/>) : null}
          {loading ? <p>"se incarca vizitele"</p> : null}
          {!loading && visits.length > 0 ? (<div className="orders-visits__grid">
              {visits.map(function (visit) {
                    var _a, _b;
                    var items = aggregateVisitItems(visit);
                    var firstOrder = visit.orders[0];
                    return (<article key={visit.key} className={(0, classnames_1.default)('order-visit-card', { 'order-visit-card--paid': visit.isPaid })}>
                    <header className="order-visit-card__header">
                      <div>
                        <h3>
                          {visit.tableNumber !== null ? "Masa ".concat(visit.tableNumber) : 'La pachet'} ·{' '}
                          {(_a = visit.clientIdentifier) !== null && _a !== void 0 ? _a : 'Anonim'}
                        </h3>
                        <p>{(0, orderHelpers_1.formatOrderType)((_b = firstOrder === null || firstOrder === void 0 ? void 0 : firstOrder.type) !== null && _b !== void 0 ? _b : 'here')}</p>
                      </div>
                      <span className={(0, classnames_1.default)('order-status-badge', visit.isPaid ? 'order-status-badge--paid' : 'order-status-badge--pending')}>
                        {visit.isPaid ? 'ACHITAT' : 'NEACHITAT'}
                      </span>
                    </header>

                    <div className="order-visit-card__times">
                      <span>Prima comandă: {visit.firstTimestamp ? (0, orderHelpers_1.formatTimestamp)(visit.firstTimestamp) : '—'}</span>
                      <span>Ultima comandă: {visit.lastTimestamp ? (0, orderHelpers_1.formatTimestamp)(visit.lastTimestamp) : '—'}</span>
                    </div>

                    <div className="order-visit-card__items">
                      <ul>
                        {items.slice(0, 6).map(function (item) { return (<li key={"".concat(visit.key, "-").concat(item.name)}>
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(0, orderHelpers_1.formatCurrency)(item.total)}</span>
                          </li>); })}
                      </ul>
                      {items.length > 6 ? (<small>+ {items.length - 6} produse suplimentare</small>) : null}
                    </div>

                    {(visit.notes.food || visit.notes.drink || visit.notes.general) && (<div className="order-visit-card__notes">
                        {visit.notes.food ? <p>🍽️ {visit.notes.food}</p> : null}
                        {visit.notes.drink ? <p>🥤 {visit.notes.drink}</p> : null}
                        {visit.notes.general ? <p>📝 {visit.notes.general}</p> : null}
                      </div>)}

                    <footer className="order-visit-card__footer">
                      <div className="order-visit-card__total">
                        <span>Total Vizită</span>
                        <strong>{(0, orderHelpers_1.formatCurrency)(visit.totalAmount)}</strong>
                      </div>
                      <div className="order-visit-card__actions">
                        <button type="button" className="btn btn-ghost" onClick={function () { return onSelectOrder(firstOrder); }} disabled={!firstOrder}>
                          👁️ Detalii
                        </button>
                        {!visit.isPaid ? (<button type="button" className="btn btn-primary" onClick={function () { return handleMarkVisit(visit); }} disabled={processingVisit === visit.key}>
                            {processingVisit === visit.key ? 'Se procesează...' : '💰 Marchează achitată'}
                          </button>) : null}
                      </div>
                    </footer>
                  </article>);
                })}
            </div>) : null}
        </div>) : null}
    </div>);
};
exports.ActiveOrdersPanel = ActiveOrdersPanel;
