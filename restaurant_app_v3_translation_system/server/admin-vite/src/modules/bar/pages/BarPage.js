"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Page
 *
 * React implementation replacing "comenzi bar.html".
 * Displays orders with bar items in real-time.
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
exports.BarPage = BarPage;
var react_1 = require("react");
var barStore_1 = require("../barStore");
var useBarEvents_1 = require("../hooks/useBarEvents");
var ordersApi_1 = require("@/core/api/ordersApi");
require("./BarPage.css");
/**
 * Format time as MM:SS
 */
function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return "".concat(m, ":").concat(s.toString().padStart(2, '0'));
}
/**
 * Get time class based on elapsed time
 */
function getTimeClass(elapsed) {
    if (elapsed > 15 * 60)
        return 'urgent'; // > 15 min
    if (elapsed > 8 * 60)
        return 'warning'; // > 8 min
    return 'normal';
}
/**
 * Bar Page Component
 */
function BarPage() {
    var _this = this;
    //   const { t } = useTranslation();
    // Access store methods using selector (same pattern as KdsPage)
    // CRITICAL: Add defensive checks to prevent "Cannot read properties of undefined"
    var getBarOrders = (0, barStore_1.useBarStore)(function (state) { return state === null || state === void 0 ? void 0 : state.getBarOrders; });
    var getElapsedSeconds = (0, barStore_1.useBarStore)(function (state) { return state === null || state === void 0 ? void 0 : state.getElapsedSeconds; });
    var getPendingCount = (0, barStore_1.useBarStore)(function (state) { return state === null || state === void 0 ? void 0 : state.getPendingCount; });
    var getPreparingCount = (0, barStore_1.useBarStore)(function (state) { return state === null || state === void 0 ? void 0 : state.getPreparingCount; });
    var getReadyCount = (0, barStore_1.useBarStore)(function (state) { return state === null || state === void 0 ? void 0 : state.getReadyCount; });
    // Sync with order events
    (0, useBarEvents_1.useBarEvents)();
    // Get orders with defensive check
    var orders = (getBarOrders === null || getBarOrders === void 0 ? void 0 : getBarOrders()) || [];
    // Sort by creation time (oldest first)
    var sortedOrders = __spreadArray([], orders, true).sort(function (a, b) {
        var _a, _b;
        var tA = ((_a = a.timestamps) === null || _a === void 0 ? void 0 : _a.created_at) ? new Date(a.timestamps.created_at).getTime() : 0;
        var tB = ((_b = b.timestamps) === null || _b === void 0 ? void 0 : _b.created_at) ? new Date(b.timestamps.created_at).getTime() : 0;
        return tA - tB;
    });
    // Handle "Ready" button
    var handleReady = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.markOrderReady)(orderId)];
                case 1:
                    _a.sent();
                    console.log("'Bar' Order ".concat(orderId, " marked as ready"));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("'Bar' Error marking order ".concat(orderId, " as ready:"), error_1);
                    alert('Eroare la marcarea comenzii ca gata');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Update timer every second
    var _a = (0, react_1.useState)(Date.now()), now = _a[0], setNow = _a[1];
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            setNow(Date.now());
        }, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    return (<div className="bar-page">
      <header className="bar-header">
        <h1 className="bar-title">Bar – Comenzi Active</h1>
        <div className="bar-stats">
          <span className="bar-stat-item">
            <span className="bar-stat-label">Pending:</span>
            <span className="bar-stat-value">{(getPendingCount === null || getPendingCount === void 0 ? void 0 : getPendingCount()) || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Preparing:</span>
            <span className="bar-stat-value">{(getPreparingCount === null || getPreparingCount === void 0 ? void 0 : getPreparingCount()) || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Ready:</span>
            <span className="bar-stat-value">{(getReadyCount === null || getReadyCount === void 0 ? void 0 : getReadyCount()) || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Total:</span>
            <span className="bar-stat-value">{sortedOrders.length}</span>
          </span>
        </div>
      </header>



      <div className="bar-orders-grid">
        {sortedOrders.map(function (order) {
            var _a;
            var elapsed = (getElapsedSeconds === null || getElapsedSeconds === void 0 ? void 0 : getElapsedSeconds(order)) || 0;
            var timeClass = getTimeClass(elapsed);
            // Filter bar items only
            var barItems = order.items.filter(function (item) { return item.station === 'bar'; });
            if (barItems.length === 0)
                return null;
            return (<div key={order.id} className={"bar-order-card ".concat(timeClass)}>
              <div className="bar-order-header">
                <div className="bar-order-id">#{order.id}</div>
                {order.table && (<div className="bar-order-table">Masa {order.table}</div>)}
                {order.type === "Delivery" && (<div className="bar-badge bar-badge-delivery">Delivery</div>)}
                {order.type === 'takeout' && (<div className="bar-badge bar-badge-takeout">Takeout</div>)}
              </div>

              <div className="bar-order-items">
                {barItems.map(function (item) { return (<div key={item.id || "".concat(item.product_id, "-").concat(item.name)} className="bar-item-row">
                    <div className="bar-item-main">
                      <span className="bar-item-qty">{item.qty}×</span>
                      <span className="bar-item-name">{item.name}</span>
                    </div>

                    {item.options && item.options.length > 0 && (<div className="bar-item-options">
                        {item.options.map(function (opt, idx) { return (<span key={idx} className="bar-item-option">
                            {opt.label}
                          </span>); })}
                      </div>)}

                    {item.notes && (<div className="bar-item-notes">
                        <strong>Note:</strong> {item.notes}
                      </div>)}
                  </div>); })}
              </div>

              {((_a = order.notes) === null || _a === void 0 ? void 0 : _a.bar) && (<div className="bar-order-notes">
                  <strong>Note bar:</strong> {order.notes.bar}
                </div>)}

              <div className="bar-order-footer">
                <div className={"bar-timer ".concat(timeClass)}>
                  {formatTime(elapsed)}
                </div>

                {order.status !== 'ready' && (<button className="bar-ready-btn" onClick={function () { return handleReady(order.id); }}>
                    Gata
                  </button>)}

                {order.status === 'ready' && (<div className="bar-status-ready">✓ Gata</div>)}
              </div>
            </div>);
        })}
      </div>

      {sortedOrders.length === 0 && (<div className="bar-empty">
          <p>Nu există comenzi active pentru bar</p>
        </div>)}
    </div>);
}
