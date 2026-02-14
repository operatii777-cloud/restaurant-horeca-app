"use strict";
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
exports.FiscalArchivePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FiscalArchivePage.css");
var FiscalArchivePage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), documents = _a[0], setDocuments = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(''), filterType = _c[0], setFilterType = _c[1];
    var _d = (0, react_1.useState)(''), filterStatus = _d[0], setFilterStatus = _d[1];
    var _e = (0, react_1.useState)(''), filterDateFrom = _e[0], setFilterDateFrom = _e[1];
    var _f = (0, react_1.useState)(''), filterDateTo = _f[0], setFilterDateTo = _f[1];
    var _g = (0, react_1.useState)(''), searchTerm = _g[0], setSearchTerm = _g[1];
    (0, react_1.useEffect)(function () {
        loadDocuments();
    }, [filterType, filterStatus, filterDateFrom, filterDateTo]);
    var loadDocuments = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/fiscal/archive', {
                            params: {
                                document_type: filterType || undefined,
                                status: filterStatus || undefined,
                                date_from: filterDateFrom || undefined,
                                date_to: filterDateTo || undefined,
                                search: searchTerm || undefined,
                            },
                        })];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setDocuments(response.data.data || []);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea documentelor:', error_1);
                    // Fallback pentru development
                    setDocuments([
                        {
                            id: 1,
                            document_type: 'invoice',
                            document_number: 'INV-001',
                            document_date: '2025-01-15',
                            amount: 1250.0,
                            tax_amount: 237.5,
                            status: 'issued',
                            file_url: '/files/invoices/INV-001.pdf',
                            created_at: '2025-01-15T10:00:00Z',
                        },
                        {
                            id: 2,
                            document_type: 'receipt',
                            document_number: 'RC-001',
                            document_date: '2025-01-15',
                            amount: 150.0,
                            tax_amount: 28.5,
                            status: 'issued',
                            file_url: '/files/receipts/RC-001.pdf',
                            created_at: '2025-01-15T11:00:00Z',
                        },
                    ]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filterType, filterStatus, filterDateFrom, filterDateTo, searchTerm]);
    var handleDownload = function (document) {
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        }
    };
    var handleExportArchive = function (format) { return __awaiter(void 0, void 0, void 0, function () {
        var url, baseUrl, fullUrl, link;
        var _a;
        return __generator(this, function (_b) {
            try {
                url = "/api/fiscal/archive/export/\"Format\"?".concat(new URLSearchParams({
                    document_type: filterType || '',
                    status: filterStatus || '',
                    date_from: filterDateFrom || '',
                    date_to: filterDateTo || '',
                }).toString());
                baseUrl = ((_a = httpClient_1.httpClient.defaults.baseURL) !== null && _a !== void 0 ? _a : '').replace(/\/$/, '');
                fullUrl = "".concat(baseUrl, "\"Url\"");
                if (format === 'excel') {
                    link = document.createElement('a');
                    link.href = fullUrl;
                    link.download = "arhiva_fiscala_".concat(new Date().toISOString().split('T')[0], ".xlsx");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else {
                    window.open(fullUrl, '_blank');
                }
            }
            catch (error) {
                console.error('❌ Eroare la exportul arhivei:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var getDocumentTypeLabel = function (type) {
        var labels = {
            invoice: 'Factură',
            receipt: 'Bon Fiscal',
            fiscal_report: 'Raport Fiscal',
            monthly_report: 'Raport Lunar',
            other: 'Altul',
        };
        return labels[type] || type;
    };
    var getStatusBadge = function (status) {
        var badges = {
            draft: { bg: 'secondary', label: 'Ciornă' },
            issued: { bg: 'success', label: 'Emis' },
            cancelled: { bg: 'danger', label: 'Anulat' },
            archived: { bg: 'info', label: 'Arhivat' },
        };
        var badge = badges[status] || badges.draft;
        return <span className={"badge bg-".concat(badge.bg)}>{badge.label}</span>;
    };
    var filteredDocuments = documents.filter(function (doc) {
        if (searchTerm) {
            var searchLower = searchTerm.toLowerCase();
            return (doc.document_number.toLowerCase().includes(searchLower) ||
                doc.document_type.toLowerCase().includes(searchLower));
        }
        return true;
    });
    return (<div className="fiscal-archive-page">
      <h2 className="mb-4">Arhivă Documente Fiscale</h2>

      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-archive me-2"></i>Arhivă Documente Fiscale</h5>
          <div>
            <react_bootstrap_1.Button variant="light" size="sm" className="me-2" onClick={function () { return handleExportArchive('excel'); }}>
              <i className="fas fa-file-excel me-1"></i>Export Excel
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleExportArchive('pdf'); }}>
              <i className="fas fa-file-pdf me-1"></i>Export PDF
            </react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {/* Filtre */}
          <react_bootstrap_1.Row className="mb-3">
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Tip Document</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterType} onChange={function (e) { return setFilterType(e.target.value); }}>
                <option value="">Toate</option>
                <option value="invoice">Factură</option>
                <option value="receipt">Bon Fiscal</option>
                <option value="fiscal_report">Raport Fiscal</option>
                <option value="monthly_report">Raport Lunar</option>
                <option value="other">Altul</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }}>
                <option value="">Toate</option>
                <option value="draft">Ciornă</option>
                <option value="issued">Emis</option>
                <option value="cancelled">Anulat</option>
                <option value="archived">Arhivat</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data De La</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={filterDateFrom} onChange={function (e) { return setFilterDateFrom(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Data Până La</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={filterDateTo} onChange={function (e) { return setFilterDateTo(e.target.value); }}/>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Căutare */}
          <react_bootstrap_1.Row className="mb-3">
            <react_bootstrap_1.Col md={12}>
              <react_bootstrap_1.InputGroup>
                <react_bootstrap_1.InputGroup.Text>
                  <i className="fas fa-search"></i>
                </react_bootstrap_1.InputGroup.Text>
                <react_bootstrap_1.Form.Control type="text" placeholder="Caută după număr document sau tip" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
                <react_bootstrap_1.Button variant="secondary" onClick={loadDocuments}>
                  <i className="fas fa-sync-alt"></i>
                </react_bootstrap_1.Button>
              </react_bootstrap_1.InputGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>

          {/* Tabel Documente */}
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-info"></i>
              <p className="mt-2">Se încarcă documentele...</p>
            </div>) : (<div className="table-responsive">
              <react_bootstrap_1.Table hover size="sm">
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Număr document</th>
                    <th>Data</th>
                    <th>Valoare</th>
                    <th>TVA</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (filteredDocuments
                .sort(function (a, b) { return new Date(b.document_date).getTime() - new Date(a.document_date).getTime(); })
                .map(function (document) { return (<tr key={document.id}>
                          <td>
                            <span className="badge bg-primary">{getDocumentTypeLabel(document.document_type)}</span>
                          </td>
                          <td>
                            <strong>{document.document_number}</strong>
                          </td>
                          <td>{new Date(document.document_date).toLocaleDateString('ro-RO')}</td>
                          <td>{document.amount.toFixed(2)} RON</td>
                          <td>{document.tax_amount.toFixed(2)} RON</td>
                          <td>{getStatusBadge(document.status)}</td>
                          <td>
                            {document.file_url && (<react_bootstrap_1.Button variant="link" size="sm" onClick={function () { return handleDownload(document); }}>
                                <i className="fas fa-download"></i>
                              </react_bootstrap_1.Button>)}
                          </td>
                        </tr>); })) : (<tr>
                      <td colSpan={7} className="text-center text-muted">Nu există documente în arhivă pentru filtrele selectate</td>
                    </tr>)}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}

          {/* Statistici */}
          {filteredDocuments.length > 0 && (<react_bootstrap_1.Card className="mt-4">
              <react_bootstrap_1.Card.Header>
                <h6 className="mb-0">Statistici Arhivă</h6>
              </react_bootstrap_1.Card.Header>
              <react_bootstrap_1.Card.Body>
                <react_bootstrap_1.Row>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Total documente</strong> {filteredDocuments.length}
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Valoare Totală:</strong>' '
                    {filteredDocuments.reduce(function (sum, doc) { return sum + doc.amount; }, 0).toFixed(2)} RON
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>TVA Total:</strong>' '
                    {filteredDocuments.reduce(function (sum, doc) { return sum + doc.tax_amount; }, 0).toFixed(2)} RON
                  </react_bootstrap_1.Col>
                  <react_bootstrap_1.Col md={3}>
                    <strong>Valoare cu TVA</strong>' '
                    {filteredDocuments
                .reduce(function (sum, doc) { return sum + doc.amount + doc.tax_amount; }, 0)
                .toFixed(2)}' '
                    RON
                  </react_bootstrap_1.Col>
                </react_bootstrap_1.Row>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.FiscalArchivePage = FiscalArchivePage;
