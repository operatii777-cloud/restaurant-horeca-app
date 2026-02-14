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
exports.SupplierOrdersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var DataGrid_1 = require("@/shared/components/DataGrid");
var supplierOrdersApi_1 = require("../api/supplierOrdersApi");
var suppliersApi_1 = require("../../api/suppliersApi");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./SupplierOrdersPage.css");
var ORDER_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'secondary' },
    { value: 'sent', label: 'Trimis', color: 'info' },
    { value: 'confirmed', label: 'Confirmat', color: 'primary' },
    { value: 'in_transit', label: 'În tranzit', color: 'warning' },
    { value: 'delivered', label: 'Livrat', color: 'success' },
    { value: 'cancelled', label: 'Anulat', color: 'danger' },
];
var SupplierOrdersPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), orders = _a[0], setOrders = _a[1];
    var _b = (0, react_1.useState)([]), suppliers = _b[0], setSuppliers = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), showModal = _e[0], setShowModal = _e[1];
    var _f = (0, react_1.useState)(null), editingOrder = _f[0], setEditingOrder = _f[1];
    var _g = (0, react_1.useState)(null), feedback = _g[0], setFeedback = _g[1];
    var _h = (0, react_1.useState)({
        supplier_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        status: 'draft',
    }), formData = _h[0], setFormData = _h[1];
    var fetchData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ordersData, suppliersData, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            supplierOrdersApi_1.supplierOrdersApi.fetchOrders(),
                            suppliersApi_1.suppliersApi.fetchSuppliers(true),
                        ])];
                case 2:
                    _a = _b.sent(), ordersData = _a[0], suppliersData = _a[1];
                    setOrders(ordersData);
                    setSuppliers(suppliersData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea datelor:', err_1);
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
        void fetchData();
    }, [fetchData]);
    var handleOpenModal = function (order) {
        if (order) {
            setEditingOrder(order);
            setFormData(order);
        }
        else {
            setEditingOrder(null);
            setFormData({
                supplier_id: 0,
                order_date: new Date().toISOString().split('T')[0],
                status: 'draft',
            });
        }
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingOrder(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.supplier_id || !formData.order_date) {
                        setFeedback({ type: 'error', message: 'Furnizorul și data sunt obligatorii!' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (!(editingOrder === null || editingOrder === void 0 ? void 0 : editingOrder.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, supplierOrdersApi_1.supplierOrdersApi.updateOrder(editingOrder.id, formData)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Comandă actualizată cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, supplierOrdersApi_1.supplierOrdersApi.createOrder(formData)];
                case 4:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Comandă creată cu succes!' });
                    _a.label = 5;
                case 5:
                    handleCloseModal();
                    return [4 /*yield*/, fetchData()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.error('❌ Eroare la salvare:', err_2);
                    setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (err_2.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi această comandă?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, supplierOrdersApi_1.supplierOrdersApi.deleteOrder(id)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Comandă ștearsă cu succes!' });
                    return [4 /*yield*/, fetchData()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    console.error('❌ Eroare la ștergere:', err_3);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        var statusInfo = ORDER_STATUSES.find(function (s) { return s.value === status; });
        return <react_bootstrap_1.Badge bg={(statusInfo === null || statusInfo === void 0 ? void 0 : statusInfo.color) || 'secondary'}>{(statusInfo === null || statusInfo === void 0 ? void 0 : statusInfo.label) || status}</react_bootstrap_1.Badge>;
    };
    var columnDefs = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'supplier_name', headerName: 'Furnizor', flex: 1 },
        { field: 'order_date', headerName: 'Data Comandă', width: 120 },
        { field: 'expected_delivery_date', headerName: 'Data Livrare', width: 120 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            cellRenderer: function (params) { return getStatusBadge(params.value); },
        },
        {
            field: 'total_amount',
            headerName: 'Total',
            width: 120,
            cellRenderer: function (params) { return "".concat((params.value || 0).toFixed(2), " RON"); },
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            cellRenderer: function (params) { return (<div className="d-flex gap-2">
          <react_bootstrap_1.Button variant="info" size="sm" onClick={function () { return handleOpenModal(params.data); }}>
            <i className="fas fa-edit"></i>
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="danger" size="sm" onClick={function () { return handleDelete(params.data.id); }}>
            <i className="fas fa-trash-alt"></i>
          </react_bootstrap_1.Button>
        </div>); },
        },
    ];
    return (<div className="supplier-orders-page">
      <PageHeader_1.PageHeader title='📦 Comenzi furnizori' description="Gestionare comenzi către furnizori" actions={[
            {
                label: 'Comandă Nouă',
                variant: 'primary',
                onClick: function () { return handleOpenModal(); },
            },
            {
                label: 'Reîmprospătează',
                variant: 'secondary',
                onClick: fetchData,
            },
        ]}/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}
      {error && <InlineAlert_1.InlineAlert type="error" message={error} onClose={function () { return setError(null); }}/>}

      <react_bootstrap_1.Card className="mt-4 shadow-sm">
        <react_bootstrap_1.Card.Header className="bg-white">
          <h5 className="mb-0">Lista Comenzi</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body className="p-0">
          {loading ? (<div className="text-center p-4">
              <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>Se încarcă...</div>) : (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={orders} height="60vh"/>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>{editingOrder ? 'Editează Comandă' : 'Comandă Nouă'}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Modal.Body>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Furnizor *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.supplier_id || 0} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { supplier_id: Number(e.target.value) })); }} required>
                <option value={0}>Selectează furnizor</option>
                {suppliers.map(function (supplier) { return (<option key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Data Comandă *</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={formData.order_date || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { order_date: e.target.value })); }} required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Data livrare așteptată</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={formData.expected_delivery_date || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { expected_delivery_date: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.status || 'draft'} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { status: e.target.value })); }}>
                {ORDER_STATUSES.map(function (status) { return (<option key={status.value} value={status.value}>
                    {status.label}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Note</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={formData.notes || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>Anulează</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              {editingOrder ? 'Actualizează' : 'Creează'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.SupplierOrdersPage = SupplierOrdersPage;
