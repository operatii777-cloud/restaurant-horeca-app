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
exports.SecurityEventsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
// AG Grid CSS imported globally with theme="legacy"
require("./SecurityEventsPage.css");
var SecurityEventsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), events = _a[0], setEvents = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(0), suspiciousCount = _c[0], setSuspiciousCount = _c[1];
    (0, react_1.useEffect)(function () {
        loadSecurityEvents();
    }, []);
    var loadSecurityEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, securityEvents, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/audit/security?limit=500')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load security events');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    securityEvents = Array.isArray(data) ? data : [];
                    setEvents(securityEvents.map(function (log) {
                        var _a, _b, _c, _d, _e;
                        return (__assign(__assign({}, log), { event_type: log.action || 'unknown', severity: log.status === 'error' || ((_a = log.action) === null || _a === void 0 ? void 0 : _a.includes('FAILED')) || ((_b = log.action) === null || _b === void 0 ? void 0 : _b.includes('failed')) ? 'high' :
                                ((_c = log.action) === null || _c === void 0 ? void 0 : _c.includes('login')) || ((_d = log.action) === null || _d === void 0 ? void 0 : _d.includes('logout')) ? 'medium' : 'low', description: ((_e = log.details) === null || _e === void 0 ? void 0 : _e.description) || "".concat(log.action || 'unknown', " - ").concat(log.module || log.entity_type || log.resource_type || 'N/A'), ip_address: log.ip_address || 'N/A', user_agent: log.user_agent || 'N/A' }));
                    }));
                    setSuspiciousCount(securityEvents.filter(function (e) { var _a; return (_a = e.action) === null || _a === void 0 ? void 0 : _a.includes('FAILED'); }).length);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading security events:', error_1);
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
        { field: 'username', headerName: 'Utilizator', width: 150 },
        { field: 'event_type', headerName: 'Tip Eveniment', width: 200 },
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
        { field: 'ip_address', headerName: 'IP Address', width: 150 },
        { field: "Description", headerName: 'Descriere', width: 300 },
        { field: 'timestamp', headerName: 'Timestamp', width: 180, valueFormatter: function (params) { return new Date(params.value).toLocaleString('ro-RO'); } }
    ];
    return (<div className="security-events-page">
      <div className="security-events-page-header">
        <h1><i className="fas fa-shield-alt me-2"></i>Evenimente Securitate</h1>
        <button className="btn btn-primary" onClick={loadSecurityEvents}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      {suspiciousCount > 0 && (<div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Alertă:</strong> {suspiciousCount} evenimente suspicioase detectate!
        </div>)}

      <div className="ag-theme-alpine-dark security-events-grid">
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={events} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>
    </div>);
};
exports.SecurityEventsPage = SecurityEventsPage;
