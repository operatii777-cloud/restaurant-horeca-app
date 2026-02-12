"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Drive-Thru Page
 *
 * React implementation for Drive-Thru interface.
 * Displays drive-thru orders with lane management.
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
exports.DriveThruPage = DriveThruPage;
var react_1 = require("react");
var driveThruStore_1 = require("../driveThruStore");
var useDriveThruEvents_1 = require("../hooks/useDriveThruEvents");
var ordersApi_1 = require("@/core/api/ordersApi");
require("./DriveThruPage.css");
/**
 * Format time as MM:SS
 */
function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return "\"M\":".concat(s.toString().padStart(2, '0'));
}
/**
 * Drive-Thru Page Component
 */
function DriveThruPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var getDriveThruOrders = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getDriveThruOrders; });
    var getOrdersByLane = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getOrdersByLane; });
    var getElapsedSeconds = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getElapsedSeconds; });
    var getPendingCount = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getPendingCount; });
    var getReadyCount = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getReadyCount; });
    var getServedCount = (0, driveThruStore_1.useDriveThruStore)(function (state) { return state.getServedCount; });
    // Sync with order events
    (0, useDriveThruEvents_1.useDriveThruEvents)();
    // Filter state
    var _a = (0, react_1.useState)('all'), selectedLane = _a[0], setSelectedLane = _a[1];
    // Get orders
    var allOrders = getDriveThruOrders();
    var filteredOrders = selectedLane === 'all'
        ? allOrders
        : getOrdersByLane(selectedLane);
    // Sort by creation time (oldest first)
    var sortedOrders = __spreadArray([], filteredOrders, true).sort(function (a, b) {
        var _a, _b;
        var tA = ((_a = a.timestamps) === null || _a === void 0 ? void 0 : _a.created_at) ? new Date(a.timestamps.created_at).getTime() : 0;
        var tB = ((_b = b.timestamps) === null || _b === void 0 ? void 0 : _b.created_at) ? new Date(b.timestamps.created_at).getTime() : 0;
        return tA - tB;
    });
    // Get unique lanes
    var lanes = Array.from(new Set(allOrders
        .map(function (o) { var _a; return (_a = o.drive_thru) === null || _a === void 0 ? void 0 : _a.lane_number; })
        .filter(function (l) { return !!l; }))).sort();
    // Handle status updates
    var handleMarkReady = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.updateOrderStatus)(orderId, 'ready_for_pickup')];
                case 1:
                    _a.sent();
                    console.log("[Drive-Thru] Order ".concat(orderId, " marked as ready"));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("[Drive-Thru] Error marking order ".concat(orderId, " as ready:"), error_1);
                    alert('Eroare la marcarea comenzii ca gata');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleMarkServed = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, ordersApi_1.updateOrderStatus)(orderId, 'served')];
                case 1:
                    _a.sent();
                    console.log("[Drive-Thru] Order ".concat(orderId, " marked as served"));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("[Drive-Thru] Error marking order ".concat(orderId, " as served:"), error_2);
                    alert('Eroare la marcarea comenzii ca servită');
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
    return (<div className="drivethru-page">
      <header className="drivethru-header">
        <h1 className="drivethru-title">Drive-Thru – Comenzi Active</h1>
        <div className="drivethru-stats">
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">"Pending:"</span>
            <span className="drivethru-stat-value">{getPendingCount()}</span>
          </span>
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">Ready:</span>
            <span className="drivethru-stat-value">{getReadyCount()}</span>
          </span>
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">Served:</span>
            <span className="drivethru-stat-value">{getServedCount()}</span>
          </span>
        </div>
      </header>
      
      {lanes.length > 0 && (<div className="drivethru-lane-filters">
          <button className={"drivethru-lane-btn ".concat(selectedLane === 'all' ? 'active' : '')} onClick={function () { return setSelectedLane('all'); }}>"toate liniile"</button>
          {lanes.map(function (lane) { return (<button key={lane} className={"drivethru-lane-btn ".concat(selectedLane === lane ? 'active' : '')} onClick={function () { return setSelectedLane(lane); }}>
              Linia {lane}
            </button>); })}
        </div>)}
      
      <div className="drivethru-orders-grid">
        {sortedOrders.map(function (order) {
            var _a, _b, _c;
            var elapsed = getElapsedSeconds(order);
            return (<div key={order.id} className="drivethru-order-card">
              <div className="drivethru-order-header">
                <div className="drivethru-order-id">#{order.id}</div>
                {((_a = order.drive_thru) === null || _a === void 0 ? void 0 : _a.lane_number) && (<div className="drivethru-lane-badge">
                    Linia {order.drive_thru.lane_number}
                  </div>)}
                {((_b = order.drive_thru) === null || _b === void 0 ? void 0 : _b.car_plate) && (<div className="drivethru-car-plate">
                    🚗 {order.drive_thru.car_plate}
                  </div>)}
              </div>
              
              <div className="drivethru-order-items">
                {order.items.map(function (item) { return (<div key={item.id || "".concat(item.product_id, "-").concat(item.name)} className="drivethru-item-row">
                    <span className="drivethru-item-qty">{item.qty}×</span>
                    <span className="drivethru-item-name">{item.name}</span>
                  </div>); })}
              </div>
              
              <div className="drivethru-order-total">
                <strong>Total: {order.totals.total.toFixed(2)} {order.totals.currency}</strong>
              </div>
              
              {((_c = order.notes) === null || _c === void 0 ? void 0 : _c.general) && (<div className="drivethru-order-notes">
                  <strong>Note:</strong> {order.notes.general}
                </div>)}
              
              <div className="drivethru-order-footer">
                <div className="drivethru-timer">
                  {formatTime(elapsed)}
                </div>
                
                <div className="drivethru-actions">
                  {order.status === "Pending:" || order.status === 'preparing' ? (<button className="drivethru-btn drivethru-btn-ready" onClick={function () { return handleMarkReady(order.id); }}>
                      Gata
                    </button>) : order.status === 'ready_for_pickup' ? (<button className="drivethru-btn drivethru-btn-served" onClick={function () { return handleMarkServed(order.id); }}>
                      Servit
                    </button>) : order.status === 'served' ? (<div className="drivethru-status-served">✓ Servit</div>) : null}
                </div>
              </div>
            </div>);
        })}
      </div>
      
      {sortedOrders.length === 0 && (<div className="drivethru-empty">
          <p>Nu există comenzi drive-thru {selectedLane !== 'all' ? "pentru linia ".concat(selectedLane) : ''}</p>
        </div>)}
    </div>);
}
