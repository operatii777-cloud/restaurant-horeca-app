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
exports.CleaningTaskModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var httpClient_1 = require("@/shared/api/httpClient");
require("./CleaningTaskModal.css");
var CleaningTaskModal = function (_a) {
    var task = _a.task, onComplete = _a.onComplete, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), checklistItems = _b[0], setChecklistItems = _b[1];
    var _c = (0, react_1.useState)(''), signature = _c[0], setSignature = _c[1];
    var checklistUrl = (task === null || task === void 0 ? void 0 : task.id) ? "/api/compliance/cleaning-schedule/".concat(task.id, "/checklist") : null;
    var _d = (0, useApiQuery_1.useApiQuery)(checklistUrl), checklist = _d.data, refetchChecklist = _d.refetch;
    (0, react_1.useEffect)(function () {
        if (checklist === null || checklist === void 0 ? void 0 : checklist.data) {
            setChecklistItems(checklist.data);
        }
    }, [checklist]);
    var handleToggleItem = function (itemId, isChecked) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/compliance/cleaning-schedule/".concat(task.id, "/checklist/").concat(itemId), {
                            is_checked: !isChecked,
                            checked_by: 1, // TODO: Get from auth context
                        })];
                case 1:
                    _a.sent();
                    refetchChecklist();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Eroare la actualizarea checklist-ului:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleComplete = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (checklistItems.some(function (item) { return !item.is_checked; })) {
                        if (!confirm('Nu toate item-urile sunt bifate. Sigur doriți să completați task-ul?')) {
                            return [2 /*return*/];
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/compliance/cleaning-schedule/".concat(task.id, "/complete"), {
                            completed_by: 1, // TODO: Get from auth context
                            signature_image: signature || null,
                        })];
                case 2:
                    _a.sent();
                    onComplete();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Eroare la completarea task-ului:', error_2);
                    alert('Eroare la completarea task-ului');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose} title="Închide" aria-label="Închide">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="task-info">
            <p><strong>"Frecvență:"</strong> {task.frequency}</p>
            <p><strong>"Tură:"</strong> {task.shift_type}</p>
            <p><strong>Termen:</strong> {new Date(task.due_date).toLocaleString('ro-RO')}</p>
            {task.description && <p><strong>"Descriere:"</strong> {task.description}</p>}
          </div>

          <div className="checklist-section">
            <h3>Checklist</h3>
            <div className="checklist-items">
              {checklistItems.map(function (item) { return (<div key={item.id} className="checklist-item">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={item.is_checked === 1} onChange={function () { return handleToggleItem(item.id, item.is_checked === 1); }} disabled={task.status === 'completed'}/>
                    <span className="checkmark"></span>
                    <span className={item.is_checked === 1 ? 'checked' : ''}>{item.item_text}</span>
                  </label>
                  {item.checked_by_name && (<small className="checked-by">
                      Bifat de {item.checked_by_name} la {new Date(item.checked_at).toLocaleString('ro-RO')}
                    </small>)}
                </div>); })}
            </div>
          </div>

          {task.status !== 'completed' && (<div className="signature-section">
              <h3>Semnătură Digitală (Opțional)</h3>
              <textarea className="form-control" rows={3} value={signature} onChange={function (e) { return setSignature(e.target.value); }} placeholder="Nume operator sau semnătură (text)"/>
              <small className="form-text text-muted">"nota pentru semnatura canvas va trebui implementat"</small>
            </div>)}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>"Închide"</button>
          {task.status !== 'completed' && (<button type="button" className="btn btn-primary" onClick={handleComplete}>
              <i className="fas fa-check me-2"></i>"completeaza task"</button>)}
        </div>
      </div>
    </div>);
};
exports.CleaningTaskModal = CleaningTaskModal;
