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
exports.HACCPDashboardPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../services/haccp.service");
var KPICard_1 = require("../components/dashboard/KPICard");
var AlertsList_1 = require("../components/dashboard/AlertsList");
var ComplianceChart_1 = require("../components/dashboard/ComplianceChart");
var HACCPDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), kpis = _a[0], setKpis = _a[1];
    var _b = (0, react_1.useState)([]), recentAlerts = _b[0], setRecentAlerts = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, []);
    var loadDashboardData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var kpisData, alerts, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, haccp_service_1.haccpService.getDashboardKPIs()];
                case 1:
                    kpisData = _a.sent();
                    setKpis(kpisData);
                    return [4 /*yield*/, haccp_service_1.haccpService.getMonitoring({
                            status: 'critical',
                            limit: 10
                        })];
                case 2:
                    alerts = _a.sent();
                    setRecentAlerts(alerts);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError('Eroare la încărcarea datelor dashboard: ' + (err_1.message || 'Eroare necunoscută'));
                    console.error('Dashboard load error:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Generate compliance chart data (last 7 days)
    var complianceChartData = Array.from({ length: 7 }, function (_, i) {
        var date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            date: date.toISOString().split('T')[0],
            complianceRate: (kpis === null || kpis === void 0 ? void 0 : kpis.complianceRate) || 0
        };
    });
    if (loading) {
        return (<div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">Se încarcă dashboard-ul HACCP</p>
      </div>);
    }
    if (error) {
        return (<div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard HACCP</h1>
        <p className="text-gray-600 mt-1">vizualizare generală a conformității HACCP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard_1.KPICard title="monitorizări astăzi" value={(kpis === null || kpis === void 0 ? void 0 : kpis.monitoringsToday) || 0} icon="fas fa-clipboard-check" status="info"/>
        <KPICard_1.KPICard title="Alerte Critice" value={(kpis === null || kpis === void 0 ? void 0 : kpis.criticalAlerts) || 0} icon="fas fa-exclamation-triangle" status={kpis && kpis.criticalAlerts > 0 ? 'critical' : 'success'}/>
        <KPICard_1.KPICard title="acțiuni în așteptare" value={(kpis === null || kpis === void 0 ? void 0 : kpis.pendingActions) || 0} icon="fas fa-tasks" status={kpis && kpis.pendingActions > 0 ? 'warning' : 'success'}/>
        <KPICard_1.KPICard title="rata conformității" value={"".concat(((kpis === null || kpis === void 0 ? void 0 : kpis.complianceRate) || 0).toFixed(1), "%")} icon="fas fa-percentage" status={kpis && kpis.complianceRate >= 95 ? 'success' :
            kpis && kpis.complianceRate >= 85 ? 'warning' : 'critical'}/>
      </div>

      {/* Alerts and Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Alerte Recente (Critice)</h2>
          <AlertsList_1.AlertsList alerts={recentAlerts} onAlertClick={function (alert) {
            // Navigate to monitoring page with filter
            window.location.href = "/compliance/haccp/monitoring?ccp_id=".concat(alert.ccp_id, "&status=critical");
        }}/>
        </div>

        {/* Compliance Chart */}
        <div>
          <ComplianceChart_1.ComplianceChart data={complianceChartData}/>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">acțiuni rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/compliance/haccp/monitoring" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center">
            <i className="fas fa-plus-circle text-3xl text-blue-600 mb-2"></i>
            <p className="font-semibold text-gray-900">monitorizare rapidă</p>
            <p className="text-sm text-gray-600 mt-1">înregistrează o monitorizare nouă</p>
          </a>
          <a href="/compliance/haccp/corrective-actions" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-center">
            <i className="fas fa-tools text-3xl text-yellow-600 mb-2"></i>
            <p className="font-semibold text-gray-900">acțiuni corective</p>
            <p className="text-sm text-gray-600 mt-1">gestionează acțiunile corective</p>
          </a>
          <a href="/compliance/haccp/processes" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center">
            <i className="fas fa-project-diagram text-3xl text-green-600 mb-2"></i>
            <p className="font-semibold text-gray-900">Procese HACCP</p>
            <p className="text-sm text-gray-600 mt-1">vezi procesele și CCP-urile</p>
          </a>
        </div>
      </div>
    </div>);
};
exports.HACCPDashboardPage = HACCPDashboardPage;
