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
exports.HACCPProcessesPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../services/haccp.service");
var ProcessCard_1 = require("../components/processes/ProcessCard");
var CCPCard_1 = require("../components/processes/CCPCard");
var CCPLimitsTable_1 = require("../components/processes/CCPLimitsTable");
var HACCPProcessesPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), processes = _a[0], setProcesses = _a[1];
    var _b = (0, react_1.useState)(null), selectedProcess = _b[0], setSelectedProcess = _b[1];
    var _c = (0, react_1.useState)([]), ccps = _c[0], setCcps = _c[1];
    var _d = (0, react_1.useState)(null), selectedCcp = _d[0], setSelectedCcp = _d[1];
    var _e = (0, react_1.useState)([]), limits = _e[0], setLimits = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), loadingCcps = _g[0], setLoadingCcps = _g[1];
    var _h = (0, react_1.useState)(false), loadingLimits = _h[0], setLoadingLimits = _h[1];
    var _j = (0, react_1.useState)(null), error = _j[0], setError = _j[1];
    var _k = (0, react_1.useState)(false), sidebarOpen = _k[0], setSidebarOpen = _k[1];
    (0, react_1.useEffect)(function () {
        loadProcesses();
    }, []);
    var loadProcesses = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
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
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleProcessClick = function (process) { return __awaiter(void 0, void 0, void 0, function () {
        var ccpsData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSelectedProcess(process);
                    setSelectedCcp(null);
                    setLimits([]);
                    setSidebarOpen(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoadingCcps(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getCCPsByProcess(process.id)];
                case 2:
                    ccpsData = _a.sent();
                    setCcps(ccpsData);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError('Eroare la încărcarea CCP-urilor: ' + (err_2.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingCcps(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCcpClick = function (ccp) { return __awaiter(void 0, void 0, void 0, function () {
        var limitsData, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSelectedCcp(ccp);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoadingLimits(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getLimitsByCCP(ccp.id)];
                case 2:
                    limitsData = _a.sent();
                    setLimits(limitsData);
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    setError('Eroare la încărcarea limitelor: ' + (err_3.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingLimits(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var closeSidebar = function () {
        setSidebarOpen(false);
        setSelectedProcess(null);
        setSelectedCcp(null);
        setCcps([]);
        setLimits([]);
    };
    var groupedProcesses = processes.reduce(function (acc, process) {
        if (!acc[process.category]) {
            acc[process.category] = [];
        }
        acc[process.category].push(process);
        return acc;
    }, {});
    var categoryLabels = {
        receiving: 'Recepție',
        storage: 'Stocare',
        preparation: 'Preparare',
        cooking: 'Gătire',
        serving: 'Servire'
    };
    if (loading) {
        return (<div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">"se incarca procesele haccp"</p>
      </div>);
    }
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Procese HACCP</h1>
        <p className="text-gray-600 mt-1">"gestionarea proceselor si punctelor critice de con"</p>
      </div>

      {error && (<div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>)}

      {/* Process Groups */}
      <div className="space-y-6">
        {Object.entries(groupedProcesses).map(function (_a) {
            var category = _a[0], categoryProcesses = _a[1];
            return (<div key={category}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProcesses.map(function (process) { return (<ProcessCard_1.ProcessCard key={process.id} process={process} onClick={handleProcessClick}/>); })}
            </div>
          </div>);
        })}
      </div>

      {/* Sidebar for CCPs and Limits */}
      {sidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-full max-w-4xl ml-auto h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProcess === null || selectedProcess === void 0 ? void 0 : selectedProcess.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {(selectedProcess === null || selectedProcess === void 0 ? void 0 : selectedProcess.description) || 'Fără descriere'}
                  </p>
                </div>
                <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-600 text-2xl" title="Închide">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* CCPs List */}
              {!selectedCcp && (<div>
                  <h3 className="text-xl font-semibold mb-4">Puncte Critice de Control (CCP)</h3>
                  {loadingCcps ? (<div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                      <p className="mt-2 text-gray-500">"se incarca ccp urile"</p>
                    </div>) : ccps.length === 0 ? (<div className="text-center py-8 text-gray-500">
                      <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                      <p>"nu exista ccp uri definite pentru acest proces"</p>
                    </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ccps.map(function (ccp) { return (<CCPCard_1.CCPCard key={ccp.id} ccp={ccp} onClick={handleCcpClick}/>); })}
                    </div>)}
                </div>)}

              {/* Limits View */}
              {selectedCcp && (<div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <button onClick={function () {
                    setSelectedCcp(null);
                    setLimits([]);
                }} className="text-blue-600 hover:text-blue-800 mb-2">
                        <i className="fas fa-arrow-left mr-2"></i>"inapoi la ccp uri"</button>
                      <h3 className="text-xl font-semibold">{selectedCcp.ccp_number}</h3>
                      <p className="text-gray-600 mt-1">{selectedCcp.hazard_description}</p>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold mb-4">"limite definite"</h4>
                  {loadingLimits ? (<div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                      <p className="mt-2 text-gray-500">"se incarca limitele"</p>
                    </div>) : (<CCPLimitsTable_1.CCPLimitsTable limits={limits}/>)}
                </div>)}
            </div>
          </div>
        </div>)}
    </div>);
};
exports.HACCPProcessesPage = HACCPProcessesPage;
