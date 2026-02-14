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
exports.LostFoundPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var DataGrid_1 = require("@/shared/components/DataGrid");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./LostFoundPage.css");
var LOCATIONS = [
    'Sală Principală',
    'Terasă',
    'Bar',
    'Toaletă',
    'Parcare',
    'Intrare',
    'Altele'
];
var LostFoundPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), items = _a[0], setItems = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showAddModal = _d[0], setShowAddModal = _d[1];
    var _e = (0, react_1.useState)(false), showReturnModal = _e[0], setShowReturnModal = _e[1];
    var _f = (0, react_1.useState)(null), selectedItem = _f[0], setSelectedItem = _f[1];
    var _g = (0, react_1.useState)('STORED'), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, react_1.useState)({
        description: '',
        location_found: '',
        found_at: new Date().toISOString().slice(0, 16),
        notes: ''
    }), addForm = _j[0], setAddForm = _j[1];
    var _k = (0, react_1.useState)(''), returnTo = _k[0], setReturnTo = _k[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, itemsRes, statsRes, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/lostfound/items', { params: { status: statusFilter } }),
                            httpClient_1.httpClient.get('/api/lostfound/stats')
                        ])];
                case 2:
                    _a = _d.sent(), itemsRes = _a[0], statsRes = _a[1];
                    setItems(((_b = itemsRes.data) === null || _b === void 0 ? void 0 : _b.data) || []);
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
    var handleAdd = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!addForm.description) {
                        setFeedback({ type: 'error', message: 'Descrierea este obligatorie!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/lostfound/items', addForm)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Obiect adăugat cu succes!' });
                    setShowAddModal(false);
                    setAddForm({ description: '', location_found: '', found_at: new Date().toISOString().slice(0, 16), notes: '' });
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error adding item:', error_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la adăugare' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleReturn = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedItem || !returnTo) {
                        setFeedback({ type: 'error', message: 'Completează toate câmpurile!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/lostfound/items/".concat(selectedItem.id, "/return"), { returned_to: returnTo })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Obiect returnat cu succes!' });
                    setShowReturnModal(false);
                    setReturnTo('');
                    setSelectedItem(null);
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error returning item:', error_3);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la returnare' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDiscard = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Marchezi acest obiect ca fiind aruncat?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/lostfound/items/\"Id\"/discard")];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Obiect marcat ca aruncat!' });
                    loadData();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error discarding item:', error_4);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'STORED': return <react_bootstrap_1.Badge bg="warning">"Depozitat"</react_bootstrap_1.Badge>;
            case 'RETURNED': return <react_bootstrap_1.Badge bg="success">Returnat</react_bootstrap_1.Badge>;
            case 'DISCARDED': return <react_bootstrap_1.Badge bg="secondary">Aruncat</react_bootstrap_1.Badge>;
            default: return <react_bootstrap_1.Badge bg="secondary">{status}</react_bootstrap_1.Badge>;
        }
    };
    var columnDefs = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: "Description", headerName: 'Descriere', flex: 1 },
        { field: 'location_found', headerName: 'Locație', width: 150 },
        {
            field: 'found_at',
            headerName: 'Găsit La',
            width: 180,
            valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            cellRenderer: function (params) { return getStatusBadge(params.value); }
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            cellRenderer: function (params) { return (<div className="d-flex gap-2">
          {params.data.status === 'STORED' && (<>
              <react_bootstrap_1.Button variant="success" size="sm" onClick={function () {
                        setSelectedItem(params.data);
                        setShowReturnModal(true);
                    }} title="Returnează">
                <i className="fas fa-undo"></i>
              </react_bootstrap_1.Button>
              <react_bootstrap_1.Button variant="danger" size="sm" onClick={function () { return handleDiscard(params.data.id); }} title="Aruncă">
                <i className="fas fa-trash"></i>
              </react_bootstrap_1.Button>
            </>)}
        </div>); }
        }
    ];
    return (<div className="lostfound-page">
      <PageHeader_1.PageHeader title="🔍 Lost & Found" description="Gestionare obiecte găsite și pierdute" actions={[
            {
                label: 'Adaugă Obiect Găsit',
                variant: 'primary',
                onClick: function () { return setShowAddModal(true); }
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
                <h3 className="mb-0">{stats.today_items}</h3>
                <p className="text-muted mb-0">"Astăzi"</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-warning">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-warning">{stats.stored_items}</h3>
                <p className="text-muted mb-0">"Depozitate"</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm border-success">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-success">{stats.returned_items}</h3>
                <p className="text-muted mb-0">Returnate</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="text-center shadow-sm">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0">{stats.discarded_items}</h3>
                <p className="text-muted mb-0">Aruncate</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Filter */}
      <react_bootstrap_1.Card className="mt-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
          <react_bootstrap_1.Form.Select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
            <option value="">"Toate"</option>
            <option value="STORED">"Depozitate"</option>
            <option value="RETURNED">Returnate</option>
            <option value="DISCARDED">Aruncate</option>
          </react_bootstrap_1.Form.Select>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Items Grid */}
      <react_bootstrap_1.Card className="mt-4 shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-white">
          <h5 className="mb-0">"obiecte gasite"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body className="p-0">
          {loading ? (<div className="text-center p-4">
              <div className="spinner-border text-primary"/>
            </div>) : (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={items} height="60vh"/>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Add Item Modal */}
      <react_bootstrap_1.Modal show={showAddModal} onHide={function () { return setShowAddModal(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title><i className="fas fa-plus me-2"></i>"obiect gasit nou"</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere Obiect *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={addForm.description} onChange={function (e) { return setAddForm(__assign(__assign({}, addForm), { description: e.target.value })); }} placeholder="Ex: Portofel negru din piele"/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"locatie gasire"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={addForm.location_found} onChange={function (e) { return setAddForm(__assign(__assign({}, addForm), { location_found: e.target.value })); }}>
                <option value="">"Selectează..."</option>
                {LOCATIONS.map(function (loc) { return (<option key={loc} value={loc}>{loc}</option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Data/Ora Găsirii</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="datetime-local" value={addForm.found_at} onChange={function (e) { return setAddForm(__assign(__assign({}, addForm), { found_at: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"Observații"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={2} value={addForm.notes} onChange={function (e) { return setAddForm(__assign(__assign({}, addForm), { notes: e.target.value })); }} placeholder="detalii suplimentare"/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowAddModal(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={handleAdd}>
            <i className="fas fa-save me-2"></i>Salvează
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

      {/* Return Item Modal */}
      <react_bootstrap_1.Modal show={showReturnModal} onHide={function () { return setShowReturnModal(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title><i className="fas fa-undo me-2"></i>Returnare Obiect</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedItem && (<>
              <react_bootstrap_1.Alert variant="info">
                <strong>Obiect:</strong> {selectedItem.description}
              </react_bootstrap_1.Alert>
              <react_bootstrap_1.Form>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Returnat Către *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={returnTo} onChange={function (e) { return setReturnTo(e.target.value); }} placeholder="nume client" autoFocus/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Form>
            </>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowReturnModal(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="success" onClick={handleReturn}>
            <i className="fas fa-check me-2"></i>"confirma returnare"</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.LostFoundPage = LostFoundPage;
