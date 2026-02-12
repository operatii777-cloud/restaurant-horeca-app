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
exports.MonitoringHistoryTable = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../../services/haccp.service");
var MonitoringStatusBadge_1 = require("./MonitoringStatusBadge");
var MonitoringHistoryTable = function (_a) {
    var refreshTrigger = _a.refreshTrigger;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), monitorings = _b[0], setMonitorings = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)({
        limit: 10,
        offset: 0
    }), filters = _d[0], setFilters = _d[1];
    var _e = (0, react_1.useState)(0), totalCount = _e[0], setTotalCount = _e[1];
    var _f = (0, react_1.useState)(''), selectedCcpId = _f[0], setSelectedCcpId = _f[1];
    var _g = (0, react_1.useState)(''), selectedStatus = _g[0], setSelectedStatus = _g[1];
    var _h = (0, react_1.useState)(''), dateFrom = _h[0], setDateFrom = _h[1];
    var _j = (0, react_1.useState)(''), dateTo = _j[0], setDateTo = _j[1];
    (0, react_1.useEffect)(function () {
        loadMonitorings();
    }, [filters, refreshTrigger]);
    var loadMonitorings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getMonitoring(filters)];
                case 1:
                    data = _a.sent();
                    setMonitorings(data);
                    setTotalCount(data.length); // Backend should return total count, using length for now
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading monitoring records:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var applyFilters = function () {
        var newFilters = {
            limit: 10,
            offset: 0
        };
        if (selectedCcpId)
            newFilters.ccp_id = selectedCcpId;
        if (selectedStatus)
            newFilters.status = selectedStatus;
        if (dateFrom)
            newFilters.date_from = dateFrom;
        if (dateTo)
            newFilters.date_to = dateTo;
        setFilters(newFilters);
    };
    var clearFilters = function () {
        setSelectedCcpId('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
        setFilters({ limit: 10, offset: 0 });
    };
    var goToPage = function (page) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { offset: (page - 1) * (prev.limit || 10) })); });
    };
    var currentPage = Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1;
    var totalPages = Math.ceil(totalCount / (filters.limit || 10));
    (0, react_1.useEffect)(function () {
        // Listen for new monitoring records
        var handleMonitoringRecorded = function () {
            loadMonitorings();
        };
        window.addEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
        return function () {
            window.removeEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
        };
    }, [filters]);
    return (<div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Istoric Monitorizare</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">CCP ID</label>
          <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" value={selectedCcpId} onChange={function (e) { return setSelectedCcpId(e.target.value ? parseInt(e.target.value) : ''); }} placeholder="CCP ID"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded" value={selectedStatus} onChange={function (e) { return setSelectedStatus(e.target.value); }}>
            <option value="">Toate</option>
            <option value="ok">OK</option>
            <option value="warning">Atenție</option>
            <option value="critical">Critic</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">De la</label>
          <input type="date" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" value={dateFrom} onChange={function (e) { return setDateFrom(e.target.value); }}/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Până la</label>
          <input type="date" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" value={dateTo} onChange={function (e) { return setDateTo(e.target.value); }}/>
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            <i className="fas fa-filter mr-1"></i>
            Aplică Filtre
          </button>
          <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
            <i className="fas fa-times mr-1"></i>Resetează</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (<div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
          <p className="mt-2 text-gray-500">Se încarcă...</p>
        </div>) : monitorings.length === 0 ? (<div className="text-center py-8 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
          <p>Nu există înregistrări de monitorizare</p>
        </div>) : (<>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Data/Ora</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">CCP</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Proces</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Parametru</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Valoare</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {monitorings.map(function (monitoring) { return (<tr key={monitoring.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {new Date(monitoring.monitored_at).toLocaleString('ro-RO')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {monitoring.ccp_number || "CCP-".concat(monitoring.ccp_id)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {monitoring.process_name || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">{monitoring.parameter_name}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {monitoring.measured_value} {monitoring.unit}
                    </td>
                    <td className="px-4 py-2">
                      <MonitoringStatusBadge_1.MonitoringStatusBadge status={monitoring.status} size="sm"/>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {monitoring.notes || '-'}
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (<div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Pagina {currentPage} din {totalPages}
              </div>
              <div className="flex gap-2">
                <button onClick={function () { return goToPage(currentPage - 1); }} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button onClick={function () { return goToPage(currentPage + 1); }} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>)}
        </>)}
    </div>);
};
exports.MonitoringHistoryTable = MonitoringHistoryTable;
