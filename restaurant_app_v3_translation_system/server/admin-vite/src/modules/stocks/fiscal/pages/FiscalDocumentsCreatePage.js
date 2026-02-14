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
exports.FiscalDocumentsCreatePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FiscalDocumentsCreatePage.css");
var FiscalDocumentsCreatePage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), orders = _a[0], setOrders = _a[1];
    var _b = (0, react_1.useState)(false), loadingOrders = _b[0], setLoadingOrders = _b[1];
    var _c = (0, react_1.useState)(false), submittingReceipt = _c[0], setSubmittingReceipt = _c[1];
    var _d = (0, react_1.useState)(false), submittingInvoice = _d[0], setSubmittingInvoice = _d[1];
    var _e = (0, react_1.useState)(null), feedback = _e[0], setFeedback = _e[1];
    // Receipt form state
    var _f = (0, react_1.useState)({
        orderId: '',
        paymentMethod: 'cash',
        isFiscal: '0', // 0 = Chitanță, 1 = Bon Nefiscal
    }), receiptForm = _f[0], setReceiptForm = _f[1];
    // Invoice form state
    var _g = (0, react_1.useState)({
        orderId: '',
        clientName: '',
        clientCUI: '',
        clientRegCom: '',
        invoiceAmount: '',
    }), invoiceForm = _g[0], setInvoiceForm = _g[1];
    (0, react_1.useEffect)(function () {
        loadOrders();
    }, []);
    var loadOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, ordersList, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoadingOrders(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/orders-delivery?lang=ro')];
                case 2:
                    response = _b.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.orders) {
                        ordersList = response.data.orders.map(function (order) {
                            var _a;
                            return ({
                                id: order.id || order.order_id,
                                order_number: order.order_number || ((_a = order.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                                date: order.date || order.created_at || '',
                                total: order.total || order.total_amount || 0,
                                table_name: order.table_name || order.table || '',
                                customer_name: order.customer_name || order.customer || '',
                            });
                        });
                        setOrders(ordersList);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea comenzilor:', error_1);
                    setFeedback({ type: 'error', message: 'Nu s-au putut încărca comenzile.' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingOrders(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleReceiptSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    e.preventDefault();
                    setSubmittingReceipt(true);
                    setFeedback(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/fiscal/create-document', {
                            order_id: receiptForm.orderId,
                            payment_method: receiptForm.paymentMethod,
                            document_type: receiptForm.isFiscal === '1' ? 'bon_nefiscal' : "Chitanță",
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({
                            type: 'success',
                            message: "Document fiscal emis cu succes! Num\u0103r: ".concat(response.data.document_number || 'N/A'),
                        });
                        // Reset form
                        setReceiptForm({
                            orderId: '',
                            paymentMethod: 'cash',
                            isFiscal: '0',
                        });
                    }
                    else {
                        setFeedback({
                            type: 'error',
                            message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut emite documentul fiscal.',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _e.sent();
                    console.error('❌ Eroare la emiterea documentului fiscal:', error_2);
                    setFeedback({
                        type: 'error',
                        message: ((_d = (_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la emiterea documentului fiscal.',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setSubmittingReceipt(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleInvoiceSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    e.preventDefault();
                    setSubmittingInvoice(true);
                    setFeedback(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/fiscal/create-invoice', {
                            order_id: invoiceForm.orderId || null,
                            client_name: invoiceForm.clientName,
                            client_cui: invoiceForm.clientCUI || null,
                            client_reg_com: invoiceForm.clientRegCom || null,
                            amount: parseFloat(invoiceForm.invoiceAmount),
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({
                            type: 'success',
                            message: "Factur\u0103 emis\u0103 cu succes! Num\u0103r: ".concat(response.data.invoice_number || 'N/A'),
                        });
                        // Reset form
                        setInvoiceForm({
                            orderId: '',
                            clientName: '',
                            clientCUI: '',
                            clientRegCom: '',
                            invoiceAmount: '',
                        });
                    }
                    else {
                        setFeedback({
                            type: 'error',
                            message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut emite factura.',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _e.sent();
                    console.error('❌ Eroare la emiterea facturii:', error_3);
                    setFeedback({
                        type: 'error',
                        message: ((_d = (_c = error_3.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la emiterea facturii.',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setSubmittingInvoice(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Group orders by date for better UX
    var groupedOrders = orders.reduce(function (acc, order) {
        var date = new Date(order.date).toLocaleDateString('ro-RO');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(order);
        return acc;
    }, {});
    return (<div className="fiscal-documents-create-page">
      <react_bootstrap_1.Card className="shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-success text-white">
          <i className="fas fa-plus-circle me-1"></i>"creare documente fiscale"</react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : feedback.type === 'warning' ? 'warning' : 'danger'} dismissible onClose={function () { return setFeedback(null); }}>
              {feedback.message}
            </react_bootstrap_1.Alert>)}

          <div className="row">
            {/* Bon Nefiscal / Chitanță */}
            <div className="col-md-6">
              <h6>Bon Nefiscal / Chitanță</h6>
              <p className="text-muted">"emite bon nefiscal sau chitanta pentru o comanda e"</p>
              <react_bootstrap_1.Form onSubmit={handleReceiptSubmit}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"selecteaza comanda"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={receiptForm.orderId} onChange={function (e) { return setReceiptForm(__assign(__assign({}, receiptForm), { orderId: e.target.value })); }} required disabled={loadingOrders}>
                    <option value="">
                      {loadingOrders ? 'Se încarcă comenzile...' : 'Selectează o comandă'}
                    </option>
                    {Object.entries(groupedOrders).map(function (_a) {
            var date = _a[0], dateOrders = _a[1];
            return (<optgroup key={date} label={date}>
                        {dateOrders.map(function (order) { return (<option key={order.id} value={order.id}>
                            #{order.order_number} - {order.table_name ? "Masa ".concat(order.table_name) : 'Fără masă'} - {order.total.toFixed(2)} RON
                          </option>); })}
                      </optgroup>);
        })}
                  </react_bootstrap_1.Form.Select>
                  <react_bootstrap_1.Form.Text className="text-muted">"comenzile sunt grupate pe zile pentru usurinta"</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Metodă de Plată:</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={receiptForm.paymentMethod} onChange={function (e) { return setReceiptForm(__assign(__assign({}, receiptForm), { paymentMethod: e.target.value })); }} required>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="sodexo">"Sodexo"</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Tip Document:</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={receiptForm.isFiscal} onChange={function (e) { return setReceiptForm(__assign(__assign({}, receiptForm), { isFiscal: e.target.value })); }} required>
                    <option value="0">"Chitanță"</option>
                    <option value="1">Bon Nefiscal</option>
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Button type="submit" variant="success" disabled={submittingReceipt}>
                  <i className="fas fa-receipt me-1"></i>
                  {submittingReceipt ? 'Se emite...' : 'Emite Document'}
                </react_bootstrap_1.Button>
              </react_bootstrap_1.Form>
            </div>

            {/* Factură */}
            <div className="col-md-6">
              <h6>"Factură"</h6>
              <p className="text-muted">"emite factura pentru un client"</p>
              <react_bootstrap_1.Form onSubmit={handleInvoiceSubmit}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Selectează Comanda (opțional):</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={invoiceForm.orderId} onChange={function (e) {
            var selectedOrder = orders.find(function (o) { return o.id.toString() === e.target.value; });
            setInvoiceForm(__assign(__assign({}, invoiceForm), { orderId: e.target.value, invoiceAmount: selectedOrder ? selectedOrder.total.toFixed(2) : invoiceForm.invoiceAmount }));
        }}>
                    <option value="">"fara comanda asociata"</option>
                    {Object.entries(groupedOrders).map(function (_a) {
            var date = _a[0], dateOrders = _a[1];
            return (<optgroup key={date} label={date}>
                        {dateOrders.map(function (order) { return (<option key={order.id} value={order.id}>
                            #{order.order_number} - {order.table_name ? "Masa ".concat(order.table_name) : 'Fără masă'} - {order.total.toFixed(2)} RON
                          </option>); })}
                      </optgroup>);
        })}
                  </react_bootstrap_1.Form.Select>
                  <react_bootstrap_1.Form.Text className="text-muted">"selecteaza o comanda pentru a pre popula datele sa"</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Nume Client:</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={invoiceForm.clientName} onChange={function (e) { return setInvoiceForm(__assign(__assign({}, invoiceForm), { clientName: e.target.value })); }} required placeholder="ex sc restaurant srl"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"CUI:"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={invoiceForm.clientCUI} onChange={function (e) { return setInvoiceForm(__assign(__assign({}, invoiceForm), { clientCUI: e.target.value })); }} placeholder="Ex: RO12345678"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Reg. Com:</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="text" value={invoiceForm.clientRegCom} onChange={function (e) { return setInvoiceForm(__assign(__assign({}, invoiceForm), { clientRegCom: e.target.value })); }} placeholder="Ex: J40/1234/2023"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>"suma totala"</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" step="0.01" value={invoiceForm.invoiceAmount} onChange={function (e) { return setInvoiceForm(__assign(__assign({}, invoiceForm), { invoiceAmount: e.target.value })); }} required placeholder="Ex: 150.00"/>
                </react_bootstrap_1.Form.Group>

                <react_bootstrap_1.Button type="submit" variant="primary" disabled={submittingInvoice}>
                  <i className="fas fa-file-invoice me-1"></i>
                  {submittingInvoice ? 'Se emite...' : 'Emite Factură'}
                </react_bootstrap_1.Button>
              </react_bootstrap_1.Form>
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.FiscalDocumentsCreatePage = FiscalDocumentsCreatePage;
