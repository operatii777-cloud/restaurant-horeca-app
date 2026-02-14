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
exports.ProfitabilityReportTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var react_chartjs_2_1 = require("react-chartjs-2");
var httpClient_1 = require("@/shared/api/httpClient");
var ProfitabilityReportTab = function (_a) {
    var startDate = _a.startDate, endDate = _a.endDate, onExport = _a.onExport;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), data = _c[0], setData = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        loadReport();
    }, [startDate, endDate]);
    var loadReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!startDate || !endDate)
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/reports/profitability', {
                            params: { startDate: startDate, endDate: endDate },
                        })];
                case 2:
                    response = _c.sent();
                    setData(response.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('Error loading profitability report:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la încărcarea raportului');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.00 RON';
        }
        return "".concat(Number(value).toFixed(2), " RON");
    };
    var formatPercent = function (value) {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.0%';
        }
        return "".concat(Number(value).toFixed(1), "%");
    };
    var getProfitabilityChartData = function () {
        if (!data || !data.products.length)
            return null;
        var topProducts = data.products.slice(0, 10);
        return {
            labels: topProducts.map(function (p) { return p.name; }),
            datasets: [
                {
                    label: 'Profit Brut (RON)',
                    data: topProducts.map(function (p) { return p.grossProfit; }),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };
    var getMarginChartData = function () {
        if (!data || !data.products.length)
            return null;
        var topProducts = data.products.slice(0, 10);
        return {
            labels: topProducts.map(function (p) { return p.name; }),
            datasets: [
                {
                    label: 'Marjă (%)',
                    data: topProducts.map(function (p) { return p.marginPercent; }),
                    backgroundColor: 'rgba(37, 99, 235, 0.5)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };
    if (loading) {
        return (<div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>);
    }
    if (error) {
        return <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>;
    }
    if (!data) {
        return <react_bootstrap_1.Alert variant="info">"selecteaza o perioada pentru a genera raportul"</react_bootstrap_1.Alert>;
    }
    return (<div>
      {/* Summary Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Total Venituri</h6>
              <h4 className="text-success">{formatCurrency(data.summary.totalRevenue)}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Total Costuri</h6>
              <h4 className="text-danger">{formatCurrency(data.summary.totalCost)}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>Profit Brut</h6>
              <h4 className="text-primary">{formatCurrency(data.summary.totalGrossProfit)}</h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="text-center">
            <react_bootstrap_1.Card.Body>
              <h6>"marja totala"</h6>
              <h4 className={data.summary.overallMargin > 30 ? 'text-success' : data.summary.overallMargin > 15 ? 'text-warning' : 'text-danger'}>
                {formatPercent(data.summary.overallMargin)}
              </h4>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Export Buttons */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body>
              <div className="d-flex gap-2">
                <react_bootstrap_1.Button variant="success" onClick={function () { return onExport === null || onExport === void 0 ? void 0 : onExport('excel'); }}>
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="danger" onClick={function () { return onExport === null || onExport === void 0 ? void 0 : onExport('pdf'); }}>
                  <i className="fas fa-file-pdf me-2"></i>Export PDF
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Charts */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Top 10 Produse - Profit Brut</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {getProfitabilityChartData() ? (<div style={{ height: '300px' }}>
                  <react_chartjs_2_1.Bar data={getProfitabilityChartData()} options={{ responsive: true, maintainAspectRatio: false }}/>
                </div>) : (<react_bootstrap_1.Alert variant="info">Nu există date</react_bootstrap_1.Alert>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">Top 10 Produse - Marjă (%)</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {getMarginChartData() ? (<div style={{ height: '300px' }}>
                  <react_chartjs_2_1.Bar data={getMarginChartData()} options={{ responsive: true, maintainAspectRatio: false }}/>
                </div>) : (<react_bootstrap_1.Alert variant="info">Nu există date</react_bootstrap_1.Alert>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Products Table */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">Profitabilitate Produse</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Table striped hover responsive>
            <thead>
              <tr>
                <th>Produs</th>
                <th>Categorie</th>
                <th>Venituri</th>
                <th>Costuri</th>
                <th>Profit Brut</th>
                <th>"Marjă"</th>
                <th>Profitabilitate</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map(function (prod) { return (<tr key={prod.productId}>
                  <td><strong>{prod.name}</strong></td>
                  <td><react_bootstrap_1.Badge bg="secondary">{prod.category}</react_bootstrap_1.Badge></td>
                  <td>{formatCurrency(prod.revenue)}</td>
                  <td>{formatCurrency(prod.totalCost)}</td>
                  <td className={prod.grossProfit > 0 ? 'text-success' : 'text-danger'}>
                    <strong>{formatCurrency(prod.grossProfit)}</strong>
                  </td>
                  <td>
                    <react_bootstrap_1.Badge bg={prod.marginPercent > 30 ? 'success' : prod.marginPercent > 15 ? 'warning' : 'danger'}>
                      {formatPercent(prod.marginPercent)}
                    </react_bootstrap_1.Badge>
                  </td>
                  <td>
                    <react_bootstrap_1.Badge bg={prod.profitability === 'High' ? 'success' : prod.profitability === 'Medium' ? 'warning' : 'danger'}>
                      {prod.profitability === 'High' ? 'Ridicată' : prod.profitability === 'Medium' ? 'Medie' : 'Scăzută'}
                    </react_bootstrap_1.Badge>
                  </td>
                </tr>); })}
            </tbody>
          </react_bootstrap_1.Table>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>
    </div>);
};
exports.ProfitabilityReportTab = ProfitabilityReportTab;
