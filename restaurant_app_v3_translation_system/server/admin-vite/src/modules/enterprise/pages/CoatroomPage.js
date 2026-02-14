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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoatroomPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./CoatroomPage.css");
var ITEM_TYPES = [
    { value: 'haină', label: '🧥 Haină' },
    { value: 'geantă', label: '👜 Geantă' },
    { value: 'umbrelă', label: '☂️ Umbrelă' },
    { value: 'rucsac', label: '🎒 Rucsac' },
    { value: 'valiză', label: '🧳 Valiză' },
    { value: 'altele', label: '📦 Altele' },
];
var CoatroomPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), tickets = _a[0], setTickets = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showCheckinModal = _d[0], setShowCheckinModal = _d[1];
    var _e = (0, react_1.useState)(false), showCheckoutModal = _e[0], setShowCheckoutModal = _e[1];
    var _f = (0, react_1.useState)(null), selectedTicket = _f[0], setSelectedTicket = _f[1];
    var _g = (0, react_1.useState)('OPEN'), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, react_1.useState)({
        type: 'haină',
        customer_name: '',
        notes: ''
    }), checkinForm = _j[0], setCheckinForm = _j[1];
    var _k = (0, react_1.useState)(''), checkoutCode = _k[0], setCheckoutCode = _k[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ticketsRes, statsRes, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/coatroom/tickets', { params: { status: statusFilter } }),
                            httpClient_1.httpClient.get('/api/coatroom/stats')
                        ])];
                case 2:
                    _a = _d.sent(), ticketsRes = _a[0], statsRes = _a[1];
                    setTickets(((_b = ticketsRes.data) === null || _b === void 0 ? void 0 : _b.data) || []);
                    setStats(((_c = statsRes.data) === null || _c === void 0 ? void 0 : _c.data) || null);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _d.sent();
                    console.error('Error loading data:', error_1);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea datelor' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [statusFilter]);
    (0, react_1.useEffect)(function () {
        loadData();
    }, [loadData]);
    var handleCheckin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!checkinForm.type) {
                        setFeedback({ type: 'error', message: 'Tipul obiectului este obligatoriu!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/coatroom/checkin', checkinForm)];
                case 2:
                    response = _c.sent();
                    setFeedback({ type: 'success', message: "Tichet creat: ".concat(response.data.data.code) });
                    setShowCheckinModal(false);
                    setCheckinForm({ type: 'haină', customer_name: '', notes: '' });
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error check-in:', error_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la check-in' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCheckout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!checkoutCode) {
                        setFeedback({ type: 'error', message: 'Codul tichetului este obligatoriu!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/coatroom/checkout', { code: checkoutCode })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Check-out realizat cu succes!' });
                    setShowCheckoutModal(false);
                    setCheckoutCode('');
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error check-out:', error_3);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la check-out' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'OPEN': return <react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>;
            case 'CLOSED': return <react_bootstrap_1.Badge bg="secondary">Închis</react_bootstrap_1.Badge>;
            case 'LOST': return <react_bootstrap_1.Badge bg="danger">Pierdut</react_bootstrap_1.Badge>;
            default: return <react_bootstrap_1.Badge bg="secondary">{status}</react_bootstrap_1.Badge>;
        }
    };
    return (<div className="coatroom-page">
      <PageHeader_1.PageHeader title='🧥 Garderobă & Valet' description="Gestionare tichete garderobă și valet parking" actions={[
            {
                label: 'Check-in Nou',
                variant: 'primary',
                onClick: function () { return setShowCheckinModal(true); }
            },
            {
                label: 'Check-out',
                variant: 'secondary',
                onClick: function () { return setShowCheckoutModal(true); }
            },
            {
                label: 'Reîmprospătează',
                variant: 'secondary',
                onClick: loadData
            }
        ]}/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : 'success'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      {stats && (<react_bootstrap_1.Row className="mt-4">
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0">{stats.today_tickets}</h3>
                <p className="text-muted mb-0">Astăzi</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-success">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-success">{stats.open_tickets}</h3>
                <p className="text-muted mb-0">Active</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-secondary">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0">{stats.closed_tickets}</h3>
                <p className="text-muted mb-0">Închise</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-danger">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-danger">{stats.lost_tickets}</h3>
                <p className="text-muted mb-0">Pierdute</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Filter */}
      <react_bootstrap_1.Card className="mt-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
          <react_bootstrap_1.Form.Select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
            <option value="">Toate</option>
            <option value="OPEN">Active</option>
            <option value="CLOSED">Închise</option>
            <option value="LOST">Pierdute</option>
          </react_bootstrap_1.Form.Select>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tickets Table */}
      <react_bootstrap_1.Card className="mt-4 shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-white">
          <h5 className="mb-0">Tichete Garderobă</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body className="p-0">
          {loading ? (<div className="text-center p-4">
              <div className="spinner-border text-primary"/>
            </div>) : (<react_bootstrap_1.Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Tip</th>
                  <th>Client</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Observații</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (<tr>
                    <td colSpan={6} className="text-center py-4">Nu există tichete</td>
                  </tr>) : (tickets.map(function (ticket) { return (<tr key={ticket.id}>
                      <td><code className="ticket-code">{ticket.code}</code></td>
                      <td>{ticket.type}</td>
                      <td>{ticket.customer_name || '—'}</td>
                      <td>{new Date(ticket.created_at).toLocaleString('ro-RO')}</td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>{ticket.notes || '—'}</td>
                    </tr>); }))}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Check-in Modal */}
      <react_bootstrap_1.Modal show={showCheckinModal} onHide={function () { return setShowCheckinModal(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title><i className="fas fa-plus me-2"></i>Check-in Tichet Nou</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Tip Obiect *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={checkinForm.type} onChange={function (e) { return setCheckinForm(__assign(__assign({}, checkinForm), { type: e.target.value })); }}>
                {ITEM_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>{type.label}</option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Nume Client (opțional)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={checkinForm.customer_name} onChange={function (e) { return setCheckinForm(__assign(__assign({}, checkinForm), { customer_name: e.target.value })); }} placeholder="ex popescu ion"/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Observații</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={2} value={checkinForm.notes} onChange={function (e) { return setCheckinForm(__assign(__assign({}, checkinForm), { notes: e.target.value })); }} placeholder="ex haina neagra marime l"/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowCheckinModal(false); }}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="success" onClick={handleCheckin}>
            <i className="fas fa-check me-2"></i>Creează tichet</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

      {/* Check-out Modal */}
      <react_bootstrap_1.Modal show={showCheckoutModal} onHide={function () { return setShowCheckoutModal(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title><i className="fas fa-sign-out-alt me-2"></i>Check-out</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Cod Tichet *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={checkoutCode} onChange={function (e) { return setCheckoutCode(e.target.value.toUpperCase()); }} placeholder="Ex: C-20251203-0001" autoFocus/>
              <react_bootstrap_1.Form.Text className="text-muted">Introdu codul de pe tichet</react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowCheckoutModal(false); }}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="warning" onClick={handleCheckout}>
            <i className="fas fa-check me-2"></i>Check-out
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.CoatroomPage = CoatroomPage;
