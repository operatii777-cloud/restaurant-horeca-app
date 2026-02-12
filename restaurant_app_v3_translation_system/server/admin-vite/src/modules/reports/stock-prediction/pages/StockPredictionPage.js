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
exports.StockPredictionPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var stockPredictionApi_1 = require("../api/stockPredictionApi");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./StockPredictionPage.css");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var StockPredictionPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), predictions = _a[0], setPredictions = _a[1];
    var _b = (0, react_1.useState)(14), daysAhead = _b[0], setDaysAhead = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var loadPrediction = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, stockPredictionApi_1.stockPredictionApi.getPrediction(daysAhead)];
                case 2:
                    data = _c.sent();
                    setPredictions(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('❌ Eroare la încărcarea predicției:', err_1);
                    setError(((_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la încărcarea predicției');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [daysAhead]);
    (0, react_1.useEffect)(function () {
        void loadPrediction();
    }, [loadPrediction]);
    var chartData = {
        labels: predictions.slice(0, 20).map(function (p) { return p.ingredient_name; }),
        datasets: [
            {
                label: 'Stoc Curent',
                data: predictions.slice(0, 20).map(function (p) { return p.current_stock; }),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
            {
                label: 'Consum Predicție',
                data: predictions.slice(0, 20).map(function (p) { return p.predicted_consumption; }),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
        ],
    };
    var getRecommendationBadge = function (recommendation) {
        if (recommendation.toLowerCase().includes('urgent')) {
            return <react_bootstrap_1.Badge bg="danger">URGENT</react_bootstrap_1.Badge>;
        }
        if (recommendation.toLowerCase().includes('recomandat')) {
            return <react_bootstrap_1.Badge bg="warning">Recomandat</react_bootstrap_1.Badge>;
        }
        return <react_bootstrap_1.Badge bg="success">OK</react_bootstrap_1.Badge>;
    };
    return (<div className="stock-prediction-page" data-page-ready="true">
      <div className="page-header">
        <div>
          <h1>predicție stoc</h1>
          <p>predicție stocuri bazată pe analiza ABC și viteză</p>
        </div>
        <button className="btn btn-secondary" onClick={function () { return void loadPrediction(); }}>
          ↻ Reîmprospătare
        </button>
      </div>

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      {/* Filtre */}
      <react_bootstrap_1.Card className="mt-4 mb-4">
        <react_bootstrap_1.Card.Body>
          <div className="row align-items-end">
            <div className="col-md-4">
              <react_bootstrap_1.Form.Label>zile în viitor pentru predicție</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="number" min="1" max="90" value={daysAhead} onChange={function (e) { return setDaysAhead(parseInt(e.target.value) || 14); }}/>
            </div>
            <div className="col-md-4">
              <react_bootstrap_1.Button variant="primary" onClick={function () { return void loadPrediction(); }} disabled={loading}>
                {loading ? (<>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>se calculează...&lpar;</>) : (<>
                    <i className="fas fa-bolt me-2"></i>rulează predicția</>)}
              </react_bootstrap_1.Button>
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {loading && (<div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">se calculează predicția...</p>
        </div>)}

      {!loading && predictions.length > 0 && (<>
          {/* Grafic */}
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header>
              <h6 className="mb-0">Grafic Predicție (Top 20 Ingrediente)</h6>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_chartjs_2_1.Line data={chartData} options={{ responsive: true, maintainAspectRatio: true }}/>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Tabel Predicții */}
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h6 className="mb-0">predicții detaliate</h6>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Unit</th>
                    <th className="text-end">Stoc Curent</th>
                    <th className="text-end">Stoc Minim</th>
                    <th className="text-end">consum predicție</th>
                    <th className="text-center">zile până la minim</th>
                    <th className="text-center">zile până la zero</th>
                    <th>Recomandare</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(function (pred) { return (<tr key={pred.ingredient_id}>
                      <td>{pred.ingredient_name}</td>
                      <td>{pred.unit}</td>
                      <td className="text-end">{pred.current_stock.toFixed(2)}</td>
                      <td className="text-end">{pred.min_stock.toFixed(2)}</td>
                      <td className="text-end">{pred.predicted_consumption.toFixed(2)}</td>
                      <td className="text-center">
                        {pred.predicted_days_until_min !== null ? (<react_bootstrap_1.Badge bg={pred.predicted_days_until_min < 7 ? 'danger' : pred.predicted_days_until_min < 14 ? 'warning' : 'success'}>
                            {pred.predicted_days_until_min}
                          </react_bootstrap_1.Badge>) : (<span className="text-muted">-</span>)}
                      </td>
                      <td className="text-center">
                        {pred.predicted_days_until_zero !== null ? (<react_bootstrap_1.Badge bg={pred.predicted_days_until_zero < 7 ? 'danger' : pred.predicted_days_until_zero < 14 ? 'warning' : 'success'}>
                            {pred.predicted_days_until_zero}
                          </react_bootstrap_1.Badge>) : (<span className="text-muted">-</span>)}
                      </td>
                      <td>{getRecommendationBadge(pred.recommendation)}</td>
                    </tr>); })}
                </tbody>
              </react_bootstrap_1.Table>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </>)}

      {!loading && predictions.length === 0 && (<div className="text-center py-5 text-muted">
          <i className="fas fa-chart-line fa-3x mb-3 opacity-50"></i>
          <p>nu există predicții disponibile, rulează predicția</p>
        </div>)}
    </div>);
};
exports.StockPredictionPage = StockPredictionPage;
