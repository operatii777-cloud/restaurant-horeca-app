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
exports.UserActivityPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
// AG Grid CSS imported globally with theme="legacy"
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var UserActivityPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), activities = _a[0], setActivities = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)([]), topUsers = _c[0], setTopUsers = _c[1];
    var _d = (0, react_1.useState)(null), chartData = _d[0], setChartData = _d[1];
    (0, react_1.useEffect)(function () {
        loadUserActivity();
        loadChartData();
    }, []);
    var loadChartData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, chartDataPoints, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/audit/user-activity/chart?days=30')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load chart data');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    chartDataPoints = Array.isArray(data) ? data : [];
                    setChartData({
                        labels: chartDataPoints.map(function (d) { return new Date(d.date).toLocaleDateString('ro-RO'); }),
                        datasets: [
                            {
                                label: 'Acțiuni',
                                data: chartDataPoints.map(function (d) { return d.actions; }),
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.1
                            },
                            {
                                label: 'Utilizatori Activi',
                                data: chartDataPoints.map(function (d) { return d.users; }),
                                borderColor: 'rgb(255, 99, 132)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                tension: 0.1
                            }
                        ]
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading chart data:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadUserActivity = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, activitiesList, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/audit/user-activity?limit=1000')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load user activity');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    activitiesList = Array.isArray(data) ? data : [];
                    setActivities(activitiesList);
                    setTopUsers(activitiesList.slice(0, 10));
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error loading user activity:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'username', headerName: 'Utilizator', width: 200 },
        { field: 'total_actions', headerName: 'Total Acțiuni', width: 150 },
        { field: 'last_activity', headerName: 'Ultima Activitate', width: 180, valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); } },
        {
            headerName: 'Acțiuni pe Tip',
            width: 300,
            cellRenderer: function (params) {
                var actions = params.data.actions_by_type;
                return Object.entries(actions).map(function (_a) {
                    var action = _a[0], count = _a[1];
                    return "".concat(action, ": ").concat(count);
                }).join(', ');
            }
        }
    ];
    return (<div className="padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-user-clock me-2"></i>User Activity</h1>
        <button className="btn btn-primary" onClick={loadUserActivity}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5><i className="fas fa-trophy me-2"></i>Top 10 Utilizatori Activi</h5>
            </div>
            <div className="card-body">
              <ol>
                {topUsers.map(function (user, idx) { return (<li key={user.user_id}>
                    <strong>{user.username}</strong> - {user.total_actions} acțiuni
                  </li>); })}
              </ol>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5><i className="fas fa-chart-line me-2"></i>Evoluție Activitate (30 zile)</h5>
            </div>
            <div className="card-body">
              {chartData ? (<react_chartjs_2_1.Line data={chartData} options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                    },
                },
            }}/>) : (<p>Se încarcă datele...</p>)}
            </div>
          </div>
        </div>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={activities} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>
    </div>);
};
exports.UserActivityPage = UserActivityPage;
