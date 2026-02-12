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
exports.CoatroomDashboardPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var recharts_1 = require("recharts");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("./CoatroomDashboardPage.css");
var STATUS_COLORS = {
    OPEN: '#3b82f6',
    CLOSED: '#22c55e',
    LOST: '#ef4444'
};
var CoatroomDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(new Date().toISOString().split('T')[0]), date = _a[0], setDate = _a[1];
    var _b = (0, react_1.useState)(null), overview = _b[0], setOverview = _b[1];
    var _c = (0, react_1.useState)([]), hourly = _c[0], setHourly = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, overviewRes, hourlyRes, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!date)
                        return [2 /*return*/];
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            httpClient_1.httpClient.get('/api/stats/coatroom/overview', { params: { date: date } }),
                            httpClient_1.httpClient.get('/api/stats/coatroom/hourly', { params: { date: date } })
                        ])];
                case 2:
                    _a = _b.sent(), overviewRes = _a[0], hourlyRes = _a[1];
                    setOverview(overviewRes.data);
                    setHourly(hourlyRes.data);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadData();
    }, [date]);
    var pieData = overview ? [
        { name: 'Deschise', value: overview.open, status: 'OPEN' },
        { name: 'Închise', value: overview.closed, status: 'CLOSED' },
        { name: 'Pierdute', value: overview.lost, status: 'LOST' }
    ] : [];
    return (<div className="coatroom-dashboard-page">
      <PageHeader_1.PageHeader title="📊 Coatroom Dashboard" description="Analytics tichete garderobă și valet"/>

      {/* Date Filter */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Form.Group>
            <react_bootstrap_1.Form.Label>Data</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control type="date" value={date} onChange={function (e) { return setDate(e.target.value); }}/>
          </react_bootstrap_1.Form.Group>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* KPI Cards */}
      {overview && (<react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="kpi-card text-center">
              <react_bootstrap_1.Card.Body>
                <div className="kpi-label">Total Tichete</div>
                <div className="kpi-value">{overview.total}</div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="kpi-card text-center border-primary">
              <react_bootstrap_1.Card.Body>
                <div className="kpi-label">"Deschise"</div>
                <div className="kpi-value text-primary">{overview.open}</div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="kpi-card text-center border-success">
              <react_bootstrap_1.Card.Body>
                <div className="kpi-label">"Închise"</div>
                <div className="kpi-value text-success">{overview.closed}</div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={3}>
            <react_bootstrap_1.Card className="kpi-card text-center border-danger">
              <react_bootstrap_1.Card.Body>
                <div className="kpi-label">Pierdute</div>
                <div className="kpi-value text-danger">{overview.lost}</div>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>)}

      {/* Charts */}
      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="chart-card">
            <react_bootstrap_1.Card.Body>
              <h5 className="chart-title">"tichete pe ora"</h5>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={hourly}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <recharts_1.XAxis dataKey="hour" stroke="#94a3b8"/>
                  <recharts_1.YAxis stroke="#94a3b8"/>
                  <recharts_1.Tooltip contentStyle={{
            background: '#0f172a',
            border: '1px solid #334155',
            color: '#f1f5f9'
        }}/>
                  <recharts_1.Legend wrapperStyle={{ color: '#f1f5f9' }}/>
                  <recharts_1.Bar dataKey="tickets" name="Tichete" fill="#3b82f6"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="chart-card">
            <react_bootstrap_1.Card.Body>
              <h5 className="chart-title">"distributie status"</h5>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.PieChart>
                  <recharts_1.Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map(function (entry, index) { return (<recharts_1.Cell key={"cell-\"Index\""} fill={STATUS_COLORS[entry.status]}/>); })}
                  </recharts_1.Pie>
                  <recharts_1.Tooltip contentStyle={{
            background: '#0f172a',
            border: '1px solid #334155',
            color: '#f1f5f9'
        }}/>
                  <recharts_1.Legend wrapperStyle={{ color: '#f1f5f9' }}/>
                </recharts_1.PieChart>
              </recharts_1.ResponsiveContainer>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>
    </div>);
};
exports.CoatroomDashboardPage = CoatroomDashboardPage;
