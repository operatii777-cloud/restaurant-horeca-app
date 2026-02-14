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
exports.WastePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var DataGrid_1 = require("@/shared/components/DataGrid");
var wasteApi_1 = require("../api/wasteApi");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./WastePage.css");
var WASTE_TYPES = [
    { value: 'food', label: 'Mâncare' },
    { value: 'beverage', label: 'Băuturi' },
    { value: 'operational', label: 'Operațional' },
];
var WASTE_REASONS = {
    food: [
        { value: 'expired', label: 'Expirat/Alterat' },
        { value: 'burnt', label: 'Ars/Pregătit greșit' },
        { value: 'returned', label: 'Returnat de client' },
        { value: 'inventory_discrepancy', label: 'Diferență inventar' },
    ],
    beverage: [
        { value: 'damaged', label: 'Sticle sparte' },
        { value: 'expired', label: 'Produse expirate' },
        { value: 'sample', label: 'Probe/Degustare' },
    ],
    operational: [
        { value: 'theft', label: 'Furt' },
        { value: 'sample', label: 'Probe staff' },
        { value: 'other', label: 'Altele' },
    ],
};
var ITEM_TYPES = [
    { value: 'ingredient', label: 'Ingredient' },
    { value: 'menu_product', label: 'Produs Meniu' },
    { value: 'packaging', label: 'Ambalaj' },
];
var WastePage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), wasteRecords = _b[0], setWasteRecords = _b[1];
    var _c = (0, react_1.useState)(null), dashboard = _c[0], setDashboard = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), showModal = _f[0], setShowModal = _f[1];
    var _g = (0, react_1.useState)(null), editingWaste = _g[0], setEditingWaste = _g[1];
    var _h = (0, react_1.useState)('month'), period = _h[0], setPeriod = _h[1];
    var _j = (0, react_1.useState)(null), feedback = _j[0], setFeedback = _j[1];
    var _k = (0, react_1.useState)({
        waste_type: 'food',
        waste_reason: 'expired',
        item_type: 'ingredient',
        item_name: '',
        quantity: 0,
        unit_of_measure: 'kg',
        unit_cost: 0,
        location_id: undefined,
        description: '',
        waste_date: new Date().toISOString().split('T')[0],
    }), formData = _k[0], setFormData = _k[1];
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, records, dashboardData, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            wasteApi_1.wasteApi.fetchWaste(),
                            wasteApi_1.wasteApi.fetchDashboard(period),
                        ])];
                case 2:
                    _a = _b.sent(), records = _a[0], dashboardData = _a[1];
                    setWasteRecords(records);
                    setDashboard(dashboardData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea datelor:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [period]);
    (0, react_1.useEffect)(function () {
        void fetchData();
    }, [fetchData]);
    var handleOpenModal = function (waste) {
        if (waste) {
            setEditingWaste(waste);
            setFormData(waste);
        }
        else {
            setEditingWaste(null);
            setFormData({
                waste_type: 'food',
                waste_reason: 'expired',
                item_type: 'ingredient',
                item_name: '',
                quantity: 0,
                unit_of_measure: 'kg',
                unit_cost: 0,
                location_id: undefined,
                description: '',
                waste_date: new Date().toISOString().split('T')[0],
            });
        }
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingWaste(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.item_name || !formData.quantity || !formData.unit_cost || !formData.waste_date) {
                        setFeedback({ type: 'error', message: 'Completați toate câmpurile obligatorii!' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (!(editingWaste === null || editingWaste === void 0 ? void 0 : editingWaste.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, wasteApi_1.wasteApi.updateWaste(editingWaste.id, formData)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Pierdere actualizată cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, wasteApi_1.wasteApi.createWaste(formData)];
                case 4:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Pierdere raportată cu succes!' });
                    _a.label = 5;
                case 5:
                    handleCloseModal();
                    return [4 /*yield*/, fetchData()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.error('❌ Eroare la salvare:', err_2);
                    setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err_2.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi această înregistrare?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, wasteApi_1.wasteApi.deleteWaste(id)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Înregistrare ștearsă cu succes!' });
                    return [4 /*yield*/, fetchData()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    console.error('❌ Eroare la ștergere:', err_3);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getWasteTypeBadge = function (type) {
        var _a;
        var colors = {
            food: 'danger',
            beverage: 'warning',
            operational: 'info',
        };
        return <react_bootstrap_1.Badge bg={colors[type] || 'secondary'}>{((_a = WASTE_TYPES.find(function (t) { return t.value === type; })) === null || _a === void 0 ? void 0 : _a.label) || type}</react_bootstrap_1.Badge>;
    };
    var columnDefs = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'waste_date', headerName: 'Data', width: 120 },
        { field: 'item_name', headerName: 'Item', flex: 1 },
        {
            field: 'waste_type',
            headerName: 'Tip',
            width: 120,
            cellRenderer: function (params) { return getWasteTypeBadge(params.value); },
        },
        { field: 'waste_reason', headerName: 'Motiv', width: 150 },
        { field: 'quantity', headerName: 'Cantitate', width: 100 },
        { field: 'unit_of_measure', headerName: 'UM', width: 80 },
        {
            field: 'total_cost',
            headerName: 'Cost Total',
            width: 120,
            cellRenderer: function (params) { return "".concat((params.value || 0).toFixed(2), " RON"); },
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            cellRenderer: function (params) { return (<div className="d-flex gap-2">
          <react_bootstrap_1.Button variant="info" size="sm" onClick={function () { return handleOpenModal(params.data); }} title="Editează">
            <i className="fas fa-edit"></i>
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="danger" size="sm" onClick={function () { return handleDelete(params.data.id); }} title="Șterge">
            <i className="fas fa-trash-alt"></i>
          </react_bootstrap_1.Button>
        </div>); },
        },
    ];
    return (<div className="waste-page">
      <PageHeader_1.PageHeader title='🗑️ Pierderi & Waste' description="Gestionare pierderi justificate (waste) și nejustificate (losses)" actions={[
            {
                label: 'Raportează Pierdere',
                variant: 'primary',
                onClick: function () { return handleOpenModal(); },
            },
            {
                label: 'Reîmprospătează',
                variant: 'secondary',
                onClick: fetchData,
            },
        ]}/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}
      {error && <InlineAlert_1.InlineAlert type="error" message={error} onClose={function () { return setError(null); }}/>}

      {/* Dashboard Stats */}
      {dashboard && (<react_bootstrap_1.Row className="mt-4">
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="shadow-sm text-center">
              <react_bootstrap_1.Card.Body>
                <h3 className="mb-0 text-danger">{dashboard.total_waste.toFixed(2)} RON</h3>
                <p className="text-muted mb-0">Total Waste ({period === 'today' ? 'Astăzi' : period === 'week' ? 'Săptămâna' : 'Luna'})</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="shadow-sm">
              <react_bootstrap_1.Card.Body>
                <h6 className="mb-3">Waste pe tip</h6>
                {dashboard.by_type.map(function (type) {
                var _a;
                return (<div key={type.waste_type} className="d-flex justify-content-between mb-2">
                    <span>{((_a = WASTE_TYPES.find(function (t) { return t.value === type.waste_type; })) === null || _a === void 0 ? void 0 : _a.label) || type.waste_type}</span>
                    <strong>{type.total.toFixed(2)} RON ({type.count} incidente)</strong>
                  </div>);
            })}
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="shadow-sm">
              <react_bootstrap_1.Card.Body>
                <h6 className="mb-3">Top 5 Produse cu Waste</h6>
                {dashboard.top_products.slice(0, 5).map(function (product, idx) { return (<div key={idx} className="d-flex justify-content-between mb-2">
                    <span className="text-truncate" style={{ maxWidth: '150px' }} title={product.item_name}>
                      {product.item_name}
                    </span>
                    <strong>{product.total_cost.toFixed(2)} RON</strong>
                  </div>); })}
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Period Filter */}
      <div className="mt-4 d-flex gap-2 align-items-center">
        <span>Perioadă:</span>
        <react_bootstrap_1.Button variant={period === 'today' ? 'primary' : 'outline-primary'} size="sm" onClick={function () { return setPeriod('today'); }}>Astăzi</react_bootstrap_1.Button>
        <react_bootstrap_1.Button variant={period === 'week' ? 'primary' : 'outline-primary'} size="sm" onClick={function () { return setPeriod('week'); }}>
          Săptămâna
        </react_bootstrap_1.Button>
        <react_bootstrap_1.Button variant={period === 'month' ? 'primary' : 'outline-primary'} size="sm" onClick={function () { return setPeriod('month'); }}>
          Luna
        </react_bootstrap_1.Button>
      </div>

      {/* Waste Records Table */}
      <react_bootstrap_1.Card className="mt-4 shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-white">
          <h5 className="mb-0">Înregistrări waste</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body className="p-0">
          {loading ? (<div className="text-center p-4">
              <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>Se încarcă...</div>) : (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={wasteRecords} height="60vh"/>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Add/Edit Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>{editingWaste ? 'Editează Pierdere' : 'Raportează Pierdere Nouă'}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Modal.Body>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Waste *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.waste_type || 'food'} onChange={function (e) {
            var _a, _b;
            setFormData(__assign(__assign({}, formData), { waste_type: e.target.value, waste_reason: ((_b = (_a = WASTE_REASONS[e.target.value]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || '' }));
        }} required>
                    {WASTE_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>
                        {type.label}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Motiv *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.waste_reason || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { waste_reason: e.target.value })); }} required>
                    {(_a = WASTE_REASONS[formData.waste_type]) === null || _a === void 0 ? void 0 : _a.map(function (reason) { return (<option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Item *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.item_type || 'ingredient'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { item_type: e.target.value })); }} required>
                    {ITEM_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>
                        {type.label}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Nume Item *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.item_name || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { item_name: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cantitate *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={formData.quantity || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { quantity: parseFloat(e.target.value) || 0 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Unitate Măsură *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.unit_of_measure || 'kg'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { unit_of_measure: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={4}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cost Unitar (RON) *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={formData.unit_cost || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { unit_cost: parseFloat(e.target.value) || 0 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Waste *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={formData.waste_date || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { waste_date: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Raportat de</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.reported_by || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { reported_by: e.target.value })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.description || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>Anulează</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              {editingWaste ? 'Actualizează' : 'Raportează'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.WastePage = WastePage;
