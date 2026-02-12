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
exports.ReservationsPage = ReservationsPage;
var react_1 = require("react");
var DataGrid_1 = require("@/shared/components/DataGrid");
var StatCard_1 = require("@/shared/components/StatCard");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useReservations_1 = require("@/modules/reservations/hooks/useReservations");
var useReservationMetrics_1 = require("@/modules/reservations/hooks/useReservationMetrics");
var ReservationFilters_1 = require("@/modules/reservations/components/ReservationFilters");
var ReservationModal_1 = require("@/modules/reservations/components/ReservationModal");
var ReservationTimeline_1 = require("@/modules/reservations/components/ReservationTimeline");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
require("./ReservationsPage.css");
var STATUS_LABELS = {
    pending: 'În așteptare',
    confirmed: 'Confirmată',
    seated: 'La masă',
    completed: 'Finalizată',
    cancelled: 'Anulată',
    no_show: 'Nu s-a prezentat',
};
function formatDateTime(date, time) {
    var dateObj = new Date("".concat(date, "T").concat(time));
    if (Number.isNaN(dateObj.getTime())) {
        return "".concat(date, " ").concat(time);
    }
    return "".concat(dateObj.toLocaleDateString('ro-RO'), " ").concat(dateObj.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
    }));
}
function buildColumnDefs(openTimeline, onCancel, onComplete, onSendEmail, onConfirm) {
    return [
        {
            headerName: 'Cod Confirmare',
            field: 'confirmation_code',
            width: 140,
            valueFormatter: function (params) {
                return params.value || '—';
            },
        },
        {
            headerName: 'Client',
            field: 'customer_name',
            flex: 1,
            minWidth: 150,
            valueFormatter: function (params) { return params.value || '—'; },
        },
        {
            headerName: 'Telefon',
            field: 'customer_phone',
            width: 130,
            valueFormatter: function (params) { return params.value || '—'; },
        },
        {
            headerName: 'Email',
            field: 'customer_email',
            minWidth: 200,
            valueFormatter: function (params) { return params.value || '—'; },
        },
        {
            headerName: 'Data & Time',
            field: 'reservation_date',
            minWidth: 180,
            valueFormatter: function (params) {
                return params.data ? formatDateTime(params.data.reservation_date, params.data.reservation_time) : '';
            },
        },
        {
            headerName: 'Persoane',
            field: 'party_size',
            width: 100,
            valueFormatter: function (params) { var _a; return "".concat((_a = params.value) !== null && _a !== void 0 ? _a : 0); },
        },
        {
            headerName: 'Masă',
            field: 'table_number',
            width: 100,
            valueFormatter: function (params) { var _a; return ((_a = params.data) === null || _a === void 0 ? void 0 : _a.table_number) ? "Masa ".concat(params.data.table_number) : 'Nesetat'; },
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 130,
            cellRenderer: function (params) {
                var _a;
                var status = params.value;
                var label = (_a = STATUS_LABELS[status]) !== null && _a !== void 0 ? _a : status;
                return "<span className=\"reservation-status-badge reservation-status-".concat(status, "\">").concat(label, "</span>");
            },
        },
        {
            headerName: 'Timeline',
            field: 'id',
            width: 120,
            cellRenderer: function (params) {
                if (!params.data)
                    return '';
                return "<button className=\"reservation-grid-button\" data-res-id=\"".concat(params.data.id, "\"><i className=\"fas fa-history me-1\"></i></button>");
            },
            onCellClicked: function (event) {
                if (!event.data)
                    return;
                openTimeline(event.data);
            },
        },
    ];
}
function ReservationsPage() {
    var _this = this;
    var _a, _b;
    // Temporary fallback translation function
    var t = function (key) { return key; };
    var reservationsState = (0, useReservations_1.useReservations)();
    var metricsState = (0, useReservationMetrics_1.useReservationMetrics)(reservationsState.filters);
    var statusMutation = (0, useApiMutation_1.useApiMutation)();
    var reminderMutation = (0, useApiMutation_1.useApiMutation)();
    var emailMutation = (0, useApiMutation_1.useApiMutation)();
    var _c = (0, react_1.useState)([]), selectedReservations = _c[0], setSelectedReservations = _c[1];
    var _d = (0, react_1.useState)(false), isModalOpen = _d[0], setModalOpen = _d[1];
    var _e = (0, react_1.useState)('create'), modalMode = _e[0], setModalMode = _e[1];
    var _f = (0, react_1.useState)(null), timelineReservation = _f[0], setTimelineReservation = _f[1];
    var _g = (0, react_1.useState)(null), emailReservation = _g[0], setEmailReservation = _g[1];
    var _h = (0, react_1.useState)('Confirmare Rezervare - Restaurant Trattoria'), emailSubject = _h[0], setEmailSubject = _h[1];
    var _j = (0, react_1.useState)("Bun\u0103 ziua {{customerName}},\n\nV\u0103 confirm\u0103m rezervarea pentru data de {{reservationDate}} la ora {{reservationTime}}.\n\nDetalii rezervare:\n- Data: {{reservationDate}}\n- Ora: {{reservationTime}}\n- Num\u0103rul de persoane: {{partySize}}\n- Masa: {{tableNumber}}\n- Cod confirmare: {{confirmationCode}}\n\n{{#if specialRequests}}\nCereri speciale: {{specialRequests}}\n{{/if}}\n\nV\u0103 a\u0219tept\u0103m cu pl\u0103cere!\n\nCu respect,\nEchipa Restaurant Trattoria"), emailBody = _j[0], setEmailBody = _j[1];
    var _k = (0, react_1.useState)("Restaurant Trattoria\nTelefon: 0212345678\nEmail: contact@trattoria.ro"), emailSignature = _k[0], setEmailSignature = _k[1];
    var _l = (0, react_1.useState)(''), emailPreview = _l[0], setEmailPreview = _l[1];
    var _m = (0, react_1.useState)(false), showPreview = _m[0], setShowPreview = _m[1];
    var _o = (0, react_1.useState)(null), feedback = _o[0], setFeedback = _o[1];
    var columnDefs = (0, react_1.useMemo)(function () {
        return buildColumnDefs(function (reservation) { return setTimelineReservation(reservation); }, function (reservation) { return void reservation; }, function (reservation) { return void reservation; }, function (reservation) { return void reservation; }, function (reservation) { return void reservation; });
    }, []);
    var selectedReservation = (_a = selectedReservations[0]) !== null && _a !== void 0 ? _a : null;
    var metrics = metricsState.metrics;
    (0, react_1.useEffect)(function () {
        console.log('ReservationsPage Component mounted, FORȚARE resetare filtre...');
        reservationsState.setFilters({
            startDate: undefined,
            endDate: undefined,
            statuses: undefined,
            includeCancelled: true,
            search: '',
            tableId: undefined,
            customerPhone: undefined,
        });
        console.log('[Check] ReservationsPage Filtre resetate complet - toate rezervările vor fi afișate (inclusiv cancelled și no_show)');
    }, []);
    (0, react_1.useEffect)(function () {
        console.log('ReservationsPage Reservations state updated:', {
            count: reservationsState.reservations.length,
            loading: reservationsState.loading,
            error: reservationsState.error,
            filters: reservationsState.filters,
        });
        var florin2026Reservations = reservationsState.reservations.filter(function (r) {
            return r.customer_name &&
                r.customer_name.toLowerCase().includes('florin') &&
                r.reservation_date === '2026-01-08';
        });
        var first3Reservations = reservationsState.reservations.slice(0, 3);
        console.log('ReservationsPage Primele 3 rezervări din state:', first3Reservations.map(function (r) { return ({
            id: r.id,
            customer_name: r.customer_name,
            reservation_date: r.reservation_date,
            reservation_time: r.reservation_time,
            status: r.status,
        }); }));
        if (florin2026Reservations.length > 0) {
            console.log('ReservationsPage Rezervări pentru Florin G din 08.01.2026 găsite în state:', florin2026Reservations.length);
            florin2026Reservations.forEach(function (r) {
                console.log("  - ID: ".concat(r.id, ", Nume: ").concat(r.customer_name, ", Data: ").concat(r.reservation_date, " ").concat(r.reservation_time, ", Status: ").concat(r.status));
            });
        }
        else {
            console.warn('ReservationsPage NU s-au găsit rezervări pentru Florin G din 08.01.2026 în state!');
            console.log('ReservationsPage Filtre active:', reservationsState.filters);
            console.log('ReservationsPage Total rezervări în state:', reservationsState.reservations.length);
            console.log('ReservationsPage Primele 5 rezervări din state:', reservationsState.reservations.slice(0, 5).map(function (r) { return ({
                id: r.id,
                customer_name: r.customer_name,
                reservation_date: r.reservation_date,
                status: r.status,
            }); }));
        }
    }, [
        reservationsState.reservations.length,
        reservationsState.loading,
        reservationsState.error,
        reservationsState.filters,
    ]);
    var refreshAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('ReservationsPage Refreshing all data...');
                    console.log('ReservationsPage Current filters:', reservationsState.filters);
                    return [4 /*yield*/, Promise.all([reservationsState.refetch(), metricsState.refetch()])];
                case 1:
                    _a.sent();
                    console.log('ReservationsPage Refresh completed. Reservations count:', reservationsState.reservations.length);
                    return [2 /*return*/];
            }
        });
    }); }, [reservationsState, metricsState]);
    var resetFilters = function () {
        console.log('ReservationsPage Resetting filters to show all reservations');
        reservationsState.setFilters({
            startDate: undefined,
            endDate: undefined,
            statuses: undefined,
            includeCancelled: true,
            search: '',
            tableId: undefined,
            customerPhone: undefined,
        });
        setTimeout(function () {
            reservationsState.refetch();
        }, 100);
    };
    var timelineOpen = Boolean(timelineReservation);
    return (<div className="reservations-page">
      <header className="reservations-page__header">
        <div>
          <h1>Gestionare Rezervări</h1>
          <p>Planifică, confirmă și urmărește rezervările din restaurant</p>
        </div>
        <div className="reservations-page__header-actions">
          <button type="button" onClick={function () { return setModalOpen(true); }}>
            <i className="fas fa-plus me-1"></i> Rezervare nouă
          </button>
          <button type="button" onClick={refreshAll}>
            <i className="fas fa-sync-alt me-1"></i> Reîmprospătează datele
          </button>
        </div>
      </header>

      <section className="reservations-page__stats">
        <StatCard_1.StatCard icon={<i className="fas fa-calendar-day"></i>} title="Rezervări Astăzi" value={metrics ? String(metrics.today.total) : '—'} helper="Total programate pentru azi" footer={<span>
              Confirmate: <strong>{metrics ? metrics.today.confirmed : '—'}</strong> • Anulate: <strong>{metrics ? metrics.today.cancelled : '—'}</strong>
            </span>}/>
        <StatCard_1.StatCard icon={<i className="fas fa-check-circle"></i>} title="Confirmați" value={metrics ? String(metrics.stats.confirmed_reservations) : '—'} helper="Interval selectat"/>
        <StatCard_1.StatCard icon={<i className="fas fa-ban"></i>} title="Anulați" value={metrics ? String(metrics.stats.cancelled_reservations) : '—'} helper="Include no-show"/>
        <StatCard_1.StatCard icon={<i className="fas fa-chart-line"></i>} title="Grad Ocupare" value={metrics ? "".concat(metrics.occupancy.percentage, "%") : '—'} helper={metrics
            ? "".concat(metrics.occupancy.reservationsToday, "/").concat(metrics.occupancy.totalTables, " mese ast\u0103zi")
            : 'Capacitate'}/>
      </section>

      {feedback ? <InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/> : null}
      {reservationsState.error ? (<InlineAlert_1.InlineAlert type="error" message={reservationsState.error} actionLabel="Reîncearcă" onAction={reservationsState.refetch}/>) : null}

      <ReservationFilters_1.ReservationFilters filters={reservationsState.filters} onFiltersChange={function (partial) { return reservationsState.updateFilters(partial); }} onReset={resetFilters} onCreate={function () { return setModalOpen(true); }} onExport={function () {
            var params = new URLSearchParams();
            var filters = reservationsState.filters;
            if (filters.startDate)
                params.append('startDate', filters.startDate);
            if (filters.endDate)
                params.append('endDate', filters.endDate);
            if (filters.statuses && filters.statuses.length > 0)
                params.append('status', filters.statuses.join(','));
            if (filters.includeCancelled)
                params.append('includeCancelled', 'true');
            if (filters.search)
                params.append('search', filters.search);
            var url = "".concat(window.location.origin, "/api/admin/reservations/export/csv?").concat(params.toString());
            window.open(url, '_blank', 'noopener');
        }} onRefresh={refreshAll} loading={reservationsState.loading}/>

      <section className="reservations-page__actions">
        <button type="button" onClick={function () { return void 0; }} disabled={!selectedReservation}>
          <i className="fas fa-edit me-1"></i> Editează
        </button>
        <button type="button" onClick={function () { return void 0; }} disabled={!selectedReservation}>
          <i className="fas fa-check me-1"></i> Confirmă
        </button>
        <button type="button" onClick={function () { return void 0; }} disabled={!selectedReservation}>
          <i className="fas fa-times me-1"></i> Anulează
        </button>
        <button type="button" onClick={function () { return void 0; }} disabled={!selectedReservation}>
          <i className="fas fa-flag-checkered me-1"></i> Marchează finalizat
        </button>
        <button type="button" onClick={function () { return void 0; }} disabled={!selectedReservation}>
          <i className="fas fa-paper-plane me-1"></i> Trimite reminder
        </button>
        <button type="button" onClick={function () { return setTimelineReservation(selectedReservation); }} disabled={!selectedReservation}>
          <i className="fas fa-stream me-1"></i> Timeline
        </button>
      </section>

      <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={reservationsState.reservations} loading={reservationsState.loading} quickFilterText={reservationsState.filters.search} rowSelection="single" height="60vh" onSelectedRowsChange={function (rows) { return setSelectedReservations(rows); }} onGridReady={function (event) {
            console.log('ReservationsPage Grid ready - Total reservations:', reservationsState.reservations.length);
            console.log('ReservationsPage Displayed rows:', event.api.getDisplayedRowCount());
            var allRowData = [];
            event.api.forEachNode(function (node) {
                if (node.data)
                    allRowData.push(node.data);
            });
            var florinInGrid = allRowData.filter(function (r) { return r.customer_name && r.customer_name.toLowerCase().includes('florin'); });
            console.log('ReservationsPage Rezervări pentru Florin G în grid:', florinInGrid.length);
            if (florinInGrid.length > 0) {
                florinInGrid.forEach(function (r) {
                    console.log("  - ID: ".concat(r.id, ", Nume: ").concat(r.customer_name, ", Status: ").concat(r.status, ", Data: ").concat(r.reservation_date));
                });
            }
            else {
                console.warn('ReservationsPage NU s-au găsit rezervări pentru Florin G în grid!');
            }
        }} agGridProps={{
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [50, 100, 200, 500],
            paginationAutoPageSize: false,
        }}/>

      <ReservationModal_1.ReservationModal open={isModalOpen} mode={modalMode} reservation={modalMode === 'edit' ? selectedReservation !== null && selectedReservation !== void 0 ? selectedReservation : undefined : undefined} onClose={function () { return setModalOpen(false); }} onSaved={function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, refreshAll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>

      <ReservationTimeline_1.ReservationTimeline open={timelineOpen} reservationId={(_b = timelineReservation === null || timelineReservation === void 0 ? void 0 : timelineReservation.id) !== null && _b !== void 0 ? _b : null} confirmationCode={timelineReservation === null || timelineReservation === void 0 ? void 0 : timelineReservation.confirmation_code} onClose={function () { return setTimelineReservation(null); }}/>
    </div>);
}
