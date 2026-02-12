"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Waiter Page
 *
 * React implementation replacing comanda-supervisor1-11.html.
 * Displays unpaid orders for tables (waiter/supervisor interface).
 * Supports multiple waiter views (1-11).
 *
 * Note: comanda-supervisor11.html also functions as KIOSK interface,
 * but for supervisor functionality (unpaid orders), this component covers it.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaiterPage = WaiterPage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var waiterStore_1 = require("../waiterStore");
var useWaiterEvents_1 = require("../hooks/useWaiterEvents");
var ordersApi_1 = require("@/core/api/ordersApi");
require("./WaiterPage.css");
/**
 * Format time as MM:SS
 */
function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return "\"M\":".concat(s.toString().padStart(2, '0'));
}
/**
 * Waiter Page Component
 * Supports /waiter/:waiterId (1-11)
 * - waiterId 1-10: Regular waiter views
 * - waiterId 11: Supervisor 11 (Trattoria theme variant)
 */
function WaiterPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var waiterId = (0, react_router_dom_1.useParams)().waiterId;
    var waiterNumber = waiterId ? parseInt(waiterId, 10) : null;
    var getUnpaidOrders = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getUnpaidOrders; });
    var getOrdersByTable = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getOrdersByTable; });
    var getOrdersByWaiter = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getOrdersByWaiter; });
    var getElapsedSeconds = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getElapsedSeconds; });
    var getUnpaidCount = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getUnpaidCount; });
    var getTotalUnpaid = (0, waiterStore_1.useWaiterStore)(function (state) { return state.getTotalUnpaid; });
    // Sync with order events
    (0, useWaiterEvents_1.useWaiterEvents)();
    // Filter state
    var _a = (0, react_1.useState)('all'), selectedTable = _a[0], setSelectedTable = _a[1];
    // Get orders
    var allOrders = waiterNumber
        ? getOrdersByWaiter(waiterNumber)
        : getUnpaidOrders();
    var filteredOrders = selectedTable === 'all'
        ? allOrders
        : getOrdersByTable(selectedTable);
    // Group by table
    var ordersByTable = filteredOrders.reduce(function (acc, order) {
        var table = String(order.table || 'N/A');
        if (!acc[table])
            acc[table] = [];
        acc[table].push(order);
        return acc;
    }, {});
    // Get unique tables
    var tables = Array.from(new Set(allOrders.map(function (o) { return String(o.table || 'N/A'); }))).sort();
    // Handle mark as paid
    var handleMarkPaid = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.markOrderPaid)(orderId)];
                case 1:
                    _a.sent();
                    console.log("'Waiter' Order ".concat(orderId, " marked as paid"));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("'Waiter' Error marking order ".concat(orderId, " as paid:"), error_1);
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
    return (<div className="waiter-page">
      <header className="waiter-header">
        <h1 className="waiter-title">
          {waiterNumber === 11
            ? 'Supervisor 11 (Trattoria)'
            : waiterNumber
                ? "Osp\u0103tar ".concat(waiterNumber)
                : 'Supervisor'} – Comenzi Neachitate
        </h1>
        <div className="waiter-stats">
          <span className="waiter-stat-item">
            <span className="waiter-stat-label">Comenzi:</span>
            <span className="waiter-stat-value">{getUnpaidCount()}</span>
          </span>
          <span className="waiter-stat-item">
            <span className="waiter-stat-label">Total:</span>
            <span className="waiter-stat-value">{getTotalUnpaid().toFixed(2)} RON</span>
          </span>
        </div>
      </header>
      
      {tables.length > 0 && (<div className="waiter-table-filters">
          <button className={"waiter-table-btn ".concat(selectedTable === 'all' ? 'active' : '')} onClick={function () { return setSelectedTable('all'); }}>"toate mesele"</button>
          {tables.map(function (table) { return (<button key={table} className={"waiter-table-btn ".concat(selectedTable === table ? 'active' : '')} onClick={function () { return setSelectedTable(table); }}>
              Masa {table}
            </button>); })}
        </div>)}
      
      <div className="waiter-orders-grid">
        {Object.entries(ordersByTable).map(function (_a) {
            var table = _a[0], orders = _a[1];
            return (<div key={table} className="waiter-table-section">
            <h2 className="waiter-table-title">Masa {table}</h2>
            
            {orders.map(function (order) {
                    var _a;
                    var elapsed = getElapsedSeconds(order);
                    var tableTotal = orders.reduce(function (sum, o) { return sum + o.totals.total; }, 0);
                    return (<div key={order.id} className="waiter-order-card">
                  <div className="waiter-order-header">
                    <div className="waiter-order-id">#{order.id}</div>
                    <div className="waiter-order-total">
                      {order.totals.total.toFixed(2)} {order.totals.currency}
                    </div>
                  </div>
                  
                  <div className="waiter-order-items">
                    {order.items.map(function (item) { return (<div key={item.id || "".concat(item.product_id, "-").concat(item.name)} className="waiter-item-row">
                        <span className="waiter-item-qty">{item.qty}×</span>
                        <span className="waiter-item-name">{item.name}</span>
                        <span className="waiter-item-price">
                          {(item.unit_price * item.qty).toFixed(2)} {order.totals.currency}
                        </span>
                      </div>); })}
                  </div>
                  
                  {((_a = order.notes) === null || _a === void 0 ? void 0 : _a.general) && (<div className="waiter-order-notes">
                      <strong>Note:</strong> {order.notes.general}
                    </div>)}
                  
                  <div className="waiter-order-footer">
                    <div className="waiter-timer">
                      {formatTime(elapsed)}
                    </div>
                    
                    <button className="waiter-btn waiter-btn-paid" onClick={function () { return handleMarkPaid(order.id); }}>"marcheaza achitat"</button>
                  </div>
                </div>);
                })}
            
            {orders.length > 1 && (<div className="waiter-table-total">
                <strong>Total Masă {table}: {orders.reduce(function (sum, o) { return sum + o.totals.total; }, 0).toFixed(2)} RON</strong>
              </div>)}
          </div>);
        })}
      </div>
      
      {filteredOrders.length === 0 && (<div className="waiter-empty">
          <p>Nu există comenzi neachitate {selectedTable !== 'all' ? "pentru masa ".concat(selectedTable) : ''}</p>
        </div>)}
    </div>);
}
