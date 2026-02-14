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
exports.OrdersHistoryPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var lucide_react_1 = require("lucide-react");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
var orderHelpers_1 = require("@/modules/orders/utils/orderHelpers");
require("./OrdersHistoryPage.css");
var ORDER_TYPE_LABELS = {
    DINE_IN: { label: 'DINE-IN', icon: '🍽️', color: 'secondary' },
    TAKEOUT: { label: 'TAKEAWAY', icon: '📦', color: 'success' },
    DELIVERY: { label: 'DELIVERY', icon: '🚚', color: 'primary' },
    DRIVE_THRU: { label: 'DRIVE-THRU', icon: '🚗', color: 'warning' },
};
var PLATFORM_ICONS = {
    glovo: '🚚',
    wolt: '📱',
    bolt_food: '🥡',
    friendsride: '🚗',
    tazz: '⚡',
    phone: '📞',
    online: '🌐',
    pos: '💰',
    delivery: '🚚',
    drive_thru: '🚗'
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
var OrdersHistoryPage = function () {
    var _a, _b, _c, _d;
    //   const { t } = useTranslation();
    var _e = (0, react_1.useState)([]), orders = _e[0], setOrders = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)('all'), filterOrderSource = _g[0], setFilterOrderSource = _g[1];
    var _h = (0, react_1.useState)('all'), filterType = _h[0], setFilterType = _h[1];
    var _j = (0, react_1.useState)('all'), filterStatus = _j[0], setFilterStatus = _j[1];
    var _k = (0, react_1.useState)('all'), filterPlatform = _k[0], setFilterPlatform = _k[1];
    var _l = (0, react_1.useState)(''), searchQuery = _l[0], setSearchQuery = _l[1];
    var _m = (0, react_1.useState)({ start: '', end: '' }), dateRange = _m[0], setDateRange = _m[1];
    var _o = (0, react_1.useState)(null), selectedOrder = _o[0], setSelectedOrder = _o[1];
    var _p = (0, react_1.useState)(false), showDetailsModal = _p[0], setShowDetailsModal = _p[1];
    var _q = (0, react_1.useState)(1), currentPage = _q[0], setCurrentPage = _q[1];
    var pageSize = (0, react_1.useState)(50)[0];
    (0, react_1.useEffect)(function () {
        fetchOrders();
    }, [dateRange, currentPage]);
    // NU mai prevenim scroll-ul paginii - fără overlay, pagină rămâne interactivă
    // useEffect pentru scroll a fost eliminat - pagină poate face scroll când modalul este deschis
    // Închide modalul la apăsarea tastei Escape
    (0, react_1.useEffect)(function () {
        var handleEscape = function (e) {
            if (e.key === 'Escape' && showDetailsModal) {
                setShowDetailsModal(false);
            }
        };
        if (showDetailsModal) {
            document.addEventListener('keydown', handleEscape);
            return function () { return document.removeEventListener('keydown', handleEscape); };
        }
    }, [showDetailsModal]);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, ordersData, err_1;
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
                    params.append('limit', '1000'); // Get more orders for filtering
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/orders-delivery?".concat(params.toString()))];
                case 1:
                    response = _a.sent();
                    // Suport pentru ambele formate (data sau orders)
                    if (response.data) {
                        ordersData = response.data.data || response.data.orders || [];
                        setOrders(Array.isArray(ordersData) ? ordersData : []);
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
        // Filtru după order_source
        if (filterOrderSource !== 'all') {
            filtered = filtered.filter(function (o) { return o.order_source === filterOrderSource; });
        }
        // Filtru după type
        if (filterType !== 'all') {
            var typeMap = {
                dine_in: ["Dine-In", "Restaurant"],
                takeaway: ['takeout', 'takeaway'],
                delivery: ["Livrare"],
                drive_thru: ["Drive-Thru", 'drive-thru']
            };
            var types_1 = typeMap[filterType] || [];
            filtered = filtered.filter(function (o) { var _a; return types_1.includes(((_a = o.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ''); });
        }
        // Filtru după status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(function (o) { return o.status === filterStatus; });
        }
        // Filtru după platform (suportă și delivery/drive_thru ca order_source)
        if (filterPlatform !== 'all') {
            if (filterPlatform === "Delivery") {
                filtered = filtered.filter(function (o) {
                    return o.platform === "Delivery" ||
                        o.order_source === 'DELIVERY' ||
                        o.type === "Delivery";
                });
            }
            else if (filterPlatform === "Drive-Thru") {
                filtered = filtered.filter(function (o) {
                    return o.platform === "Drive-Thru" ||
                        o.order_source === 'DRIVE_THRU' ||
                        o.type === "Drive-Thru" ||
                        o.type === 'drive-thru';
                });
            }
            else if (filterPlatform === 'pos') {
                filtered = filtered.filter(function (o) {
                    return o.platform === 'pos' ||
                        o.order_source === 'POS' ||
                        o.order_source === 'KIOSK' ||
                        o.order_source === 'QR';
                });
            }
            else {
                filtered = filtered.filter(function (o) { return o.platform === filterPlatform; });
            }
        }
        // Căutare
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            filtered = filtered.filter(function (o) {
                var _a, _b, _c, _d, _e, _f;
                return ((_a = o.customer_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) ||
                    ((_b = o.customer_phone) === null || _b === void 0 ? void 0 : _b.includes(query_1)) ||
                    ((_c = o.delivery_address) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(query_1)) ||
                    ((_d = o.order_number) === null || _d === void 0 ? void 0 : _d.includes(query_1)) ||
                    o.id.toString().includes(query_1) ||
                    ((_e = o.table_number) === null || _e === void 0 ? void 0 : _e.toString().includes(query_1)) ||
                    ((_f = o.car_plate) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(query_1));
            });
        }
        // Sortare după dată (cel mai recent primul)
        filtered.sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); });
        return filtered;
    }, [orders, filterOrderSource, filterType, filterStatus, filterPlatform, searchQuery]);
    var paginatedOrders = (0, react_1.useMemo)(function () {
        var start = (currentPage - 1) * pageSize;
        var end = start + pageSize;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, currentPage, pageSize]);
    var stats = (0, react_1.useMemo)(function () {
        var total = filteredOrders.length;
        var bySource = filteredOrders.reduce(function (acc, o) {
            var source = o.order_source || 'UNKNOWN';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});
        var byType = filteredOrders.reduce(function (acc, o) {
            var _a;
            var type = ((_a = o.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        var totalValue = filteredOrders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
        return { total: total, bySource: bySource, byType: byType, totalValue: totalValue };
    }, [filteredOrders]);
    var platforms = (0, react_1.useMemo)(function () {
        var unique = Array.from(new Set(orders.map(function (o) { return o.platform; }).filter(Boolean)));
        return unique;
    }, [orders]);
    var openDetails = function (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    var getOrderTypeInfo = function (order) {
        var source = order.order_source || 'UNKNOWN';
        var typeInfo = ORDER_TYPE_LABELS[source] || { label: source, icon: '📄', color: 'secondary' };
        return typeInfo;
    };
    var getOrderDisplayInfo = function (order) {
        if (order.order_source === 'DRIVE_THRU') {
            return "\uD83D\uDE97 ".concat(order.car_plate || 'N/A', " ").concat(order.lane_number ? "(Lane ".concat(order.lane_number, ")") : '');
        }
        if (order.order_source === 'DELIVERY') {
            return "\uD83D\uDE9A ".concat(order.delivery_address || 'N/A');
        }
        if (order.order_source === 'TAKEOUT' || order.type === 'takeout' || order.type === 'takeaway') {
            return "\uD83D\uDCE6 ".concat(order.customer_name || 'Takeaway');
        }
        if (order.table_number) {
            return "\uD83C\uDF7D\uFE0F Masa ".concat(order.table_number);
        }
        return 'N/A';
    };
    var totalPages = Math.ceil(filteredOrders.length / pageSize);
    return (<div className="orders-history-page">
      <div className="page-header">
        <h1><i className="fas fa-history me-2"></i>Istoric Comenzi</h1>
        <div className="header-actions">
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
          <StatCard_1.StatCard title="Dine-In" value={String(stats.bySource['POS'] || stats.bySource['KIOSK'] || stats.bySource['QR'] || '0')} helper="Comenzi restaurant" icon={<span>🍽️</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Delivery" value={((_a = stats.bySource['DELIVERY']) === null || _a === void 0 ? void 0 : _a.toString()) || '0'} helper="Comenzi livrare" icon={<span>🚚</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Drive-Thru" value={((_b = stats.bySource['DRIVE_THRU']) === null || _b === void 0 ? void 0 : _b.toString()) || '0'} helper="Comenzi drive-thru" icon={<span>🚗</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filtre */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="g-3">
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Tip Sursă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterOrderSource} onChange={function (e) { return setFilterOrderSource(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="POS">POS</option>
                <option value="KIOSK">KIOSK</option>
                <option value="QR">QR</option>
                <option value="DELIVERY">Delivery</option>
                <option value="DRIVE_THRU">Drive-Thru</option>
                <option value="TAKEOUT">Takeaway</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Tip Consum</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterType} onChange={function (e) { return setFilterType(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="Dine-In">Dine-In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
                <option value="Drive-Thru">Drive-Thru</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="pending">În Așteptare</option>
                <option value="preparing">În Preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
                <option value="delivered">Livrat</option>
                <option value="paid">Plătit</option>
                <option value="cancelled">Anulat</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={2}>
              <react_bootstrap_1.Form.Label>Platformă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterPlatform} onChange={function (e) { return setFilterPlatform(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="Drive-Thru">🚗 Drive-Thru</option>
                <option value="pos">💰 POS</option>
                {platforms.filter(function (p) { return p !== 'pos' && p !== "Delivery" && p !== "Drive-Thru"; }).map(function (p) { return (<option key={p} value={p}>
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
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className="mt-3">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.InputGroup>
                <react_bootstrap_1.InputGroup.Text><i className="fas fa-search"></i></react_bootstrap_1.InputGroup.Text>
                <react_bootstrap_1.Form.Control type="text" placeholder="Caută după ID, nume, telefon, adresă, masă, număr mașină" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
                {searchQuery && (<react_bootstrap_1.Button variant="outline-secondary" onClick={function () { return setSearchQuery(''); }}>
                    <i className="fas fa-times"></i>
                  </react_bootstrap_1.Button>)}
              </react_bootstrap_1.InputGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabel Comenzi */}
      {loading ? (<div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>) : (<>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="table-responsive">
                <react_bootstrap_1.Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Dată/Ora</th>
                      <th>Tip</th>
                      <th>Masa/Adresă/Client</th>
                      <th>Produse</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (<tr>
                        <td colSpan={8} className="text-center py-5">
                          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                          <p className="text-muted">Nu există comenzi care să corespundă filtrelor selectate</p>
                        </td>
                      </tr>) : (paginatedOrders.map(function (order) {
                var _a;
                var typeInfo = getOrderTypeInfo(order);
                return (<tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                            <td>
                              <react_bootstrap_1.Badge bg={typeInfo.color}>
                                {typeInfo.icon} {typeInfo.label}
                              </react_bootstrap_1.Badge>
                              {order.platform && (<react_bootstrap_1.Badge bg="light" text="dark" className="ms-1">
                                  {PLATFORM_ICONS[order.platform] || '📱'} {order.platform}
                                </react_bootstrap_1.Badge>)}
                            </td>
                            <td>{getOrderDisplayInfo(order)}</td>
                            <td>{((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 0} produs(e)</td>
                            <td><strong>{order.total.toFixed(2)} RON</strong></td>
                            <td>
                              <react_bootstrap_1.Badge bg={STATUS_COLORS[order.status] || 'secondary'}>
                                {order.status}
                              </react_bootstrap_1.Badge>
                              {order.is_paid && <react_bootstrap_1.Badge bg="success" className="ms-1">Plătit</react_bootstrap_1.Badge>}
                            </td>
                            <td>
                              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return openDetails(order); }}>
                                <i className="fas fa-eye"></i> Detalii</react_bootstrap_1.Button>
                            </td>
                          </tr>);
            }))}
                  </tbody>
                </react_bootstrap_1.Table>
              </div>

              {/* Paginare */}
              {totalPages > 1 && (<div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Afișare {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredOrders.length)} din {filteredOrders.length} comenzi
                    </small>
                  </div>
                  <div>
                    <react_bootstrap_1.Button variant="outline-secondary" size="sm" disabled={currentPage === 1} onClick={function () { return setCurrentPage(function (p) { return p - 1; }); }}>
                      <i className="fas fa-chevron-left"></i> Anterior
                    </react_bootstrap_1.Button>
                    <span className="mx-2">
                      Pagina {currentPage} din {totalPages}
                    </span>
                    <react_bootstrap_1.Button variant="outline-secondary" size="sm" disabled={currentPage === totalPages} onClick={function () { return setCurrentPage(function (p) { return p + 1; }); }}>Următor <i className="fas fa-chevron-right"></i>
                    </react_bootstrap_1.Button>
                  </div>
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}

      {/* Modal Detalii - Design Clasic */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }} size="xl" centered scrollable className="order-details-modal-classic">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            Detalii Comandă #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}
            {(selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.order_number) && " (".concat(selectedOrder.order_number, ")")}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedOrder && (<div className="order-details-content-wrapper">
              {/* Status și Tip Badges */}
              <div className="mb-3">
                <react_bootstrap_1.Badge bg={STATUS_COLORS[selectedOrder.status] || 'secondary'} className="me-2">
                  {((_c = selectedOrder.status) === null || _c === void 0 ? void 0 : _c.toUpperCase()) || 'N/A'}
                </react_bootstrap_1.Badge>
                {(function () {
                var typeInfo = getOrderTypeInfo(selectedOrder);
                return (<react_bootstrap_1.Badge bg={typeInfo.color} className="me-2">
                      {typeInfo.icon} {typeInfo.label}
                    </react_bootstrap_1.Badge>);
            })()}
                <react_bootstrap_1.Badge bg="light" text="dark">
                  <lucide_react_1.Clock size={14} className="me-1" style={{ verticalAlign: 'middle' }}/>
                  {(0, orderHelpers_1.formatTimestamp)(selectedOrder.timestamp)}
                </react_bootstrap_1.Badge>
              </div>

              {/* Informații Client */}
              {(selectedOrder.customer_name || selectedOrder.customer_phone || selectedOrder.delivery_address || selectedOrder.table_number || selectedOrder.car_plate) && (<react_bootstrap_1.Card className="mb-3">
                  <react_bootstrap_1.Card.Header>
                    <strong>
                      <lucide_react_1.User size={16} className="me-2" style={{ verticalAlign: 'middle' }}/>Informații Client</strong>
                  </react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Body>
                    {selectedOrder.customer_name && (<p className="mb-2">
                        <lucide_react_1.User size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }}/>
                        <strong>Nume:</strong> {selectedOrder.customer_name}
                      </p>)}
                    {selectedOrder.customer_phone && (<p className="mb-2">
                        <lucide_react_1.Phone size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }}/>
                        <strong>Telefon:</strong> {selectedOrder.customer_phone}
                      </p>)}
                    {selectedOrder.delivery_address && (<p className="mb-2">
                        <lucide_react_1.MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }}/>
                        <strong>Adresă:</strong> {selectedOrder.delivery_address}
                      </p>)}
                    {selectedOrder.table_number && (<p className="mb-2">
                        <lucide_react_1.MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }}/>
                        <strong>Masă:</strong> {selectedOrder.table_number}
                      </p>)}
                    {selectedOrder.car_plate && (<p className="mb-0">
                        <lucide_react_1.MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }}/>
                        <strong>Număr Mașină:</strong> {selectedOrder.car_plate}
                        {selectedOrder.lane_number && " (Lane ".concat(selectedOrder.lane_number, ")")}
                      </p>)}
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>)}

              {/* Produse */}
              <react_bootstrap_1.Card className="mb-3">
                <react_bootstrap_1.Card.Header>
                  <strong>
                    <lucide_react_1.Package size={16} className="me-2" style={{ verticalAlign: 'middle' }}/>
                    Produse
                  </strong>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body className="p-0">
                  <react_bootstrap_1.Table striped bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Preț</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(_d = selectedOrder.items) === null || _d === void 0 ? void 0 : _d.map(function (item, idx) { return (<tr key={idx}>
                          <td>{item.name || item.product_name || 'N/A'}</td>
                          <td className="text-center">{item.quantity || 1}</td>
                          <td className="text-end">{(item.price || item.unit_price || 0).toFixed(2)} RON</td>
                          <td className="text-end">
                            <strong>{((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2)} RON</strong>
                          </td>
                        </tr>); })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>

              {/* Plată */}
              <react_bootstrap_1.Card>
                <react_bootstrap_1.Card.Header>
                  <strong>
                    <lucide_react_1.CreditCard size={16} className="me-2" style={{ verticalAlign: 'middle' }}/>
                    Plată
                  </strong>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Metodă:</strong></span>
                    <span>{selectedOrder.payment_method || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Status:</strong></span>
                    <span>
                      {selectedOrder.is_paid ? (<react_bootstrap_1.Badge bg="success">✅ Plătit</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="danger">❌ Neplătit</react_bootstrap_1.Badge>)}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span><strong>Total:</strong></span>
                    <span className="fs-5"><strong>{selectedOrder.total.toFixed(2)} RON</strong></span>
                  </div>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.OrdersHistoryPage = OrdersHistoryPage;
