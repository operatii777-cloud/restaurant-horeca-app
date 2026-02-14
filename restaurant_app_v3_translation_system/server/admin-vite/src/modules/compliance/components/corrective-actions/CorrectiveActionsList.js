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
exports.CorrectiveActionsList = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var haccp_service_1 = require("../../services/haccp.service");
var ActionStatusBadge_1 = require("./ActionStatusBadge");
var CorrectiveActionsList = function (_a) {
    var filter = _a.filter, onResolve = _a.onResolve, refreshTrigger = _a.refreshTrigger;
    var _b = (0, react_1.useState)([]), actions = _b[0], setActions = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), resolvingId = _d[0], setResolvingId = _d[1];
    var _e = (0, react_1.useState)(false), resolveModalOpen = _e[0], setResolveModalOpen = _e[1];
    var _f = (0, react_1.useState)(null), selectedActionId = _f[0], setSelectedActionId = _f[1];
    var _g = (0, react_1.useState)(''), verificationNotes = _g[0], setVerificationNotes = _g[1];
    (0, react_1.useEffect)(function () {
        loadActions();
    }, [filter, refreshTrigger]);
    var loadActions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, haccp_service_1.haccpService.getAllCorrectiveActions({
                            resolved: filter === 'resolved' ? true : filter === "Pending:" ? false : undefined,
                            limit: 100
                        })];
                case 1:
                    data = _a.sent();
                    setActions(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading corrective actions:', error_1);
                    setActions([]);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleResolveClick = function (actionId) {
        setSelectedActionId(actionId);
        setResolveModalOpen(true);
        setVerificationNotes('');
    };
    var handleResolveSubmit = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedActionId || !verificationNotes.trim()) {
                        alert('Notele de verificare sunt obligatorii');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setResolvingId(selectedActionId);
                    return [4 /*yield*/, haccp_service_1.haccpService.resolveCorrectiveAction(selectedActionId, verificationNotes.trim())];
                case 2:
                    _a.sent();
                    setResolveModalOpen(false);
                    setSelectedActionId(null);
                    setVerificationNotes('');
                    loadActions();
                    onResolve === null || onResolve === void 0 ? void 0 : onResolve(selectedActionId);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    alert('Eroare la rezolvarea acțiunii: ' + (error_2.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 5];
                case 4:
                    setResolvingId(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var filteredActions = actions.filter(function (action) {
        if (filter === "Pending:")
            return !action.resolved;
        if (filter === 'resolved')
            return action.resolved;
        return true;
    });
    return (<>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {filter === "Pending:" ? 'Acțiuni În Așteptare' :
            filter === 'resolved' ? 'Acțiuni Rezolvate' :
                'Toate Acțiunile Corective'}
          </h2>
        </div>

        {loading ? (<div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
            <p className="mt-2 text-gray-500">Se încarcă...</p>
          </div>) : filteredActions.length === 0 ? (<div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
            <p>"nu exista actiuni corective"</p>
            <p className="text-sm mt-2 opacity-75">
              {filter === "Pending:" ? 'Toate acțiunile au fost rezolvate' :
                filter === 'resolved' ? 'Nu există acțiuni rezolvate' :
                    'Creează o acțiune corectivă pentru a începe'}
            </p>
          </div>) : (<div className="space-y-4">
            {filteredActions.map(function (action) { return (<div key={action.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">Acțiune #{action.id}</span>
                      <ActionStatusBadge_1.ActionStatusBadge resolved={action.resolved} size="sm"/>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="fas fa-calendar mr-1"></i>
                      Creată: {new Date(action.created_at).toLocaleString('ro-RO')}
                      {action.taken_at && (<>
                          ' | '
                          <i className="fas fa-user-clock mr-1"></i>
                          Acțiune întreprinsă: {new Date(action.taken_at).toLocaleString('ro-RO')}
                        </>)}
                    </p>
                  </div>
                  {!action.resolved && (<button onClick={function () { return handleResolveClick(action.id); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" disabled={resolvingId === action.id}>
                      <i className="fas fa-check mr-1"></i>"Rezolvă"</button>)}
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">"actiune intreprinsa"</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{action.action_taken}</p>
                </div>

                {action.verification_notes && (<div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">"note de verificare"</p>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">{action.verification_notes}</p>
                  </div>)}
              </div>); })}
          </div>)}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">"rezolva actiune corectiva"</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note de Verificare <span className="text-red-500">*</span>
              </label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} value={verificationNotes} onChange={function (e) { return setVerificationNotes(e.target.value); }} placeholder="descrie verificarea si confirmarea rezolvarii" required/>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={function () {
                setResolveModalOpen(false);
                setSelectedActionId(null);
                setVerificationNotes('');
            }} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">"Anulează"</button>
              <button onClick={handleResolveSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={!verificationNotes.trim() || resolvingId !== null}>
                {resolvingId ? (<>
                    <i className="fas fa-spinner fa-spin mr-2"></i>"se rezolva"</>) : (<>
                    <i className="fas fa-check mr-2"></i>"confirma rezolvarea"</>)}
              </button>
            </div>
          </div>
        </div>)}
    </>);
};
exports.CorrectiveActionsList = CorrectiveActionsList;
