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
exports.UnitsOfMeasurePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./UnitsOfMeasurePage.css");
var CATEGORIES = [
    { value: 'masă', label: 'Masă', icon: '⚖️' },
    { value: 'volum', label: 'Volum', icon: '💧' },
    { value: 'lungime', label: 'Lungime', icon: '📏' },
    { value: 'bucăți', label: 'Bucăți', icon: '🔢' },
    { value: 'altul', label: 'Altul', icon: '📦' },
];
var UnitsOfMeasurePage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), units = _a[0], setUnits = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingUnit = _e[0], setEditingUnit = _e[1];
    var _f = (0, react_1.useState)(null), feedback = _f[0], setFeedback = _f[1];
    var _g = (0, react_1.useState)(''), filterCategory = _g[0], setFilterCategory = _g[1];
    var _h = (0, react_1.useState)([]), baseUnits = _h[0], setBaseUnits = _h[1];
    var _j = (0, react_1.useState)({
        name: '',
        symbol: '',
        category: 'masă',
        base_unit: null,
        conversion_factor: 1.0,
        is_active: 1,
        sort_order: 0,
    }), formData = _j[0], setFormData = _j[1];
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, activeUnits, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/units-of-measure')];
                case 2:
                    response = _b.sent();
                    data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    setUnits(data);
                    activeUnits = data.filter(function (u) { return u.is_active === 1; });
                    setBaseUnits(activeUnits);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea unităților:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea unităților');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void fetchData();
    }, [fetchData]);
    var handleOpenModal = function (unit) {
        if (unit) {
            setEditingUnit(unit);
            setFormData(unit);
        }
        else {
            setEditingUnit(null);
            setFormData({
                name: '',
                symbol: '',
                category: 'masă',
                base_unit: null,
                conversion_factor: 1.0,
                is_active: 1,
                sort_order: 0,
            });
        }
        setShowModal(true);
        setFeedback(null);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingUnit(null);
        setFeedback(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.name || !formData.symbol || !formData.category) {
                        setFeedback({ type: 'error', message: 'Nume, simbol și categorie sunt obligatorii!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(editingUnit === null || editingUnit === void 0 ? void 0 : editingUnit.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/units-of-measure/".concat(editingUnit.id), formData)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Unitate actualizată cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/units-of-measure', formData)];
                case 4:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Unitate creată cu succes!' });
                    _c.label = 5;
                case 5:
                    setTimeout(function () {
                        handleCloseModal();
                        void fetchData();
                    }, 1000);
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _c.sent();
                    console.error('❌ Eroare la salvare:', err_2);
                    setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi această unitate de măsură?'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/units-of-measure/".concat(id))];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Unitate ștearsă cu succes!' });
                    void fetchData();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la ștergere:', err_3);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getCategoryLabel = function (category) {
        var _a;
        return ((_a = CATEGORIES.find(function (c) { return c.value === category; })) === null || _a === void 0 ? void 0 : _a.label) || category;
    };
    var getCategoryIcon = function (category) {
        var _a;
        return ((_a = CATEGORIES.find(function (c) { return c.value === category; })) === null || _a === void 0 ? void 0 : _a.icon) || '📦';
    };
    var filteredUnits = filterCategory
        ? units.filter(function (u) { return u.category === filterCategory; })
        : units;
    var groupedUnits = filteredUnits.reduce(function (acc, unit) {
        if (!acc[unit.category]) {
            acc[unit.category] = [];
        }
        acc[unit.category].push(unit);
        return acc;
    }, {});
    return (<div className="units-of-measure-page">
      <PageHeader_1.PageHeader title='📏 Unități de măsură' description="Gestionare unități de măsură și conversii între ele"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={function () { return setFeedback(null); }} className="mb-4">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-ruler me-2"></i>Lista unități de măsură</h5>
          <div className="d-flex gap-2">
            <react_bootstrap_1.Form.Select value={filterCategory} onChange={function (e) { return setFilterCategory(e.target.value); }} style={{ width: '200px' }} size="sm">
              <option value="">Toate categoriile</option>
              {CATEGORIES.map(function (cat) { return (<option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>); })}
            </react_bootstrap_1.Form.Select>
            <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleOpenModal(); }}>
              <i className="fas fa-plus me-1"></i>Adaugă unitate</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>) : error ? (<react_bootstrap_1.Alert variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </react_bootstrap_1.Alert>) : filteredUnits.length === 0 ? (<react_bootstrap_1.Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>Nu există unități de măsură. Adaugă prima unitate.</react_bootstrap_1.Alert>) : (<div className="table-responsive">
              <react_bootstrap_1.Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Simbol</th>
                    <th>Categorie</th>
                    <th>Unitate de bază</th>
                    <th>Factor Conversie</th>
                    <th>Ordine</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits
                .sort(function (a, b) {
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                return (a.sort_order || 0) - (b.sort_order || 0);
            })
                .map(function (unit) {
                var baseUnit = unit.base_unit
                    ? units.find(function (u) { return u.id === unit.base_unit; })
                    : null;
                return (<tr key={unit.id}>
                          <td><strong>{unit.name}</strong></td>
                          <td><code>{unit.symbol}</code></td>
                          <td>
                            <react_bootstrap_1.Badge bg="secondary">
                              {getCategoryIcon(unit.category)} {getCategoryLabel(unit.category)}
                            </react_bootstrap_1.Badge>
                          </td>
                          <td>
                            {baseUnit ? (<span>{baseUnit.name} ({baseUnit.symbol})</span>) : (<span className="text-muted">-</span>)}
                          </td>
                          <td>{unit.conversion_factor}</td>
                          <td>{unit.sort_order || 0}</td>
                          <td>
                            {unit.is_active === 1 ? (<react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Inactiv</react_bootstrap_1.Badge>)}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleOpenModal(unit); }} title="Editează">
                                <i className="fas fa-edit"></i>
                              </react_bootstrap_1.Button>
                              <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return unit.id && handleDelete(unit.id); }} title="Șterge">
                                <i className="fas fa-trash"></i>
                              </react_bootstrap_1.Button>
                            </div>
                          </td>
                        </tr>);
            })}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal pentru Creare/Editare */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingUnit ? 'Editează Unitate de Măsură' : 'Adaugă Unitate de Măsură'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Modal.Body>
            {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </react_bootstrap_1.Alert>)}

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Nume <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.name || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} placeholder="Ex: Kilogram" required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Simbol <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.symbol || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { symbol: e.target.value.toUpperCase() })); }} placeholder="Ex: kg" required maxLength={10}/>
                  <react_bootstrap_1.Form.Text className="text-muted">Simbolul trebuie să fie unic</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Categorie <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.category || 'masă'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { category: e.target.value })); }} required>
                    {CATEGORIES.map(function (cat) { return (<option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Unitate de bază</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.base_unit || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { base_unit: e.target.value ? parseInt(e.target.value) : null })); }}>
                    <option value="">Fără unitate de bază</option>
                    {baseUnits
            .filter(function (u) { return !editingUnit || u.id !== editingUnit.id; })
            .map(function (u) { return (<option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>); })}
                  </react_bootstrap_1.Form.Select>
                  <react_bootstrap_1.Form.Text className="text-muted">Unitatea față de care se face conversia</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Factor Conversie</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.0001" value={formData.conversion_factor || 1.0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { conversion_factor: parseFloat(e.target.value) || 1.0 })); }} placeholder="1.0"/>
                  <react_bootstrap_1.Form.Text className="text-muted">
                    Factorul de conversie față de unitatea de bază (ex: 1000 pentru g → kg)
                  </react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Ordine Sortare</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" value={formData.sort_order || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { sort_order: parseInt(e.target.value) || 0 })); }} placeholder="0"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Check type="switch" label="Unitate activă" checked={formData.is_active === 1} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked ? 1 : 0 })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>Anulează</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              {editingUnit ? 'Salvează Modificările' : 'Creează Unitate'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.UnitsOfMeasurePage = UnitsOfMeasurePage;
