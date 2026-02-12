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
exports.DriveThruOrdersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var StatCard_1 = require("@/shared/components/StatCard");
require("./DriveThruOrdersPage.css");
var DriveThruOrdersPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), orders = _b[0], setOrders = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)('all'), filterStatus = _d[0], setFilterStatus = _d[1];
    var _e = (0, react_1.useState)('all'), filterLane = _e[0], setFilterLane = _e[1];
    var _f = (0, react_1.useState)(''), searchQuery = _f[0], setSearchQuery = _f[1];
    var _g = (0, react_1.useState)({ start: '', end: '' }), dateRange = _g[0], setDateRange = _g[1];
    var _h = (0, react_1.useState)(null), selectedOrder = _h[0], setSelectedOrder = _h[1];
    var _j = (0, react_1.useState)(false), showDetailsModal = _j[0], setShowDetailsModal = _j[1];
    (0, react_1.useEffect)(function () {
        fetchOrders();
        var interval = setInterval(fetchOrders, 30000);
        return function () { return clearInterval(interval); };
    }, [dateRange]);
    var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, driveThruOrders, err_1;
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
                        driveThruOrders = response.data.data.filter(function (o) { return o.order_source === 'DRIVE_THRU' || o.type === "Drive-Thru" || o.type === 'drive-thru'; });
                        setOrders(driveThruOrders);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error fetching drive-thru orders:', err_1);
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
        if (filterLane !== 'all') {
            filtered = filtered.filter(function (o) { return o.lane_number === filterLane; });
        }
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            filtered = filtered.filter(function (o) {
                var _a, _b, _c, _d;
                return ((_a = o.car_plate) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) ||
                    ((_b = o.lane_number) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query_1)) ||
                    o.id.toString().includes(query_1) ||
                    ((_c = o.order_number) === null || _c === void 0 ? void 0 : _c.includes(query_1)) ||
                    ((_d = o.customer_phone) === null || _d === void 0 ? void 0 : _d.includes(query_1));
            });
        }
        filtered.sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); });
        return filtered;
    }, [orders, filterStatus, filterLane, searchQuery]);
    var stats = (0, react_1.useMemo)(function () {
        var total = orders.length;
        var pending = orders.filter(function (o) { return o.status === "Pending:" || o.status === 'preparing'; }).length;
        var completed = orders.filter(function (o) { return o.status === 'completed' || o.status === 'served'; }).length;
        var totalValue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
        // Calculează timp mediu (dacă există date)
        var ordersWithTime = orders.filter(function (o) { return o.arrived_at && o.served_at; });
        var avgTime = ordersWithTime.length > 0
            ? ordersWithTime.reduce(function (sum, o) {
                var arrived = new Date(o.arrived_at).getTime();
                var served = new Date(o.served_at).getTime();
                return sum + (served - arrived) / 60000; // minute
            }, 0) / ordersWithTime.length
            : 0;
        var under3Min = ordersWithTime.filter(function (o) {
            var arrived = new Date(o.arrived_at).getTime();
            var served = new Date(o.served_at).getTime();
            return (served - arrived) / 60000 < 3;
        }).length;
        var over5Min = ordersWithTime.filter(function (o) {
            var arrived = new Date(o.arrived_at).getTime();
            var served = new Date(o.served_at).getTime();
            return (served - arrived) / 60000 > 5;
        }).length;
        return { total: total, pending: pending, completed: completed, totalValue: totalValue, avgTime: avgTime, under3Min: under3Min, over5Min: over5Min, ordersWithTime: ordersWithTime.length };
    }, [orders]);
    var lanes = (0, react_1.useMemo)(function () {
        var unique = Array.from(new Set(orders.map(function (o) { return o.lane_number; }).filter(Boolean)));
        return unique.sort();
    }, [orders]);
    var openDetails = function (order) {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    var calculateTime = function (order) {
        if (!order.arrived_at || !order.served_at)
            return 'N/A';
        var arrived = new Date(order.arrived_at).getTime();
        var served = new Date(order.served_at).getTime();
        var minutes = Math.round((served - arrived) / 60000);
        return "".concat(minutes, " min");
    };
    return (<div className="drivethru-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-car me-2"></i>Comenzi Drive-Thru</h1>
        <div className="header-actions">
          <react_bootstrap_1.Button variant="primary" onClick={fetchOrders} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>Reîmprospătează</react_bootstrap_1.Button>
        </div>
      </div>

      {/* KPI Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Total Comenzi" value={stats.total.toString()} helper={"Valoare: ".concat(stats.totalValue.toFixed(2), " RON")} icon={<span>🚗</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="În Așteptare" value={stats.pending.toString()} helper="Comenzi active" icon={<span>⏳</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Timp Mediu" value={stats.avgTime > 0 ? "".concat(stats.avgTime.toFixed(1), " min") : 'N/A'} helper={"".concat(stats.ordersWithTime, " comenzi m\u0103surate")} icon={<span>⏱️</span>}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <StatCard_1.StatCard title="Sub 3 min" value={stats.ordersWithTime > 0 ? "".concat(((stats.under3Min / stats.ordersWithTime) * 100).toFixed(1), "%") : 'N/A'} helper={"".concat(stats.under3Min, " din ").concat(stats.ordersWithTime)} icon={<span>✅</span>}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filtre */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row className="g-3">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="all">Toate</option>
                <option value="pending">În Așteptare</option>
                <option value="preparing">În Preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
                <option value="served">Servit</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Bandă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterLane} onChange={function (e) { return setFilterLane(e.target.value); }}>
                <option value="all">Toate</option>
                {lanes.map(function (lane) { return (<option key={lane} value={lane}>{lane}</option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>De la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.start} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { start: e.target.value })); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Până la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateRange.end} onChange={function (e) { return setDateRange(__assign(__assign({}, dateRange), { end: e.target.value })); }}/>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className="mt-3">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.InputGroup>
                <react_bootstrap_1.InputGroup.Text><i className="fas fa-search"></i></react_bootstrap_1.InputGroup.Text>
                <react_bootstrap_1.Form.Control type="text" placeholder="Caută după număr mașină, bandă, ID comandă" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
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
                    <th>Bandă</th>
                    <th>Număr Mașină</th>
                    <th>Produse</th>
                    <th>Total</th>
                    <th>Timp Total</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (<tr>
                      <td colSpan={9} className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Nu există comenzi Drive-Thru</p>
                      </td>
                    </tr>) : (filteredOrders.map(function (order) {
                var _a;
                return (<tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                        <td><react_bootstrap_1.Badge bg="warning">{order.lane_number || 'N/A'}</react_bootstrap_1.Badge></td>
                        <td>{order.car_plate || 'N/A'}</td>
                        <td>{((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 0} produs(e)</td>
                        <td><strong>{order.total.toFixed(2)} RON</strong></td>
                        <td>{calculateTime(order)}</td>
                        <td>
                          <react_bootstrap_1.Badge bg={order.status === 'completed' || order.status === 'served' ? 'success' : 'warning'}>
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
          <react_bootstrap_1.Modal.Title>Detalii Comandă Drive-Thru #{selectedOrder === null || selectedOrder === void 0 ? void 0 : selectedOrder.id}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedOrder && (<>
              <react_bootstrap_1.Row className="mb-3">
                <react_bootstrap_1.Col md={6}>
                  <strong>Status:</strong>
                  <react_bootstrap_1.Badge bg={selectedOrder.status === 'completed' ? 'success' : 'warning'}>
                    {selectedOrder.status}
                  </react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <strong>Bandă:</strong> <react_bootstrap_1.Badge bg="warning">{selectedOrder.lane_number || 'N/A'}</react_bootstrap_1.Badge>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <h6 className="mt-4">Informații Mașină</h6>
              <p><strong>Număr Mașină:</strong> {selectedOrder.car_plate || 'N/A'}</p>
              {selectedOrder.customer_phone && (<p><strong>Telefon:</strong> {selectedOrder.customer_phone}</p>)}

              {selectedOrder.arrived_at && selectedOrder.served_at && (<>
                  <h6 className="mt-4">Timpi</h6>
                  <p><strong>Sosit:</strong> {new Date(selectedOrder.arrived_at).toLocaleString('ro-RO')}</p>
                  <p><strong>Servit:</strong> {new Date(selectedOrder.served_at).toLocaleString('ro-RO')}</p>
                  <p><strong>Timp total:</strong> {calculateTime(selectedOrder)}</p>
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
              {selectedOrder.fiscal_receipt_printed && (<p><strong>Bon fiscal:</strong> ✅ Printat</p>)}
            </>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.DriveThruOrdersPage = DriveThruOrdersPage;
exports.default = exports.DriveThruOrdersPage;
