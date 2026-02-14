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
exports.TakeawayOrdersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
require("./TakeawayOrdersPage.css");
var TakeawayOrdersPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), orders = _b[0], setOrders = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)('all'), filterStatus = _d[0], setFilterStatus = _d[1];
    var _e = (0, react_1.useState)(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = (0, react_1.useState)({ start: '', end: '' }), dateRange = _f[0], setDateRange = _f[1];
    var _g = (0, react_1.useState)(null), selectedOrder = _g[0], setSelectedOrder = _g[1];
    var _h = (0, react_1.useState)(false), showDetailsModal = _h[0], setShowDetailsModal = _h[1];
    (0, react_1.useEffect)(function () {
        fetchOrders();
        var interval = setInterval(fetchOrders, 30000);
        return function () { return clearInterval(interval); };
    }, [dateRange]);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, takeawayOrders, err_1;
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
                    params.append('limit', '1000');
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/orders-delivery?".concat(params.toString()))];
                case 1:
                    response = _a.sent();
                    if (response.data && response.data.data) {
                        takeawayOrders = response.data.data.filter(function (o) {
                            return (o.type === 'takeaway' || o.type === 'takeout') &&
                                o.order_source !== 'DELIVERY' &&
                                o.order_source !== 'DRIVE_THRU';
                        });
                        setOrders(takeawayOrders);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error fetching takeaway orders:', err_1);
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
        if (filterStatus !== 'all') {
            filtered = filtered.filter(function (o) { return o.status === filterStatus; });
        }
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            filtered = filtered.filter(function (o) {
                var _a, _b, _c;
                return ((_a = o.customer_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) ||
                    ((_b = o.customer_phone) === null || _b === void 0 ? void 0 : _b.includes(query_1)) ||
                    o.id.toString().includes(query_1) ||
                    ((_c = o.order_number) === null || _c === void 0 ? void 0 : _c.includes(query_1));
            });
        }
        filtered.sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); });
        return filtered;
    }, [orders, filterStatus, searchQuery]);
    var stats = (0, react_1.useMemo)(function () {
        var total = orders.length;
        var pending = orders.filter(function (o) { return o.status === "Pending:" || o.status === 'preparing'; }).length;
        var completed = orders.filter(function (o) { return o.status === 'completed' || o.status === 'ready'; }).length;
        var totalValue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
        // Calculează timp mediu preparare (dacă există completed_timestamp)
        var ordersWithTime = orders.filter(function (o) { return o.status === 'completed' && o.timestamp; });
        var avgPrepTime = ordersWithTime.length > 0
            ? ordersWithTime.reduce(function (sum, o) {
                var created = new Date(o.timestamp).getTime();
                var now = Date.now();
                return sum + (now - created) / 60000; // minute (aproximativ)
            }, 0) / ordersWithTime.length
            : 0;
        var today = new Date().toDateString();
        var todayOrders = orders.filter(function (o) { return new Date(o.timestamp).toDateString() === today; });
        return { total: total, pending: pending, completed: completed, totalValue: totalValue, avgPrepTime: avgPrepTime, todayOrders: todayOrders.length };
    }, [orders]);
    var openDetails = function (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    return (<div className="takeaway-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-shopping-bag me-2"></i>Comenzi Takeaway</h1>
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
          <StatCard_1.StatCard title="Astăzi" value={stats.todayOrders.toString()} helper="Comenzi zilnice" icon={<span>📅</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="În Așteptare" value={stats.pending.toString()} helper="Comenzi active" icon={<span>⏳</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Timp Mediu" value={stats.avgPrepTime > 0 ? "".concat(stats.avgPrepTime.toFixed(1), " min") : 'N/A'} helper="Timp preparare" icon={<span>⏱️</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filtre */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="g-3">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="pending">în așteptare</option>
                <option value="preparing">în preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>De la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.start} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { start: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Până la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.end} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { end: e.target.value })); }}/>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className="mt-3">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.InputGroup>
                <react_bootstrap_1.InputGroup.Text><i className="fas fa-search"></i></react_bootstrap_1.InputGroup.Text>
                <react_bootstrap_1.Form.Control type="text" placeholder="cauta dupa nume telefon id comanda" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
                {searchQuery && (<react_bootstrap_1.Button variant="outline-secondary" onClick={function () { return setSearchQuery(''); }}>
                    <i className="fas fa-times"></i>
                  </react_bootstrap_1.Button>)}
              </react_bootstrap_1.InputGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tabel */}
      {loading ? (<div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>) : (<react_bootstrap_1.Card>
          <react_bootstrap_1.Card.Body>
            <div className="table-responsive">
              <react_bootstrap_1.Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dată/Ora</th>
                    <th>Client</th>
                    <th>Telefon</th>
                    <th>Produse</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (<tr>
                      <td colSpan={8} className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Nu există comenzi Takeaway</p>
                      </td>
                    </tr>) : (filteredOrders.map(function (order) {
                var _a;
                return (<tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                        <td>{order.customer_name || 'N/A'}</td>
                        <td>{order.customer_phone || 'N/A'}</td>
                        <td>{((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 0} produs(e)</td>
                        <td><strong>{order.total.toFixed(2)} RON</strong></td>
                        <td>
                          <react_bootstrap_1.Badge bg={order.status === 'completed' ? 'success' : 'warning'}>
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
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Modal Detalii */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Detalii Comandă Takeaway #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedOrder && (<>
              <react_bootstrap_1.Row className="mb-3">
                <react_bootstrap_1.Col md={6}>
                  <strong>Status:</strong>{' '}
                  <react_bootstrap_1.Badge bg={selectedOrder.status === 'completed' ? 'success' : 'warning'}>
                    {selectedOrder.status}
                  </react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <strong>Tip:</strong> <react_bootstrap_1.Badge bg="success">📦 TAKEAWAY</react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <h6 className="mt-4">Informații Client</h6>
              {selectedOrder.customer_name && (<p><strong>Nume:</strong> {selectedOrder.customer_name}</p>)}
              {selectedOrder.customer_phone && (<p><strong>Telefon:</strong> {selectedOrder.customer_phone}</p>)}

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
              {selectedOrder.fiscal_receipt_printed && (<p><strong>Bon fiscal:</strong> ✅ Printat</p>)}
            </>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.TakeawayOrdersPage = TakeawayOrdersPage;
