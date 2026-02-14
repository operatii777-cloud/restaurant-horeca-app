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
exports.InvoiceImportModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var InvoiceImportModal = function (_a) {
    var show = _a.show, onHide = _a.onHide, onSuccess = _a.onSuccess;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)('pdf'), fileType = _b[0], setFileType = _b[1];
    var _c = (0, react_1.useState)(null), file = _c[0], setFile = _c[1];
    var _d = (0, react_1.useState)(''), invoiceNumber = _d[0], setInvoiceNumber = _d[1];
    var _e = (0, react_1.useState)(''), supplier = _e[0], setSupplier = _e[1];
    var _f = (0, react_1.useState)(''), invoiceDate = _f[0], setInvoiceDate = _f[1];
    var _g = (0, react_1.useState)(''), totalValue = _g[0], setTotalValue = _g[1];
    var _h = (0, react_1.useState)(false), loading = _h[0], setLoading = _h[1];
    var _j = (0, react_1.useState)(null), error = _j[0], setError = _j[1];
    var _k = (0, react_1.useState)(false), success = _k[0], setSuccess = _k[1];
    var handleFileChange = function (e) {
        var _a;
        var selectedFile = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var formData, response, err_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(false);
                    if (!file) {
                        setError('Vă rugăm selectați un fișier.');
                        return [2 /*return*/];
                    }
                    if (!invoiceNumber || !supplier || !invoiceDate || !totalValue) {
                        setError('Vă rugăm completați toate câmpurile obligatorii.');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    formData = new FormData();
                    formData.append('file', file);
                    formData.append('file_type', fileType);
                    formData.append('invoice_number', invoiceNumber);
                    formData.append('supplier', supplier);
                    formData.append('invoice_date', invoiceDate);
                    formData.append('total_value', totalValue);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/inventory/import-invoice', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setSuccess(true);
                        setTimeout(function () {
                            handleClose();
                            if (onSuccess) {
                                onSuccess();
                            }
                        }, 1500);
                    }
                    else {
                        setError(((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la importul facturii.');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _e.sent();
                    console.error('❌ Eroare la importul facturii:', err_1);
                    setError(((_d = (_c = err_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la importul facturii.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleClose = function () {
        setFile(null);
        setInvoiceNumber('');
        setSupplier('');
        setInvoiceDate('');
        setTotalValue('');
        setError(null);
        setSuccess(false);
        onHide();
    };
    return (<react_bootstrap_1.Modal show={show} onHide={handleClose} size="lg">
      <react_bootstrap_1.Modal.Header closeButton className="bg-success text-white">
        <react_bootstrap_1.Modal.Title>
          <i className="fas fa-file-upload me-2"></i>"import factura"</react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Modal.Body>
        {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}
        {success && <react_bootstrap_1.Alert variant="success">"factura a fost importata cu succes"</react_bootstrap_1.Alert>}

        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Tip Fișier *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Select value={fileType} onChange={function (e) { return setFileType(e.target.value); }} required>
              <option value="">"selecteaza tipul"</option>
              <option value="pdf">PDF</option>
              <option value="xml">XML</option>
            </react_bootstrap_1.Form.Select>
          </react_bootstrap_1.Form.Group>

          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>Fișier Factură *</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control type="file" accept={fileType === 'pdf' ? '.pdf' : '.xml'} onChange={handleFileChange} required/>
            {file && <small className="text-muted">Fișier selectat: {file.name}</small>}
          </react_bootstrap_1.Form.Group>

          <div className="row">
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Număr Factură *</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={invoiceNumber} onChange={function (e) { return setInvoiceNumber(e.target.value); }} required/>
              </react_bootstrap_1.Form.Group>
            </div>
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Furnizor *</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={supplier} onChange={function (e) { return setSupplier(e.target.value); }} required/>
              </react_bootstrap_1.Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Data Factură *</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="date" value={invoiceDate} onChange={function (e) { return setInvoiceDate(e.target.value); }} required/>
              </react_bootstrap_1.Form.Group>
            </div>
            <div className="col-md-6">
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Valoare Totală *</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="number" step="0.01" value={totalValue} onChange={function (e) { return setTotalValue(e.target.value); }} required/>
              </react_bootstrap_1.Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <react_bootstrap_1.Button variant="secondary" onClick={handleClose} disabled={loading}>"Anulează"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="success" type="submit" disabled={loading || success}>
              {loading ? (<>
                  <i className="fas fa-spinner fa-spin me-1"></i>"se importa"</>) : (<>
                  <i className="fas fa-upload me-1"></i>"importa factura"</>)}
            </react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal.Body>
    </react_bootstrap_1.Modal>);
};
exports.InvoiceImportModal = InvoiceImportModal;
