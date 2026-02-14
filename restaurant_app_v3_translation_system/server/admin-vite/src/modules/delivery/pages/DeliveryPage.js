"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Delivery Page
 *
 * React implementation replacing livrare1-10.html.
 * Displays delivery orders with status management.
 * Supports multiple waiter interfaces (1-10).
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPage = DeliveryPage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var deliveryStore_1 = require("../deliveryStore");
var useDeliveryEvents_1 = require("../hooks/useDeliveryEvents");
var ordersApi_1 = require("@/core/api/ordersApi");
require("./DeliveryPage.css");
/**
 * Format time as MM:SS
 */
function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return "\"M\":".concat(s.toString().padStart(2, '0'));
}
/**
 * Delivery Page Component
 * Supports /delivery/:waiterId (1-10)
 */
function DeliveryPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var waiterId = (0, react_router_dom_1.useParams)().waiterId;
    var waiterNumber = waiterId ? parseInt(waiterId, 10) : null;
    var getDeliveryOrders = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getDeliveryOrders; });
    var getOrdersByStatus = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getOrdersByStatus; });
    var getElapsedSeconds = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getElapsedSeconds; });
    var getReadyCount = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getReadyCount; });
    var getDeliveredCount = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getDeliveredCount; });
    var getPaidCount = (0, deliveryStore_1.useDeliveryStore)(function (state) { return state.getPaidCount; });
    // Sync with order events
    (0, useDeliveryEvents_1.useDeliveryEvents)();
    // Filter state
    var _a = (0, react_1.useState)('ready'), filterStatus = _a[0], setFilterStatus = _a[1];
    // Get orders
    var allOrders = getDeliveryOrders();
    var filteredOrders = filterStatus === 'all'
        ? allOrders
        : getOrdersByStatus(filterStatus);
    // Sort by creation time (oldest first)
    var sortedOrders = __spreadArray([], filteredOrders, true).sort(function (a, b) {
        var _a, _b;
        var tA = ((_a = a.timestamps) === null || _a === void 0 ? void 0 : _a.created_at) ? new Date(a.timestamps.created_at).getTime() : 0;
        var tB = ((_b = b.timestamps) === null || _b === void 0 ? void 0 : _b.created_at) ? new Date(b.timestamps.created_at).getTime() : 0;
        return tA - tB;
    });
    // Handle status updates
    var handleMarkDelivered = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.markOrderDelivered)(orderId)];
                case 1:
                    _a.sent();
                    console.log("'Delivery' Order ".concat(orderId, " marked as delivered"));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("'Delivery' Error marking order ".concat(orderId, " as delivered:"), error_1);
                    alert('Eroare la marcarea comenzii ca livrată');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleMarkPaid = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.markOrderPaid)(orderId)];
                case 1:
                    _a.sent();
                    console.log("'Delivery' Order ".concat(orderId, " marked as paid"));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("'Delivery' Error marking order ".concat(orderId, " as paid:"), error_2);
                    alert('Eroare la marcarea comenzii ca achitată');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Update timer every second
    var _b = (0, react_1.useState)(Date.now()), now = _b[0], setNow = _b[1];
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            setNow(Date.now());
        }, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    return (<div className="delivery-page">
      <header className="delivery-header">
        <h1 className="delivery-title">
          Livrare {waiterNumber ? "- Osp\u0103tar ".concat(waiterNumber) : ''}
        </h1>
        <div className="delivery-stats">
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Gata:</span>
            <span className="delivery-stat-value">{getReadyCount()}</span>
          </span>
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Livrate:</span>
            <span className="delivery-stat-value">{getDeliveredCount()}</span>
          </span>
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Achitate:</span>
            <span className="delivery-stat-value">{getPaidCount()}</span>
          </span>
        </div>
      </header>
      
      <div className="delivery-filters">
        <button className={"delivery-filter-btn ".concat(filterStatus === 'ready' ? 'active' : '')} onClick={function () { return setFilterStatus('ready'); }}>
          Gata
        </button>
        <button className={"delivery-filter-btn ".concat(filterStatus === 'delivered' ? 'active' : '')} onClick={function () { return setFilterStatus('delivered'); }}>
          Livrate
        </button>
        <button className={"delivery-filter-btn ".concat(filterStatus === 'paid' ? 'active' : '')} onClick={function () { return setFilterStatus('paid'); }}>
          Achitate
        </button>
        <button className={"delivery-filter-btn ".concat(filterStatus === 'all' ? 'active' : '')} onClick={function () { return setFilterStatus('all'); }}>"Toate"</button>
      </div>
      
      <div className="delivery-orders-grid">
        {sortedOrders.map(function (order) {
            var _a, _b, _c, _d;
            var elapsed = getElapsedSeconds(order);
            return (<div key={order.id} className="delivery-order-card">
              <div className="delivery-order-header">
                <div className="delivery-order-id">#{order.id}</div>
                {((_a = order.customer) === null || _a === void 0 ? void 0 : _a.name) && (<div className="delivery-customer-name">{order.customer.name}</div>)}
                {((_b = order.customer) === null || _b === void 0 ? void 0 : _b.phone) && (<a href={"tel:".concat(order.customer.phone)} className="delivery-customer-phone">
                    📞 {order.customer.phone}
                  </a>)}
              </div>
              
              {((_c = order.delivery) === null || _c === void 0 ? void 0 : _c.address) && (<div className="delivery-address">
                  <strong>"Adresă:"</strong> {order.delivery.address}
                </div>)}
              
              <div className="delivery-order-items">
                {order.items.map(function (item) { return (<div key={item.id || "".concat(item.product_id, "-").concat(item.name)} className="delivery-item-row">
                    <span className="delivery-item-qty">{item.qty}×</span>
                    <span className="delivery-item-name">{item.name}</span>
                  </div>); })}
              </div>
              
              <div className="delivery-order-total">
                <strong>Total: {order.totals.total.toFixed(2)} {order.totals.currency}</strong>
              </div>
              
              {((_d = order.notes) === null || _d === void 0 ? void 0 : _d.general) && (<div className="delivery-order-notes">
                  <strong>Note:</strong> {order.notes.general}
                </div>)}
              
              <div className="delivery-order-footer">
                <div className="delivery-timer">
                  {formatTime(elapsed)}
                </div>
                
                <div className="delivery-actions">
                  {order.status === 'ready' && (<button className="delivery-btn delivery-btn-deliver" onClick={function () { return handleMarkDelivered(order.id); }}>"marcheaza livrat"</button>)}
                  
                  {order.status === 'delivered' && (<button className="delivery-btn delivery-btn-paid" onClick={function () { return handleMarkPaid(order.id); }}>"marcheaza achitat"</button>)}
                  
                  {order.status === 'paid' && (<div className="delivery-status-paid">✓ Achitat</div>)}
                </div>
              </div>
            </div>);
        })}
      </div>
      
      {sortedOrders.length === 0 && (<div className="delivery-empty">
          <p>Nu există comenzi {filterStatus === 'all' ? '' : filterStatus}</p>
        </div>)}
    </div>);
}
