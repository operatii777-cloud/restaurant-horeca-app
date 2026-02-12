"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
// =====================================================================
// DELIVERY DASHBOARD PAGE
// Interfață completă pentru gestionarea comenzilor delivery
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
exports.DeliveryDashboardPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./DeliveryDashboardPage.css");
var PLATFORM_ICONS = {
    glovo: '🚚',
    wolt: '📱',
    bolt_food: '🥡',
    friendsride: '🚗',
    tazz: '⚡',
    phone: '📞',
    online: '🌐'
};
var DeliveryDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), orders = _a[0], setOrders = _a[1];
    var _b = (0, react_1.useState)([]), filteredOrders = _b[0], setFilteredOrders = _b[1];
    var _c = (0, react_1.useState)('all'), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = (0, react_1.useState)('all'), filterPlatform = _d[0], setFilterPlatform = _d[1];
    var _e = (0, react_1.useState)(null), selectedOrder = _e[0], setSelectedOrder = _e[1];
    var _f = (0, react_1.useState)(false), showDetailsModal = _f[0], setShowDetailsModal = _f[1];
    var _g = (0, react_1.useState)(false), showCancelModal = _g[0], setShowCancelModal = _g[1];
    var _h = (0, react_1.useState)(''), cancelReason = _h[0], setCancelReason = _h[1];
    (0, react_1.useEffect)(function () {
        fetchOrders();
        var interval = setInterval(fetchOrders, 15000);
        return function () { return clearInterval(interval); };
    }, []);
    (0, react_1.useEffect)(function () {
        applyFilters();
    }, [orders, filterStatus, filterPlatform]);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/orders/delivery/active')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setOrders(data.orders);
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
    var applyFilters = function () {
        var filtered = __spreadArray([], orders, true);
        if (filterStatus !== 'all') {
            filtered = filtered.filter(function (o) { return o.status === filterStatus; });
        }
        if (filterPlatform !== 'all') {
            filtered = filtered.filter(function (o) { return o.platform === filterPlatform; });
        }
        setFilteredOrders(filtered);
    };
    var openDetails = function (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    var openCancelModal = function (order) {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };
    var callCustomer = function (phone) {
        window.open("tel:".concat(phone));
    };
    var openMaps = function (address) {
        window.open("https://www.google.com/maps/search/?api=1&query=".concat(encodeURIComponent(address)));
    };
    var openWaze = function (address) {
        window.open("https://waze.com/ul?q=".concat(encodeURIComponent(address)));
    };
    var printFiscalReceipt = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/admin/pos/fiscalize", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: orderId })
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        alert('Bon fiscal printat cu succes!');
                    }
                    else {
                        alert('Eroare: ' + data.error);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    alert('Eroare la printare bon fiscal');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var cancelOrder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedOrder || !cancelReason) {
                        alert('Selectează un motiv de anulare');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/orders/".concat(selectedOrder.id, "/cancel"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                reason: cancelReason,
                                cancelled_by: 'admin'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowCancelModal(false);
                        setCancelReason('');
                        fetchOrders();
                        alert('Comandă anulată cu succes');
                    }
                    else {
                        alert('Eroare: ' + data.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    alert('Eroare la anulare comandă');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getWaitTime = function (timestamp) {
        var orderTime = new Date(timestamp);
        var now = new Date();
        return Math.floor((now.getTime() - orderTime.getTime()) / 60000);
    };
    var getPlatformIcon = function (platform) {
        return PLATFORM_ICONS[platform] || '📦';
    };
    return (<div className="delivery-dashboard-page">
      <div className="dashboard-header">
        <h2>📦 Delivery Dashboard</h2>
        <div className="dashboard-stats">
          <react_bootstrap_1.Badge bg="primary">Total: {orders.length}</react_bootstrap_1.Badge>
          <react_bootstrap_1.Badge bg="warning">În Așteptare: {orders.filter(function (o) { return o.status === "Pending"; }).length}</react_bootstrap_1.Badge>
          <react_bootstrap_1.Badge bg="success">Gata: {orders.filter(function (o) { return o.status === 'completed'; }).length}</react_bootstrap_1.Badge>
        </div>
      </div>

      {/* Filters */}
      <react_bootstrap_1.Card className="mb-3">
        <react_bootstrap_1.Card.Body>
          <div className="filters-row">
            <react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="pending">În Așteptare</option>
                <option value="preparing">În Preparare</option>
                <option value="completed">Gata</option>
                <option value="assigned">Alocată</option>
                <option value="picked_up">Preluată</option>
                <option value="in_transit">În Tranzit</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Label>Platformă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterPlatform} onChange={function (e) { return setFilterPlatform(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="glovo">🚚 Glovo</option>
                <option value="wolt">📱 Wolt</option>
                <option value="bolt_food">🥡 Bolt Food</option>
                <option value="friendsride">🚗 FriendsRide</option>
                <option value="tazz">⚡ Tazz</option>
                <option value="phone">📞 Telefonic</option>
                <option value="online">🌐 Online</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Button variant="outline-primary" onClick={fetchOrders}>
              🔄 Refresh
            </react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Orders Table */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Adresă</th>
                <th>Platformă</th>
                <th>Status</th>
                <th>Curier</th>
                <th>Timp</th>
                <th>Total</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(function (order) { return (<tr key={order.id} className={getWaitTime(order.timestamp) > 30 ? 'table-warning' : ''}>
                  <td><strong>#{order.id}</strong></td>
                  <td>
                    <div>{order.customer_name}</div>
                    <small className="text-muted">{order.customer_phone}</small>
                  </td>
                  <td>
                    <small>{order.delivery_address}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: '20px' }}>{getPlatformIcon(order.platform)}</span>
                  </td>
                  <td>
                    <react_bootstrap_1.Badge bg={order.status === 'completed' ? 'success' :
                order.status === 'preparing' ? 'warning' :
                    order.delivery_status === "În Tranzit" ? 'info' :
                        'secondary'}>
                      {order.delivery_status || order.status}
                    </react_bootstrap_1.Badge>
                  </td>
                  <td>
                    {order.courier_name ? (<div>
                        <div>{order.courier_name}</div>
                        {order.courier_phone && <small className="text-muted">{order.courier_phone}</small>}
                      </div>) : (<react_bootstrap_1.Badge bg="secondary">Nealocat</react_bootstrap_1.Badge>)}
                  </td>
                  <td>
                    <span className={getWaitTime(order.timestamp) > 30 ? 'text-danger fw-bold' : ''}>
                      {getWaitTime(order.timestamp)} min
                    </span>
                  </td>
                  <td><strong>{order.total.toFixed(2)} RON</strong></td>
                  <td>
                    <div className="action-buttons">
                      <react_bootstrap_1.Button size="sm" variant="info" onClick={function () { return openDetails(order); }} title="Detalii">
                        👁️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button size="sm" variant="primary" onClick={function () { return callCustomer(order.customer_phone); }} title="Sună">
                        📞
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button size="sm" variant="success" onClick={function () { return openMaps(order.delivery_address); }} title="Maps">
                        🗺️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button size="sm" variant="warning" onClick={function () { return printFiscalReceipt(order.id); }} title="Print Bon">
                        🖨️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button size="sm" variant="danger" onClick={function () { return openCancelModal(order); }} title="Anulează">
                        ❌
                      </react_bootstrap_1.Button>
                    </div>
                  </td>
                </tr>); })}
            </tbody>
          </react_bootstrap_1.Table>

          {filteredOrders.length === 0 && (<div className="text-center text-muted py-5">
              <h5>Nicio comandă delivery activă</h5>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal Detalii */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Detalii Comandă #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedOrder && (<div>
              <h5>Client</h5>
              <p>
                <strong>{selectedOrder.customer_name}</strong><br />
                📞 {selectedOrder.customer_phone}<br />
                📍 {selectedOrder.delivery_address}
              </p>

              <h5>Produse</h5>
              <react_bootstrap_1.Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cant.</th>
                    <th>Preț</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(function (item, idx) { return (<tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toFixed(2)} RON</td>
                    </tr>); })}
                </tbody>
              </react_bootstrap_1.Table>

              <h5>Informații Livrare</h5>
              <p>
                <strong>Platformă:</strong> {getPlatformIcon(selectedOrder.platform)} {selectedOrder.platform}<br />
                <strong>Plată:</strong> {selectedOrder.payment_method}<br />
                <strong>Status:</strong> <react_bootstrap_1.Badge bg="info">{selectedOrder.status}</react_bootstrap_1.Badge><br />
                {selectedOrder.courier_name && (<>
                    <strong>Curier:</strong> {selectedOrder.courier_name} ({selectedOrder.courier_phone})<br />
                  </>)}
                <strong>Total:</strong> <span className="text-success fw-bold">{selectedOrder.total.toFixed(2)} RON</span>
              </p>
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

      {/* Modal Anulare */}
      <react_bootstrap_1.Modal show={showCancelModal} onHide={function () { return setShowCancelModal(false); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Anulare Comandă #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Label>Motiv Anulare</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Select value={cancelReason} onChange={function (e) { return setCancelReason(e.target.value); }}>
              <option value="">Selectează motiv</option>
              <option value="CUSTOMER_REQUEST">Cerere client</option>
              <option value="CUSTOMER_UNREACHABLE">Client indisponibil</option>
              <option value="WRONG_ADDRESS">Adresă greșită</option>
              <option value="PRODUCT_UNAVAILABLE">Produs indisponibil</option>
              <option value="PAYMENT_ISSUE">Problemă plată</option>
              <option value="COURIER_UNAVAILABLE">Curier indisponibil</option>
              <option value="OUTSIDE_DELIVERY_ZONE">În afara zonei</option>
              <option value="OTHER">Altul</option>
            </react_bootstrap_1.Form.Select>
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowCancelModal(false); }}>Renunță</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="danger" onClick={cancelOrder} disabled={!cancelReason}>Confirmă anulare</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.DeliveryDashboardPage = DeliveryDashboardPage;
exports.default = exports.DeliveryDashboardPage;
