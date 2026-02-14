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
exports.DeliveryOrdersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
require("./DeliveryOrdersPage.css");
var PLATFORM_ICONS = {
    glovo: '🚚',
    wolt: '📱',
    bolt_food: '🥡',
    friendsride: '🚗',
    tazz: '⚡',
    phone: '📞',
    online: '🌐',
    pos: '💰'
};
var ORDER_TYPE_LABELS = {
    DELIVERY: 'Delivery',
    DRIVE_THRU: 'Drive-Thru',
    TAKEOUT: 'Takeaway'
};
var STATUS_COLORS = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    completed: 'success',
    in_transit: 'primary',
    delivered: 'success',
    cancelled: 'danger',
    paid: 'success'
};
var DeliveryOrdersPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), orders = _b[0], setOrders = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)('all'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)('all'), filterStatus = _e[0], setFilterStatus = _e[1];
    var _f = (0, react_1.useState)('all'), filterPlatform = _f[0], setFilterPlatform = _f[1];
    var _g = (0, react_1.useState)(''), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = (0, react_1.useState)(null), selectedOrder = _h[0], setSelectedOrder = _h[1];
    var _j = (0, react_1.useState)(false), showDetailsModal = _j[0], setShowDetailsModal = _j[1];
    var _k = (0, react_1.useState)(false), showCancelModal = _k[0], setShowCancelModal = _k[1];
    var _l = (0, react_1.useState)(''), cancelReason = _l[0], setCancelReason = _l[1];
    var _m = (0, react_1.useState)({ start: '', end: '' }), dateRange = _m[0], setDateRange = _m[1];
    (0, react_1.useEffect)(function () {
        fetchOrders();
        var interval = setInterval(fetchOrders, 30000); // Refresh la 30 secunde
        return function () { return clearInterval(interval); };
    }, [dateRange]);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    params = new URLSearchParams();
                    if (dateRange.start)
                        params.append('startDate', dateRange.start);
                    if (dateRange.end)
                        params.append('endDate', dateRange.end);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/orders-delivery?".concat(params.toString()))];
                case 1:
                    response = _a.sent();
                    if (response.data && response.data.data) {
                        setOrders(response.data.data);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error fetching orders:', err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var filteredOrders = (0, react_1.useMemo)(function () {
        var filtered = __spreadArray([], orders, true);
        // Filtru după tip (delivery, drive-thru, takeaway)
        if (activeTab !== 'all') {
            var sourceMap_1 = {
                delivery: 'DELIVERY',
                drivethru: 'DRIVE_THRU',
                takeaway: 'TAKEOUT'
            };
            filtered = filtered.filter(function (o) { return o.order_source === sourceMap_1[activeTab]; });
        }
        // Filtru după status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(function (o) { return o.status === filterStatus; });
        }
        // Filtru după platform
        if (filterPlatform !== 'all') {
            filtered = filtered.filter(function (o) { return o.platform === filterPlatform; });
        }
        // Căutare
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            filtered = filtered.filter(function (o) {
                var _a, _b, _c, _d;
                return ((_a = o.customer_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) ||
                    ((_b = o.customer_phone) === null || _b === void 0 ? void 0 : _b.includes(query_1)) ||
                    ((_c = o.delivery_address) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(query_1)) ||
                    ((_d = o.order_number) === null || _d === void 0 ? void 0 : _d.includes(query_1)) ||
                    o.id.toString().includes(query_1);
            });
        }
        return filtered;
    }, [orders, activeTab, filterStatus, filterPlatform, searchQuery]);
    var stats = (0, react_1.useMemo)(function () {
        var total = orders.length;
        var pending = orders.filter(function (o) { return o.status === "Pending" || o.status === 'preparing'; }).length;
        var inTransit = orders.filter(function (o) { return o.status === "in_transit" || o.delivery_status === "in_transit"; }).length;
        var delivered = orders.filter(function (o) { return o.status === 'delivered' || o.status === 'completed'; }).length;
        var totalValue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
        var pendingValue = orders
            .filter(function (o) { return o.status === "Pending" || o.status === 'preparing'; })
            .reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
        return { total: total, pending: pending, inTransit: inTransit, delivered: delivered, totalValue: totalValue, pendingValue: pendingValue };
    }, [orders]);
    var openDetails = function (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    var handleMarkDelivered = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/orders/".concat(orderId, "/deliver"), {})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchOrders()];
                case 2:
                    _a.sent();
                    setShowDetailsModal(false);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error marking as delivered:', err_2);
                    alert('Eroare la marcarea comenzii ca livrată');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleMarkPaid = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/orders/".concat(orderId, "/mark-paid"), {})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchOrders()];
                case 2:
                    _a.sent();
                    setShowDetailsModal(false);
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error marking as paid:', err_3);
                    alert('Eroare la marcarea comenzii ca plătită');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedOrder || !cancelReason)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/orders/".concat(selectedOrder.id, "/cancel"), {
                            reason: cancelReason
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetchOrders()];
                case 3:
                    _a.sent();
                    setShowCancelModal(false);
                    setShowDetailsModal(false);
                    setCancelReason('');
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('Error cancelling order:', err_4);
                    alert('Eroare la anularea comenzii');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var callCustomer = function (phone) {
        window.open("tel:".concat(phone));
    };
    var openMaps = function (address) {
        window.open("https://www.google.com/maps/search/?api=1&query=".concat(encodeURIComponent(address)));
    };
    var openWaze = function (address) {
        window.open("https://waze.com/ul?q=".concat(encodeURIComponent(address)));
    };
    var printReceipt = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/admin/pos/fiscalize", { orderId: orderId })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchOrders()];
                case 2:
                    _a.sent();
                    alert('Bon fiscal trimis la imprimantă');
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _a.sent();
                    console.error('Error printing receipt:', err_5);
                    alert('Eroare la printarea bonului fiscal');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var platforms = (0, react_1.useMemo)(function () {
        var unique = Array.from(new Set(orders.map(function (o) { return o.platform; }).filter(Boolean)));
        return unique;
    }, [orders]);
    var handleCreateOrder = function () {
        // Navighează la POS pentru creare comandă nouă delivery
        window.location.href = '/kiosk/pos-split?type=delivery';
    };
    return (<div className="delivery-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-truck me-2"></i>Comenzi Delivery</h1>
        <div className="header-actions">
          <react_bootstrap_1.Button variant="success" onClick={handleCreateOrder} className="me-2">
            <i className="fas fa-plus me-1"></i>Comandă Nouă</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={fetchOrders} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>Reîmprospătează</react_bootstrap_1.Button>
        </div>
      </div>

      {/* KPI Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Total Comenzi" value={stats.total.toString()} helper={"Valoare: ".concat(stats.totalValue.toFixed(2), " RON")} icon={<span>📦</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="În Așteptare" value={stats.pending.toString()} helper={"Valoare: ".concat(stats.pendingValue.toFixed(2), " RON")} icon={<span>⏳</span>} trendDirection={stats.pending > 0 ? 'up' : 'flat'}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="În Tranzit" value={stats.inTransit.toString()} helper="Comenzi în livrare" icon={<span>🚚</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Livrate" value={stats.delivered.toString()} helper="Comenzi finalizate" icon={<span>✅</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filtre și Căutare */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="g-3">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Tip Comandă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Tabs activeKey={activeTab} onSelect={function (k) { return setActiveTab(k); }} className="mb-0">
                <react_bootstrap_1.Tab eventKey="all" title="Toate"/>
                <react_bootstrap_1.Tab eventKey="delivery" title='🚚 Delivery'/>
                <react_bootstrap_1.Tab eventKey="drivethru" title="🚗 Drive-Thru"/>
                <react_bootstrap_1.Tab eventKey="takeaway" title="📦 Takeaway"/>
              </react_bootstrap_1.Tabs>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="pending">În Așteptare</option>
                <option value="preparing">În Preparare</option>
                <option value="ready">Gata</option>
                <option value="in_transit">În Tranzit</option>
                <option value="delivered">Livrat</option>
                <option value="completed">Finalizat</option>
                <option value="cancelled">Anulat</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Platformă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterPlatform} onChange={function (e) { return setFilterPlatform(e.target.value); }}>
                <option value="all">Toate</option>
                {platforms.map(function (p) { return (<option key={p} value={p}>
                    {PLATFORM_ICONS[p] || '📱'} {p}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>De la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.start} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { start: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Până la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.end} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { end: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={1}>
              <react_bootstrap_1.Form.Label>&nbsp;</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Button variant="outline-secondary" onClick={function () { return setDateRange({ start: '', end: '' }); }} className="w-100">
                <i className="fas fa-times"></i>
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className="mt-3">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.InputGroup>
                <react_bootstrap_1.InputGroup.Text><i className="fas fa-search"></i></react_bootstrap_1.InputGroup.Text>
                <react_bootstrap_1.Form.Control type="text" placeholder="Caută după nume, telefon, adresă, număr comandă" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
                {searchQuery && (<react_bootstrap_1.Button variant="outline-secondary" onClick={function () { return setSearchQuery(''); }}>
                    <i className="fas fa-times"></i>
                  </react_bootstrap_1.Button>)}
              </react_bootstrap_1.InputGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Lista Comenzi */}
      {loading ? (<div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>) : filteredOrders.length === 0 ? (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Body className="text-center py-5">
            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p className="text-muted">Nu există comenzi care să corespundă filtrelor selectate</p>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>) : (<div className="orders-grid">
          {filteredOrders.map(function (order) {
                var _a;
                return (<react_bootstrap_1.Card key={order.id} className="order-card" onClick={function () { return openDetails(order); }}>
              <react_bootstrap_1.Card.Body>
                <div className="order-header">
                  <div>
                    <h5 className="mb-1">
                      #{order.id} {order.order_number && "(".concat(order.order_number, ")")}
                    </h5>
                    <react_bootstrap_1.Badge bg={STATUS_COLORS[order.status] || 'secondary'} className="me-2">
                      {order.status}
                    </react_bootstrap_1.Badge>
                    <react_bootstrap_1.Badge bg="info" className="me-2">
                      {ORDER_TYPE_LABELS[order.order_source] || order.order_source}
                    </react_bootstrap_1.Badge>
                    {order.platform && (<react_bootstrap_1.Badge bg="light" text="dark">
                        {PLATFORM_ICONS[order.platform] || '📱'} {order.platform}
                      </react_bootstrap_1.Badge>)}
                  </div>
                  <div className="order-total">
                    <strong>{order.total.toFixed(2)} RON</strong>
                  </div>
                </div>

                <div className="order-info mt-3">
                  <div className="info-row">
                    <i className="fas fa-user me-2"></i>
                    <span>{order.customer_name || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-phone me-2"></i>
                    <span>{order.customer_phone}</span>
                    <react_bootstrap_1.Button variant="link" size="sm" className="p-0 ms-2" onClick={function (e) {
                        e.stopPropagation();
                        callCustomer(order.customer_phone);
                    }}>
                      <i className="fas fa-phone"></i>
                    </react_bootstrap_1.Button>
                  </div>
                  {order.delivery_address && (<div className="info-row">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      <span className="text-truncate">{order.delivery_address}</span>
                      <react_bootstrap_1.Button variant="link" size="sm" className="p-0 ms-2" onClick={function (e) {
                            e.stopPropagation();
                            openMaps(order.delivery_address);
                        }}>
                        <i className="fas fa-map"></i>
                      </react_bootstrap_1.Button>
                    </div>)}
                  {order.car_plate && (<div className="info-row">
                      <i className="fas fa-car me-2"></i>
                      <span>Mașină: {order.car_plate} {order.lane_number && "(Lane ".concat(order.lane_number, ")")}</span>
                    </div>)}
                  {order.courier_name && (<div className="info-row">
                      <i className="fas fa-motorcycle me-2"></i>
                      <span>Curier: {order.courier_name}</span>
                    </div>)}
                  <div className="info-row">
                    <i className="fas fa-credit-card me-2"></i>
                    <span>Plată: {order.payment_method} {order.is_paid && '✅'}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-clock me-2"></i>
                    <span>{new Date(order.timestamp).toLocaleString('ro-RO')}</span>
                  </div>
                </div>

                <div className="order-items mt-3">
                  <small className="text-muted">
                    {((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 0} produs(e)
                  </small>
                </div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>);
            })}
        </div>)}

      {/* Modal Detalii Comandă */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            Detalii Comandă #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}
            {(selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.order_number) && " (".concat(selectedOrder.order_number, ")")}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedOrder && (<>
              <react_bootstrap_1.Row className="mb-3">
                <react_bootstrap_1.Col md={6}>
                  <strong>Status:</strong>' '
                  <react_bootstrap_1.Badge bg={STATUS_COLORS[selectedOrder.status] || 'secondary'}>
                    {selectedOrder.status}
                  </react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <strong>Tip:</strong>' '
                  <react_bootstrap_1.Badge bg="info">
                    {ORDER_TYPE_LABELS[selectedOrder.order_source] || selectedOrder.order_source}
                  </react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <h6 className="mt-4">Informații Client</h6>
              <p><strong>Nume:</strong> {selectedOrder.customer_name || 'N/A'}</p>
              <p>
                <strong>Telefon:</strong> {selectedOrder.customer_phone}
                <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return callCustomer(selectedOrder.customer_phone); }}>
                  <i className="fas fa-phone"></i> Sună</react_bootstrap_1.Button>
              </p>
              {selectedOrder.delivery_address && (<p>
                  <strong>Adresă:</strong> {selectedOrder.delivery_address}' '
                  <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return openMaps(selectedOrder.delivery_address); }}>
                    <i className="fas fa-map"></i> Maps
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return openWaze(selectedOrder.delivery_address); }}>
                    <i className="fas fa-map-marked-alt"></i> Waze
                  </react_bootstrap_1.Button>
                </p>)}

              {selectedOrder.car_plate && (<>
                  <h6 className="mt-4">Drive-Thru</h6>
                  <p><strong>Număr Mașină:</strong> {selectedOrder.car_plate}</p>
                  {selectedOrder.lane_number && (<p><strong>Lane:</strong> {selectedOrder.lane_number}</p>)}
                </>)}

              {selectedOrder.courier_name && (<>
                  <h6 className="mt-4">Curier</h6>
                  <p><strong>Nume:</strong> {selectedOrder.courier_name}</p>
                  {selectedOrder.courier_phone && (<p>
                      <strong>Telefon:</strong> {selectedOrder.courier_phone}' '
                      <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return callCustomer(selectedOrder.courier_phone); }}>
                        <i className="fas fa-phone"></i> Sună</react_bootstrap_1.Button>
                    </p>)}
                </>)}

              <h6 className="mt-4">Produse</h6>
              <react_bootstrap_1.Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cantitate</th>
                    <th>Preț</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(_a = selectedOrder.items) === null || _a === void 0 ? void 0 : _a.map(function (item, idx) { return (<tr key={idx}>
                      <td>{item.name || item.product_name || 'N/A'}</td>
                      <td>{item.quantity || 1}</td>
                      <td>{(item.price || item.unit_price || 0).toFixed(2)} RON</td>
                      <td>{((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2)} RON</td>
                    </tr>); })}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}>Total</th>
                    <th>{selectedOrder.total.toFixed(2)} RON</th>
                  </tr>
                </tfoot>
              </react_bootstrap_1.Table>

              <h6 className="mt-4">Plată</h6>
              <p><strong>Metodă:</strong> {selectedOrder.payment_method}</p>
              <p><strong>Status:</strong> {selectedOrder.is_paid ? '✅ Plătit' : '❌ Neplătit'}</p>
              {selectedOrder.fiscal_receipt_printed && (<p>
                  <strong>Bon fiscal:</strong> {selectedOrder.fiscal_receipt_number || 'Printat'} ✅
                </p>)}
            </>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          {selectedOrder && (<>
              {!selectedOrder.is_paid && (<react_bootstrap_1.Button variant="success" onClick={function () { return handleMarkPaid(selectedOrder.id); }}>
                  <i className="fas fa-check me-1"></i> Marchează Plătit</react_bootstrap_1.Button>)}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'completed' && (<react_bootstrap_1.Button variant="primary" onClick={function () { return handleMarkDelivered(selectedOrder.id); }}>
                  <i className="fas fa-truck me-1"></i> Marchează Livrat</react_bootstrap_1.Button>)}
              {!selectedOrder.fiscal_receipt_printed && (<react_bootstrap_1.Button variant="info" onClick={function () { return printReceipt(selectedOrder.id); }}>
                  <i className="fas fa-print me-1"></i> Printează Bon</react_bootstrap_1.Button>)}
              {selectedOrder.status !== 'cancelled' && (<react_bootstrap_1.Button variant="danger" onClick={function () { return setShowCancelModal(true); }}>
                  <i className="fas fa-times me-1"></i> Anulează</react_bootstrap_1.Button>)}
            </>)}
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

      {/* Modal Anulare */}
      <react_bootstrap_1.Modal show={showCancelModal} onHide={function () { return setShowCancelModal(false); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Anulează Comandă #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Label>Motiv Anulare</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control as="textarea" rows={3} value={cancelReason} onChange={function (e) { return setCancelReason(e.target.value); }} placeholder="Introduceți motivul anulării"/>
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowCancelModal(false); }}>Renunță</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="danger" onClick={handleCancel} disabled={!cancelReason}>Anulează Comanda</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.DeliveryOrdersPage = DeliveryOrdersPage;
