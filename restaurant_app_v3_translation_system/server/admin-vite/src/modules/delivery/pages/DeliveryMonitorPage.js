"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
// =====================================================================
// DELIVERY MONITOR PAGE (TV Display)
// Ecran dedicat pentru zona de livrări - afișează doar comenzi delivery
// =====================================================================
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
exports.DeliveryMonitorPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./DeliveryMonitorPage.css");
var PLATFORM_ICONS = {
    glovo: '🚚',
    wolt: '📱',
    bolt_food: '🍴',
    friendsride: '🚗',
    tazz: '⚡',
    phone: '📞',
    online: '🌐',
    pos: '💰'
};
var DeliveryMonitorPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), inPreparation = _a[0], setInPreparation = _a[1];
    var _b = (0, react_1.useState)([]), ready = _b[0], setReady = _b[1];
    var _c = (0, react_1.useState)(new Date()), lastUpdate = _c[0], setLastUpdate = _c[1];
    var audioRef = (0, react_1.useRef)(null);
    var _d = (0, react_1.useState)(0), previousCount = _d[0], setPreviousCount = _d[1];
    (0, react_1.useEffect)(function () {
        fetchOrders();
        var interval = setInterval(function () {
            fetchOrders();
        }, 10000); // Refresh la 10s
        return function () { return clearInterval(interval); };
    }, []);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, currentCount, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/orders/delivery/monitor')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        currentCount = data.in_preparation.length + data.ready.length;
                        // Sunet + flash la comandă nouă
                        if (currentCount > previousCount) {
                            playNotificationSound();
                            flashScreen();
                        }
                        setInPreparation(data.in_preparation);
                        setReady(data.ready);
                        setPreviousCount(currentCount);
                        setLastUpdate(new Date());
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error fetching orders:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var playNotificationSound = function () {
        if (audioRef.current) {
            audioRef.current.play().catch(function (e) { return console.log('Audio play failed:', e); });
        }
    };
    var flashScreen = function () {
        document.body.classList.add('flash-animation');
        setTimeout(function () {
            document.body.classList.remove('flash-animation');
        }, 500);
    };
    var markAsDelivered = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/orders/".concat(orderId), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'delivered', delivered_timestamp: new Date().toISOString() })
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        fetchOrders();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error marking as delivered:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var markAsPaid = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/orders/".concat(orderId), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_paid: true, paid_timestamp: new Date().toISOString() })
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        fetchOrders();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error marking as paid:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getWaitTime = function (timestamp) {
        var orderTime = new Date(timestamp);
        var now = new Date();
        var diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
        return diffMinutes;
    };
    var getProgressPercent = function (order) {
        var items = order.items || [];
        if (items.length === 0)
            return 0;
        var completedItems = items.filter(function (item) { return item.status === 'completed' || item.status === 'ready'; }).length;
        return Math.round((completedItems / items.length) * 100);
    };
    var getPlatformIcon = function (platform) {
        return PLATFORM_icons[platform] || '📦';
    };
    var renderOrderCard = function (order, isReady) {
        var waitTime = getWaitTime(order.timestamp);
        var progress = getProgressPercent(order);
        return (<react_bootstrap_1.Card key={order.id} className={"delivery-order-card ".concat(isReady ? 'ready' : 'preparing', " ").concat(waitTime > 30 ? 'urgent' : '')}>
        <react_bootstrap_1.Card.Header>
          <div className="order-header">
            <div>
              <h4>#{order.id}</h4>
              {order.delivery_pickup_code && (<react_bootstrap_1.Badge bg="warning" className="pickup-code">
                  Cod: {order.delivery_pickup_code}
                </react_bootstrap_1.Badge>)}
            </div>
            <div className="order-meta">
              <span className="platform-badge">{getPlatformIcon(order.platform)}</span>
              <react_bootstrap_1.Badge bg={order.payment_method === 'cash' ? 'success' : order.payment_method === 'protocol' || order.payment_method === 'degustare' ? 'secondary' : 'info'}>
                {order.payment_method === 'cash' ? '💵 NUMERAR' : order.payment_method === 'card' ? '💳 CARD' : order.payment_method === 'protocol' ? '📋 PROTOCOL' : order.payment_method === 'degustare' ? '🍷 DEGUSTARE' : (order.payment_method || 'CARD')}
              </react_bootstrap_1.Badge>
            </div>
          </div>
        </react_bootstrap_1.Card.Header>
        
        <react_bootstrap_1.Card.Body>
          <div className="customer-info">
            <div><strong>{order.customer_name}</strong></div>
            <div className="text-muted">{order.customer_phone}</div>
            <div className="delivery-address">{order.delivery_address}</div>
          </div>

          {order.courier_name && (<div className="courier-info">
              <react_bootstrap_1.Badge bg="primary">🚴 {order.courier_name}</react_bootstrap_1.Badge>
            </div>)}

          <div className="order-items">
            {order.items.map(function (item, idx) { return (<div key={idx} className="order-item">
                <span>{item.quantity}x {item.name}</span>
                {item.status && (<react_bootstrap_1.Badge bg={item.status === 'completed' ? 'success' : 'warning'}>
                    {item.status === 'completed' ? '✅' : '🍳'}
                  </react_bootstrap_1.Badge>)}
              </div>); })}
          </div>

          {!isReady && progress > 0 && (<div className="progress-section">
              <small>Progres preparare:</small>
              <react_bootstrap_1.ProgressBar now={progress} label={"\"Progress\"%"} variant={progress === 100 ? 'success' : 'info'}/>
            </div>)}

          <div className="order-footer">
            <div className="wait-time">
              <span className={waitTime > 30 ? 'text-danger' : waitTime > 20 ? 'text-warning' : ''}>
                â±ï¸ {waitTime} min
              </span>
            </div>
            <div className="order-total">
              <strong>{order.total.toFixed(2)} RON</strong>
            </div>
          </div>

          {isReady && (<div className="order-actions">
              <react_bootstrap_1.Button variant="success" size="sm" onClick={function () { return markAsDelivered(order.id); }} className="w-100 mb-2">
                ✅ Livrat
              </react_bootstrap_1.Button>
              {(order.payment_method === 'cash' || order.payment_method === 'protocol' || order.payment_method === 'degustare') && !order.is_paid && (<react_bootstrap_1.Button variant="warning" size="sm" onClick={function () { return markAsPaid(order.id); }} className="w-100">
                  💰 Achitat
                </react_bootstrap_1.Button>)}
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>);
    };
    return (<div className="delivery-monitor-page">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto"/>
      
      <div className="monitor-header">
        <h1>📦 Monitor Delivery</h1>
        <div className="monitor-stats">
          <react_bootstrap_1.Badge bg="primary" className="stat-badge">
            În preparare: {inPreparation.length}
          </react_bootstrap_1.Badge>
          <react_bootstrap_1.Badge bg="success" className="stat-badge">
            Gata: {ready.length}
          </react_bootstrap_1.Badge>
          <small className="text-muted">
            Actualizat: {lastUpdate.toLocaleTimeString('ro-RO')}
          </small>
        </div>
      </div>

      <div className="monitor-content">
        {/* În Preparare */}
        <div className="monitor-column">
          <div className="column-header preparing">
            <h3>🍳 În Preparare</h3>
            <react_bootstrap_1.Badge bg="warning">{inPreparation.length}</react_bootstrap_1.Badge>
          </div>
          <div className="orders-list">
            {inPreparation.map(function (order) { return renderOrderCard(order, false); })}
            {inPreparation.length === 0 && (<div className="empty-state">
                <p>"Nicio comandă în pregătire"</p>
              </div>)}
          </div>
        </div>

        {/* Gata de Livrare */}
        <div className="monitor-column">
          <div className="column-header ready">
            <h3>✅ Gata de Livrare</h3>
            <react_bootstrap_1.Badge bg="success">{ready.length}</react_bootstrap_1.Badge>
          </div>
          <div className="orders-list">
            {ready.map(function (order) { return renderOrderCard(order, true); })}
            {ready.length === 0 && (<div className="empty-state">
                <p>"Nicio comandă gata"</p>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
};
exports.DeliveryMonitorPage = DeliveryMonitorPage;
exports.default = exports.DeliveryMonitorPage;
