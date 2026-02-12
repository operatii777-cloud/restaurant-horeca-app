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
exports.TablesPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./TablesPage.css");
var TablesPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), tables = _a[0], setTables = _a[1];
    var _b = (0, react_1.useState)([]), areas = _b[0], setAreas = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(false), showBulkModal = _e[0], setShowBulkModal = _e[1];
    var _f = (0, react_1.useState)(null), editingTable = _f[0], setEditingTable = _f[1];
    var _g = (0, react_1.useState)(''), filterArea = _g[0], setFilterArea = _g[1];
    var _h = (0, react_1.useState)(''), filterStatus = _h[0], setFilterStatus = _h[1];
    var _j = (0, react_1.useState)({
        table_number: 1,
        area_id: 0,
        seats: 2,
        shape: 'round',
        is_active: true,
        notes: '',
    }), formData = _j[0], setFormData = _j[1];
    var _k = (0, react_1.useState)({
        start_table: 1,
        end_table: 10,
        area_id: 0,
        seats: 2,
        shape: 'round',
    }), bulkFormData = _k[0], setBulkFormData = _k[1];
    var _l = (0, react_1.useState)(null), error = _l[0], setError = _l[1];
    var _m = (0, react_1.useState)(null), success = _m[0], setSuccess = _m[1];
    (0, react_1.useEffect)(function () {
        loadAreas();
        loadTables();
    }, []);
    var loadAreas = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/areas')];
                case 1:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setAreas(response.data.data || []);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea zonelor:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var loadTables = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/tables', {
                            params: {
                                area_id: filterArea || undefined,
                                status: filterStatus || undefined,
                            },
                        })];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setTables(response.data.data || []);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _b.sent();
                    console.error('❌ Eroare la încărcarea meselor:', error_2);
                    // Fallback pentru development
                    setTables([
                        {
                            id: 1,
                            table_number: 1,
                            area_id: 1,
                            area_name: 'Interior',
                            seats: 4,
                            shape: 'round',
                            is_active: true,
                        },
                        {
                            id: 2,
                            table_number: 2,
                            area_id: 1,
                            area_name: 'Interior',
                            seats: 2,
                            shape: 'square',
                            is_active: true,
                        },
                    ]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filterArea, filterStatus]);
    (0, react_1.useEffect)(function () {
        loadTables();
    }, [filterArea, filterStatus, loadTables]);
    var handleOpenModal = function (table) {
        if (table) {
            setEditingTable(table);
            setFormData({
                table_number: table.table_number,
                area_id: table.area_id,
                seats: table.seats,
                shape: table.shape,
                is_active: table.is_active,
                notes: table.notes || '',
            });
        }
        else {
            setEditingTable(null);
            setFormData({
                table_number: tables.length > 0 ? Math.max.apply(Math, tables.map(function (t) { return t.table_number; })) + 1 : 1,
                area_id: areas.length > 0 ? areas[0].id : 0,
                seats: 2,
                shape: 'round',
                is_active: true,
                notes: '',
            });
        }
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingTable(null);
        setError(null);
        setSuccess(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
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
                    if (!editingTable) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/tables/".concat(editingTable.id), formData)];
                case 2:
                    _c.sent();
                    setSuccess('Masa a fost actualizată cu succes!');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/tables', formData)];
                case 4:
                    _c.sent();
                    setSuccess('Masa a fost creată cu succes!');
                    _c.label = 5;
                case 5: return [4 /*yield*/, loadTables()];
                case 6:
                    _c.sent();
                    setTimeout(function () {
                        handleCloseModal();
                    }, 1500);
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _c.sent();
                    console.error('❌ Eroare la salvarea mesei:', error_3);
                    setError(((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut salva masa.');
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/tables/bulk', bulkFormData)];
                case 2:
                    _c.sent();
                    setSuccess("Mesele ".concat(bulkFormData.start_table, "-").concat(bulkFormData.end_table, " au fost create cu succes!"));
                    setShowBulkModal(false);
                    return [4 /*yield*/, loadTables()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _c.sent();
                    console.error('❌ Eroare la crearea în masă:', error_4);
                    setError(((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut crea mesele în masă.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleActive = function (table) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.patch("/api/tables/".concat(table.id, "/toggle-active"))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTables()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('❌ Eroare la toggle active:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (table) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi masa ".concat(table.table_number, "?")))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/tables/".concat(table.id))];
                case 2:
                    _a.sent();
                    setSuccess('Masa a fost ștearsă cu succes!');
                    return [4 /*yield*/, loadTables()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.error('❌ Eroare la ștergerea mesei:', error_6);
                    setError('Nu s-a putut șterge masa.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var filteredTables = tables.filter(function (table) {
        if (filterArea && table.area_id !== filterArea)
            return false;
        if (filterStatus === 'configured' && !table.area_id)
            return false;
        if (filterStatus === 'unconfigured' && table.area_id)
            return false;
        return true;
    });
    return (<div className="tables-page">
      <h2 className="mb-4">Configurare Mese (1-200)</h2>

      {error && <react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>{error}</react_bootstrap_1.Alert>}
      {success && <react_bootstrap_1.Alert variant="success" dismissible onClose={function () { return setSuccess(null); }}>{success}</react_bootstrap_1.Alert>}

      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chair me-2"></i>Configurare Mese (1-200)
          </h5>
          <div>
            <react_bootstrap_1.Button variant="primary" size="sm" className="me-2" onClick={function () { return setShowBulkModal(true); }}>
              <i className="fas fa-layer-group me-1"></i>Configurare Bulk
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleOpenModal(); }}>
              <i className="fas fa-plus me-1"></i>Masă nouă</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>Configurează fiecare masă: zonă, număr locuri, formă</react_bootstrap_1.Alert>

          {/* Filtre */}
          <react_bootstrap_1.Row className="mb-3">
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Filtrează după zonă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterArea} onChange={function (e) { return setFilterArea(e.target.value ? parseInt(e.target.value) : ''); }}>
                <option value="">Toate zonele</option>
                {areas.map(function (area) { return (<option key={area.id} value={area.id}>
                    {area.name}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4}>
              <react_bootstrap_1.Form.Label>Status:</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="">Toate</option>
                <option value="configured">Configurate</option>
                <option value="unconfigured">Neconfigrate</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4} className="d-flex align-items-end">
              <react_bootstrap_1.Button variant="secondary" className="w-100" onClick={loadTables}>
                <i className="fas fa-sync me-1"></i>Refresh
              </react_bootstrap_1.Button>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Tabel Mese */}
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
              <p className="mt-2">Se încarcă mesele...</p>
            </div>) : (<div className="table-responsive" style={{ maxHeight: '500px', overflowY: "auto" }}>
              <react_bootstrap_1.Table hover size="sm">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Masă #</th>
                    <th>Zonă</th>
                    <th>Locuri</th>
                    <th>Formă</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.length > 0 ? (filteredTables
                .sort(function (a, b) { return a.table_number - b.table_number; })
                .map(function (table) { return (<tr key={table.id}>
                          <td>
                            <strong>#{table.table_number}</strong>
                          </td>
                          <td>{table.area_name || '—'}</td>
                          <td>{table.seats}</td>
                          <td>
                            <span className="badge bg-info">
                              {table.shape === 'round' ? 'Rotund' : table.shape === 'square' ? 'Pătrat' : table.shape === 'rectangular' ? 'Dreptunghiular' : 'Oval'}
                            </span>
                          </td>
                          <td>
                            <span className={"badge bg-".concat(table.is_active ? 'success' : 'secondary')}>
                              {table.is_active ? 'Activ' : 'Inactiv'}
                            </span>
                          </td>
                          <td>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleOpenModal(table); }} className="me-2">
                              <i className="fas fa-edit"></i>
                            </react_bootstrap_1.Button>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleToggleActive(table); }} className="me-2">
                              <i className={"fas fa-toggle-".concat(table.is_active ? 'on' : 'off')}></i>
                            </react_bootstrap_1.Button>
                            <react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleDelete(table); }} className="text-danger">
                              <i className="fas fa-trash"></i>
                            </react_bootstrap_1.Button>
                          </td>
                        </tr>); })) : (<tr>
                      <td colSpan={6} className="text-center text-muted">Nu există mese configurate</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal Editare/Creare */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal}>
        <react_bootstrap_1.Modal.Header closeButton className="bg-warning text-dark">
          <react_bootstrap_1.Modal.Title>{editingTable ? "Editeaz\u0103 Masa #".concat(editingTable.table_number) : 'Masă Nouă'}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form onSubmit={handleSubmit}>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Număr Masă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" max="200" value={formData.table_number} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { table_number: parseInt(e.target.value) || 1 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Zonă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.area_id} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { area_id: parseInt(e.target.value) || 0 })); }} required>
                    <option value="">Selectează zona</option>
                    {areas.map(function (area) { return (<option key={area.id} value={area.id}>
                        {area.name}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Număr Locuri *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" value={formData.seats} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { seats: parseInt(e.target.value) || 2 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Formă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={formData.shape} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { shape: e.target.value })); }} required>
                    <option value="round">Rotund</option>
                    <option value="square">Pătrat</option>
                    <option value="rectangular">Dreptunghiular</option>
                    <option value="oval">Oval</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Note</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={2} value={formData.notes} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Check type="switch" label="Masă activă" checked={formData.is_active} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked })); }}/>

            {error && <react_bootstrap_1.Alert variant="danger" className="mt-3">{error}</react_bootstrap_1.Alert>}
            {success && <react_bootstrap_1.Alert variant="success" className="mt-3">{success}</react_bootstrap_1.Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>Anulează</react_bootstrap_1.Button>
              <react_bootstrap_1.Button variant="warning" type="submit">
                {editingTable ? 'Actualizează' : 'Creează'}
              </react_bootstrap_1.Button>
            </div>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
      </react_bootstrap_1.Modal>

      {/* Modal Configurare Bulk */}
      <react_bootstrap_1.Modal show={showBulkModal} onHide={function () { return setShowBulkModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton className="bg-primary text-white">
          <react_bootstrap_1.Modal.Title>Configurare Bulk Mese</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form onSubmit={handleBulkSubmit}>
            <react_bootstrap_1.Alert variant="info">Creează multiple mese deodată. Mesele vor fi create automat cu numere consecutive.</react_bootstrap_1.Alert>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Masă Start *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" max="200" value={bulkFormData.start_table} onChange={function (e) { return setBulkFormData(__assign(__assign({}, bulkFormData), { start_table: parseInt(e.target.value) || 1 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Masă Sfârșit *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" max="200" value={bulkFormData.end_table} onChange={function (e) { return setBulkFormData(__assign(__assign({}, bulkFormData), { end_table: parseInt(e.target.value) || 10 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Zonă *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={bulkFormData.area_id} onChange={function (e) { return setBulkFormData(__assign(__assign({}, bulkFormData), { area_id: parseInt(e.target.value) || 0 })); }} required>
                    <option value="">Selectează zona</option>
                    {areas.map(function (area) { return (<option key={area.id} value={area.id}>
                        {area.name}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Număr Locuri *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" value={bulkFormData.seats} onChange={function (e) { return setBulkFormData(__assign(__assign({}, bulkFormData), { seats: parseInt(e.target.value) || 2 })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Formă *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={bulkFormData.shape} onChange={function (e) { return setBulkFormData(__assign(__assign({}, bulkFormData), { shape: e.target.value })); }} required>
                <option value="round">Rotund</option>
                <option value="square">Pătrat</option>
                <option value="rectangular">Dreptunghiular</option>
                <option value="oval">Oval</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            {error && <react_bootstrap_1.Alert variant="danger" className="mt-3">{error}</react_bootstrap_1.Alert>}
            {success && <react_bootstrap_1.Alert variant="success" className="mt-3">{success}</react_bootstrap_1.Alert>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowBulkModal(false); }}>Anulează</react_bootstrap_1.Button>
              <react_bootstrap_1.Button variant="primary" type="submit">Creează mese</react_bootstrap_1.Button>
            </div>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.TablesPage = TablesPage;
