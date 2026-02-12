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
exports.LoginHistoryPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var LoginHistoryPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), history = _a[0], setHistory = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(0), failedLogins = _c[0], setFailedLogins = _c[1];
    (0, react_1.useEffect)(function () {
        loadLoginHistory();
    }, []);
    var loadLoginHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, historyData, historyWithDuration, failedResponse, failedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 8]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/audit/login-history?limit=500')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load login history');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    historyData = Array.isArray(data) ? data : [];
                    historyWithDuration = historyData.map(function (entry) {
                        var duration = null;
                        if (entry.logout_time) {
                            var loginTime = new Date(entry.login_time).getTime();
                            var logoutTime = new Date(entry.logout_time).getTime();
                            duration = Math.round((logoutTime - loginTime) / 1000 / 60); // minutes
                        }
                        return __assign(__assign({}, entry), { duration_minutes: duration });
                    });
                    setHistory(historyWithDuration);
                    return [4 /*yield*/, fetch('/api/audit/login-history/failed')];
                case 3:
                    failedResponse = _a.sent();
                    if (!failedResponse.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, failedResponse.json()];
                case 4:
                    failedData = _a.sent();
                    setFailedLogins(Array.isArray(failedData) ? failedData.length : 0);
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error loading login history:', error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'username', headerName: 'Utilizator', width: 150 },
        { field: 'role', headerName: 'Rol', width: 120 },
        { field: 'source', headerName: 'Sursă', width: 100 },
        { field: 'ip', headerName: 'IP Address', width: 150 },
        { field: 'device_id', headerName: 'Device ID', width: 200 },
        { field: 'login_time', headerName: 'Login Time', width: 180, valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); } },
        { field: 'logout_time', headerName: 'Logout Time', width: 180, valueFormatter: function (params) { return params.value ? new Date(params.value).toLocaleString('ro-RO') : 'Active'; } },
        {
            field: 'duration_minutes',
            headerName: 'Durată',
            width: 120,
            valueFormatter: function (params) {
                if (params.value === null)
                    return 'Active';
                return "".concat(params.value, " min");
            }
        },
        {
            field: 'success',
            headerName: 'Status',
            width: 100,
            cellRenderer: function (params) {
                if (params.value === false || params.value === 0) {
                    return <span className="badge bg-danger">Eșuat</span>;
                }
                return <span className="badge bg-success">Succes</span>;
            }
        }
    ];
    return (<div className="padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-history me-2"></i>Login History</h1>
        <button className="btn btn-primary" onClick={loadLoginHistory}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      {failedLogins > 0 && (<div className="alert alert-warning mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Login-uri eșuate:</strong> {failedLogins} încercări eșuate detectate
        </div>)}

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={history} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>
    </div>);
};
exports.LoginHistoryPage = LoginHistoryPage;
