"use strict";
/**
 * PHASE S5.2 - Tipizate PDF Preview Modal
 * Modal component for previewing and downloading PDF documents
 */
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
exports.TipizatePdfPreviewModal = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var tipizateApi_1 = require("../api/tipizateApi");
var TipizatePdfPreviewModal = function (_a) {
    var docType = _a.docType, docId = _a.docId, show = _a.show, onHide = _a.onHide, documentNumber = _a.documentNumber, externalPdfUrl = _a.pdfUrl;
    var _b = (0, react_1.useState)(null), pdfUrl = _b[0], setPdfUrl = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        if (show && docId) {
            if (externalPdfUrl) {
                // Use provided URL
                setPdfUrl(externalPdfUrl);
                setLoading(false);
                setError(null);
            }
            else {
                // Fetch PDF
                loadPdf();
            }
        }
        else {
            setPdfUrl(null);
            setError(null);
        }
    }, [show, docId, docType, externalPdfUrl]);
    var loadPdf = function () { return __awaiter(void 0, void 0, void 0, function () {
        var blob, url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!docId)
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, tipizateApi_1.tipizateApi.pdf(docId, docType)];
                case 2:
                    blob = _a.sent();
                    url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Eroare la încărcarea PDF-ului');
                    console.error('PDF load error:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () {
        if (!pdfUrl || !docId)
            return;
        var link = document.createElement('a');
        link.href = pdfUrl;
        link.download = "".concat(docType, "-").concat(docId, ".pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    var handlePrint = function () {
        if (!pdfUrl)
            return;
        var printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.onload = function () {
                printWindow.print();
            };
        }
    };
    var handleClose = function () {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
        onHide();
    };
    return (<react_bootstrap_1.Modal show={show} onHide={handleClose} size="xl" centered>
      <react_bootstrap_1.Modal.Header closeButton>
        <react_bootstrap_1.Modal.Title>
          Preview PDF - {docType}
          {documentNumber && " (".concat(documentNumber, ")")}
        </react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Modal.Body style={{ minHeight: '500px', padding: 0 }}>
        {loading && (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
            <react_bootstrap_1.Spinner animation="border" role="status">
              <span className="visually-hidden">Se încarcă PDF-ul...</span>
            </react_bootstrap_1.Spinner>
          </div>)}

        {error && (<div className="alert alert-danger m-3">
            <strong>Eroare:</strong> {error}
            <react_bootstrap_1.Button variant="outline-danger" size="sm" className="ms-2" onClick={loadPdf}>
              Reîncearcă
            </react_bootstrap_1.Button>
          </div>)}

        {pdfUrl && !loading && !error && (<iframe src={pdfUrl} style={{
                width: '100%',
                height: '600px',
                border: 'none',
            }} title="PDF Preview"/>)}
      </react_bootstrap_1.Modal.Body>
      <react_bootstrap_1.Modal.Footer>
        <react_bootstrap_1.Button variant="secondary" onClick={handleClose}>
          Închide
        </react_bootstrap_1.Button>
        {pdfUrl && (<>
            <react_bootstrap_1.Button variant="outline-primary" onClick={handleDownload}>
              <i className="bi bi-download me-1"></i>
              Descarcă
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="outline-primary" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i>
              Tipărește
            </react_bootstrap_1.Button>
          </>)}
      </react_bootstrap_1.Modal.Footer>
    </react_bootstrap_1.Modal>);
};
exports.TipizatePdfPreviewModal = TipizatePdfPreviewModal;
