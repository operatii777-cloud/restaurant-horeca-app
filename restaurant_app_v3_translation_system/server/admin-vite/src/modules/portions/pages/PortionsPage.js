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
exports.PortionsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
var PortionsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), portions = _a[0], setPortions = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), feedback = _d[0], setFeedback = _d[1];
    var _e = (0, react_1.useState)({
        product_id: '',
        size_code: 'M',
        size_name: 'Medie',
        multiplier: '1.0',
        grams: '350',
        price: '25.00'
    }), form = _e[0], setForm = _e[1];
    (0, react_1.useEffect)(function () {
        loadPortions();
    }, []);
    var loadPortions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/portions')];
                case 2:
                    response = _b.sent();
                    setPortions(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading portions:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/portions', {
                            product_id: parseInt(form.product_id),
                            size_code: form.size_code,
                            size_name: form.size_name,
                            portion_multiplier: parseFloat(form.multiplier),
                            portion_grams: parseFloat(form.grams),
                            price: parseFloat(form.price)
                        })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Porție adăugată cu succes!' });
                    setShowModal(false);
                    loadPortions();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    setFeedback({ type: 'error', message: ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la adăugare' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var recalculateCosts = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/portions/recalculate/".concat(productId))];
                case 1:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Costuri recalculate!' });
                    loadPortions();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setFeedback({ type: 'error', message: 'Eroare la recalculare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="portions-page page">
      <PageHeader_1.PageHeader title="Gestionare Porții (S/M/L)" subtitle="configurare portii multiple per produs"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={function () { return setFeedback(null); }}>
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>"lista portii"</h5>
            <react_bootstrap_1.Button variant="primary" onClick={function () { return setShowModal(true); }}>
              <i className="fas fa-plus me-2"></i>"adauga portie"</react_bootstrap_1.Button>
          </div>

          <react_bootstrap_1.Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Produs</th>
                <th>"Mărime"</th>
                <th>Multiplier</th>
                <th>Gramaj</th>
                <th>"Preț"</th>
                <th>Cost</th>
                <th>"Marjă"</th>
                <th>"Default"</th>
                <th>"Acțiuni"</th>
              </tr>
            </thead>
            <tbody>
              {portions.map(function (portion) {
            var _a, _b;
            return (<tr key={portion.id}>
                  <td>Product #{portion.product_id}</td>
                  <td>
                    <react_bootstrap_1.Badge bg="primary">{portion.size_code}</react_bootstrap_1.Badge> {portion.size_name}
                  </td>
                  <td>{portion.portion_multiplier}x</td>
                  <td>{portion.portion_grams}g</td>
                  <td>{portion.price.toFixed(2)} RON</td>
                  <td>{(_a = portion.cost_per_portion) === null || _a === void 0 ? void 0 : _a.toFixed(2)} RON</td>
                  <td>
                    <react_bootstrap_1.Badge bg={portion.margin_percentage > 200 ? 'success' : 'warning'}>
                      {(_b = portion.margin_percentage) === null || _b === void 0 ? void 0 : _b.toFixed(1)}%
                    </react_bootstrap_1.Badge>
                  </td>
                  <td>{portion.is_default ? '✓' : '-'}</td>
                  <td>
                    <react_bootstrap_1.Button size="sm" variant="info" onClick={function () { return recalculateCosts(portion.product_id); }}>
                      🔄 Recalc
                    </react_bootstrap_1.Button>
                  </td>
                </tr>);
        })}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal Add Portion */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { return setShowModal(false); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>"adauga portie"</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form onSubmit={handleSubmit}>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Produs</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={form.product_id} onChange={function (e) { return setForm(__assign(__assign({}, form), { product_id: e.target.value })); }} required>
                <option value="">"selecteaza produs"</option>
                {/* TODO: Load products */}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"Mărime"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={form.size_code} onChange={function (e) { return setForm(__assign(__assign({}, form), { size_code: e.target.value })); }}>
                <option value="S">"s mica"</option>
                <option value="M">M - Medie</option>
                <option value="L">L - Mare</option>
                <option value="XL">XL - Extra Mare</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"nume portie"</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control value={form.size_name} onChange={function (e) { return setForm(__assign(__assign({}, form), { size_name: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Multiplier (ex: 0.75 pentru S, 1.5 pentru L)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" step="0.01" value={form.multiplier} onChange={function (e) { return setForm(__assign(__assign({}, form), { multiplier: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Gramaj (g)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" value={form.grams} onChange={function (e) { return setForm(__assign(__assign({}, form), { grams: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Preț (RON)</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" step="0.01" value={form.price} onChange={function (e) { return setForm(__assign(__assign({}, form), { price: e.target.value })); }}/>
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Button type="submit" variant="primary" className="w-100">"adauga portie"</react_bootstrap_1.Button>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.PortionsPage = PortionsPage;
