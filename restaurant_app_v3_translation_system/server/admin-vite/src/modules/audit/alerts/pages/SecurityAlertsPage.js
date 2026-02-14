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
exports.SecurityAlertsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var AgGridTable_1 = require("@/shared/components/AgGridTable");
require("./SecurityAlertsPage.css");
var SecurityAlertsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), alerts = _a[0], setAlerts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(0), activeAlerts = _c[0], setActiveAlerts = _c[1];
    (0, react_1.useEffect)(function () {
        loadSecurityAlerts();
    }, []);
    var loadSecurityAlerts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, alertsData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/audit/alerts')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load security alerts');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    alertsData = Array.isArray(data) ? data : [];
                    setAlerts(alertsData);
                    setActiveAlerts(alertsData.filter(function (a) { return !a.resolved; }).length);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading security alerts:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'alert_type', headerName: 'Tip Alertă', width: 200 },
        {
            field: 'severity',
            headerName: 'Severitate',
            width: 120,
            cellRenderer: function (params) {
                var severity = params.value;
                var colors = {
                    'high': 'danger',
                    'medium': 'warning',
                    'low': 'info'
                };
                return <span className={"badge bg-".concat(colors[severity] || 'secondary')}>{severity}</span>;
            }
        },
        { field: 'message', headerName: 'Mesaj', width: 400 },
        { field: 'username', headerName: 'Utilizator', width: 150 },
        { field: 'ip_address', headerName: 'IP Address', width: 150 },
        { field: 'timestamp', headerName: 'Timestamp', width: 180, valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); } },
        {
            field: 'resolved',
            headerName: 'Status',
            width: 120,
            cellRenderer: function (params) {
                return params.value ? <span className="badge bg-success">Rezolvat</span> : <span className="badge bg-danger">Activ</span>;
            }
        }
    ];
    return (<div className="security-alerts-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-bell me-2"></i>Alerte Securitate</h1>
        <button className="btn btn-primary" onClick={loadSecurityAlerts}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      {activeAlerts > 0 && (<div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Alertă:</strong> {activeAlerts} alertări active necesită atenție!
        </div>)}

      <AgGridTable_1.AgGridTable columnDefs={columnDefs} rowData={alerts} loading={loading} height={600}/>
    </div>);
};
exports.SecurityAlertsPage = SecurityAlertsPage;
