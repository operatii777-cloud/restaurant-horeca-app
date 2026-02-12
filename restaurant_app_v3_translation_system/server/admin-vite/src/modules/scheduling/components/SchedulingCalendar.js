"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Scheduling Calendar Component
 *
 * Visual shift scheduling with drag & drop
 * Similar to Toast/Lightspeed scheduling interface
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
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./SchedulingCalendar.css");
var weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
var hours = Array.from({ length: 16 }, function (_, i) { return i + 8; }); // 8:00 - 23:00
var SchedulingCalendar = function (_a) {
    var _b, _c;
    var onShiftClick = _a.onShiftClick;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(getMonday(new Date())), currentWeek = _d[0], setCurrentWeek = _d[1];
    var _e = (0, react_1.useState)([]), employees = _e[0], setEmployees = _e[1];
    var _f = (0, react_1.useState)([]), shifts = _f[0], setShifts = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    // Modal state
    var _j = (0, react_1.useState)(false), showModal = _j[0], setShowModal = _j[1];
    var _k = (0, react_1.useState)(null), editingShift = _k[0], setEditingShift = _k[1];
    var _l = (0, react_1.useState)(null), selectedDate = _l[0], setSelectedDate = _l[1];
    // Summary state
    var _m = (0, react_1.useState)(null), summary = _m[0], setSummary = _m[1];
    // Get Monday of a week
    function getMonday(d) {
        var date = new Date(d);
        var day = date.getDay();
        var diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }
    // Get week dates
    var getWeekDates = (0, react_1.useCallback)(function () {
        return weekDays.map(function (_, index) {
            var date = new Date(currentWeek);
            date.setDate(date.getDate() + index);
            return date;
        });
    }, [currentWeek]);
    // Format date
    var formatDate = function (date) {
        return date.toISOString().split('T')[0];
    };
    // Load data
    (0, react_1.useEffect)(function () {
        loadEmployees();
        loadShifts();
        loadSummary();
    }, [currentWeek]);
    var loadEmployees = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/scheduling/employees')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setEmployees(data.data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to load employees:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadShifts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var weekDates_1, startDate, endDate, response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    weekDates_1 = getWeekDates();
                    startDate = formatDate(weekDates_1[0]);
                    endDate = formatDate(weekDates_1[6]);
                    return [4 /*yield*/, fetch("/api/scheduling/shifts?startDate=".concat(startDate, "&endDate=").concat(endDate))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShifts(data.data);
                    }
                    else {
                        setError(data.error);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    console.error('Failed to load shifts:', err_2);
                    setError('Failed to load shifts');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var loadSummary = function () { return __awaiter(void 0, void 0, void 0, function () {
        var weekDates_2, startDate, endDate, response, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    weekDates_2 = getWeekDates();
                    startDate = formatDate(weekDates_2[0]);
                    endDate = formatDate(weekDates_2[6]);
                    return [4 /*yield*/, fetch("/api/scheduling/summary?startDate=".concat(startDate, "&endDate=").concat(endDate))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setSummary(data.data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Failed to load summary:', err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Navigate weeks
    var previousWeek = function () {
        var newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() - 7);
        setCurrentWeek(newWeek);
    };
    var nextWeek = function () {
        var newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() + 7);
        setCurrentWeek(newWeek);
    };
    var goToToday = function () {
        setCurrentWeek(getMonday(new Date()));
    };
    // Get shifts for a specific day
    var getShiftsForDay = function (date) {
        var dateStr = formatDate(date);
        return shifts.filter(function (shift) {
            var shiftDate = shift.start.split('T')[0];
            return shiftDate === dateStr;
        });
    };
    // Open modal for new shift
    var openNewShiftModal = function (date) {
        var _a;
        setSelectedDate(formatDate(date));
        setEditingShift({
            employeeId: (_a = employees[0]) === null || _a === void 0 ? void 0 : _a.id,
            start: "".concat(formatDate(date), "T09:00"),
            end: "".concat(formatDate(date), "T17:00"),
            status: 'scheduled'
        });
        setShowModal(true);
    };
    // Open modal for editing shift
    var openEditShiftModal = function (shift) {
        setEditingShift(shift);
        setShowModal(true);
    };
    // Save shift
    var saveShift = function () { return __awaiter(void 0, void 0, void 0, function () {
        var isNew, url, method, body, response, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingShift)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    isNew = !editingShift.id;
                    url = isNew ? '/api/scheduling/shifts' : "/api/scheduling/shifts/".concat(editingShift.id);
                    method = isNew ? 'POST' : 'PUT';
                    body = {
                        employeeId: editingShift.employeeId,
                        startTime: editingShift.start,
                        endTime: editingShift.end,
                        role: editingShift.role,
                        position: editingShift.position,
                        notes: editingShift.notes,
                        status: editingShift.status
                    };
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowModal(false);
                        setEditingShift(null);
                        loadShifts();
                        loadSummary();
                    }
                    else {
                        setError(data.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('Failed to save shift:', err_4);
                    setError('Failed to save shift');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Delete shift
    var deleteShift = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(editingShift === null || editingShift === void 0 ? void 0 : editingShift.id))
                        return [2 /*return*/];
                    if (!window.confirm('Are you sure you want to delete this shift?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/scheduling/shifts/".concat(editingShift.id), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowModal(false);
                        setEditingShift(null);
                        loadShifts();
                        loadSummary();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    console.error('Failed to delete shift:', err_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Copy previous week
    var copyPreviousWeek = function () { return __awaiter(void 0, void 0, void 0, function () {
        var previousWeekStart, response, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Copy all shifts from last week to this week?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    previousWeekStart = new Date(currentWeek);
                    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
                    return [4 /*yield*/, fetch('/api/scheduling/shifts/copy-week', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sourceWeekStart: formatDate(previousWeekStart),
                                targetWeekStart: formatDate(currentWeek)
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        loadShifts();
                        loadSummary();
                    }
                    else {
                        setError(data.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_6 = _a.sent();
                    console.error('Failed to copy week:', err_6);
                    setError('Failed to copy week');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Format time display
    var formatTime = function (dateStr) {
        return new Date(dateStr).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    };
    // Calculate shift duration
    var getShiftDuration = function (start, end) {
        return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    };
    var weekDates = getWeekDates();
    return (<react_bootstrap_1.Container fluid className="scheduling-calendar">
      {/* Header */}
      <react_bootstrap_1.Row className="mb-3 align-items-center">
        <react_bootstrap_1.Col>
          <h4>📅 Program Angajați</h4>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col xs="auto" className="d-flex gap-2">
          <react_bootstrap_1.Button variant="outline-secondary" onClick={previousWeek}>
            ◀ Săptămâna anterioară
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="outline-primary" onClick={goToToday}>
            Azi
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="outline-secondary" onClick={nextWeek}>
            Săptămâna următoare ▶
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col xs="auto">
          <react_bootstrap_1.Button variant="primary" onClick={copyPreviousWeek}>
            📋 Copiază săptămâna anterioară
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Week header */}
      <react_bootstrap_1.Card className="mb-3">
        <react_bootstrap_1.Card.Body className="p-2">
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col xs={12} className="text-center">
              <h5>
                {weekDates[0].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} - 
                {weekDates[6].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h5>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Row>
        {/* Calendar Grid */}
        <react_bootstrap_1.Col md={9}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Body className="p-0">
              <div className="calendar-grid">
                {/* Day headers */}
                <div className="calendar-header">
                  {weekDates.map(function (date, index) {
            var isToday = formatDate(date) === formatDate(new Date());
            return (<div key={index} className={"day-header ".concat(isToday ? 'today' : '')}>
                        <div className="day-name">{weekDays[index]}</div>
                        <div className="day-date">{date.getDate()}</div>
                      </div>);
        })}
                </div>

                {/* Day columns with shifts */}
                <div className="calendar-body">
                  {weekDates.map(function (date, dayIndex) {
            var dayShifts = getShiftsForDay(date);
            var isToday = formatDate(date) === formatDate(new Date());
            return (<div key={dayIndex} className={"day-column ".concat(isToday ? 'today' : '')} onClick={function () { return openNewShiftModal(date); }}>
                        {dayShifts.map(function (shift) { return (<div key={shift.id} className="shift-block" style={{ backgroundColor: shift.color }} onClick={function (e) {
                        e.stopPropagation();
                        openEditShiftModal(shift);
                    }}>
                            <div className="shift-time">
                              {formatTime(shift.start)} - {formatTime(shift.end)}
                            </div>
                            <div className="shift-name">{shift.employeeName}</div>
                            <div className="shift-duration">
                              {getShiftDuration(shift.start, shift.end).toFixed(1)}h
                            </div>
                          </div>); })}
                        
                        {dayShifts.length === 0 && (<div className="no-shifts">
                            <small className="text-muted">+ Adaugă tură</small>
                          </div>)}
                      </div>);
        })}
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        {/* Summary Panel */}
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="mb-3">
            <react_bootstrap_1.Card.Header>📊 Sumar Săptămână</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {summary ? (<>
                  <div className="summary-stat">
                    <span>Total ture:</span>
                    <strong>{summary.totals.totalShifts}</strong>
                  </div>
                  <div className="summary-stat">
                    <span>Total ore:</span>
                    <strong>{summary.totals.totalHours}h</strong>
                  </div>
                  <div className="summary-stat">
                    <span>Media/angajat:</span>
                    <strong>{summary.totals.averageHoursPerEmployee}h</strong>
                  </div>
                </>) : (<p className="text-muted">Loading...</p>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>👥 Angajați</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body className="p-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {employees.map(function (emp) {
            var empSummary = summary === null || summary === void 0 ? void 0 : summary.employees.find(function (e) { return e.id === emp.id; });
            return (<div key={emp.id} className="employee-row">
                    <react_bootstrap_1.Badge bg="primary" style={{ backgroundColor: emp.color }} className="me-2">
                      {emp.name.charAt(0)}
                    </react_bootstrap_1.Badge>
                    <span className="flex-grow-1">{emp.name}</span>
                    <small className="text-muted">
                      {(empSummary === null || empSummary === void 0 ? void 0 : empSummary.totalHours) || 0}h
                    </small>
                  </div>);
        })}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Shift Edit Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { return setShowModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {(editingShift === null || editingShift === void 0 ? void 0 : editingShift.id) ? '✏️ Editare Tură' : '➕ Tură Nouă'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {editingShift && (<react_bootstrap_1.Form>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Angajat</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Select value={editingShift.employeeId || ''} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { employeeId: parseInt(e.target.value) }) : null; }); }} title="Selectează angajat">
                      {employees.map(function (emp) { return (<option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>); })}
                    </react_bootstrap_1.Form.Select>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>"Poziție"</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Select value={editingShift.position || ''} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { position: e.target.value }) : null; }); }} title="Selectează poziție">
                      <option value="">-- Selectează --</option>
                      <option value="floor">"Sală"</option>
                      <option value="bar">Bar</option>
                      <option value="kitchen">"Bucătărie"</option>
                      <option value="terrace">"Terasă"</option>
                      <option value="delivery">"Livrări"</option>
                    </react_bootstrap_1.Form.Select>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>"Început"</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="datetime-local" value={((_b = editingShift.start) === null || _b === void 0 ? void 0 : _b.substring(0, 16)) || ''} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { start: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>"Sfârșit"</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="datetime-local" value={((_c = editingShift.end) === null || _c === void 0 ? void 0 : _c.substring(0, 16)) || ''} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { end: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Note</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control as="textarea" rows={2} value={editingShift.notes || ''} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { notes: e.target.value }) : null; }); }} placeholder="note optionale"/>
              </react_bootstrap_1.Form.Group>

              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>Status</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={editingShift.status || 'scheduled'} onChange={function (e) { return setEditingShift(function (prev) { return prev ? __assign(__assign({}, prev), { status: e.target.value }) : null; }); }} title="Selectează status">
                  <option value="scheduled">Programat</option>
                  <option value="confirmed">Confirmat</option>
                  <option value="completed">Finalizat</option>
                  <option value="cancelled">"Anulat"</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Form>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          {(editingShift === null || editingShift === void 0 ? void 0 : editingShift.id) && (<react_bootstrap_1.Button variant="danger" onClick={deleteShift} className="me-auto">
              🗑️ Șterge
            </react_bootstrap_1.Button>)}
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowModal(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={saveShift}>
            💾 Salvează
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </react_bootstrap_1.Container>);
};
exports.default = SchedulingCalendar;
