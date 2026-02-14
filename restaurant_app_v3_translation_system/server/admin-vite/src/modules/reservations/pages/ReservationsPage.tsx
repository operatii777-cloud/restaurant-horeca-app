import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type {
  CellClickedEvent,
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useReservations } from '@/modules/reservations/hooks/useReservations';
import { useReservationMetrics } from '@/modules/reservations/hooks/useReservationMetrics';
import { ReservationFilters } from '@/modules/reservations/components/ReservationFilters';
import { ReservationModal } from '@/modules/reservations/components/ReservationModal';
import { ReservationTimeline } from '@/modules/reservations/components/ReservationTimeline';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type { Reservation, ReservationStatus } from '@/types/reservations';
import './ReservationsPage.css';

function formatDateTime(date: string, time: string): string {
  const dateObj = new Date(`${date}T${time}`);
  if (Number.isNaN(dateObj.getTime())) {
    return `${date} ${time}`;
  }
  return `${dateObj.toLocaleDateString('ro-RO')} ${dateObj.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function buildColumnDefs(
  t: (key: string) => string,
  openTimeline: (reservation: Reservation) => void,
  onCancel: (reservation: Reservation) => void,
  onComplete: (reservation: Reservation) => void,
  onSendEmail: (reservation: Reservation) => void,
  onConfirm: (reservation: Reservation) => void,
): ColDef<Reservation>[] {
  return [
    {
      headerName: t('reservations.page.confirmationCode'),
      field: 'confirmation_code',
      width: 140,
      valueFormatter: (params: ValueFormatterParams<Reservation, Reservation['confirmation_code']>) =>
        params.value || '—',
    },
    {
      headerName: t('reservations.customer.name'),
      field: 'customer_name',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params: ValueFormatterParams<Reservation>) => params.value || '—',
    },
    {
      headerName: t('reservations.customer.phone'),
      field: 'customer_phone',
      width: 130,
      valueFormatter: (params: ValueFormatterParams<Reservation>) => params.value || '—',
    },
    {
      headerName: t('reservations.customer.email'),
      field: 'customer_email',
      minWidth: 200,
      valueFormatter: (params: ValueFormatterParams<Reservation>) => params.value || '—',
    },
    {
      headerName: t('reservations.page.dateTime'),
      field: 'reservation_date',
      minWidth: 180,
      valueFormatter: (params: ValueFormatterParams<Reservation>) =>
        params.data ? formatDateTime(params.data.reservation_date, params.data.reservation_time) : '',
    },
    {
      headerName: t('reservations.list.guests'),
      field: 'party_size',
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Reservation, Reservation['party_size']>) =>
        `${params.value ?? 0}`,
    },
    {
      headerName: t('reservations.list.table'),
      field: 'table_number',
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Reservation>) =>
        params.data?.table_number ? `${t('reservations.modal.table')} ${params.data.table_number}` : t('reservations.page.notSet'),
    },
    {
      headerName: t('common.status'),
      field: 'status',
      width: 130,
      cellRenderer: (params: ICellRendererParams<Reservation>) => {
        const status = params.value as ReservationStatus;
        const label = t(`reservations.status.${status}`);
        return `<span className="reservation-status-badge reservation-status-${status}">${label}</span>`;
      },
    },
    {
      headerName: t('reservations.calendar.timeline'),
      field: 'id',
      width: 120,
      cellRenderer: (params: ICellRendererParams<Reservation>) => {
        if (!params.data) return '';
        return `<button className="reservation-grid-button" data-res-id="${params.data.id}"><i className="fas fa-history me-1"></i></button>`;
      },
      onCellClicked: (event: CellClickedEvent<Reservation>) => {
        if (!event.data) return;
        openTimeline(event.data);
      },
    },
  ];
}

export function ReservationsPage() {
  const { t } = useTranslation();
  const reservationsState = useReservations();
  const metricsState = useReservationMetrics(reservationsState.filters);

  const statusMutation = useApiMutation<Reservation>();
  const reminderMutation = useApiMutation();
  const emailMutation = useApiMutation();

  const [selectedReservations, setSelectedReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [timelineReservation, setTimelineReservation] = useState<Reservation | null>(null);
  const [emailReservation, setEmailReservation] = useState<Reservation | null>(null);
  const [emailSubject, setEmailSubject] = useState('Confirmare Rezervare - Restaurant Trattoria');
  const [emailBody, setEmailBody] = useState(`Bună ziua {{customerName}},

Vă confirmăm rezervarea pentru data de {{reservationDate}} la ora {{reservationTime}}.

Detalii rezervare:
- Data: {{reservationDate}}
- Ora: {{reservationTime}}
- Numărul de persoane: {{partySize}}
- Masa: {{tableNumber}}
- Cod confirmare: {{confirmationCode}}

{{#if specialRequests}}
Cereri speciale: {{specialRequests}}
{{/if}}

Vă așteptăm cu plăcere!

Cu respect,
Echipa Restaurant Trattoria`);
  const [emailSignature, setEmailSignature] = useState(`Restaurant Trattoria
Telefon: 0212345678
Email: contact@trattoria.ro`);
  const [emailPreview, setEmailPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const columnDefs = useMemo(
    () =>
      buildColumnDefs(
        t,
        (reservation) => setTimelineReservation(reservation),
        (reservation) => void reservation,
        (reservation) => void reservation,
        (reservation) => void reservation,
        (reservation) => void reservation,
      ),
    [t],
  );

  const selectedReservation = selectedReservations[0] ?? null;
  const metrics = metricsState.metrics;

  useEffect(() => {
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
    console.log(
      '[Check] ReservationsPage Filtre resetate complet - toate rezervările vor fi afișate (inclusiv cancelled și no_show)',
    );
  }, []);

  useEffect(() => {
    console.log('ReservationsPage Reservations state updated:', {
      count: reservationsState.reservations.length,
      loading: reservationsState.loading,
      error: reservationsState.error,
      filters: reservationsState.filters,
    });

    const florin2026Reservations = reservationsState.reservations.filter(
      (r) =>
        r.customer_name &&
        r.customer_name.toLowerCase().includes('florin') &&
        r.reservation_date === '2026-01-08',
    );

    const first3Reservations = reservationsState.reservations.slice(0, 3);
    console.log('ReservationsPage Primele 3 rezervări din state:',
      first3Reservations.map((r) => ({
        id: r.id,
        customer_name: r.customer_name,
        reservation_date: r.reservation_date,
        reservation_time: r.reservation_time,
        status: r.status,
      })),
    );

    if (florin2026Reservations.length > 0) {
      console.log('ReservationsPage Rezervări pentru Florin G din 08.01.2026 găsite în state:',
        florin2026Reservations.length,
      );
      florin2026Reservations.forEach((r) => {
        console.log(
          `  - ID: ${r.id}, Nume: ${r.customer_name}, Data: ${r.reservation_date} ${r.reservation_time}, Status: ${r.status}`,
        );
      });
    } else {
      console.warn('ReservationsPage NU s-au găsit rezervări pentru Florin G din 08.01.2026 în state!');
      console.log('ReservationsPage Filtre active:', reservationsState.filters);
      console.log('ReservationsPage Total rezervări în state:', reservationsState.reservations.length);
      console.log('ReservationsPage Primele 5 rezervări din state:',
        reservationsState.reservations.slice(0, 5).map((r) => ({
          id: r.id,
          customer_name: r.customer_name,
          reservation_date: r.reservation_date,
          status: r.status,
        })),
      );
    }
  }, [
    reservationsState.reservations.length,
    reservationsState.loading,
    reservationsState.error,
    reservationsState.filters,
  ]);

  const refreshAll = useCallback(async () => {
    console.log('ReservationsPage Refreshing all data...');
    console.log('ReservationsPage Current filters:', reservationsState.filters);
    await Promise.all([reservationsState.refetch(), metricsState.refetch()]);
    console.log('ReservationsPage Refresh completed. Reservations count:',
      reservationsState.reservations.length,
    );
  }, [reservationsState, metricsState]);

  const resetFilters = () => {
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
    setTimeout(() => {
      reservationsState.refetch();
    }, 100);
  };

  const timelineOpen = Boolean(timelineReservation);

  return (
    <div className="reservations-page">
      <header className="reservations-page__header">
        <div>
          <h1>{t('reservations.page.title')}</h1>
          <p>{t('reservations.page.subtitle')}</p>
        </div>
        <div className="reservations-page__header-actions">
          <button type="button" onClick={() => setModalOpen(true)}>
            <i className="fas fa-plus me-1"></i> {t('reservations.new.title')}
          </button>
          <button type="button" onClick={refreshAll}>
            <i className="fas fa-sync-alt me-1"></i> {t('reservations.page.refreshData')}
          </button>
        </div>
      </header>

      <section className="reservations-page__stats">
        <StatCard
          icon={<i className="fas fa-calendar-day"></i>}
          title={t('reservations.page.reservationsToday')}
          value={metrics ? String(metrics.today.total) : '—'}
          helper={t('reservations.page.totalScheduledToday')}
          footer={
            <span>
              {t('reservations.page.confirmed')}: <strong>{metrics ? metrics.today.confirmed : '—'}</strong> • {t('reservations.page.cancelled')}: <strong>{metrics ? metrics.today.cancelled : '—'}</strong>
            </span>
          }
        />
        <StatCard
          icon={<i className="fas fa-check-circle"></i>}
          title={t('reservations.page.confirmed')}
          value={metrics ? String(metrics.stats.confirmed_reservations) : '—'}
          helper={t('reservations.page.selectedInterval')}
        />
        <StatCard
          icon={<i className="fas fa-ban"></i>}
          title={t('reservations.page.cancelled')}
          value={metrics ? String(metrics.stats.cancelled_reservations) : '—'}
          helper={t('reservations.page.includesNoShow')}
        />
        <StatCard
          icon={<i className="fas fa-chart-line"></i>}
          title={t('reservations.page.occupancyRate')}
          value={metrics ? `${metrics.occupancy.percentage}%` : '—'}
          helper={
            metrics
              ? `${metrics.occupancy.reservationsToday}/${metrics.occupancy.totalTables} ${t('reservations.page.tablesToday')}`
              : t('reservations.page.capacity')
          }
        />
      </section>

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} /> : null}
      {reservationsState.error ? (
        <InlineAlert
          type="error"
          message={reservationsState.error}
          actionLabel={t('actions.retry')}
          onAction={reservationsState.refetch}
        />
      ) : null}

      <ReservationFilters
        filters={reservationsState.filters}
        onFiltersChange={(partial) => reservationsState.updateFilters(partial)}
        onReset={resetFilters}
        onCreate={() => setModalOpen(true)}
        onExport={() => {
          const params = new URLSearchParams();
          const filters = reservationsState.filters;
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
          if (filters.statuses && filters.statuses.length > 0) params.append('status', filters.statuses.join(','));
          if (filters.includeCancelled) params.append('includeCancelled', 'true');
          if (filters.search) params.append('search', filters.search);
          const url = `${window.location.origin}/api/admin/reservations/export/csv?${params.toString()}`;
          window.open(url, '_blank', 'noopener');
        }}
        onRefresh={refreshAll}
        loading={reservationsState.loading}
      />

      <section className="reservations-page__actions">
        <button type="button" onClick={() => void 0} disabled={!selectedReservation}>
          <i className="fas fa-edit me-1"></i> {t('actions.edit')}
        </button>
        <button type="button" onClick={() => void 0} disabled={!selectedReservation}>
          <i className="fas fa-check me-1"></i> {t('reservations.actions.confirm')}
        </button>
        <button type="button" onClick={() => void 0} disabled={!selectedReservation}>
          <i className="fas fa-times me-1"></i> {t('actions.cancel')}
        </button>
        <button type="button" onClick={() => void 0} disabled={!selectedReservation}>
          <i className="fas fa-flag-checkered me-1"></i> {t('reservations.page.markCompleted')}
        </button>
        <button type="button" onClick={() => void 0} disabled={!selectedReservation}>
          <i className="fas fa-paper-plane me-1"></i> {t('reservations.page.sendReminder')}
        </button>
        <button type="button" onClick={() => setTimelineReservation(selectedReservation)} disabled={!selectedReservation}>
          <i className="fas fa-stream me-1"></i> {t('reservations.calendar.timeline')}
        </button>
      </section>

      <DataGrid<Reservation>
        columnDefs={columnDefs}
        rowData={reservationsState.reservations}
        loading={reservationsState.loading}
        quickFilterText={reservationsState.filters.search}
        rowSelection="single"
        height="60vh"
        onSelectedRowsChange={(rows) => setSelectedReservations(rows)}
        onGridReady={(event) => {
          console.log('ReservationsPage Grid ready - Total reservations:',
            reservationsState.reservations.length,
          );
          console.log('ReservationsPage Displayed rows:', event.api.getDisplayedRowCount());

          const allRowData: Reservation[] = [];
          event.api.forEachNode((node) => {
            if (node.data) allRowData.push(node.data);
          });
          const florinInGrid = allRowData.filter(
            (r) => r.customer_name && r.customer_name.toLowerCase().includes('florin'),
          );
          console.log('ReservationsPage Rezervări pentru Florin G în grid:', florinInGrid.length);
          if (florinInGrid.length > 0) {
            florinInGrid.forEach((r) => {
              console.log(
                `  - ID: ${r.id}, Nume: ${r.customer_name}, Status: ${r.status}, Data: ${r.reservation_date}`,
              );
            });
          } else {
            console.warn('ReservationsPage NU s-au găsit rezervări pentru Florin G în grid!');
          }
        }}
        agGridProps={{
          pagination: true,
          paginationPageSize: 100,
          paginationPageSizeSelector: [50, 100, 200, 500],
          paginationAutoPageSize: false,
        }}
      />

      <ReservationModal
        open={isModalOpen}
        mode={modalMode}
        reservation={modalMode === 'edit' ? selectedReservation ?? undefined : undefined}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          await refreshAll();
        }}
      />

      <ReservationTimeline
        open={timelineOpen}
        reservationId={timelineReservation?.id ?? null}
        confirmationCode={timelineReservation?.confirmation_code}
        onClose={() => setTimelineReservation(null)}
      />
    </div>
  );
}
