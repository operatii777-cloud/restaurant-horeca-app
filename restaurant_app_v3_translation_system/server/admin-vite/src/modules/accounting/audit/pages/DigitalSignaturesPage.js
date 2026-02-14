"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Digital Signatures Page
 *
 * Gestionare Semnături Digitale pentru Documente Contabile:
 * - Lista semnături
 * - Verificare semnături
 * - Detalii semnătură
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
exports.DigitalSignaturesPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
var HelpButton_1 = require("@/shared/components/HelpButton");
require("./DigitalSignaturesPage.css");
var DigitalSignaturesPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), signatures = _a[0], setSignatures = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), selectedSignature = _d[0], setSelectedSignature = _d[1];
    var _e = (0, react_1.useState)(false), showDetailsModal = _e[0], setShowDetailsModal = _e[1];
    (0, react_1.useEffect)(function () {
        loadSignatures();
    }, []);
    var loadSignatures = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, signaturesList, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/audit/signatures')];
                case 2:
                    response = _c.sent();
                    console.log('DigitalSignaturesPage Response:', response.data);
                    signaturesList = [];
                    if (response.data && response.data.success && Array.isArray(response.data.data)) {
                        signaturesList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        signaturesList = response.data;
                    }
                    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        signaturesList = response.data.data;
                    }
                    if (!Array.isArray(signaturesList)) {
                        console.warn('DigitalSignaturesPage signaturesList is not an array, setting to empty array');
                        signaturesList = [];
                    }
                    console.log('DigitalSignaturesPage Loaded signatures:', signaturesList.length);
                    setSignatures(signaturesList);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('DigitalSignaturesPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea semnăturilor');
                    setSignatures([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleVerifySignature = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/accounting/audit/signatures/\"Id\"/verify")];
                case 1:
                    response = _c.sent();
                    if (response.data.success) {
                        loadSignatures(); // Reload to get updated status
                    }
                    else {
                        alert('Eroare la verificare: ' + (response.data.error || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _c.sent();
                    alert('Eroare la verificare: ' + (((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleViewDetails = function (signature) {
        setSelectedSignature(signature);
        setShowDetailsModal(true);
    };
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        try {
            return new Date(dateString).toLocaleString('ro-RO');
        }
        catch (_a) {
            return dateString;
        }
    };
    var getDocumentTypeBadge = function (type) {
        var badges = {
            'invoice': { bg: 'primary', label: 'Factură' },
            'receipt': { bg: 'success', label: 'Bon Fiscal' },
            'report': { bg: 'info', label: 'Raport' },
            'export': { bg: 'warning', label: 'Export' },
            'other': { bg: 'secondary', label: 'Altul' }
        };
        var badge = badges[type] || badges['other'];
        return <react_bootstrap_1.Badge bg={badge.bg}>{badge.label}</react_bootstrap_1.Badge>;
    };
    return (<div className="digital-signatures-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>✍️ Semnături Digitale</h1>
          <p>Gestionare și verificare semnături digitale pentru documente contabile</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor semnături digitale" content={<div>
              <h5>✍️ Ce sunt semnăturile digitale?</h5>
              <p>
                Semnăturile digitale asigură integritatea și autenticitatea documentelor contabile.
                Fiecare document important (facturi, rapoarte Z, etc.) poate fi semnat digital.
              </p>
              <h5 className="mt-4">🔍 Funcționalități</h5>
              <ul>
                <li><strong>Generare semnătură</strong> - Creează o semnătură digitală pentru un document</li>
                <li><strong>Verificare semnătură</strong> - Verifică dacă un document a fost modificat</li>
                <li><strong>Istoric</strong> - Vezi toate semnăturile generate</li>
                <li><strong>Detalii</strong> - Vezi informații despre semnătură (hash, timestamp, etc.)</li>
              </ul>
              <h5 className="mt-4">🔒 Securitate</h5>
              <p>
                Semnăturile digitale folosesc algoritmi criptografici pentru a asigura că documentul
                nu a fost modificat după semnare. Orice modificare va invalida semnătura.
              </p>
              <div className="alert alert-warning mt-4">
                <strong>⚠️ Important:</strong> Semnăturile digitale nu înlocuiesc semnăturile legale.
                Consultă întotdeauna un avocat pentru aspecte legale.
              </div>
            </div>}/>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista semnături</h5>
          <react_bootstrap_1.Button variant="outline-primary" onClick={loadSignatures}>
            <i className="fas fa-sync me-2"></i>Reîncarcă</react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Tip Document</th>
                  <th>Semnat de</th>
                  <th>Data semnătură</th>
                  <th>Metodă</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {(function () {
                var safeSignatures = Array.isArray(signatures) ? signatures : [];
                if (safeSignatures.length > 0) {
                    return safeSignatures.map(function (signature) { return (<tr key={signature.id}>
                        <td>
                          <strong>#{signature.document_id}</strong>
                          {signature.document_number && (<div className="text-muted small">{signature.document_number}</div>)}
                        </td>
                        <td>{getDocumentTypeBadge(signature.document_type)}</td>
                        <td>{signature.signed_by}</td>
                        <td>{formatDate(signature.signature_time)}</td>
                        <td>
                          <react_bootstrap_1.Badge bg="secondary">{signature.signature_method}</react_bootstrap_1.Badge>
                        </td>
                        <td>
                          <react_bootstrap_1.Badge bg={signature.is_valid ? 'success' : 'danger'}>
                            {signature.is_valid ? 'Validă' : 'Invalidă'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          <react_bootstrap_1.Button variant="outline-info" size="sm" onClick={function () { return handleViewDetails(signature); }} className="me-2">
                            <i className="fas fa-eye"></i>
                          </react_bootstrap_1.Button>
                          {!signature.is_valid && (<react_bootstrap_1.Button variant="outline-warning" size="sm" onClick={function () { return handleVerifySignature(signature.id); }}>
                              <i className="fas fa-check-circle"></i>
                            </react_bootstrap_1.Button>)}
                        </td>
                      </tr>); });
                }
                else {
                    return (<tr>
                        <td colSpan={7} className="text-center text-muted py-4">Nu există semnături digitale. Semnăturile vor apărea aici.</td>
                      </tr>);
                }
            })()}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Details Modal */}
      <react_bootstrap_1.Modal show={showDetailsModal} onHide={function () { return setShowDetailsModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-info-circle me-2"></i>Detalii semnătură digitală</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedSignature && (<div>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>ID semnătură</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedSignature.id} readOnly/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Tip Document</strong></react_bootstrap_1.Form.Label>
                <div>{getDocumentTypeBadge(selectedSignature.document_type)}</div>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>ID Document</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedSignature.document_id} readOnly/>
              </react_bootstrap_1.Form.Group>
              {selectedSignature.document_number && (<react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label><strong>Număr Document</strong></react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={selectedSignature.document_number} readOnly/>
                </react_bootstrap_1.Form.Group>)}
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Semnat de</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedSignature.signed_by} readOnly/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Data semnătură</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={formatDate(selectedSignature.signature_time)} readOnly/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Metodă semnătură</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedSignature.signature_method} readOnly/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Hash semnătură</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedSignature.signature_hash} readOnly className="font-monospace small"/>
              </react_bootstrap_1.Form.Group>
              {selectedSignature.certificate_info && (<react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label><strong>Informații certificat</strong></react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={selectedSignature.certificate_info} readOnly/>
                </react_bootstrap_1.Form.Group>)}
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Status</strong></react_bootstrap_1.Form.Label>
                <div>
                  <react_bootstrap_1.Badge bg={selectedSignature.is_valid ? 'success' : 'danger'}>
                    {selectedSignature.is_valid ? 'Validă' : 'Invalidă'}
                  </react_bootstrap_1.Badge>
                </div>
              </react_bootstrap_1.Form.Group>
              {selectedSignature.verified_at && (<>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label><strong>Verificat la</strong></react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="text" value={formatDate(selectedSignature.verified_at)} readOnly/>
                  </react_bootstrap_1.Form.Group>
                  {selectedSignature.verified_by && (<react_bootstrap_1.Form.Group className="mb-3">
                      <react_bootstrap_1.Form.Label><strong>Verificat de</strong></react_bootstrap_1.Form.Label>
                      <react_bootstrap_1.Form.Control type="text" value={selectedSignature.verified_by} readOnly/>
                    </react_bootstrap_1.Form.Group>)}
                </>)}
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowDetailsModal(false); }}>Închide</react_bootstrap_1.Button>
          {selectedSignature && !selectedSignature.is_valid && (<react_bootstrap_1.Button variant="warning" onClick={function () {
                handleVerifySignature(selectedSignature.id);
                setShowDetailsModal(false);
            }}>
              <i className="fas fa-check-circle me-2"></i>Verifică semnătura</react_bootstrap_1.Button>)}
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.DigitalSignaturesPage = DigitalSignaturesPage;
