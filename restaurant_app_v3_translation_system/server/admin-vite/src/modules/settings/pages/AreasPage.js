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
exports.AreasPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AreasPage.css");
var AreasPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), areas = _a[0], setAreas = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), editingArea = _d[0], setEditingArea = _d[1];
    var _e = (0, react_1.useState)({
        name: '',
        code: '',
        description: '',
        capacity: 0,
        is_active: true,
        sort_order: 0,
    }), formData = _e[0], setFormData = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(null), success = _g[0], setSuccess = _g[1];
    (0, react_1.useEffect)(function () {
        loadAreas();
    }, []);
    var loadAreas = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/areas')];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setAreas(response.data.data || []);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea zonelor:', error_1);
                    // Fallback pentru development
                    setAreas([
                        { id: 1, name: 'Interior', code: 'INT', description: 'Sala principală', capacity: 50, is_active: true, sort_order: 1 },
                        { id: 2, name: 'Terasă', code: 'TER', description: 'Terasă acoperită', capacity: 30, is_active: true, sort_order: 2 },
                        { id: 3, name: 'Nefumători', code: 'NEF', description: 'Zonă nefumători', capacity: 20, is_active: true, sort_order: 3 },
                    ]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleOpenModal = function (area) {
        if (area) {
            setEditingArea(area);
            setFormData({
                name: area.name,
                code: area.code,
                description: area.description || '',
                capacity: area.capacity || 0,
                is_active: area.is_active,
                sort_order: area.sort_order || 0,
            });
        }
        else {
            setEditingArea(null);
            setFormData({
                name: '',
                code: '',
                description: '',
                capacity: 0,
                is_active: true,
                sort_order: 0,
            });
        }
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingArea(null);
        setError(null);
        setSuccess(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    if (!editingArea) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/areas/".concat(editingArea.id), formData)];
                case 2:
                    _c.sent();
                    setSuccess('Zona a fost actualizată cu succes!');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/areas', formData)];
                case 4:
                    _c.sent();
                    setSuccess('Zona a fost creată cu succes!');
                    _c.label = 5;
                case 5: return [4 /*yield*/, loadAreas()];
                case 6:
                    _c.sent();
                    setTimeout(function () {
                        handleCloseModal();
                    }, 1500);
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _c.sent();
                    console.error('❌ Eroare la salvarea zonei:', error_2);
                    setError(((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut salva zona.');
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleActive = function (area) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.patch("/api/areas/".concat(area.id, "/toggle-active"))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadAreas()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('❌ Eroare la toggle active:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (area) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi zona \"".concat(area.name, "\"?")))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/areas/".concat(area.id))];
                case 2:
                    _a.sent();
                    setSuccess('Zona a fost ștearsă cu succes!');
                    return [4 /*yield*/, loadAreas()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('❌ Eroare la ștergerea zonei:', error_4);
                    setError('Nu s-a putut șterge zona.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="areas-page">
      <h2 className="mb-4">Gestionare Zone Restaurant</h2>

      {error && <react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>{error}</react_bootstrap_1.Alert>}
      {success && <react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }}>{success}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-map-marked-alt me-2"></i>Gestionare Zone Restaurant</h5>
          <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleOpenModal(); }}>
            <i className="fas fa-plus me-1"></i>Adaugă zonă nouă</react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            Configurează zonele restaurantului (Interior, Terasă, Nefumători, etc.) pentru organizare mese și raportare.
          </react_bootstrap_1.Alert>

          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-success"></i>
              <p className="mt-2">Se încarcă zonele...</p>
            </div>) : (<div className="table-responsive">
              <react_bootstrap_1.Table hover size="sm">
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Cod</th>
                    <th>Descriere</th>
                    <th>Capacitate</th>
                    <th>Ordine</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.length > 0 ? (areas
                .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); })
                .map(function (area) { return (<tr key={area.id}>
                          <td>
                            <strong>{area.name}</strong>
                          </td>
                          <td>{area.code}</td>
                          <td>{area.description || '—'}</td>
                          <td>{area.capacity || '—'}</td>
                          <td>{area.sort_order || 0}</td>
                          <td>
                            <span className={"badge bg-".concat(area.is_active ? 'success' : 'secondary')}>
                              {area.is_active ? 'Activ' : 'Inactiv'}
                            </span>
                          </td>
                          <td>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleOpenModal(area); }} className="me-2">
                              <i className="fas fa-edit"></i>
                            </react_bootstrap_1.Button>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleToggleActive(area); }} className="me-2">
                              <i className={"fas fa-toggle-".concat(area.is_active ? 'on' : 'off')}></i>
                            </react_bootstrap_1.Button>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleDelete(area); }} className="text-danger">
                              <i className="fas fa-trash"></i>
                            </react_bootstrap_1.Button>
                          </td>
                        </tr>); })) : (<tr>
                      <td colSpan={7} className="text-center text-muted">Nu există zone configurate</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal Editare/Creare */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal}>
        <react_bootstrap_1.Modal.Header closeButton className="bg-success text-white">
          <react_bootstrap_1.Modal.Title>{editingArea ? 'Editează Zonă' : 'Zonă Nouă'}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form onSubmit={handleSubmit}>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Nume Zonă *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cod *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={formData.code} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { code: e.target.value.toUpperCase() })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Capacitate</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="0" value={formData.capacity} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { capacity: parseInt(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Ordine Sortare</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="0" value={formData.sort_order} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { sort_order: parseInt(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6} className="d-flex align-items-end">
                <react_bootstrap_1.Form.Check type="switch" label="Zonă activă" checked={formData.is_active} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked })); }}/>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            {error && <react_bootstrap_1.Alert variant="danger" className="mt-3">{error}</react_bootstrap_1.Alert>}
            {success && <react_bootstrap_1.Alert variant="success" className="mt-3">{success}</react_bootstrap_1.Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>Anulează</react_bootstrap_1.Button>
              <react_bootstrap_1.Button variant="success" type="submit">
                {editingArea ? 'Actualizează' : 'Creează'}
              </react_bootstrap_1.Button>
            </div>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.AreasPage = AreasPage;
