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
exports.LoyaltyPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var LoyaltyPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), rewards = _a[0], setRewards = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), editingRewardId = _d[0], setEditingRewardId = _d[1];
    var _e = (0, react_1.useState)({
        name: '',
        combinations_required: 1,
        description: '',
        is_active: true
    }), rewardForm = _e[0], setRewardForm = _e[1];
    var gridRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        loadRewards();
    }, []);
    var loadRewards = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/loyalty/rewards')];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to load rewards');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setRewards(data || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading rewards:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenModal = function (rewardId) {
        if (rewardId) {
            var reward = rewards.find(function (r) { return r.id === rewardId; });
            if (reward) {
                setEditingRewardId(rewardId);
                setRewardForm({
                    name: reward.name || '',
                    combinations_required: reward.combinations_required || 1,
                    description: reward.description || '',
                    is_active: reward.is_active !== undefined ? reward.is_active : true
                });
            }
        }
        else {
            setEditingRewardId(null);
            setRewardForm({
                name: '',
                combinations_required: 1,
                description: '',
                is_active: true
            });
        }
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingRewardId(null);
        setRewardForm({
            name: '',
            combinations_required: 1,
            description: '',
            is_active: true
        });
    };
    var handleSaveReward = function () { return __awaiter(void 0, void 0, void 0, function () {
        var url, method, response, errorData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    url = editingRewardId
                        ? "/api/loyalty/rewards/".concat(editingRewardId)
                        : '/api/loyalty/rewards';
                    method = editingRewardId ? 'PUT' : 'POST';
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(rewardForm)
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 2];
                    handleCloseModal();
                    loadRewards();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    alert("Eroare la ".concat(editingRewardId ? 'actualizarea' : 'adăugarea', " recompensei: ").concat(errorData.error || 'Eroare necunoscută'));
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error ".concat(editingRewardId ? 'updating' : 'adding', " reward:"), error_2);
                    alert("Eroare la ".concat(editingRewardId ? 'actualizarea' : 'adăugarea', " recompensei"));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteReward = function (rewardId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Sigur doriți să ștergeți această recompensă?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/loyalty/rewards/".concat(rewardId), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    loadRewards();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    errorData = _a.sent();
                    alert("Eroare la \u0219tergerea recompensei: ".concat(errorData.error || 'Eroare necunoscută'));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error deleting reward:', error_3);
                    alert('Eroare la ștergerea recompensei');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var columnDefs = [
        { field: 'name', headerName: 'Nume Recompensă', width: 200 },
        { field: 'combinations_required', headerName: 'Combinații Necesare', width: 180 },
        { field: 'description', headerName: 'Descriere', width: 300, flex: 1 },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            cellRenderer: function (params) {
                return params.value
                    ? '<span class="badge bg-success">Activ</span>'
                    : '<span class="badge bg-secondary">Inactiv</span>';
            }
        },
        {
            headerName: 'Acțiuni',
            width: 200,
            cellRenderer: function (params) {
                var editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-primary me-2';
                editBtn.textContent = 'Editează';
                editBtn.onclick = function () { return handleOpenModal(params.data.id); };
                var deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-danger';
                deleteBtn.textContent = 'Șterge';
                deleteBtn.onclick = function () { return handleDeleteReward(params.data.id); };
                var container = document.createElement('div');
                container.appendChild(editBtn);
                container.appendChild(deleteBtn);
                return container;
            }
        }
    ];
    return (<div className="padding-20">
      <div className="page-header margin-bottom-20 flex-between">
        <h1><i className="fas fa-gift me-2"></i>Program Loialitate</h1>
        <button className="btn btn-primary" onClick={function () { return handleOpenModal(); }}>
          <i className="fas fa-plus me-1"></i>Adaugă recompensă</button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <ag_grid_react_1.AgGridReact theme="legacy" ref={gridRef} rowData={rewards} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true }} loading={loading}/>
      </div>

      {showModal && (<div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRewardId ? 'Editează Recompensă' : 'Adaugă Recompensă'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} title="Închide"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nume Recompensă</label>
                  <input type="text" className="form-control" value={rewardForm.name} onChange={function (e) { return setRewardForm(__assign(__assign({}, rewardForm), { name: e.target.value })); }} title="Nume recompensă"/>
                </div>
                <div className="mb-3">
                  <label className="form-label">Combinații Necesare</label>
                  <input type="number" className="form-control" min="1" value={rewardForm.combinations_required} onChange={function (e) { return setRewardForm(__assign(__assign({}, rewardForm), { combinations_required: parseInt(e.target.value) || 1 })); }} title="Combinații necesare"/>
                </div>
                <div className="mb-3">
                  <label className="form-label">Descriere</label>
                  <textarea className="form-control" rows={3} value={rewardForm.description} onChange={function (e) { return setRewardForm(__assign(__assign({}, rewardForm), { description: e.target.value })); }} title="Descriere recompensă"/>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={rewardForm.is_active} onChange={function (e) { return setRewardForm(__assign(__assign({}, rewardForm), { is_active: e.target.checked })); }} id="rewardActive"/>
                    <label className="form-check-label" htmlFor="rewardActive">
                      Activ
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Anulează</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveReward}>
                  {editingRewardId ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};
exports.LoyaltyPage = LoyaltyPage;
