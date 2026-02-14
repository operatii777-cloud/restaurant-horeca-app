"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationTimeline = ReservationTimeline;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./ReservationTimeline.css");
var EVENT_ICONS = {
    created: '🆕',
    updated: '✏️',
    status_changed: '🔁',
    reminder_sent: '🔔',
    notification: '✉️',
    note_added: '🗒️',
    deleted: '🗑️',
};
function formatDateTime(timestamp) {
    var date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }
    return "".concat(date.toLocaleDateString('ro-RO'), " ").concat(date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
}
function stringifyPayload(payload) {
    if (!payload) {
        return null;
    }
    try {
        return JSON.stringify(payload, null, 2);
    }
    catch (_a) {
        return String(payload);
    }
}
function ReservationTimeline(_a) {
    var open = _a.open, reservationId = _a.reservationId, confirmationCode = _a.confirmationCode, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var endpoint = reservationId ? "/api/admin/reservations/".concat(reservationId, "/timeline") : null;
    var _b = (0, useApiQuery_1.useApiQuery)(endpoint), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var events = (0, react_1.useMemo)(function () {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.sort(function (a, b) { return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); });
    }, [data]);
    return (<Modal_1.Modal isOpen={open} onClose={onClose} size="md" title={"Timeline rezervare ".concat(confirmationCode ? "#".concat(confirmationCode) : '')}>
      <div className="reservation-timeline">
        {loading ? <InlineAlert_1.InlineAlert type="info" message="Se încarcă istoricul evenimentelor..."/> : null}
        {error ? (<div className="reservation-timeline__error">
            <InlineAlert_1.InlineAlert type="error" message={"Nu am putut \u00EEnc\u0103rca timeline-ul: \"Error\""}/>
            <button type="button" className="reservation-timeline__retry" onClick={function () { return void refetch(); }}>Reîncearcă</button>
          </div>) : null}
        {!loading && events.length === 0 ? <InlineAlert_1.InlineAlert type="info" message="Nu există evenimente înregistrate pentru această rezervare."/> : null}

        <ol className="reservation-timeline__list">
          {events.map(function (event) {
            var _a, _b;
            var icon = (_a = EVENT_ICONS[event.eventType]) !== null && _a !== void 0 ? _a : '📌';
            var payload = stringifyPayload((_b = event.payload) !== null && _b !== void 0 ? _b : null);
            return (<li key={event.id} className="reservation-timeline__item">
                <div className="reservation-timeline__icon">{icon}</div>
                <div className="reservation-timeline__details">
                  <header>
                    <span className="reservation-timeline__event-type">{event.eventType.replace(/_/g, ' ')}</span>
                    <time>{formatDateTime(event.createdAt)}</time>
                  </header>
                  <p className="reservation-timeline__meta">
                    {event.createdBy ? "Operat de ".concat(event.createdBy) : 'Operat din sistem'}
                  </p>
                  {payload ? (<pre className="reservation-timeline__payload">
                      <code>{payload}</code>
                    </pre>) : null}
                </div>
              </li>);
        })}
        </ol>
      </div>
    </Modal_1.Modal>);
}
