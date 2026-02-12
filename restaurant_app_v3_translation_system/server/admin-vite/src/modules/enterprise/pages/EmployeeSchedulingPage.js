"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 📅 EMPLOYEE SCHEDULING PAGE - STANDARD HORECA PROFESIONAL
 * Inspirat din: GloriaFood, Toast, Oracle Micros, Lightspeed
 */
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
exports.EmployeeSchedulingPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./EmployeeSchedulingPage.css");
var EmployeeSchedulingPage = function () {
    var t = { t: function (s) { return s; } }.t; // Fallback or use real translation if context available
    // State Management
    var _a = (0, react_1.useState)('calendar'), activeView = _a[0], setActiveView = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)([]), employees = _c[0], setEmployees = _c[1];
    var _d = (0, react_1.useState)([]), shifts = _d[0], setShifts = _d[1];
    var _e = (0, react_1.useState)(null), liveStats = _e[0], setLiveStats = _e[1];
    // Date Filters
    var _f = (0, react_1.useState)('this_week'), quickFilter = _f[0], setQuickFilter = _f[1];
    var _g = (0, react_1.useState)(''), startDate = _g[0], setStartDate = _g[1];
    var _h = (0, react_1.useState)(''), endDate = _h[0], setEndDate = _h[1];
    // Modals
    var _j = (0, react_1.useState)(false), showShiftModal = _j[0], setShowShiftModal = _j[1];
    var _k = (0, react_1.useState)(false), showEmployeeModal = _k[0], setShowEmployeeModal = _k[1];
    var _l = (0, react_1.useState)(null), editingShift = _l[0], setEditingShift = _l[1];
    // Forms
    var _m = (0, react_1.useState)({
        shift_date: '',
        start_time: '08:00',
        end_time: '16:00',
        break_duration: '30',
        position: '',
        employee_id: '',
        status: 'scheduled'
    }), shiftForm = _m[0], setShiftForm = _m[1];
    var _o = (0, react_1.useState)({
        name: '',
        role: 'waiter',
        phone: '',
        email: '',
        hourly_rate: '18'
    }), employeeForm = _o[0], setEmployeeForm = _o[1];
    // Quick Filter Logic
    var applyQuickFilter = function (filter) {
        var now = new Date();
        var start, end;
        if (filter === 'this_week') {
            var dayOfWeek = now.getDay();
            var monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            start = monday.toISOString().split('T')[0];
            var sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            end = sunday.toISOString().split('T')[0];
        }
        else if (filter === 'next_week') {
            var dayOfWeek = now.getDay();
            var monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + 7);
            start = monday.toISOString().split('T')[0];
            var sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            end = sunday.toISOString().split('T')[0];
        }
        else if (filter === 'this_month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        }
        setStartDate(start);
        setEndDate(end);
        setQuickFilter(filter);
    };
    // Load Data
    var loadEmployees = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/employees')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setEmployees(data.employees || []);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading employees:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadShifts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!startDate || !endDate)
                        return [2 /*return*/];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    params = new URLSearchParams({ startDate: startDate, endDate: endDate });
                    return [4 /*yield*/, fetch("/api/scheduling/shifts?\"Params\"")];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShifts(data.shifts || []);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error loading shifts:', err_2);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var loadLiveStats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/scheduling/live-stats')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setLiveStats(data.stats);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadEmployees();
        applyQuickFilter('this_week');
    }, []);
    (0, react_1.useEffect)(function () {
        if (startDate && endDate) {
            loadShifts();
        }
    }, [startDate, endDate]);
    (0, react_1.useEffect)(function () {
        loadLiveStats();
        var interval = setInterval(loadLiveStats, 60000); // Refresh every minute
        return function () { return clearInterval(interval); };
    }, []);
    // CRUD Operations
    var handleCreateShift = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/scheduling/shifts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, shiftForm), { break_duration: parseInt(shiftForm.break_duration), employee_id: shiftForm.employee_id ? parseInt(shiftForm.employee_id) : null }))
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowShiftModal(false);
                        resetShiftForm();
                        loadShifts();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('Error creating shift:', err_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateShift = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!editingShift)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/scheduling/shifts/".concat(editingShift.id), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, shiftForm), { break_duration: parseInt(shiftForm.break_duration), employee_id: shiftForm.employee_id ? parseInt(shiftForm.employee_id) : null }))
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowShiftModal(false);
                        setEditingShift(null);
                        resetShiftForm();
                        loadShifts();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    console.error('Error updating shift:', err_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteShift = function (shiftId) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Sigur ștergi această tură?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/scheduling/shifts/".concat(shiftId), {
                            method: 'DELETE'
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        loadShifts();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_6 = _a.sent();
                    console.error('Error deleting shift:', err_6);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDuplicateWeek = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Duplici turele din această săptămână pentru săptămâna următoare?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/scheduling/shifts/duplicate-week', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ startDate: startDate, endDate: endDate })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        alert("\u2705 ".concat(data.created || 0, " ture duplicate cu succes!"));
                        // Mută pe săptămâna următoare
                        applyQuickFilter('next_week');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_7 = _a.sent();
                    console.error('Error duplicating week:', err_7);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateEmployee = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/employees', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, employeeForm), { hourly_rate: parseFloat(employeeForm.hourly_rate) }))
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowEmployeeModal(false);
                        setEmployeeForm({ name: '', role: 'waiter', phone: '', email: '', hourly_rate: '18' });
                        loadEmployees();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_8 = _a.sent();
                    console.error('Error creating employee:', err_8);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openEditShift = function (shift) {
        var _a;
        setEditingShift(shift);
        setShiftForm({
            shift_date: shift.shift_date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            break_duration: shift.break_duration.toString(),
            position: shift.position,
            employee_id: ((_a = shift.employee_id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            status: shift.status
        });
        setShowShiftModal(true);
    };
    var resetShiftForm = function () {
        setShiftForm({
            shift_date: '',
            start_time: '08:00',
            end_time: '16:00',
            break_duration: '30',
            position: '',
            employee_id: '',
            status: 'scheduled'
        });
        setEditingShift(null);
    };
    var getRoleIcon = function (role) {
        var icons = {
            chef: '👨‍🍳', sous_chef: '👨‍🍳', cook: '🧑‍🍳',
            waiter: '🧑‍💼', bartender: '🍸', manager: '👔',
            supervisor: '⭐', cleaner: '🧹', driver: '🚗',
            host: '🎩', dishwasher: '🍽️'
        };
        return icons[role] || '👤';
    };
    var getStatusColor = function (status) {
        var colors = {
            scheduled: '#3b82f6',
            confirmed: '#22c55e',
            on_shift: '#10b981',
            completed: '#6b7280',
            cancelled: '#ef4444',
            no_show: '#f59e0b'
        };
        return colors[status] || '#6b7280';
    };
    var getStatusIcon = function (status) {
        var icons = {
            scheduled: '📅',
            confirmed: '✅',
            on_shift: '🟢',
            completed: '✔️',
            cancelled: '❌',
            no_show: '⚠️'
        };
        return icons[status] || '❓';
    };
    return (<div className="employee-scheduling-page">
      <PageHeader_1.PageHeader title='📅 programare personal & ture' description="Gestionare completă program angajați (Standard HORECA Enterprise)"/>

      {/* Dashboard Mini - Live Stats */}
      {liveStats && (<div className="live-stats-dashboard">
          <div className="stat-card stat-online">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.on_shift || 0}</div>
              <div className="stat-label">în tură acum</div>
            </div>
          </div>
          <div className="stat-card stat-upcoming">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.upcoming_2h || 0}</div>
              <div className="stat-label">Urmează (2h)</div>
            </div>
          </div>
          <div className="stat-card stat-break">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.on_break || 0}</div>
              <div className="stat-label">în pauză</div>
            </div>
          </div>
          <div className="stat-card stat-late">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-value">{liveStats.late || 0}</div>
              <div className="stat-label">Întârziați</div>
            </div>
          </div>
        </div>)}

      {/* View Tabs */}
      <div className="view-tabs">
        <button className={activeView === 'calendar' ? 'active' : ''} onClick={function () { return setActiveView('calendar'); }}>
          📅 Calendar Ture ({shifts.length})
        </button>
        <button className={activeView === 'employees' ? 'active' : ''} onClick={function () { return setActiveView('employees'); }}>
          👥 Angajați ({employees.length})
        </button>
      </div>

      {/* CALENDAR VIEW - Shift Planner */}
      {activeView === 'calendar' && (<>
          {/* Toolbar */}
          <div className="scheduling-toolbar">
            <div className="toolbar-left">
              <div className="quick-filters">
                <button className={quickFilter === 'this_week' ? 'active' : ''} onClick={function () { return applyQuickFilter('this_week'); }}>săptămâna aceasta</button>
                <button className={quickFilter === 'next_week' ? 'active' : ''} onClick={function () { return applyQuickFilter('next_week'); }}>săptămâna viitoare</button>
                <button className={quickFilter === 'this_month' ? 'active' : ''} onClick={function () { return applyQuickFilter('this_month'); }}>luna curentă</button>
              </div>

              <div className="date-range-picker">
                <input type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }} title="Data început"/>
                <span>→</span>
                <input type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }} title="Data sfârșit"/>
              </div>
            </div>

            <div className="toolbar-right">
              <button onClick={loadShifts} className="btn-refresh">
                🔄 Actualizează
              </button>
              <button onClick={function () { resetShiftForm(); setShowShiftModal(true); }} className="btn-add-shift">
                ➕ Adaugă Tură
              </button>
              <button onClick={handleDuplicateWeek} className="btn-duplicate">
                📋 Duplică Săptămână
              </button>
            </div>
          </div>

          {/* Shifts Table */}
          <div className="shifts-table-container">
            <table className="shifts-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ora Start</th>
                  <th>ora sfârșit</th>
                  <th>Durată</th>
                  <th>Pauză</th>
                  <th>Poziție</th>
                  <th>Angajat</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(function (shift) {
                var start = new Date("2000-01-01T".concat(shift.start_time));
                var end = new Date("2000-01-01T".concat(shift.end_time));
                var duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                if (duration < 0)
                    duration += 24;
                var workHours = duration - (shift.break_duration / 60);
                return (<tr key={shift.id}>
                      <td><strong>{new Date(shift.shift_date).toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: '2-digit' })}</strong></td>
                      <td>{shift.start_time}</td>
                      <td>{shift.end_time}</td>
                      <td>{workHours.toFixed(1)}h</td>
                      <td>{shift.break_duration} min</td>
                      <td>{shift.position}</td>
                      <td>{shift.employee_name || <span style={{ color: '#ef4444' }}>"Nedefinit"</span>}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(shift.status) }}>
                          {getStatusIcon(shift.status)} {shift.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={function () { return openEditShift(shift); }} className="btn-edit" title="Editează">
                            ✏️
                          </button>
                          <button onClick={function () { return handleDeleteShift(shift.id); }} className="btn-delete" title="Șterge">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>);
            })}
              </tbody>
            </table>

            {shifts.length === 0 && !loading && (<div className="empty-state">
                <p>📭 Nu există ture programate în această perioadă.</p>
                <button onClick={function () { resetShiftForm(); setShowShiftModal(true); }} className="btn-add-first">
                  ➕ Adaugă Prima Tură
                </button>
              </div>)}
          </div>

          {/* Shift Modal - Add/Edit */}
          {showShiftModal && (<div className="modal-overlay" onClick={function () { setShowShiftModal(false); resetShiftForm(); }}>
              <div className="modal-content modal-shift" onClick={function (e) { return e.stopPropagation(); }}>
                <h2>{editingShift ? '✏️ Editează Tură' : '➕ Adaugă Tură Nouă'}</h2>
                <form onSubmit={editingShift ? handleUpdateShift : handleCreateShift}>
                  <div className="form-group">
                    <label>📅 Data:</label>
                    <input type="date" required title="Data turei" value={shiftForm.shift_date} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { shift_date: e.target.value })); }}/>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>🕐 Ora Start:</label>
                      <input type="time" required value={shiftForm.start_time} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { start_time: e.target.value })); }} title="Ora de început"/>
                    </div>
                    <div className="form-group">
                      <label>🕐 Ora Sfârșit:</label>
                      <input type="time" required value={shiftForm.end_time} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { end_time: e.target.value })); }} title="Ora de sfârșit"/>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>⏸️ Pauză (minute):</label>
                    <input type="number" min="0" title="Durata pauzei în minute" max="120" step="15" value={shiftForm.break_duration} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { break_duration: e.target.value })); }}/>
                  </div>

                  <div className="form-group">
                    <label>💼 Poziție:</label>
                    <input type="text" required placeholder="Ex: Ospătar, Bucătar" value={shiftForm.position} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { position: e.target.value })); }}/>
                  </div>

                  <div className="form-group">
                    <label>👤 Angajat:</label>
                    <select value={shiftForm.employee_id} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { employee_id: e.target.value })); }} title="Angajat">
                      <option value="">Neatribuit</option>
                      {employees.filter(function (e) { return e.status === 'active'; }).map(function (emp) { return (<option key={emp.id} value={emp.id}>
                          {getRoleIcon(emp.role)} {emp.name} ({emp.role})
                        </option>); })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📊 Status:</label>
                    <select value={shiftForm.status} onChange={function (e) { return setShiftForm(__assign(__assign({}, shiftForm), { status: e.target.value })); }} title="Status tură">
                      <option value="scheduled">📅 Planificat</option>
                      <option value="confirmed">✅ Confirmat</option>
                      <option value="on_shift">🟢 În Tură</option>
                      <option value="completed">✔️ Finalizat</option>
                      <option value="cancelled">❌ Anulat</option>
                      <option value="no_show">⚠️ Absent</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingShift ? '💾 Salvează' : '➕ Creează'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={function () { setShowShiftModal(false); resetShiftForm(); }}>
                      ❌ Anulează
                    </button>
                  </div>
                </form>
              </div>
            </div>)}
        </>)}

      {/* EMPLOYEES VIEW */}
      {activeView === 'employees' && (<>
          <div className="employees-toolbar">
            <button onClick={function () { return setShowEmployeeModal(true); }} className="btn-create-employee">
              ➕ Adaugă Angajat
            </button>
            <div className="employees-stats">
              <span>Total: {employees.length}</span>
              <span>Activi: {employees.filter(function (e) { return e.status === 'active'; }).length}</span>
            </div>
          </div>

          <div className="employees-grid">
            {employees.map(function (emp) { return (<div key={emp.id} className="employee-card">
                <div className="employee-header">
                  <h3>{getRoleIcon(emp.role)} {emp.name}</h3>
                  <span className="employee-code">{emp.code}</span>
                </div>
                <div className="employee-body">
                  <div className="employee-stat">
                    <span className="stat-label">Rol:</span>
                    <span className="stat-value">{emp.role}</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Telefon:</span>
                    <span className="stat-value">{emp.phone}</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Tarif orar:</span>
                    <span className="stat-value">{emp.hourly_rate} RON/h</span>
                  </div>
                  <div className="employee-stat">
                    <span className="stat-label">Status:</span>
                    <span className={"status-badge status-".concat(emp.status)}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              </div>); })}
          </div>

          {/* Employee Modal */}
          {showEmployeeModal && (<div className="modal-overlay" onClick={function () { return setShowEmployeeModal(false); }}>
              <div className="modal-content modal-employee" onClick={function (e) { return e.stopPropagation(); }}>
                <h2>➕ Adaugă Angajat Nou</h2>
                <form onSubmit={handleCreateEmployee}>
                  <div className="form-group">
                    <label>👤 Nume Complet:</label>
                    <input type="text" required placeholder="ex ion popescu" value={employeeForm.name} onChange={function (e) { return setEmployeeForm(__assign(__assign({}, employeeForm), { name: e.target.value })); }}/>
                  </div>
                  <div className="form-group">
                    <label>💼 Rol:</label>
                    <select value={employeeForm.role} onChange={function (e) { return setEmployeeForm(__assign(__assign({}, employeeForm), { role: e.target.value })); }} title="Rol angajat">
                      <option value="waiter">🧑‍💼 Ospătar</option>
                      <option value="chef">👨‍🍳 Chef</option>
                      <option value="cook">🧑‍🍳 Bucătar</option>
                      <option value="bartender">🍸 Barman</option>
                      <option value="manager">👔 Manager</option>
                      <option value="supervisor">⭐ Supraveghetor</option>
                      <option value="cleaner">🧹 Curățenie</option>
                      <option value="driver">🚗 Șofer</option>
                      <option value="host">🎩 Gazdă</option>
                      <option value="dishwasher">🍽️ Spălător vase</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>📱 Telefon:</label>
                    <input type="tel" required placeholder="Ex: 0721234567" value={employeeForm.phone} onChange={function (e) { return setEmployeeForm(__assign(__assign({}, employeeForm), { phone: e.target.value })); }}/>
                  </div>
                  <div className="form-group">
                    <label>📧 Email (opțional):</label>
                    <input type="email" placeholder='[ex_ionpopescu@restaurantro]' value={employeeForm.email} onChange={function (e) { return setEmployeeForm(__assign(__assign({}, employeeForm), { email: e.target.value })); }} title="Email angajat"/>
                  </div>
                  <div className="form-group">
                    <label>💰 Tarif Orar (RON):</label>
                    <input type="number" step="0.01" min="0" required value={employeeForm.hourly_rate} onChange={function (e) { return setEmployeeForm(__assign(__assign({}, employeeForm), { hourly_rate: e.target.value })); }} title="Tarif orar în RON"/>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">💾 Creează Angajat</button>
                    <button type="button" className="btn-cancel" onClick={function () { return setShowEmployeeModal(false); }}>
                      ❌ Anulează
                    </button>
                  </div>
                </form>
              </div>
            </div>)}
        </>)}
    </div>);
};
exports.EmployeeSchedulingPage = EmployeeSchedulingPage;
