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
exports.CleaningScheduleTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var httpClient_1 = require("@/shared/api/httpClient");
var CleaningScheduleFormModal_1 = require("./CleaningScheduleFormModal");
var CleaningTaskModal_1 = require("./CleaningTaskModal");
// AG Grid CSS is imported globally with theme="legacy" to avoid #239 error
require("./CleaningScheduleTab.css");
var CleaningScheduleTab = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), showFormModal = _a[0], setShowFormModal = _a[1];
    var _b = (0, react_1.useState)(false), showTaskModal = _b[0], setShowTaskModal = _b[1];
    var _c = (0, react_1.useState)(null), selectedTask = _c[0], setSelectedTask = _c[1];
    var _d = (0, react_1.useState)('all'), filterStatus = _d[0], setFilterStatus = _d[1];
    // Construim URL-ul cu query params
    var scheduleUrl = (0, react_1.useMemo)(function () {
        var params = new URLSearchParams();
        if (filterStatus !== 'all')
            params.append('status', filterStatus);
        if (filterStatus === 'overdue')
            params.append('overdue', 'true');
        var queryString = params.toString();
        return queryString ? "/api/compliance/cleaning-schedule?".concat(queryString) : '/api/compliance/cleaning-schedule';
    }, [filterStatus]);
    var _e = (0, useApiQuery_1.useApiQuery)(scheduleUrl), schedules = _e.data, loading = _e.loading, refetch = _e.refetch;
    var columnDefs = [
        { field: 'title', headerName: 'Titlu', width: 200 },
        { field: 'frequency', headerName: 'Frecvență', width: 120 },
        { field: 'shift_type', headerName: 'Tură', width: 120 },
        { field: 'assigned_to_name', headerName: 'Atribuit', width: 150 },
        {
            field: 'due_date', headerName: 'Termen', width: 180, valueFormatter: function (params) {
                if (!params.value)
                    return '-';
                return new Date(params.value).toLocaleString('ro-RO');
            }
        },
        {
            field: 'status', headerName: 'Status', width: 120, cellRenderer: function (params) {
                var status = params.value;
                var colors = {
                    pending: 'secondary',
                    in_progress: 'info',
                    completed: 'success',
                    overdue: 'danger',
                };
                var labels = {
                    pending: 'În Așteptare',
                    in_progress: 'În Progres',
                    completed: 'Completat',
                    overdue: 'Depășit',
                };
                return react_1.default.createElement('span', {
                    className: "badge bg-".concat(colors[status] || 'secondary')
                }, labels[status] || status);
            }
        },
        {
            field: 'checked_items', headerName: 'Progres', width: 120, valueGetter: function (params) {
                return "".concat(params.data.checked_items || 0, "/").concat(params.data.total_items || 0);
            }
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            cellRenderer: function (params) { return react_1.default.createElement('button', {
                className: 'btn-sm btn-primary',
                onClick: function () { return window.handleViewTask(params.data.id); }
            }, react_1.default.createElement('i', { className: 'fas fa-eye' }), ' Vezi'); },
        },
    ];
    react_1.default.useEffect(function () {
        window.handleViewTask = function (taskId) {
            var _a;
            var task = (_a = schedules === null || schedules === void 0 ? void 0 : schedules.data) === null || _a === void 0 ? void 0 : _a.find(function (t) { return t.id === taskId; });
            if (task) {
                setSelectedTask(task);
                setShowTaskModal(true);
            }
        };
    }, [schedules]);
    var handleAddTask = function () {
        setSelectedTask(null);
        setShowFormModal(true);
    };
    var handleSaveTask = function (formData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/compliance/cleaning-schedule', formData)];
                case 1:
                    _a.sent();
                    setShowFormModal(false);
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Eroare la salvarea task-ului:', error_1);
                    alert('Eroare la salvarea task-ului');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="cleaning-schedule-tab">
      <div className="tab-toolbar">
        <div className="filters">
          <select className="form-control form-select" value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }} title="Filtrează după status" aria-label="Filtrează după status">
            <option value="all">Toate statusurile</option>
            <option value="pending">În Așteptare</option>
            <option value="În progres">În progres</option>
            <option value="completed">Completat</option>
            <option value="overdue">Depășit</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleAddTask}>
          <i className="fas fa-plus me-2"></i>Adaugă task curățenie</button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine-dark">
          <ag_grid_react_1.AgGridReact theme="legacy" rowData={(schedules === null || schedules === void 0 ? void 0 : schedules.data) || []} columnDefs={columnDefs} pagination={true} paginationPageSize={20} suppressCellFocus={true} defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
        }}/>
        </div>
      </div>

      {showFormModal && (<CleaningScheduleFormModal_1.CleaningScheduleFormModal onSave={handleSaveTask} onClose={function () { return setShowFormModal(false); }}/>)}

      {showTaskModal && selectedTask && (<CleaningTaskModal_1.CleaningTaskModal task={selectedTask} onComplete={function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, refetch()];
                        case 1:
                            _a.sent();
                            setShowTaskModal(false);
                            return [2 /*return*/];
                    }
                });
            }); }} onClose={function () { return setShowTaskModal(false); }}/>)}
    </div>);
};
exports.CleaningScheduleTab = CleaningScheduleTab;
