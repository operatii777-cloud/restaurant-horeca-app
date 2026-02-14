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
exports.SchedulePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./SchedulePage.css");
var DAYS = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
var SchedulePage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), schedules = _a[0], setSchedules = _a[1];
    var _b = (0, react_1.useState)([]), holidays = _b[0], setHolidays = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showHolidayModal = _d[0], setShowHolidayModal = _d[1];
    var _e = (0, react_1.useState)(null), editingHoliday = _e[0], setEditingHoliday = _e[1];
    var _f = (0, react_1.useState)(null), alert = _f[0], setAlert = _f[1];
    var _g = (0, useApiQuery_1.useApiQuery)('/api/settings/schedule'), schedulesData = _g.data, refetchSchedules = _g.refetch;
    var _h = (0, useApiQuery_1.useApiQuery)('/api/settings/holidays'), holidaysData = _h.data, refetchHolidays = _h.refetch;
    var updateScheduleMutation = (0, useApiMutation_1.useApiMutation)();
    var createHolidayMutation = (0, useApiMutation_1.useApiMutation)();
    var updateHolidayMutation = (0, useApiMutation_1.useApiMutation)();
    var deleteHolidayMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (schedulesData) {
            // Inițializează programul pentru toate zilele dacă nu există
            var existingDays = schedulesData.map(function (s) { return s.day_of_week; });
            var allSchedules = [];
            var _loop_1 = function (i) {
                var existing = schedulesData.find(function (s) { return s.day_of_week === i; });
                if (existing) {
                    allSchedules.push(existing);
                }
                else {
                    allSchedules.push({
                        day_of_week: i,
                        is_closed: false,
                        open_time: '09:00',
                        close_time: '22:00',
                    });
                }
            };
            for (var i = 0; i < 7; i++) {
                _loop_1(i);
            }
            setSchedules(allSchedules);
            setLoading(false);
        }
    }, [schedulesData]);
    (0, react_1.useEffect)(function () {
        if (holidaysData) {
            setHolidays(holidaysData);
        }
    }, [holidaysData]);
    var handleScheduleChange = function (dayIndex, field, value) {
        var updated = schedules.map(function (s, idx) {
            var _a;
            if (idx === dayIndex) {
                return __assign(__assign({}, s), (_a = {}, _a[field] = value, _a));
            }
            return s;
        });
        setSchedules(updated);
    };
    var handleSaveSchedule = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateScheduleMutation.mutate({
                            url: '/api/settings/schedule',
                            method: 'PUT',
                            data: { schedules: schedules }
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Program salvat cu succes!' });
                    refetchSchedules();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setAlert({ type: 'error', message: error_1.message || 'Eroare la salvare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveHoliday = function (holiday) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(editingHoliday === null || editingHoliday === void 0 ? void 0 : editingHoliday.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateHolidayMutation.mutate({
                            url: "/api/settings/holidays/".concat(editingHoliday.id),
                            method: 'PUT',
                            data: holiday
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Sărbătoare actualizată cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createHolidayMutation.mutate({
                        url: '/api/settings/holidays',
                        method: 'POST',
                        data: holiday
                    })];
                case 3:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Sărbătoare adăugată cu succes!' });
                    _a.label = 4;
                case 4:
                    setShowHolidayModal(false);
                    setEditingHoliday(null);
                    refetchHolidays();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    setAlert({ type: 'error', message: error_2.message || 'Eroare la salvare' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteHoliday = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Sigur doriți să ștergeți această sărbătoare?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteHolidayMutation.mutate({
                            url: "/api/settings/holidays/\"Id\"",
                            method: 'DELETE'
                        })];
                case 2:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Sărbătoare ștearsă cu succes!' });
                    refetchHolidays();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    setAlert({ type: 'error', message: error_3.message || 'Eroare la ștergere' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="schedule-page">Se încarcă...</div>;
    }
    return (<div className="schedule-page">
      <PageHeader_1.PageHeader title="Program & Orar" description="Configurare program restaurant și sărbători"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="schedule-page__section">
        <h3>Program săptămânal</h3>
        <div className="schedule-table">
          <table className="table">
            <thead>
              <tr>
                <th>Zi</th>
                <th>Închis</th>
                <th>Oră deschidere</th>
                <th>Oră închidere</th>
                <th>Pauză start</th>
                <th>Pauză end</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(function (schedule, idx) { return (<tr key={idx}>
                  <td><strong>{DAYS[schedule.day_of_week]}</strong></td>
                  <td>
                    <input type="checkbox" checked={schedule.is_closed} onChange={function (e) { return handleScheduleChange(idx, 'is_closed', e.target.checked); }} title={"\u00CEnchis ".concat(DAYS[schedule.day_of_week])}/>
                  </td>
                  <td>
                    <input type="time" value={schedule.open_time || ''} onChange={function (e) { return handleScheduleChange(idx, 'open_time', e.target.value); }} disabled={schedule.is_closed} title="Ora deschidere"/>
                  </td>
                  <td>
                    <input type="time" value={schedule.close_time || ''} onChange={function (e) { return handleScheduleChange(idx, 'close_time', e.target.value); }} disabled={schedule.is_closed} title="Ora închidere"/>
                  </td>
                  <td>
                    <input type="time" value={schedule.break_start || ''} onChange={function (e) { return handleScheduleChange(idx, 'break_start', e.target.value); }} disabled={schedule.is_closed} title="Început pauză"/>
                  </td>
                  <td>
                    <input type="time" value={schedule.break_end || ''} onChange={function (e) { return handleScheduleChange(idx, 'break_end', e.target.value); }} disabled={schedule.is_closed} title="Sfârșit pauză"/>
                  </td>
                </tr>); })}
            </tbody>
          </table>
          <div className="schedule-actions">
            <button className="btn btn-primary" onClick={handleSaveSchedule}>
              💾 Salvează Program
            </button>
          </div>
        </div>
      </div>

      <div className="schedule-page__section">
        <div className="section-header">
          <h3>Sărbători</h3>
          <button className="btn btn-primary" onClick={function () {
            setEditingHoliday(null);
            setShowHolidayModal(true);
        }}>
            ➕ Adaugă Sărbătoare
          </button>
        </div>
        <div className="holidays-table">
          <table className="table">
            <thead>
              <tr>
                <th>Dată</th>
                <th>Nume</th>
                <th>Închis</th>
                <th>Recurent</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (<tr>
                  <td colSpan={5} className="text-center">Nu există sărbători configurate</td>
                </tr>) : (holidays.map(function (holiday) { return (<tr key={holiday.id}>
                    <td>{holiday.date}</td>
                    <td>{holiday.name}</td>
                    <td>
                      <span className={"badge ".concat(holiday.is_closed ? 'badge-warning' : 'badge-success')}>
                        {holiday.is_closed ? 'Închis' : 'Deschis'}
                      </span>
                    </td>
                    <td>{holiday.is_recurring ? '✅' : '❌'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={function () {
                setEditingHoliday(holiday);
                setShowHolidayModal(true);
            }}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={function () { return holiday.id && handleDeleteHoliday(holiday.id); }}>
                        🗑️ Șterge
                      </button>
                    </td>
                  </tr>); }))}
            </tbody>
          </table>
        </div>
      </div>

      {showHolidayModal && (<HolidayModal holiday={editingHoliday} onSave={handleSaveHoliday} onClose={function () {
                setShowHolidayModal(false);
                setEditingHoliday(null);
            }}/>)}
    </div>);
};
exports.SchedulePage = SchedulePage;
var HolidayModal = function (_a) {
    var _b;
    var holiday = _a.holiday, onSave = _a.onSave, onClose = _a.onClose;
    var _c = (0, react_1.useState)({
        date: (holiday === null || holiday === void 0 ? void 0 : holiday.date) || '',
        name: (holiday === null || holiday === void 0 ? void 0 : holiday.name) || '',
        name_en: (holiday === null || holiday === void 0 ? void 0 : holiday.name_en) || '',
        is_closed: (_b = holiday === null || holiday === void 0 ? void 0 : holiday.is_closed) !== null && _b !== void 0 ? _b : true,
        special_open_time: (holiday === null || holiday === void 0 ? void 0 : holiday.special_open_time) || '',
        special_close_time: (holiday === null || holiday === void 0 ? void 0 : holiday.special_close_time) || '',
        is_recurring: (holiday === null || holiday === void 0 ? void 0 : holiday.is_recurring) || false,
        location_id: holiday === null || holiday === void 0 ? void 0 : holiday.location_id,
    }), formData = _c[0], setFormData = _c[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSave(formData);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h3>{holiday ? 'Editare Sărbătoare' : 'Adaugă Sărbătoare'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dată *</label>
            <input type="date" value={formData.date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { date: e.target.value })); }} required title="Data sărbătorii"/>
          </div>
          <div className="form-group">
            <label>Nume *</label>
            <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required title="Nume sărbătoare"/>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.is_closed} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_closed: e.target.checked })); }}/>Restaurant închis</label>
          </div>
          {!formData.is_closed && (<>
              <div className="form-group">
                <label>Oră deschidere specială</label>
                <input type="time" value={formData.special_open_time || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { special_open_time: e.target.value })); }} title="Ora deschidere specială"/>
              </div>
              <div className="form-group">
                <label>Oră închidere specială</label>
                <input type="time" value={formData.special_close_time || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { special_close_time: e.target.value })); }} title="Ora închidere specială"/>
              </div>
            </>)}
          <div className="form-group">
            <label>
              <input type="checkbox" checked={formData.is_recurring} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_recurring: e.target.checked })); }}/>Se repetă anual</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>);
};
