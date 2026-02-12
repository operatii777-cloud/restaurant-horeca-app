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
exports.LabelsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var labelsApi_1 = require("../api/labelsApi");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./LabelsPage.css");
var LabelsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), selectedProduct = _d[0], setSelectedProduct = _d[1];
    var _e = (0, react_1.useState)(''), productName = _e[0], setProductName = _e[1];
    var _f = (0, react_1.useState)(''), productPrice = _f[0], setProductPrice = _f[1];
    var _g = (0, react_1.useState)(''), barcode = _g[0], setBarcode = _g[1];
    var _h = (0, react_1.useState)(''), additionalInfo = _h[0], setAdditionalInfo = _h[1];
    var _j = (0, react_1.useState)('standard'), currentTemplate = _j[0], setCurrentTemplate = _j[1];
    var _k = (0, react_1.useState)(1), batchCount = _k[0], setBatchCount = _k[1];
    var _l = (0, react_1.useState)(null), feedback = _l[0], setFeedback = _l[1];
    var fetchProducts = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, labelsApi_1.labelsApi.fetchProducts()];
                case 2:
                    data = _a.sent();
                    setProducts(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('❌ Eroare la încărcarea produselor:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void fetchProducts();
    }, [fetchProducts]);
    var generateBarcode = (0, react_1.useCallback)(function () {
        var timestamp = Date.now().toString().slice(-8);
        var random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        var newBarcode = "2025\"Timestamp\"\"Random\"";
        setBarcode(newBarcode);
    }, []);
    (0, react_1.useEffect)(function () {
        generateBarcode();
    }, [generateBarcode]);
    var handleProductSelect = function (productId) {
        var product = products.find(function (p) { return p.id === Number(productId); });
        if (product) {
            setSelectedProduct(product);
            setProductName(product.name);
            setProductPrice(product.price.toString());
            setBarcode(product.barcode || '');
        }
    };
    var handlePrintLabel = function () {
        var _a;
        var printWindow = window.open('', '', 'width=600,height=400');
        if (!printWindow)
            return;
        var labelContent = ((_a = document.getElementById('labelTemplate')) === null || _a === void 0 ? void 0 : _a.outerHTML) || '';
        printWindow.document.write("\n      <html>\n      <head>\n        <title>\"eticheta produs\"</title>\n        <style>\n          body { font-family: Arial, sans-serif; margin: 20px; }\n          .label-template { \n            border: 1px solid #333; \n            padding: 20px; \n            text-align: center; \n            max-width: 400px;\n            margin: 20px auto;\n            background: white;\n          }\n          .barcode { \n            font-family: 'Courier New', monospace; \n            font-size: 2rem; \n            margin: 20px 0; \n            letter-spacing: 2px;\n          }\n          .price { \n            font-size: 2rem; \n            font-weight: 700; \n            color: #667eea; \n            margin: 15px 0;\n          }\n          h3 {\n            font-size: 1.5rem;\n            margin-bottom: 10px;\n            font-weight: 700;\n          }\n        </style>\n      </head>\n      <body>\n        ".concat(labelContent, "\n      </body>\n      </html>\n    "));
        printWindow.document.close();
        setTimeout(function () {
            printWindow.print();
            printWindow.close();
        }, 250);
    };
    var handleDownloadPDF = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!productName || !productPrice) {
                        setFeedback({ type: 'error', message: 'Completați numele și prețul produsului!' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, labelsApi_1.labelsApi.generateLabel({
                            product_id: selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id,
                            product_name: productName,
                            price: parseFloat(productPrice),
                            barcode: barcode || undefined,
                            additional_info: additionalInfo || undefined,
                        })];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'PDF generat cu succes! (Funcționalitate în dezvoltare)' });
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('❌ Eroare la generare PDF:', err_2);
                    setFeedback({ type: 'error', message: 'Eroare la generare PDF: ' + (err_2.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handlePrintBatch = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProduct) {
                        setFeedback({ type: 'error', message: 'Selectați un produs!' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, labelsApi_1.labelsApi.printBatch(selectedProduct.id, batchCount)];
                case 2:
                    response = _a.sent();
                    setFeedback({ type: 'success', message: response.message });
                    handlePrintLabel(); // Deschide fereastra de print
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('❌ Eroare la imprimare lot:', err_3);
                    setFeedback({ type: 'error', message: 'Eroare la imprimare lot: ' + (err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getTemplateStyles = function (template) {
        switch (template) {
            case 'minimal':
                return {
                    border: '1px solid #ccc',
                    padding: '15px',
                    background: 'white',
                };
            case 'premium':
                return {
                    border: '3px double gold',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #fff, #f9f9f9)',
                };
            default:
                return {
                    border: '1px solid #333',
                    padding: '20px',
                    background: 'white',
                };
        }
    };
    return (<div className="labels-page">
      <PageHeader_1.PageHeader title="🏷️ Etichete Produse" description="Generare etichete cu cod de bare pentru produse"/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}
      {error && <InlineAlert_1.InlineAlert type="error" message={error} onClose={function () { return setError(null); }}/>}

      <div className="row mt-4">
        {/* Left: Configuration */}
        <div className="col-md-6">
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-cog me-2"></i>Configurare etichetă</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Form>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Produs *</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) || ''} onChange={function (e) { return handleProductSelect(e.target.value); }}>
                    <option value="">Selectează produs</option>
                    {products.map(function (product) { return (<option key={product.id} value={product.id}>
                        {product.name} - {product.price.toFixed(2)} RON
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Nume Produs</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={productName} onChange={function (e) { return setProductName(e.target.value); }} placeholder="nume produs"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Preț (RON)</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={productPrice} onChange={function (e) { return setProductPrice(e.target.value); }} placeholder="0.00"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Cod de bare</react_bootstrap_1.Form.Label>
                  <div className="d-flex gap-2">
                    <react_bootstrap_1.Form.Control type="text" value={barcode} onChange={function (e) { return setBarcode(e.target.value); }} placeholder="generat automat" readOnly/>
                    <react_bootstrap_1.Button variant="secondary" onClick={generateBarcode}>
                      <i className="fas fa-sync-alt"></i>Generează</react_bootstrap_1.Button>
                  </div>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Informații Suplimentare</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control as="textarea" rows={2} value={additionalInfo} onChange={function (e) { return setAdditionalInfo(e.target.value); }} placeholder="ex valabil pana"/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Form>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Template Selection */}
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-th me-2"></i>Șabloane</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div className="template-grid">
                <div className={"template-card ".concat(currentTemplate === 'standard' ? 'active' : '')} onClick={function () { return setCurrentTemplate('standard'); }}>
                  <i className="fas fa-file-alt fa-3x mb-2"></i>
                  <p><strong>Standard</strong></p>
                  <small>Etichetă clasică</small>
                </div>
                <div className={"template-card ".concat(currentTemplate === 'minimal' ? 'active' : '')} onClick={function () { return setCurrentTemplate('minimal'); }}>
                  <i className="fas fa-minus-square fa-3x mb-2"></i>
                  <p><strong>Minimal</strong></p>
                  <small>Design simplu</small>
                </div>
                <div className={"template-card ".concat(currentTemplate === 'premium' ? 'active' : '')} onClick={function () { return setCurrentTemplate('premium'); }}>
                  <i className="fas fa-star fa-3x mb-2"></i>
                  <p><strong>Premium</strong></p>
                  <small>Design elegant</small>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>

        {/* Right: Preview */}
        <div className="col-md-6">
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="fas fa-eye me-2"></i>Previzualizare</h5>
              <div className="d-flex gap-2">
                <react_bootstrap_1.Button variant="success" onClick={handlePrintLabel}>
                  <i className="fas fa-print me-2"></i>Imprimă</react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="primary" onClick={handleDownloadPDF}>
                  <i className="fas fa-download me-2"></i>Descarcă PDF</react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <div className="label-preview">
                <div id="labelTemplate" className="label-template" style={getTemplateStyles(currentTemplate)}>
                  <h3>{productName || 'Nume Produs'}</h3>
                  <div className="barcode">*{barcode || '123456789'}*</div>
                  <div className="price">
                    {productPrice ? "".concat(parseFloat(productPrice).toFixed(2), " RON") : '0.00 RON'}
                  </div>
                  {additionalInfo && (<p className="text-muted small mb-0">{additionalInfo}</p>)}
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Batch Printing */}
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0"><i className="fas fa-layer-group me-2"></i>Imprimare în lot</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Număr etichete</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="number" min="1" max="100" value={batchCount} onChange={function (e) { return setBatchCount(Number(e.target.value)); }}/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Button variant="warning" onClick={handlePrintBatch} className="w-100">
                <i className="fas fa-print me-2"></i>Imprimă în lot</react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>
    </div>);
};
exports.LabelsPage = LabelsPage;
