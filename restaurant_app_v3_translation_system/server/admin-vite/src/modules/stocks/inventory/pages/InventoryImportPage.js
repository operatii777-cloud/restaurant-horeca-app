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
exports.InventoryImportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var lucide_react_1 = require("lucide-react");
require("bootstrap/dist/css/bootstrap.min.css");
require("./InventoryImportPage.css");
var InventoryImportPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), showModal = _a[0], setShowModal = _a[1];
    var _b = (0, react_1.useState)('pdf'), fileType = _b[0], setFileType = _b[1];
    var _c = (0, react_1.useState)(null), file = _c[0], setFile = _c[1];
    var _d = (0, react_1.useState)(''), invoiceNumber = _d[0], setInvoiceNumber = _d[1];
    var _e = (0, react_1.useState)(''), supplier = _e[0], setSupplier = _e[1];
    var _f = (0, react_1.useState)(new Date().toISOString().split('T')[0]), invoiceDate = _f[0], setInvoiceDate = _f[1];
    var _g = (0, react_1.useState)(''), totalValue = _g[0], setTotalValue = _g[1];
    var _h = (0, react_1.useState)(false), loading = _h[0], setLoading = _h[1];
    var _j = (0, react_1.useState)(0), uploadProgress = _j[0], setUploadProgress = _j[1];
    var _k = (0, react_1.useState)(null), error = _k[0], setError = _k[1];
    var _l = (0, react_1.useState)(false), success = _l[0], setSuccess = _l[1];
    var _m = (0, react_1.useState)([]), history = _m[0], setHistory = _m[1];
    var _o = (0, react_1.useState)(false), historyLoading = _o[0], setHistoryLoading = _o[1];
    var _p = (0, react_1.useState)({
        total: 0,
        imported: 0,
        processed: 0,
        draft: 0
    }), stats = _p[0], setStats = _p[1];
    (0, react_1.useEffect)(function () {
        loadImportHistory();
    }, []);
    var loadImportHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, records, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setHistoryLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/inventory/import-history')];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setHistory(response.data.data || []);
                        records = response.data.data || [];
                        setStats({
                            total: records.length,
                            imported: records.filter(function (r) { return r.status === 'imported'; }).length,
                            processed: records.filter(function (r) { return r.status === 'processed'; }).length,
                            draft: records.filter(function (r) { return r.status === 'draft'; }).length
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea istoricului:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setHistoryLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleFileChange = function (e) {
        var _a, _b;
        var selectedFile = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            // Auto-detect file type
            var ext = (_b = selectedFile.name.split('.').pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            if (ext === 'pdf') {
                setFileType('pdf');
            }
            else if (ext === 'xml') {
                setFileType('xml');
            }
        }
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var formData, response, err_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(false);
                    setUploadProgress(0);
                    // Validate required fields
                    if (!invoiceNumber || !supplier || !invoiceDate || !totalValue) {
                        setError('Vă rugăm completați toate câmpurile obligatorii.');
                        return [2 /*return*/];
                    }
                    if (fileType !== 'manual' && !file) {
                        setError('Vă rugăm selectați un fișier pentru import.');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    formData = new FormData();
                    if (file) {
                        formData.append('file', file);
                    }
                    formData.append('file_type', fileType);
                    formData.append('invoice_number', invoiceNumber);
                    formData.append('supplier', supplier);
                    formData.append('invoice_date', invoiceDate);
                    formData.append('total_value', totalValue);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/inventory/import-invoice', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                            onUploadProgress: function (progressEvent) {
                                if (progressEvent.total) {
                                    var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                    setUploadProgress(percentCompleted);
                                }
                            }
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setSuccess(true);
                        setTimeout(function () {
                            handleCloseModal();
                            loadImportHistory(); // Reload history
                        }, 1500);
                    }
                    else {
                        setError(((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la importul facturii.');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _e.sent();
                    console.error('❌ Eroare la importul facturii:', err_2);
                    setError(((_d = (_c = err_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || err_2.message || 'Eroare la importul facturii.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCloseModal = function () {
        setShowModal(false);
        setFile(null);
        setInvoiceNumber('');
        setSupplier('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setTotalValue('');
        setError(null);
        setSuccess(false);
        setUploadProgress(0);
        setFileType('pdf');
    };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!window.confirm('Sigur doriți să ștergeți acest import?')) {
                        return [2 /*return*/];
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/inventory/import/\"Id\"")];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        loadImportHistory();
                    }
                    else {
                        alert('Eroare la ștergerea importului: ' + (((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _e.sent();
                    console.error('❌ Eroare la ștergerea importului:', err_3);
                    alert('Eroare la ștergerea importului: ' + (((_d = (_c = err_3.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || err_3.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        var statusMap = {
            draft: { variant: 'secondary', icon: lucide_react_1.Clock, label: 'Draft' },
            imported: { variant: 'success', icon: lucide_react_1.CheckCircle, label: 'Importat' },
            processed: { variant: 'primary', icon: lucide_react_1.Package, label: 'Procesat' },
            error: { variant: 'danger', icon: lucide_react_1.AlertCircle, label: 'Eroare' }
        };
        var config = statusMap[status] || statusMap.draft;
        var Icon = config.icon;
        return (<react_bootstrap_1.Badge bg={config.variant}>
        <Icon size={14} className="me-1" style={{ verticalAlign: 'middle' }}/>
        {config.label}
      </react_bootstrap_1.Badge>);
    };
    var getFileTypeIcon = function (fileType) {
        switch (fileType) {
            case 'pdf':
                return <lucide_react_1.FileText size={18} className="text-danger"/>;
            case 'xml':
                return <lucide_react_1.FileCode size={18} className="text-primary"/>;
            case 'manual':
                return <lucide_react_1.FileText size={18} className="text-secondary"/>;
            default:
                return <lucide_react_1.FileText size={18}/>;
        }
    };
    return (<div className="inventory-import-page p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <lucide_react_1.Upload size={32} className="me-2" style={{ verticalAlign: 'middle' }}/>
            Import Facturi
          </h2>
          <p className="text-muted mb-0">Import facturi furnizori (PDF, XML) și creare automată NIR</p>
        </div>
        <react_bootstrap_1.Button variant="primary" size="lg" onClick={function () { return setShowModal(true); }} className="d-flex align-items-center">
          <lucide_react_1.Upload size={20} className="me-2"/>Importă factură</react_bootstrap_1.Button>
      </div>

      {/* Stats Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-2">{stats.total}</h3>
              <p className="text-muted mb-0">Total Importuri</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center border-success">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-2 text-success">{stats.imported}</h3>
              <p className="text-muted mb-0">Importate</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center border-primary">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-2 text-primary">{stats.processed}</h3>
              <p className="text-muted mb-0">Procesate</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center border-secondary">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-2 text-secondary">{stats.draft}</h3>
              <p className="text-muted mb-0">Draft</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Import History */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <lucide_react_1.Clock size={20} className="me-2" style={{ verticalAlign: 'middle' }}/>
            Istoric Importuri
          </h5>
          <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={loadImportHistory} disabled={historyLoading}>
            {historyLoading ? <react_bootstrap_1.Spinner animation="border" size="sm"/> : 'Reîmprospătează'}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body className="p-0">
          {historyLoading ? (<div className="text-center p-5">
              <react_bootstrap_1.Spinner animation="border"/>
              <p className="mt-3 text-muted">Se încarcă istoric...</p>
            </div>) : history.length === 0 ? (<div className="text-center p-5">
              <lucide_react_1.AlertCircle size={48} className="text-muted mb-3"/>
              <p className="text-muted">Nu există importuri în istoric</p>
              <react_bootstrap_1.Button variant="primary" onClick={function () { return setShowModal(true); }}>Importă prima factură</react_bootstrap_1.Button>
            </div>) : (<div className="table-responsive">
              <react_bootstrap_1.Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Nr. factură</th>
                    <th>Furnizor</th>
                    <th>Data</th>
                    <th className="text-end">Valoare</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>NIR ID</th>
                    <th>Articole</th>
                    <th>Importat la</th>
                    <th className="text-end">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(function (record) { return (<tr key={record.id}>
                      <td>{getFileTypeIcon(record.file_type)}</td>
                      <td><strong>{record.invoice_number}</strong></td>
                      <td>{record.supplier_name}</td>
                      <td>{new Date(record.invoice_date).toLocaleDateString('ro-RO')}</td>
                      <td className="text-end">
                        <strong>{record.total_value.toFixed(2)} RON</strong>
                      </td>
                      <td>
                        <react_bootstrap_1.Badge bg="light" text="dark">
                          {record.file_type.toUpperCase()}
                        </react_bootstrap_1.Badge>
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        {record.nir_id ? (<react_bootstrap_1.Badge bg="info">NIR #{record.nir_id}</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">-</react_bootstrap_1.Badge>)}
                      </td>
                      <td>
                        <react_bootstrap_1.Badge bg="light" text="dark">
                          {record.items_count || 0} articole
                        </react_bootstrap_1.Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(record.created_at).toLocaleString('ro-RO')}
                        </small>
                      </td>
                      <td className="text-end">
                        {record.file_path && (<react_bootstrap_1.Button variant="outline-primary" size="sm" className="me-2" onClick={function () { return window.open("/uploads/invoices/".concat(record.file_path), '_blank'); }}>
                            <lucide_react_1.Download size={14}/>
                          </react_bootstrap_1.Button>)}
                        <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return handleDelete(record.id); }}>
                          <lucide_react_1.Trash2 size={14}/>
                        </react_bootstrap_1.Button>
                      </td>
                    </tr>); })}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Import Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal} size="xl" backdrop="static" dialogClassName="inventory-import-modal-custom">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <lucide_react_1.Upload size={24} className="me-2" style={{ verticalAlign: 'middle' }}/>Importă factură</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}
          {success && <react_bootstrap_1.Alert variant="success">✅ Factura a fost importată cu succes!</react_bootstrap_1.Alert>}

          {loading && (<div className="mb-3">
              <react_bootstrap_1.ProgressBar now={uploadProgress} label={"".concat(uploadProgress, "%")} animated striped/>
            </div>)}

          <react_bootstrap_1.Form onSubmit={handleSubmit}>
            {/* File Type Selection */}
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Tip Import *</react_bootstrap_1.Form.Label>
              <div className="d-flex gap-3">
                <react_bootstrap_1.Form.Check type="radio" label={<span>
                      <lucide_react_1.FileText size={18} className="me-2 text-danger" style={{ verticalAlign: 'middle' }}/>
                      PDF
                    </span>} name="fileType" value="pdf" checked={fileType === 'pdf'} onChange={function (e) { return setFileType('pdf'); }}/>
                <react_bootstrap_1.Form.Check type="radio" label={<span>
                      <lucide_react_1.FileCode size={18} className="me-2 text-primary" style={{ verticalAlign: 'middle' }}/>
                      XML (e-Factura)
                    </span>} name="fileType" value="xml" checked={fileType === 'xml'} onChange={function (e) { return setFileType('xml'); }}/>
                <react_bootstrap_1.Form.Check type="radio" label={<span>
                      <lucide_react_1.FileText size={18} className="me-2 text-secondary" style={{ verticalAlign: 'middle' }}/>Manual</span>} name="fileType" value="manual" checked={fileType === 'manual'} onChange={function (e) { return setFileType('manual'); }}/>
              </div>
            </react_bootstrap_1.Form.Group>

            {/* File Upload */}
            {fileType !== 'manual' && (<react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Fișier Factură *</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="file" accept={fileType === 'pdf' ? '.pdf' : '.xml'} onChange={handleFileChange} required={true}/>
                {file && (<react_bootstrap_1.Form.Text className="text-success">
                    <lucide_react_1.CheckCircle size={14} className="me-1" style={{ verticalAlign: 'middle' }}/>
                    Fișier selectat: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </react_bootstrap_1.Form.Text>)}
              </react_bootstrap_1.Form.Group>)}

            <hr />

            {/* Invoice Details */}
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Număr Factură *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={invoiceNumber} onChange={function (e) { return setInvoiceNumber(e.target.value); }} placeholder="Ex: FAC-2026-001" required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Furnizor *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={supplier} onChange={function (e) { return setSupplier(e.target.value); }} placeholder="Ex: Metro Cash & Carry" required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Data Factură *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="date" value={invoiceDate} onChange={function (e) { return setInvoiceDate(e.target.value); }} required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Valoare Totală (RON) *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={totalValue} onChange={function (e) { return setTotalValue(e.target.value); }} placeholder="0.00" required/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            {/* Info Box */}
            <react_bootstrap_1.Alert variant="info" className="mb-0">
              <lucide_react_1.AlertCircle size={18} className="me-2" style={{ verticalAlign: 'middle' }}/>
              <strong>Ce se întâmplă după import</strong>
              <ul className="mb-0 mt-2">
                <li>Se creează automat un document NIR (Notă de Intrare Recepție)</li>
                <li>Se generează mișcări de stoc (RECEIVE) pentru toate articolele</li>
                <li>Fișierul original este salvat și poate fi descărcat</li>
              </ul>
            </react_bootstrap_1.Alert>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal} disabled={loading}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={handleSubmit} disabled={loading || success}>
            {loading ? (<>
                <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>Se importă...</>) : success ? (<>
                <lucide_react_1.CheckCircle size={18} className="me-2" style={{ verticalAlign: 'middle' }}/>Importat cu succes</>) : (<>
                <lucide_react_1.Upload size={18} className="me-2" style={{ verticalAlign: 'middle' }}/>Importă factură</>)}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.InventoryImportPage = InventoryImportPage;
