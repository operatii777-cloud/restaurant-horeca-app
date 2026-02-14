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
exports.VarianceReportsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var VarianceReportsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), variances = _a[0], setVariances = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(new Date().toISOString().split('T')[0]), date = _c[0], setDate = _c[1];
    var loadVariances = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/variance/daily?date=\"Date\"")];
                case 2:
                    response = _b.sent();
                    setVariances(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading variances:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var calculateVariance = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/variance/calculate', { date: date })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, loadVariances()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error calculating variance:', error_2);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="variance-reports-page page">
      <PageHeader_1.PageHeader title="Variance Reports" subtitle="Theoretical vs Actual Usage (detectare pierderi, furt, erori)"/>

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Label>"selecteaza data"</react_bootstrap_1.Form.Label>
            <div className="d-flex gap-2">
              <react_bootstrap_1.Form.Control type="date" value={date} onChange={function (e) { return setDate(e.target.value); }} style={{ maxWidth: '200px' }}/>
              <react_bootstrap_1.Button variant="primary" onClick={calculateVariance} disabled={loading}>
                {loading ? 'Se calculează...' : 'Calculează Variance'}
              </react_bootstrap_1.Button>
              <react_bootstrap_1.Button variant="secondary" onClick={loadVariances}>"incarca raport"</react_bootstrap_1.Button>
            </div>
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Body>
          <h5 className="mb-3">Raport Variance - {date}</h5>

          {variances.length === 0 ? (<react_bootstrap_1.Alert variant="info">"nu exista date variance pentru aceasta data calcul"</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped bordered hover>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Teoretic</th>
                  <th>Actual</th>
                  <th>Diferență</th>
                  <th>%</th>
                  <th>"cost diferenta"</th>
                  <th>Tip</th>
                  <th>"investigatie"</th>
                </tr>
              </thead>
              <tbody>
                {variances.map(function (v) { return (<tr key={v.id} className={v.requires_investigation ? 'table-warning' : ''}>
                    <td><strong>{v.ingredient_name}</strong></td>
                    <td>{v.theoretical_usage.toFixed(2)}</td>
                    <td>{v.actual_usage.toFixed(2)}</td>
                    <td>
                      <react_bootstrap_1.Badge bg={v.variance_quantity > 0 ? 'success' : 'danger'}>
                        {v.variance_quantity > 0 ? '+' : ''}{v.variance_quantity.toFixed(2)}
                      </react_bootstrap_1.Badge>
                    </td>
                    <td>
                      <react_bootstrap_1.Badge bg={Math.abs(v.variance_percentage) > 10 ? 'danger' : 'warning'}>
                        {v.variance_percentage.toFixed(1)}%
                      </react_bootstrap_1.Badge>
                    </td>
                    <td>{v.variance_cost.toFixed(2)} RON</td>
                    <td><react_bootstrap_1.Badge bg={v.variance_type === 'shortage' ? 'danger' : 'success'}>{v.variance_type}</react_bootstrap_1.Badge></td>
                    <td>{v.requires_investigation ? '⚠️ DA' : '✓ NU'}</td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.VarianceReportsPage = VarianceReportsPage;
