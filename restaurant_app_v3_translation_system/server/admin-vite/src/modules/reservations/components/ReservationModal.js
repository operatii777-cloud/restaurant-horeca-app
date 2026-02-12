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
exports.ReservationModal = ReservationModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var useReservationTables_1 = require("@/modules/reservations/hooks/useReservationTables");
var reservationForm_1 = require("@/modules/reservations/validators/reservationForm");
require("./ReservationModal.css");
var DEFAULT_TIME = '19:00';
var DEFAULT_DURATION = 120;
function getDefaultDate() {
    return new Date().toISOString().split('T')[0];
}
var STATUS_OPTIONS = ["Pending:", 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
function ReservationModal(_a) {
    var _this = this;
    var _b;
    var open = _a.open, mode = _a.mode, reservation = _a.reservation, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(null), formError = _c[0], setFormError = _c[1];
    var mutation = (0, useApiMutation_1.useApiMutation)();
    var defaultValues = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (mode === 'edit' && reservation) {
            return {
                customerName: (_a = reservation.customer_name) !== null && _a !== void 0 ? _a : '',
                customerPhone: (_b = reservation.customer_phone) !== null && _b !== void 0 ? _b : '',
                customerEmail: (_c = reservation.customer_email) !== null && _c !== void 0 ? _c : undefined,
                reservationDate: (_d = reservation.reservation_date) !== null && _d !== void 0 ? _d : getDefaultDate(),
                reservationTime: (_e = reservation.reservation_time) !== null && _e !== void 0 ? _e : DEFAULT_TIME,
                durationMinutes: (_f = reservation.duration_minutes) !== null && _f !== void 0 ? _f : DEFAULT_DURATION,
                partySize: (_g = reservation.party_size) !== null && _g !== void 0 ? _g : 2,
                tableId: (_h = reservation.table_id) !== null && _h !== void 0 ? _h : 0,
                specialRequests: (_j = reservation.special_requests) !== null && _j !== void 0 ? _j : undefined,
                status: (_k = reservation.status) !== null && _k !== void 0 ? _k : "Pending:",
                notes: undefined,
            };
        }
        return {
            customerName: '',
            customerPhone: '',
            customerEmail: undefined,
            reservationDate: getDefaultDate(),
            reservationTime: DEFAULT_TIME,
            durationMinutes: DEFAULT_DURATION,
            partySize: 2,
            tableId: 0,
            specialRequests: undefined,
            status: "Pending:",
            notes: undefined,
        };
    }, [mode, reservation]);
    var _d = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(reservationForm_1.reservationFormSchema),
        defaultValues: defaultValues,
    }), control = _d.control, handleSubmit = _d.handleSubmit, reset = _d.reset, register = _d.register, watch = _d.watch, errors = _d.formState.errors;
    (0, react_1.useEffect)(function () {
        if (open) {
            reset(defaultValues);
            setFormError(null);
        }
    }, [open, defaultValues, reset]);
    var reservationDate = watch('reservationDate');
    var reservationTime = watch('reservationTime');
    var partySize = watch('partySize');
    var tablesState = (0, useReservationTables_1.useReservationTables)({
        date: reservationDate,
        time: reservationTime,
        partySize: partySize || 1,
        enabled: open,
    });
    var tableOptions = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f;
        var list = (_a = tablesState.tables) !== null && _a !== void 0 ? _a : [];
        if (mode === 'edit' && (reservation === null || reservation === void 0 ? void 0 : reservation.table_id)) {
            var exists = list.some(function (table) { return table.id === reservation.table_id; });
            if (!exists) {
                return __spreadArray(__spreadArray([], list, true), [
                    {
                        id: reservation.table_id,
                        tableNumber: (_b = reservation.table_number) !== null && _b !== void 0 ? _b : "Mas\u0103 ".concat(reservation.table_id),
                        capacity: (_e = (_d = (_c = reservation.capacity) !== null && _c !== void 0 ? _c : reservation.party_size) !== null && _d !== void 0 ? _d : partySize) !== null && _e !== void 0 ? _e : 1,
                        location: (_f = reservation.location) !== null && _f !== void 0 ? _f : undefined,
                        isAvailable: true,
                    },
                ], false);
            }
        }
        return list;
    }, [tablesState.tables, mode, reservation, partySize]);
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, method, url, data, result, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (mutation.loading)
                        return [2 /*return*/];
                    setFormError(null);
                    payload = {
                        tableId: values.tableId,
                        customerName: values.customerName.trim(),
                        customerPhone: values.customerPhone.trim(),
                        customerEmail: values.customerEmail,
                        reservationDate: values.reservationDate,
                        reservationTime: values.reservationTime,
                        durationMinutes: values.durationMinutes || DEFAULT_DURATION,
                        partySize: values.partySize || 2,
                        specialRequests: values.specialRequests,
                        notes: values.notes,
                    };
                    method = mode === 'create' ? 'post' : 'put';
                    url = mode === 'create' ? '/api/admin/reservations' : "/api/admin/reservations/".concat((_a = reservation === null || reservation === void 0 ? void 0 : reservation.id) !== null && _a !== void 0 ? _a : 0);
                    data = mode === 'create'
                        ? payload
                        : __assign(__assign({}, payload), { status: values.status });
                    return [4 /*yield*/, mutation.mutate({
                            url: url,
                            method: method,
                            data: data,
                        })];
                case 1:
                    result = _c.sent();
                    if (!result) {
                        setFormError((_b = mutation.error) !== null && _b !== void 0 ? _b : 'Nu am putut salva rezervarea.');
                        return [2 /*return*/];
                    }
                    message = mode === 'create' ? 'Rezervare creată cu succes.' : 'Rezervare actualizată.';
                    onSaved(message);
                    reset(defaultValues);
                    onClose();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title={mode === 'create' ? 'Rezervare nouă' : "Editeaz\u0103 rezervarea #".concat((_b = reservation === null || reservation === void 0 ? void 0 : reservation.confirmation_code) !== null && _b !== void 0 ? _b : reservation === null || reservation === void 0 ? void 0 : reservation.id)} size="lg">
      <form className="reservation-modal__form" onSubmit={handleSubmit(onSubmit)}>
        {formError ? <InlineAlert_1.InlineAlert type="error" message={formError}/> : null}

        <div className="reservation-modal__grid">
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerName">Client</label>
            <input id="reservationCustomerName" type="text" placeholder="Nume complet" {...register('customerName')}/>
            {errors.customerName ? <small className="reservation-modal__error">{errors.customerName.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerPhone">Telefon</label>
            <input id="reservationCustomerPhone" type="tel" placeholder="07xx xxx xxx" {...register('customerPhone')}/>
            {errors.customerPhone ? <small className="reservation-modal__error">{errors.customerPhone.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerEmail">Email</label>
            <input id="reservationCustomerEmail" type="email" placeholder='[client@emailcom]' {...register('customerEmail')}/>
            {errors.customerEmail ? <small className="reservation-modal__error">{errors.customerEmail.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationDate">Data</label>
            <input id="reservationDate" type="date" {...register('reservationDate')}/>
            {errors.reservationDate ? <small className="reservation-modal__error">{errors.reservationDate.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationTime">Ora</label>
            <input id="reservationTime" type="time" {...register('reservationTime')}/>
            {errors.reservationTime ? <small className="reservation-modal__error">{errors.reservationTime.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationPartySize">Persoane</label>
            <input id="reservationPartySize" type="number" min={1} {...register('partySize', { valueAsNumber: true })}/>
            {errors.partySize ? <small className="reservation-modal__error">{errors.partySize.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationDuration">Durată (minute)</label>
            <input id="reservationDuration" type="number" min={30} step={15} {...register('durationMinutes', { valueAsNumber: true })}/>
            {errors.durationMinutes ? (<small className="reservation-modal__error">{errors.durationMinutes.message}</small>) : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationTable">Masă</label>
            <react_hook_form_1.Controller name="tableId" control={control} render={function (_a) {
            var field = _a.field;
            return (<select id="reservationTable" value={field.value && field.value > 0 ? field.value : ''} onChange={function (event) { return field.onChange(Number(event.target.value) || 0); }}>
                  <option value="">Selectează masa</option>
                  {tableOptions.map(function (table) { return (<option key={table.id} value={table.id}>
                      {table.tableNumber} • {table.capacity} pers. {table.location ? "\u2022 ".concat(table.location) : ''}' '
                      {!table.isAvailable && table.id !== (reservation === null || reservation === void 0 ? void 0 : reservation.table_id) ? '(ocupată)' : ''}
                    </option>); })}
                </select>);
        }}/>
            {tablesState.loading ? <small className="reservation-modal__hint">Se verifică disponibilitatea meselor...</small> : null}
            {tablesState.error ? <small className="reservation-modal__error">Eroare la încărcarea meselor: {tablesState.error}</small> : null}
            {errors.tableId ? <small className="reservation-modal__error">{errors.tableId.message}</small> : null}
          </div>
          <div className="reservation-modal__field reservation-modal__field--full">
            <label htmlFor="reservationSpecialRequests">Note client</label>
            <textarea id="reservationSpecialRequests" placeholder="Preferințe, alergii, cereri speciale" rows={3} {...register('specialRequests')}/>
          </div>
          {mode === 'edit' ? (<div className="reservation-modal__field">
              <label htmlFor="reservationStatus">Status</label>
              <select id="reservationStatus" {...register('status')}>
                {STATUS_OPTIONS.map(function (status) { return (<option key={status} value={status}>
                    {status}
                  </option>); })}
              </select>
            </div>) : null}
          {mode === 'create' ? (<div className="reservation-modal__field reservation-modal__field--full">
              <label htmlFor="reservationNotes">Note interne</label>
              <textarea id="reservationNotes" placeholder="Instrucțiuni pentru staff, notificări către host" rows={2} {...register('notes')}/>
            </div>) : null}
        </div>

        <footer className="reservation-modal__footer">
          <button type="button" className="ghost" onClick={onClose} disabled={mutation.loading}>Anulează</button>
          <button type="submit" className="primary" disabled={mutation.loading}>
            {mutation.loading ? 'Se salvează...' : mode === 'create' ? 'Creează rezervare' : 'Salvează modificările'}
          </button>
        </footer>
      </form>
    </Modal_1.Modal>);
}
