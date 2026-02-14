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
exports.AccountingPeriodsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_query_1 = require("@tanstack/react-query");
var httpClient_1 = require("@/shared/api/httpClient");
require("./AccountingPeriodsPage.css");
var AccountingPeriodsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), showModal = _a[0], setShowModal = _a[1];
    var _b = (0, react_1.useState)(null), editingPeriod = _b[0], setEditingPeriod = _b[1];
    var _c = (0, react_1.useState)({
        name: '',
        start_date: '',
        end_date: '',
        fiscal_year: new Date().getFullYear(),
        status: 'open'
    }), formData = _c[0], setFormData = _c[1];
    var queryClient = (0, react_query_1.useQueryClient)();
    // Fetch periods
    var _d = (0, react_query_1.useQuery)({
        queryKey: ['accounting-periods'],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/periods')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); }
    }), periods = _d.data, isLoading = _d.isLoading, error = _d.error;
    // Create/Update period
    var mutation = (0, react_query_1.useMutation)({
        mutationFn: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (editingPeriod) {
                    return [2 /*return*/, httpClient_1.httpClient.put("/api/accounting/periods/".concat(editingPeriod.id), data)];
                }
                else {
                    return [2 /*return*/, httpClient_1.httpClient.post('/api/accounting/periods', data)];
                }
                return [2 /*return*/];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['accounting-periods'] });
            setShowModal(false);
            setEditingPeriod(null);
            setFormData({
                name: '',
                start_date: '',
                end_date: '',
                fiscal_year: new Date().getFullYear(),
                status: 'open'
            });
        }
    });
    // Close period
    var closePeriodMutation = (0, react_query_1.useMutation)({
        mutationFn: function (id) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, httpClient_1.httpClient.post("/api/accounting/periods/\"Id\"/close")];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['accounting-periods'] });
        }
    });
    var handleEdit = function (period) {
        setEditingPeriod(period);
        setFormData({
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
            fiscal_year: period.fiscal_year,
            status: period.status
        });
        setShowModal(true);
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        mutation.mutate(formData);
    };
    var handleClosePeriod = function (id) {
        if (window.confirm('Sigur doriți să închideți această perioadă contabilă? Această acțiune nu poate fi anulată.')) {
            closePeriodMutation.mutate(id);
        }
    };
    if (isLoading) {
        return (<react_bootstrap_1.Container fluid className="accounting-periods-page">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </react_bootstrap_1.Container>);
    }
    return (<react_bootstrap_1.Container fluid className="accounting-periods-page">
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col>
          <h2>📅 Perioade Contabile</h2>
          <p className="text-muted">"gestionati perioadele contabile pentru raportare s"</p>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col xs="auto">
          <react_bootstrap_1.Button variant="primary" onClick={function () { return setShowModal(true); }}>
            <i className="fas fa-plus me-2"></i>"perioada noua"</react_bootstrap_1.Button>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {error && (<react_bootstrap_1.Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Eroare la încărcarea perioadelor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Table responsive hover>
            <thead>
              <tr>
                <th>Nume</th>
                <th>An Fiscal</th>
                <th>Data Început</th>
                <th>Data Sfârșit</th>
                <th>Status</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {periods && periods.length > 0 ? (periods.map(function (period) { return (<tr key={period.id}>
                    <td>{period.name}</td>
                    <td>{period.fiscal_year}</td>
                    <td>{new Date(period.start_date).toLocaleDateString('ro-RO')}</td>
                    <td>{new Date(period.end_date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      <span className={"badge ".concat(period.status === 'open' ? 'bg-success' :
                period.status === 'closed' ? 'bg-warning' :
                    'bg-secondary')}>
                        {period.status === 'open' ? 'Deschis' :
                period.status === 'closed' ? 'Închis' :
                    'Blocat'}
                      </span>
                    </td>
                    <td>
                      <react_bootstrap_1.Button variant="outline-primary" size="sm" className="me-2" onClick={function () { return handleEdit(period); }} disabled={period.status === 'locked'}>
                        <i className="fas fa-edit"></i>
                      </react_bootstrap_1.Button>
                      {period.status === 'open' && (<react_bootstrap_1.Button variant="outline-warning" size="sm" onClick={function () { return handleClosePeriod(period.id); }}>
                          <i className="fas fa-lock"></i>"Închide"</react_bootstrap_1.Button>)}
                    </td>
                  </tr>); })) : (<tr>
                  <td colSpan={6} className="text-center text-muted py-4">"nu exista perioade contabile definite"</td>
                </tr>)}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal pentru creare/editare */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { setShowModal(false); setEditingPeriod(null); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingPeriod ? 'Editează Perioada' : 'Perioadă Contabilă Nouă'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Modal.Body>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Nume Perioadă *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required placeholder={t('$([ex_q1_2026_ianuarie_2026] -replace "\[|\]")')}/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>An Fiscal *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" value={formData.fiscal_year} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { fiscal_year: parseInt(e.target.value) })); }} required min={2020} max={2100}/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Început *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={formData.start_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { start_date: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Sfârșit *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={formData.end_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { end_date: e.target.value })); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.status} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { status: e.target.value })); }} disabled={(editingPeriod === null || editingPeriod === void 0 ? void 0 : editingPeriod.status) === 'locked'}>
                <option value="open">"Deschis"</option>
                <option value="closed">"Închis"</option>
                <option value="locked" disabled>Blocat (nu poate fi modificat)</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={function () { setShowModal(false); setEditingPeriod(null); }}>"Anulează"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Se salvează...' : editingPeriod ? 'Actualizează' : 'Creează'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </react_bootstrap_1.Container>);
};
exports.AccountingPeriodsPage = AccountingPeriodsPage;
