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
exports.VouchersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./VouchersPage.css");
var VouchersPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), vouchers = _b[0], setVouchers = _b[1];
    var _c = (0, react_1.useState)([]), filteredVouchers = _c[0], setFilteredVouchers = _c[1];
    var _d = (0, react_1.useState)({ total: 0, active: 0, used: 0, totalValue: 0 }), stats = _d[0], setStats = _d[1];
    var _e = (0, react_1.useState)(false), showModal = _e[0], setShowModal = _e[1];
    var _f = (0, react_1.useState)(null), selectedVoucher = _f[0], setSelectedVoucher = _f[1];
    var _g = (0, react_1.useState)(''), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)(''), typeFilter = _h[0], setTypeFilter = _h[1];
    var _j = (0, react_1.useState)(''), searchTerm = _j[0], setSearchTerm = _j[1];
    var _k = (0, react_1.useState)(null), feedback = _k[0], setFeedback = _k[1];
    // Form state
    var _l = (0, react_1.useState)({
        code: '',
        type: '',
        value: '',
        start_date: '',
        expiry_date: '',
        max_uses: '1',
        description: '',
    }), formData = _l[0], setFormData = _l[1];
    (0, react_1.useEffect)(function () {
        loadVouchers();
    }, []);
    (0, react_1.useEffect)(function () {
        filterVouchers();
    }, [vouchers, statusFilter, typeFilter, searchTerm]);
    var loadVouchers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, vouchersData, vouchersData, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/vouchers')];
                case 2:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        vouchersData = response.data.data.map(function (v) { return (__assign(__assign({}, v), { status: getVoucherStatus(v) })); });
                        setVouchers(vouchersData);
                        updateStats(vouchersData);
                    }
                    else if (Array.isArray(response.data)) {
                        vouchersData = response.data.map(function (v) { return (__assign(__assign({}, v), { status: getVoucherStatus(v) })); });
                        setVouchers(vouchersData);
                        updateStats(vouchersData);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading vouchers:', error_1);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea voucherelor' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getVoucherStatus = function (voucher) {
        if (voucher.used_count >= voucher.max_uses)
            return 'used';
        if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date())
            return 'expired';
        return 'active';
    };
    var updateStats = function (vouchersData) {
        var stats = {
            total: vouchersData.length,
            active: vouchersData.filter(function (v) { return v.status === 'active'; }).length,
            used: vouchersData.filter(function (v) { return v.status === 'used'; }).length,
            totalValue: vouchersData.reduce(function (sum, v) {
                if (v.type === 'fixed' || v.type === 'gift') {
                    return sum + parseFloat(String(v.value));
                }
                return sum;
            }, 0),
        };
        setStats(stats);
    };
    var filterVouchers = function () {
        var filtered = __spreadArray([], vouchers, true);
        if (statusFilter) {
            filtered = filtered.filter(function (v) { return v.status === statusFilter; });
        }
        if (typeFilter) {
            filtered = filtered.filter(function (v) { return v.type === typeFilter; });
        }
        if (searchTerm) {
            filtered = filtered.filter(function (v) {
                var _a;
                return v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ((_a = v.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
            });
        }
        setFilteredVouchers(filtered);
    };
    var handleCreateVoucher = function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!formData.code || !formData.type || !formData.value || !formData.expiry_date) {
                        setFeedback({ type: 'error', message: 'Completați toate câmpurile obligatorii' });
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    payload = {
                        code: formData.code,
                        type: formData.type,
                        value: parseFloat(formData.value),
                        start_date: formData.start_date || null,
                        expiry_date: formData.expiry_date,
                        max_uses: parseInt(formData.max_uses) || 1,
                        description: formData.description || null,
                    };
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/vouchers', payload)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Voucher creat cu succes!' });
                    setShowModal(false);
                    resetForm();
                    loadVouchers();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error creating voucher:', error_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la crearea voucherului' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteVoucher = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!confirm('Sigur doriți să ștergeți acest voucher?'))
                        return [2 /*return*/];
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/vouchers/\"Id\"")];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Voucher șters cu succes!' });
                    loadVouchers();
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error deleting voucher:', error_3);
                    setFeedback({ type: 'error', message: ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la ștergerea voucherului' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var generateVoucherCode = function () {
        var prefix = 'VCH';
        var random = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData(__assign(__assign({}, formData), { code: "\"Prefix\"-\"Random\"" }));
    };
    var resetForm = function () {
        setFormData({
            code: '',
            type: '',
            value: '',
            start_date: '',
            expiry_date: '',
            max_uses: '1',
            description: '',
        });
        setSelectedVoucher(null);
    };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'active':
                return <react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>;
            case 'used':
                return <react_bootstrap_1.Badge bg="info">Utilizat</react_bootstrap_1.Badge>;
            case 'expired':
                return <react_bootstrap_1.Badge bg="danger">Expirat</react_bootstrap_1.Badge>;
            default:
                return <react_bootstrap_1.Badge bg="secondary">{status}</react_bootstrap_1.Badge>;
        }
    };
    var getTypeLabel = function (type) {
        switch (type) {
            case 'percentage':
                return 'Reducere %';
            case 'fixed':
                return 'Valoare Fixă';
            case 'gift':
                return 'Bon Cadou';
            default:
                return type;
        }
    };
    var formatValue = function (voucher) {
        if (voucher.type === 'percentage') {
            return "".concat(voucher.value, "%");
        }
        return "".concat(voucher.value, " RON");
    };
    var formatDate = function (dateString) {
        if (!dateString)
            return '—';
        return new Date(dateString).toLocaleDateString('ro-RO');
    };
    return (<div className="vouchers-page">
      <PageHeader_1.PageHeader title='🎫 Vouchere & Bonuri Valorice' description="Gestionare vouchere, coduri promoționale și bonuri cadou"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-ticket-alt fa-2x text-primary"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Vouchere</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.active}</div>
                  <div className="stat-label">Active</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-shopping-cart fa-2x text-info"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.used}</div>
                  <div className="stat-label">Utilizate</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-money-bill-wave fa-2x text-warning"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.totalValue.toFixed(2)} RON</div>
                  <div className="stat-label">Valoare Totală</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Filters and Actions */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Lista Vouchere</h5>
          <react_bootstrap_1.Button variant="primary" onClick={function () { return setShowModal(true); }}>
            <i className="fas fa-plus me-2"></i>Voucher Nou
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <div className="row mb-3">
            <div className="col-md-4">
              <react_bootstrap_1.Form.Select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
                <option value="">Toate statusurile</option>
                <option value="active">Active</option>
                <option value="used">Utilizate</option>
                <option value="expired">Expirate</option>
              </react_bootstrap_1.Form.Select>
            </div>
            <div className="col-md-4">
              <react_bootstrap_1.Form.Select value={typeFilter} onChange={function (e) { return setTypeFilter(e.target.value); }}>
                <option value="">Toate tipurile</option>
                <option value="percentage">Reducere Procentuală</option>
                <option value="fixed">Valoare Fixă</option>
                <option value="gift">Bon Cadou</option>
              </react_bootstrap_1.Form.Select>
            </div>
            <div className="col-md-4">
              <react_bootstrap_1.Form.Control type="text" placeholder='[🔍_cauta_cod]' value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
            </div>
          </div>

          {loading ? (<div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>) : filteredVouchers.length === 0 ? (<div className="text-center py-5">
              <i className="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
              <h5>Nu există vouchere</h5>
              <p className="text-muted">Creează primul voucher sau cod promoțional</p>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Tip</th>
                  <th>Valoare</th>
                  <th>Utilizări</th>
                  <th>Valabilitate</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map(function (voucher) { return (<tr key={voucher.id}>
                    <td>
                      <code className="voucher-code">{voucher.code}</code>
                    </td>
                    <td>{getTypeLabel(voucher.type)}</td>
                    <td>
                      <strong>{formatValue(voucher)}</strong>
                    </td>
                    <td>
                      {voucher.used_count}/{voucher.max_uses}
                    </td>
                    <td>{formatDate(voucher.expiry_date)}</td>
                    <td>{getStatusBadge(voucher.status)}</td>
                    <td>
                      <react_bootstrap_1.Button variant="danger" size="sm" onClick={function () { return handleDeleteVoucher(voucher.id); }}>
                        <i className="fas fa-trash"></i>
                      </react_bootstrap_1.Button>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Create Voucher Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { setShowModal(false); resetForm(); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-plus me-2"></i>Voucher Nou
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Cod Voucher *</react_bootstrap_1.Form.Label>
              <div className="input-group">
                <react_bootstrap_1.Form.Control type="text" value={formData.code} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { code: e.target.value })); }} placeholder="Ex: SUMMER2025" required/>
                <react_bootstrap_1.Button variant="secondary" onClick={generateVoucherCode}>
                  <i className="fas fa-random"></i> Generează</react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Tip Voucher *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.type} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { type: e.target.value })); }} required>
                <option value="">Selectează tip</option>
                <option value="percentage">Reducere Procentuală (%)</option>
                <option value="fixed">Valoare Fixă (RON)</option>
                <option value="gift">Bon Cadou</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Valoare *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" step="0.01" min="0" value={formData.value} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { value: e.target.value })); }} placeholder="0" required/>
            </react_bootstrap_1.Form.Group>

            <div className="row">
              <div className="col-md-6">
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Start</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={formData.start_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { start_date: e.target.value })); }}/>
                </react_bootstrap_1.Form.Group>
              </div>
              <div className="col-md-6">
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Expirare *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={formData.expiry_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { expiry_date: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </div>
            </div>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Utilizări maxime</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" min="1" value={formData.max_uses} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { max_uses: e.target.value })); }} placeholder="1"/>
              <react_bootstrap_1.Form.Text className="text-muted">Lăsați 1 pentru utilizare unică</react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={2} value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="descriere optionala"/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { setShowModal(false); resetForm(); }}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="success" onClick={handleCreateVoucher} disabled={loading}>
            <i className="fas fa-check me-2"></i>"creeaza voucher"</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.VouchersPage = VouchersPage;
