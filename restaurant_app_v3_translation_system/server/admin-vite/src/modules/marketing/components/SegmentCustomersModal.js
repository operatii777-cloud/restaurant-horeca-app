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
exports.SegmentCustomersModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var marketingApi_1 = require("../api/marketingApi");
require("bootstrap/dist/css/bootstrap.min.css");
var SegmentCustomersModal = function (_a) {
    var show = _a.show, segment = _a.segment, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), customers = _b[0], setCustomers = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        if (show && (segment === null || segment === void 0 ? void 0 : segment.id)) {
            loadCustomers();
        }
        else {
            setCustomers([]);
            setError(null);
        }
    }, [show, segment]);
    var loadCustomers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(segment === null || segment === void 0 ? void 0 : segment.id))
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, marketingApi_1.marketingApi.getSegmentCustomers(segment.id)];
                case 2:
                    data = _c.sent();
                    setCustomers(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('❌ Eroare la încărcarea clienților:', err_1);
                    setError(((_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la încărcarea clienților');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<react_bootstrap_1.Modal show={show} onHide={onClose} size="lg">
      <react_bootstrap_1.Modal.Header closeButton>
        <react_bootstrap_1.Modal.Title>
          <i className="fas fa-users me-2"></i>
          Clienți - {(segment === null || segment === void 0 ? void 0 : segment.name) || 'Segment'}
        </react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Modal.Body>
        {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

        {loading ? (<div className="text-center py-5">
            <react_bootstrap_1.Spinner animation="border" variant="primary"/>
            <p className="mt-3">"se incarca clientii"</p>
          </div>) : customers.length === 0 ? (<div className="text-center py-4 text-muted">
            <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
            <p>"nu exista clienti in acest segment"</p>
          </div>) : (<react_bootstrap_1.Table striped hover responsive>
            <thead>
              <tr>
                <th>Token Client</th>
                <th>"numar comenzi"</th>
                <th>"prima comanda"</th>
                <th>"ultima comanda"</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(function (customer, index) { return (<tr key={index}>
                  <td>
                    <code>{customer.customer_token}</code>
                  </td>
                  <td>
                    <react_bootstrap_1.Badge bg="primary">{customer.order_count}</react_bootstrap_1.Badge>
                  </td>
                  <td>{new Date(customer.first_order_date).toLocaleDateString('ro-RO')}</td>
                  <td>{new Date(customer.last_order_date).toLocaleDateString('ro-RO')}</td>
                </tr>); })}
            </tbody>
          </react_bootstrap_1.Table>)}
      </react_bootstrap_1.Modal.Body>
      <react_bootstrap_1.Modal.Footer>
        <react_bootstrap_1.Button variant="secondary" onClick={onClose}>"Închide"</react_bootstrap_1.Button>
      </react_bootstrap_1.Modal.Footer>
    </react_bootstrap_1.Modal>);
};
exports.SegmentCustomersModal = SegmentCustomersModal;
