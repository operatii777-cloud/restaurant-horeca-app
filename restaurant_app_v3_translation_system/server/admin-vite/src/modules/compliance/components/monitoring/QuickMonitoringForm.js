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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickMonitoringForm = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../../services/haccp.service");
var MonitoringStatusBadge_1 = require("./MonitoringStatusBadge");
var QuickMonitoringForm = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), processes = _a[0], setProcesses = _a[1];
    var _b = (0, react_1.useState)([]), ccps = _b[0], setCcps = _b[1];
    var _c = (0, react_1.useState)([]), limits = _c[0], setLimits = _c[1];
    var _d = (0, react_1.useState)(''), selectedProcessId = _d[0], setSelectedProcessId = _d[1];
    var _e = (0, react_1.useState)(''), selectedCcpId = _e[0], setSelectedCcpId = _e[1];
    var _f = (0, react_1.useState)(''), selectedParameter = _f[0], setSelectedParameter = _f[1];
    var _g = (0, react_1.useState)(''), measuredValue = _g[0], setMeasuredValue = _g[1];
    var _h = (0, react_1.useState)(''), notes = _h[0], setNotes = _h[1];
    var _j = (0, react_1.useState)(false), loading = _j[0], setLoading = _j[1];
    var _k = (0, react_1.useState)(null), error = _k[0], setError = _k[1];
    var _l = (0, react_1.useState)(null), success = _l[0], setSuccess = _l[1];
    var _m = (0, react_1.useState)(null), predictedStatus = _m[0], setPredictedStatus = _m[1];
    var _o = (0, react_1.useState)(true), loadingProcesses = _o[0], setLoadingProcesses = _o[1];
    var _p = (0, react_1.useState)(false), loadingCcps = _p[0], setLoadingCcps = _p[1];
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
        if (selectedCcpId && selectedParameter) {
            loadLimits(selectedCcpId, selectedParameter);
        }
        else {
            setLimits([]);
            setPredictedStatus(null);
        }
    }, [selectedCcpId, selectedParameter]);
    (0, react_1.useEffect)(function () {
        if (limits.length > 0 && measuredValue) {
            var value = parseFloat(measuredValue);
            if (!isNaN(value)) {
                var limit = limits.find(function (l) { return l.parameter_name === selectedParameter; });
                if (limit) {
                    if (value < limit.min_value || value > limit.max_value) {
                        setPredictedStatus('critical');
                    }
                    else {
                        var range = limit.max_value - limit.min_value;
                        var warningMin = limit.min_value + (range * 0.1);
                        var warningMax = limit.max_value - (range * 0.1);
                        if (value < warningMin || value > warningMax) {
                            setPredictedStatus('warning');
                        }
                        else {
                            setPredictedStatus('ok');
                        }
                    }
                }
            }
        }
        else {
            setPredictedStatus(null);
        }
    }, [measuredValue, limits, selectedParameter]);
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
                    _a.trys.push([0, 2, 3, 4]);
                    setLoadingCcps(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getCCPsByProcess(processId)];
                case 1:
                    data = _a.sent();
                    setCcps(data);
                    if (data.length === 0) {
                        setSelectedCcpId('');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    setError('Eroare la încărcarea CCP-urilor: ' + (err_2.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingCcps(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadLimits = function (ccpId, parameterName) { return __awaiter(void 0, void 0, void 0, function () {
        var allLimits, filtered, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, haccp_service_1.haccpService.getLimitsByCCP(ccpId)];
                case 1:
                    allLimits = _a.sent();
                    filtered = allLimits.filter(function (l) { return l.parameter_name === parameterName; });
                    setLimits(filtered);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error loading limits:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var value, result, err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setSuccess(null);
                    if (!selectedCcpId || !selectedParameter || !measuredValue) {
                        setError('Toate câmpurile sunt obligatorii');
                        return [2 /*return*/];
                    }
                    value = parseFloat(measuredValue);
                    if (isNaN(value)) {
                        setError('Valoarea măsurată trebuie să fie un număr');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.recordMonitoring({
                            ccp_id: selectedCcpId,
                            parameter_name: selectedParameter,
                            measured_value: value,
                            notes: notes || undefined,
                            monitored_by: 1 // TODO: Get from auth context
                        })];
                case 2:
                    result = _c.sent();
                    setSuccess("Monitorizare \u00EEnregistrat\u0103 cu succes! Status: ".concat(result.status.toUpperCase()));
                    // Reset form
                    setMeasuredValue('');
                    setNotes('');
                    setSelectedParameter('');
                    // Trigger reload event for parent components
                    window.dispatchEvent(new CustomEvent('haccp-monitoring-recorded', { detail: result }));
                    // Clear success message after 5 seconds
                    setTimeout(function () { return setSuccess(null); }, 5000);
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _c.sent();
                    setError(((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_4.message || 'Eroare la înregistrarea monitorizării');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var selectedCcp = ccps.find(function (c) { return c.id === selectedCcpId; });
    var availableParameters = limits.length > 0 ? __spreadArray([], new Set(limits.map(function (l) { return l.parameter_name; })), true) : [];
    var currentLimit = limits.find(function (l) { return l.parameter_name === selectedParameter; });
    return (<div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">monitorizare rapidă HACCP</h2>

      {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>)}

      {success && (<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>)}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proces HACCP <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedProcessId} onChange={function (e) { return setSelectedProcessId(e.target.value ? parseInt(e.target.value) : ''); }} disabled={loadingProcesses} required>
            <option value="">selectează proces</option>
            {processes.map(function (process) { return (<option key={process.id} value={process.id}>
                {process.name} ({process.category})
              </option>); })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Punct Critic de Control (CCP) <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedCcpId} onChange={function (e) {
            setSelectedCcpId(e.target.value ? parseInt(e.target.value) : '');
            setSelectedParameter('');
            setMeasuredValue('');
        }} disabled={!selectedProcessId || loadingCcps || ccps.length === 0} required>
            <option value="">selectează CCP</option>
            {ccps.map(function (ccp) { return (<option key={ccp.id} value={ccp.id}>
                {ccp.ccp_number} - {ccp.hazard_description}
              </option>); })}
          </select>
          {selectedCcp && (<p className="mt-1 text-xs text-gray-500">
              Tip hazard: {selectedCcp.hazard_type} | Măsură de control: {selectedCcp.control_measure}
            </p>)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parametru <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedParameter} onChange={function (e) {
            setSelectedParameter(e.target.value);
            setMeasuredValue('');
        }} disabled={!selectedCcpId || availableParameters.length === 0} required>
            <option value="">selectează parametru</option>
            {availableParameters.map(function (param) { return (<option key={param} value={param}>{param}</option>); })}
          </select>
          {currentLimit && (<p className="mt-1 text-xs text-gray-500">
              Limită: {currentLimit.min_value} - {currentLimit.max_value} {currentLimit.unit}
            </p>)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">valoare măsurată<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input type="number" step="any" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={measuredValue} onChange={function (e) { return setMeasuredValue(e.target.value); }} disabled={!selectedParameter} required/>
            {currentLimit && (<span className="text-sm text-gray-500">{currentLimit.unit}</span>)}
            {predictedStatus && (<MonitoringStatusBadge_1.MonitoringStatusBadge status={predictedStatus}/>)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (opțional)
          </label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} value={notes} onChange={function (e) { return setNotes(e.target.value); }} placeholder="adaugă observații"/>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !selectedCcpId || !selectedParameter || !measuredValue}>
          {loading ? (<>
              <i className="fas fa-spinner fa-spin mr-2"></i>se înregistrează...</>) : (<>
              <i className="fas fa-save mr-2"></i>înregistrează monitorizare</>)}
        </button>
      </form>
    </div>);
};
exports.QuickMonitoringForm = QuickMonitoringForm;
