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
exports.CorrectiveActionForm = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../../services/haccp.service");
var CorrectiveActionForm = function (_a) {
    var onSuccess = _a.onSuccess, initialCcpId = _a.initialCcpId, initialMonitoringId = _a.initialMonitoringId;
    var _b = (0, react_1.useState)([]), processes = _b[0], setProcesses = _b[1];
    var _c = (0, react_1.useState)([]), ccps = _c[0], setCcps = _c[1];
    var _d = (0, react_1.useState)([]), monitorings = _d[0], setMonitorings = _d[1];
    var _e = (0, react_1.useState)(initialCcpId ? '' : ''), selectedProcessId = _e[0], setSelectedProcessId = _e[1];
    var _f = (0, react_1.useState)(initialCcpId || ''), selectedCcpId = _f[0], setSelectedCcpId = _f[1];
    var _g = (0, react_1.useState)(initialMonitoringId || ''), selectedMonitoringId = _g[0], setSelectedMonitoringId = _g[1];
    var _h = (0, react_1.useState)(''), actionTaken = _h[0], setActionTaken = _h[1];
    var _j = (0, react_1.useState)(false), loading = _j[0], setLoading = _j[1];
    var _k = (0, react_1.useState)(null), error = _k[0], setError = _k[1];
    var _l = (0, react_1.useState)(null), success = _l[0], setSuccess = _l[1];
    var _m = (0, react_1.useState)(true), loadingProcesses = _m[0], setLoadingProcesses = _m[1];
    (0, react_1.useEffect)(function () {
        loadProcesses();
    }, []);
    (0, react_1.useEffect)(function () {
        if (selectedProcessId) {
            loadCCPs(selectedProcessId);
        }
        else {
            setCcps([]);
            setSelectedCcpId('');
        }
    }, [selectedProcessId]);
    (0, react_1.useEffect)(function () {
        if (selectedCcpId) {
            loadMonitorings(selectedCcpId);
        }
        else {
            setMonitorings([]);
            setSelectedMonitoringId('');
        }
    }, [selectedCcpId]);
    var loadProcesses = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoadingProcesses(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getAllProcesses()];
                case 1:
                    data = _a.sent();
                    setProcesses(data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError('Eroare la încărcarea proceselor: ' + (err_1.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingProcesses(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadCCPs = function (processId) { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, haccp_service_1.haccpService.getCCPsByProcess(processId)];
                case 1:
                    data = _a.sent();
                    setCcps(data);
                    if (initialCcpId && data.some(function (c) { return c.id === initialCcpId; })) {
                        setSelectedCcpId(initialCcpId);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    setError('Eroare la încărcarea CCP-urilor: ' + (err_2.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadMonitorings = function (ccpId) { return __awaiter(void 0, void 0, void 0, function () {
        var data, criticalOrWarning, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, haccp_service_1.haccpService.getMonitoring({ ccp_id: ccpId, limit: 50 })];
                case 1:
                    data = _a.sent();
                    criticalOrWarning = data.filter(function (m) { return m.status === 'critical' || m.status === 'warning'; });
                    setMonitorings(criticalOrWarning);
                    if (initialMonitoringId && criticalOrWarning.some(function (m) { return m.id === initialMonitoringId; })) {
                        setSelectedMonitoringId(initialMonitoringId);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error loading monitorings:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(null);
                    if (!selectedCcpId || !actionTaken.trim()) {
                        setError('CCP-ul și acțiunea sunt obligatorii');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.createCorrectiveAction({
                            ccp_id: selectedCcpId,
                            monitoring_id: selectedMonitoringId ? selectedMonitoringId : undefined,
                            action_taken: actionTaken.trim(),
                            taken_by: 1 // TODO: Get from auth context
                        })];
                case 2:
                    _c.sent();
                    setSuccess('Acțiune corectivă creată cu succes!');
                    // Reset form
                    setActionTaken('');
                    setSelectedMonitoringId('');
                    if (!initialCcpId) {
                        setSelectedCcpId('');
                        setSelectedProcessId('');
                    }
                    // Trigger success callback
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    // Clear success message after 3 seconds
                    setTimeout(function () { return setSuccess(null); }, 3000);
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _c.sent();
                    setError(((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_4.message || 'Eroare la crearea acțiunii corective');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">"creeaza actiune corectiva"</h2>

      {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>)}

      {success && (<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>)}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialCcpId && (<>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proces HACCP
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedProcessId} onChange={function (e) { return setSelectedProcessId(e.target.value ? parseInt(e.target.value) : ''); }} disabled={loadingProcesses}>
                <option value="">"selecteaza proces"</option>
                {processes.map(function (process) { return (<option key={process.id} value={process.id}>
                    {process.name} ({process.category})
                  </option>); })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Punct Critic de Control (CCP) <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedCcpId} onChange={function (e) { return setSelectedCcpId(e.target.value ? parseInt(e.target.value) : ''); }} disabled={!selectedProcessId || ccps.length === 0} required>
                <option value="">"selecteaza ccp"</option>
                {ccps.map(function (ccp) { return (<option key={ccp.id} value={ccp.id}>
                    {ccp.ccp_number} - {ccp.hazard_description}
                  </option>); })}
              </select>
            </div>
          </>)}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Înregistrare Monitorizare (opțional)
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedMonitoringId} onChange={function (e) { return setSelectedMonitoringId(e.target.value ? parseInt(e.target.value) : ''); }} disabled={!selectedCcpId || monitorings.length === 0}>
            <option value="">"nu este legata de o monitorizare specifica"</option>
            {monitorings.map(function (monitoring) { return (<option key={monitoring.id} value={monitoring.id}>
                {new Date(monitoring.monitored_at).toLocaleString('ro-RO')} - {monitoring.parameter_name}: {monitoring.measured_value} {monitoring.unit} ({monitoring.status})
              </option>); })}
          </select>
          {!selectedCcpId && (<p className="mt-1 text-xs text-gray-500">"selecteaza mai intai un ccp pentru a vedea monitor"</p>)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Acțiune Întreprinsă <span className="text-red-500">*</span>
          </label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} value={actionTaken} onChange={function (e) { return setActionTaken(e.target.value); }} placeholder="descrie actiunea corectiva intreprinsa" required/>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !selectedCcpId || !actionTaken.trim()}>
          {loading ? (<>
              <i className="fas fa-spinner fa-spin mr-2"></i>"se creeaza"</>) : (<>
              <i className="fas fa-plus-circle mr-2"></i>"creeaza actiune corectiva"</>)}
        </button>
      </form>
    </div>);
};
exports.CorrectiveActionForm = CorrectiveActionForm;
