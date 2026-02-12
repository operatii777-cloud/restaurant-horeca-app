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
exports.HostessMapPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./HostessMapPage.css");
var HostessMapPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), tables = _a[0], setTables = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), selectedTable = _d[0], setSelectedTable = _d[1];
    var _e = (0, react_1.useState)(false), showSessionModal = _e[0], setShowSessionModal = _e[1];
    var _f = (0, react_1.useState)(''), zoneFilter = _f[0], setZoneFilter = _f[1];
    var _g = (0, react_1.useState)(''), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, react_1.useState)({
        server_id: '',
        covers: '2',
        notes: ''
    }), sessionForm = _j[0], setSessionForm = _j[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, tablesRes, statsRes, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/hostess/tables', { params: { zone: zoneFilter, status: statusFilter } }),
                            httpClient_1.httpClient.get('/api/hostess/stats')
                        ])];
                case 2:
                    _a = _d.sent(), tablesRes = _a[0], statsRes = _a[1];
                    setTables(((_b = tablesRes.data) === null || _b === void 0 ? void 0 : _b.data) || []);
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
    }); }, [zoneFilter, statusFilter]);
    (0, react_1.useEffect)(function () {
        loadData();
        var interval = setInterval(loadData, 30000); // Refresh every 30s
        return function () { return clearInterval(interval); };
    }, [loadData]);
    var handleStartSession = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedTable)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/hostess/sessions/start', {
                            table_id: selectedTable.id,
                            server_id: sessionForm.server_id ? parseInt(sessionForm.server_id) : null,
                            covers: parseInt(sessionForm.covers),
                            notes: sessionForm.notes
                        })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Sesiune deschisă cu succes!' });
                    setShowSessionModal(false);
                    setSessionForm({ server_id: '', covers: '2', notes: '' });
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error starting session:', error_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la deschiderea sesiunii' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCloseSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Închizi sesiunea acestei mese?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/hostess/sessions/".concat(sessionId, "/close"))];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Sesiune închisă!' });
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error closing session:', error_3);
                    setFeedback({ type: 'error', message: 'Eroare la închiderea sesiunii' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (table) {
        if (table.session_id) {
            return <react_bootstrap_1.Badge bg="danger">OCUPATĂ</react_bootstrap_1.Badge>;
        }
        return <react_bootstrap_1.Badge bg="success">LIBERĂ</react_bootstrap_1.Badge>;
    };
    var zones = Array.from(new Set(tables.map(function (t) { return t.location; }).filter(Boolean)));
    return (<div className="hostess-map-page">
      <PageHeader_1.PageHeader title="🗺️ Hostess Map" description="Hartă mese și gestionare sesiuni pentru hostess/recepție" actions={[
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
                <h3 className="mb-0">{stats.total_tables}</h3>
                <p className="text-muted mb-0">Total Mese</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-success">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-success">{stats.total_tables - stats.occupied_tables}</h3>
                <p className="text-muted mb-0">Mese Libere</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-danger">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-danger">{stats.occupied_tables}</h3>
                <p className="text-muted mb-0">Mese Ocupate</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-info">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-info">{stats.total_covers}</h3>
                <p className="text-muted mb-0">Total Clienți</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Filters */}
      <react_bootstrap_1.Card className="mt-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={6}>
              <react_bootstrap_1.Form.Label>"Zonă"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={zoneFilter} onChange={function (e) { return setZoneFilter(e.target.value); }}>
                <option value="">Toate zonele</option>
                {zones.map(function (zone) { return (<option key={zone} value={zone}>{zone}</option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={6}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
                <option value="">Toate</option>
                <option value="active">Doar active</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Tables Grid */}
      <react_bootstrap_1.Row className="mt-4">
        {loading ? (<div className="text-center py-5">
            <div className="spinner-border text-primary"/>
          </div>) : tables.length === 0 ? (<div className="text-center py-5">
            <p className="text-muted">Nu există mese configurate</p>
          </div>) : (tables.map(function (table) { return (<react_bootstrap_1.Col key={table.id} md={4} lg={3} className="mb-4">
              <react_bootstrap_1.Card className={"table-card ".concat(table.session_id ? 'occupied' : 'free')}>
                <react_bootstrap_1.Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{table.table_number}</h5>
                    {getStatusBadge(table)}
                  </div>
                  <p className="text-muted mb-1">
                    <i className="fas fa-map-marker-alt me-2"></i>{table.location || 'N/A'}
                  </p>
                  <p className="text-muted mb-2">
                    <i className="fas fa-users me-2"></i>{table.capacity} locuri
                  </p>

                  {table.session_id ? (<>
                      <hr />
                      <p className="mb-1"><strong>Clienți:</strong> {table.covers || 0}</p>
                      {table.server_name && (<p className="mb-1"><strong>Ospătar:</strong> {table.server_name}</p>)}
                      <p className="mb-2"><strong>De la:</strong> {new Date(table.started_at).toLocaleTimeString('ro-RO')}</p>
                      <react_bootstrap_1.Button variant="warning" size="sm" className="w-100" onClick={function () { return handleCloseSession(table.session_id); }}>
                        <i className="fas fa-times me-2"></i>Închide sesiune</react_bootstrap_1.Button>
                    </>) : (<react_bootstrap_1.Button variant="success" size="sm" className="w-100 mt-2" onClick={function () {
                    setSelectedTable(table);
                    setShowSessionModal(true);
                }}>
                      <i className="fas fa-plus me-2"></i>Deschide sesiune</react_bootstrap_1.Button>)}
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>); }))}
      </react_bootstrap_1.Row>

      {/* Start Session Modal */}
      <react_bootstrap_1.Modal show={showSessionModal} onHide={function () { return setShowSessionModal(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Deschide Sesiune - {selectedTable === null || selectedTable === void 0 ? void 0 : selectedTable.table_number}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Număr Clienți *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" min="1" value={sessionForm.covers} onChange={function (e) { return setSessionForm(__assign(__assign({}, sessionForm), { covers: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>ID Ospătar (opțional)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" value={sessionForm.server_id} onChange={function (e) { return setSessionForm(__assign(__assign({}, sessionForm), { server_id: e.target.value })); }} placeholder="lasa gol daca nu e alocat"/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Observații</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={2} value={sessionForm.notes} onChange={function (e) { return setSessionForm(__assign(__assign({}, sessionForm), { notes: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowSessionModal(false); }}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="success" onClick={handleStartSession}>
            <i className="fas fa-check me-2"></i>Deschide sesiune</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.HostessMapPage = HostessMapPage;
