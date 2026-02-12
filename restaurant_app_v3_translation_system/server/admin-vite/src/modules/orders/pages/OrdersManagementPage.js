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
exports.OrdersManagementPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
var OrderDetailsDrawer_1 = require("@/modules/orders/components/OrderDetailsDrawer");
var CancelledOrdersPanel_1 = require("@/modules/orders/components/CancelledOrdersPanel");
var ActiveOrdersPanel_1 = require("@/modules/orders/components/ActiveOrdersPanel");
var OrdersAnalyticsPanel_1 = require("@/modules/orders/components/OrdersAnalyticsPanel");
var TopProductsPanel_1 = require("@/modules/orders/components/TopProductsPanel");
var OrdersArchivePanel_1 = require("@/modules/orders/components/OrdersArchivePanel");
var orderHelpers_1 = require("@/modules/orders/utils/orderHelpers");
require("./OrdersManagementPage.css");
var DEFAULT_FILTERS = {
    status: 'all',
    startDate: null,
    endDate: null,
};
function normaliseFilters(filters) {
    var _a, _b;
    if (!filters) {
        return DEFAULT_FILTERS;
    }
    return {
        status: filters.status === 'cancelled' ? 'all' : filters.status,
        startDate: (_a = filters.startDate) !== null && _a !== void 0 ? _a : null,
        endDate: (_b = filters.endDate) !== null && _b !== void 0 ? _b : null,
    };
}
var OrdersManagementPage = function () {
    //   const { t } = useTranslation();
    var restoredFilters = (0, react_1.useMemo)(function () { return normaliseFilters((0, orderHelpers_1.restoreOrdersFilters)()); }, []);
    var _a = (0, react_1.useState)('active'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(restoredFilters), filtersDraft = _b[0], setFiltersDraft = _b[1];
    var _c = (0, react_1.useState)(restoredFilters), appliedFilters = _c[0], setAppliedFilters = _c[1];
    var _d = (0, react_1.useState)(null), feedback = _d[0], setFeedback = _d[1];
    var _e = (0, react_1.useState)(false), pageReady = _e[0], setPageReady = _e[1];
    var _f = (0, react_1.useState)(false), detailsDrawerOpen = _f[0], setDetailsDrawerOpen = _f[1];
    var _g = (0, react_1.useState)(null), selectedOrder = _g[0], setSelectedOrder = _g[1];
    (0, react_1.useEffect)(function () {
        (0, orderHelpers_1.rememberOrdersFilters)(appliedFilters);
    }, [appliedFilters]);
    var ordersQuery = (0, react_1.useMemo)(function () {
        var params = new URLSearchParams();
        params.set('status', appliedFilters.status);
        if (appliedFilters.startDate) {
            params.set('startDate', appliedFilters.startDate);
        }
        if (appliedFilters.endDate) {
            params.set('endDate', appliedFilters.endDate);
        }
        var qs = params.toString();
        return qs ? "/api/orders-delivery?\"Qs\"" : '/api/orders-delivery';
    }, [appliedFilters]);
    var _h = (0, useApiQuery_1.useApiQuery)(ordersQuery), ordersData = _h.data, ordersLoading = _h.loading, ordersError = _h.error, refetchOrders = _h.refetch;
    var orders = (0, react_1.useMemo)(function () { return (Array.isArray(ordersData) ? ordersData : []); }, [ordersData]);
    (0, react_1.useEffect)(function () {
        if (!ordersLoading) {
            setPageReady(true);
        }
    }, [ordersLoading]);
    (0, react_1.useEffect)(function () {
        if (!ordersError) {
            return;
        }
        setFeedback({
            type: 'error',
            message: ordersError,
        });
    }, [ordersError]);
    var handleGlobalFeedback = (0, react_1.useCallback)(function (message, type) {
        if (type === void 0) { type = 'info'; }
        setFeedback({ message: message, type: type });
    }, []);
    var handleDismissFeedback = (0, react_1.useCallback)(function () { return setFeedback(null); }, []);
    var handleFilterDraftChange = (0, react_1.useCallback)(function (partial) {
        setFiltersDraft(function (prev) { return (__assign(__assign({}, prev), partial)); });
    }, []);
    var handleApplyFilters = (0, react_1.useCallback)(function (next) {
        setFiltersDraft(function (prev) {
            var _a, _b;
            var base = next !== null && next !== void 0 ? next : prev;
            var payload = {
                status: base.status === 'cancelled' ? 'all' : base.status,
                startDate: (_a = base.startDate) !== null && _a !== void 0 ? _a : null,
                endDate: (_b = base.endDate) !== null && _b !== void 0 ? _b : null,
            };
            setAppliedFilters(payload);
            return payload;
        });
    }, []);
    var handleResetFilters = (0, react_1.useCallback)(function () {
        setFiltersDraft(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, []);
    var handleRefreshOrders = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, refetchOrders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [refetchOrders]);
    var handleExportOrders = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, blob, url, link, fileDate, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = new URLSearchParams();
                    if (appliedFilters.startDate)
                        params.set('startDate', appliedFilters.startDate);
                    if (appliedFilters.endDate)
                        params.set('endDate', appliedFilters.endDate);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/orders/export', {
                            params: params,
                            responseType: 'blob',
                        })];
                case 2:
                    response = _a.sent();
                    blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement('a');
                    link.href = url;
                    fileDate = new Date().toISOString().slice(0, 10);
                    link.download = "orders-".concat(fileDate, ".csv");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    handleGlobalFeedback('Exportul comenzilor a fost generat.', 'success');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Eroare la exportul comenzilor:', error_1);
                    handleGlobalFeedback('Nu s-a putut genera exportul comenzilor.', 'error');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [appliedFilters.endDate, appliedFilters.startDate, handleGlobalFeedback]);
    var handleSelectOrder = (0, react_1.useCallback)(function (order) {
        if (!order) {
            return;
        }
        setSelectedOrder(order);
        setDetailsDrawerOpen(true);
    }, []);
    var handleCloseDrawer = (0, react_1.useCallback)(function () {
        setDetailsDrawerOpen(false);
    }, []);
    var handleMarkVisitPaid = (0, react_1.useCallback)(function (tableNumber, clientIdentifier) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2, message;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/visits/close', {
                            tableNumber: tableNumber,
                            clientIdentifier: clientIdentifier,
                        })];
                case 1:
                    _d.sent();
                    handleGlobalFeedback('Comanda a fost marcată ca achitată.', 'success');
                    return [4 /*yield*/, refetchOrders()];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _d.sent();
                    console.error('Eroare la marcarea vizitei ca achitată:', error_2);
                    message = (_c = (_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : (error_2 instanceof Error ? error_2.message : 'Nu s-a putut marca vizita ca achitată.');
                    handleGlobalFeedback(message, 'error');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [handleGlobalFeedback, refetchOrders]);
    var summary = (0, react_1.useMemo)(function () { return (0, orderHelpers_1.summariseOrders)(orders); }, [orders]);
    return (<div className="orders-management-page" data-page-ready={pageReady ? 'true' : 'false'}>
      <header className="orders-management-header">
        <div className="orders-management-header__intro">
          <div>
            <h1>Gestionare comenzi</h1>
            <p>Monitorizează comenzile active, plățile și analizele.</p>
          </div>
          <div className="orders-management-header__tags">
            <span>Filtrare avansată și export CSV</span>
            <span>Analitice anulări & top produse</span>
            <span>Integrare cu arhiva istoric</span>
          </div>
        </div>

        <div className="orders-management-summary">
          <div className="orders-management-summary__item">
            <span>Comenzi totale</span>
            <strong>{summary.totalOrders}</strong>
          </div>
          <div className="orders-management-summary__item">
            <span>Neachitate</span>
            <strong className={summary.unpaidOrders > 0 ? 'warning' : undefined}>{summary.unpaidOrders}</strong>
          </div>
          <div className="orders-management-summary__item">
            <span>Valoare totală</span>
            <strong>{summary.totalAmount.toFixed(2)} RON</strong>
          </div>
        </div>

        <div className="orders-management-tablist" role="tablist" aria-label="Taburi gestionare comenzi">
          {[
            { key: 'active', emoji: '📋', label: 'Comenzi active' },
            { key: 'cancelled', emoji: '🛑', label: 'Comenzi anulate' },
            { key: 'analytics', emoji: '📊', label: 'Analitice anulări' },
            { key: 'top-products', emoji: '🏆', label: 'Top produse' },
            { key: 'archive', emoji: '🗃️', label: 'Arhivă comenzi' },
        ].map(function (tab) { return (<button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} className={(0, classnames_1.default)('orders-management-tab', { 'is-active': activeTab === tab.key })} onClick={function () { return setActiveTab(tab.key); }}>
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>); })}
        </div>
      </header>

      <section className="orders-management-content">
        {feedback ? (<InlineAlert_1.InlineAlert title={feedback.type === 'error' ? 'Eroare' : feedback.type === 'success' ? 'Succes' : 'Informație'} variant={feedback.type} message={feedback.message} onClose={handleDismissFeedback}/>) : null}

        {activeTab === 'active' ? (<ActiveOrdersPanel_1.ActiveOrdersPanel orders={orders} loading={ordersLoading} filtersDraft={filtersDraft} onFilterDraftChange={handleFilterDraftChange} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} onRefresh={handleRefreshOrders} onExport={handleExportOrders} onSelectOrder={handleSelectOrder} onMarkVisitPaid={handleMarkVisitPaid}/>) : null}

        {activeTab === 'cancelled' ? <CancelledOrdersPanel_1.CancelledOrdersPanel onFeedback={handleGlobalFeedback}/> : null}
        {activeTab === 'analytics' ? <OrdersAnalyticsPanel_1.OrdersAnalyticsPanel onFeedback={handleGlobalFeedback}/> : null}
        {activeTab === 'top-products' ? <TopProductsPanel_1.TopProductsPanel onFeedback={handleGlobalFeedback}/> : null}
        {activeTab === 'archive' ? <OrdersArchivePanel_1.OrdersArchivePanel onFeedback={handleGlobalFeedback}/> : null}
      </section>

      <OrderDetailsDrawer_1.OrderDetailsDrawer open={detailsDrawerOpen} order={selectedOrder} onClose={handleCloseDrawer} onOrderUpdated={refetchOrders} onFeedback={handleGlobalFeedback}/>
    </div>);
};
exports.OrdersManagementPage = OrdersManagementPage;
