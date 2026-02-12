"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationFilters = ReservationFilters;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./ReservationFilters.css");
var STATUS_LABELS = {
    pending: 'În așteptare',
    confirmed: 'Confirmată',
    seated: 'La masă',
    completed: 'Finalizată',
    cancelled: 'Anulată',
    no_show: 'Nu s-a prezentat',
};
var STATUS_ORDER = ["Pending:", 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function ReservationFilters(_a) {
    var _b, _c, _d;
    var filters = _a.filters, onFiltersChange = _a.onFiltersChange, onReset = _a.onReset, onCreate = _a.onCreate, onExport = _a.onExport, onRefresh = _a.onRefresh, _e = _a.loading, loading = _e === void 0 ? false : _e;
    //   const { t } = useTranslation();
    var activeStatuses = (0, react_1.useMemo)(function () { var _a; return new Set((_a = filters.statuses) !== null && _a !== void 0 ? _a : []); }, [filters.statuses]);
    var searchValue = (_b = filters.search) !== null && _b !== void 0 ? _b : '';
    var handleStatusToggle = function (status) {
        //   const { t } = useTranslation();
        var next = new Set(activeStatuses);
        if (next.has(status)) {
            next.delete(status);
        }
        else {
            next.add(status);
        }
        onFiltersChange({ statuses: Array.from(next) });
    };
    var handleQuickRange = function (range) {
        var today = new Date();
        if (range === 'today') {
            onFiltersChange({
                startDate: formatDate(today),
                endDate: formatDate(today),
            });
            return;
        }
        if (range === 'next7') {
            var end = new Date(today);
            end.setDate(end.getDate() + 7);
            onFiltersChange({
                startDate: formatDate(today),
                endDate: formatDate(end),
            });
            return;
        }
        onFiltersChange({
            startDate: undefined,
            endDate: undefined,
        });
    };
    return (<section className="reservation-filters">
      <div className="reservation-filters__left">
        <div className="reservation-filters__dates">
          <label className="reservation-filters__label">
            De la
            <input type="date" value={(_c = filters.startDate) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return onFiltersChange({ startDate: event.target.value || undefined }); }}/>
          </label>
          <label className="reservation-filters__label">
            Până la
            <input type="date" value={(_d = filters.endDate) !== null && _d !== void 0 ? _d : ''} onChange={function (event) { return onFiltersChange({ endDate: event.target.value || undefined }); }}/>
          </label>
          <div className="reservation-filters__quick-range">
            <button type="button" onClick={function () { return handleQuickRange('today'); }}>
              Azi
            </button>
            <button type="button" onClick={function () { return handleQuickRange('next7'); }}>
              Următoarele 7 zile
            </button>
            <button type="button" onClick={function () { return handleQuickRange('all'); }}>Toate</button>
          </div>
        </div>

        <div className="reservation-filters__statuses">
          {STATUS_ORDER.map(function (status) {
            var active = activeStatuses.has(status);
            return (<button key={status} type="button" className={active ? 'status-pill status-pill--active' : 'status-pill'} onClick={function () { return handleStatusToggle(status); }}>
                {STATUS_LABELS[status]}
              </button>);
        })}
        </div>
      </div>

      <div className="reservation-filters__right">
        <div className="reservation-filters__search">
          <input type="search" placeholder='[🔍_cauta_dupa_client_telefon_email_sau_cod]' value={searchValue} onChange={function (event) { return onFiltersChange({ search: event.target.value }); }}/>
          <label className="reservation-filters__toggle">
            <input type="checkbox" checked={Boolean(filters.includeCancelled)} onChange={function (event) { return onFiltersChange({ includeCancelled: event.target.checked }); }}/>Include anulările</label>
        </div>

        <div className="reservation-filters__actions">
          <button type="button" className="ghost" onClick={onRefresh} disabled={loading}>
            🔄 Reîmprospătează
          </button>
          <button type="button" className="ghost" onClick={onExport}>
            📤 Export CSV
          </button>
          <button type="button" className="ghost" onClick={onReset}>
            â™»ï¸ Reset
          </button>
          <button type="button" className="primary" onClick={onCreate}>
            âž• Rezervare nouă
          </button>
        </div>
      </div>
    </section>);
}
