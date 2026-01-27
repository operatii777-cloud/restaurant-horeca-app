import { useCallback, useMemo, useState } from 'react';
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

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  seated: 'La masă',
  completed: 'Finalizată',
  cancelled: 'Anulată',
  no_show: 'Nu s-a prezentat',
};

function formatDateTime(date: string, time: string): string {
  const dateObj = new Date(`${date}T${time}`);
  if (Number.isNaN(dateObj.getTime())) {
    return `${date} ${time}`;
  }
  return `${dateObj.toLocaleDateString('ro-RO')} ${dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
}

function buildColumnDefs(openTimeline: (reservation: Reservation) => void): ColDef<Reservation>[] {
  return [
    {
      headerName: 'Cod',
      field: 'confirmation_code',
      width: 140,
      valueFormatter: (params: ValueFormatterParams<Reservation, Reservation['confirmation_code']>) =>
        params.value || '—',
    },
    {
      headerName: 'Client',
      field: 'customer_name',
      flex: 1,
      minWidth: 220,
      valueFormatter: (params: ValueFormatterParams<Reservation>) => {
        const { data } = params;
        if (!data) return '';
        return `${data.customer_name ?? ''}${data.customer_phone ? ` • ${data.customer_phone}` : ''}`;
      },
    },
    {
      headerName: 'Email',
      field: 'customer_email',
      minWidth: 200,
      valueFormatter: (params: ValueFormatterParams<Reservation>) => params.value || '—',
    },
    {
      headerName: 'Data & Ora',
      field: 'reservation_date',
      minWidth: 200,
      valueFormatter: (params: ValueFormatterParams<Reservation>) =>
        params.data ? formatDateTime(params.data.reservation_date, params.data.reservation_time) : '',
    },
    {
      headerName: 'Masă',
      field: 'table_number',
      width: 140,
      valueFormatter: (params: ValueFormatterParams<Reservation>) =>
        params.data?.table_number ? `Masa ${params.data.table_number}` : 'Nesetat',
    },
    {
      headerName: 'Persoane',
      field: 'party_size',
      width: 120,
      valueFormatter: (params: ValueFormatterParams<Reservation, Reservation['party_size']>) =>
        `${params.value ?? 0} pers.`,
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 150,
      cellRenderer: (params: ICellRendererParams<Reservation>) => {
        const status = params.value as ReservationStatus;
        const label = STATUS_LABELS[status] ?? status;
        return `<span class="reservation-status-badge reservation-status-${status}">${label}</span>`;
      },
    },
    {
      headerName: 'Ultima actualizare',
      field: 'updated_at',
      minWidth: 200,
      valueFormatter: (params: ValueFormatterParams<Reservation, Reservation['updated_at']>) => {
        if (!params.value) return '—';
        const date = new Date(params.value);
        return `${date.toLocaleDateString('ro-RO')} ${date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
      },
    },
    {
      headerName: 'Timeline',
      field: 'id',
      width: 120,
      cellRenderer: (params: ICellRendererParams<Reservation>) => {
        if (!params.data) return '';
        return `<button class="reservation-grid-button" data-res-id="${params.data.id}">🕒</button>`;
      },
      onCellClicked: (event: CellClickedEvent<Reservation>) => {
        if (!event.data) return;
        openTimeline(event.data);
      },
    },
  ];
}

export function ReservationsPage() {
  const reservationsState = useReservations();
  const metricsState = useReservationMetrics(reservationsState.filters);

  const statusMutation = useApiMutation<Reservation>();
  const reminderMutation = useApiMutation();

  const [selectedReservations, setSelectedReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [timelineReservation, setTimelineReservation] = useState<Reservation | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const columnDefs = useMemo(() => buildColumnDefs((reservation) => setTimelineReservation(reservation)), []);

  const selectedReservation = selectedReservations[0] ?? null;

  const metrics = metricsState.metrics;

  const handleCreate = () => {
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedReservation) return;
    setModalMode('edit');
    setModalOpen(true);
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([reservationsState.refetch(), metricsState.refetch()]);
  }, [reservationsState, metricsState]);

  const handleStatusChange = async (status: ReservationStatus) => {
    if (!selectedReservation) return;
    const result = await statusMutation.mutate({
      url: `/api/admin/reservations/${selectedReservation.id}/status`,
      method: 'put',
      data: { status },
    });

    if (!result) {
      setFeedback({ type: 'error', message: statusMutation.error ?? 'Nu am putut actualiza statusul.' });
      return;
    }

    await refreshAll();
    setFeedback({ type: 'success', message: `Status actualizat la "${STATUS_LABELS[status] ?? status}".` });
  };

  const handleReminder = async () => {
    if (!selectedReservation) return;
    const result = await reminderMutation.mutate({
      url: `/api/admin/reservations/${selectedReservation.id}/reminder`,
      method: 'post',
    });

    if (!result) {
      setFeedback({ type: 'error', message: reminderMutation.error ?? 'Nu am putut trimite reminderul.' });
      return;
    }
    await refreshAll();
    setFeedback({ type: 'success', message: 'Reminder trimis către client.' });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    const filters = reservationsState.filters;
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.statuses && filters.statuses.length > 0) params.append('status', filters.statuses.join(','));
    if (filters.includeCancelled) params.append('includeCancelled', 'true');
    if (filters.search) params.append('search', filters.search);
    const url = `${window.location.origin}/api/admin/reservations/export/csv?${params.toString()}`;
    window.open(url, '_blank', 'noopener');
  };

  const resetFilters = () => {
    reservationsState.setFilters({
      startDate: undefined,
      endDate: undefined,
      statuses: ['pending', 'confirmed'],
      includeCancelled: false,
      search: '',
      tableId: undefined,
    });
  };

  const timelineOpen = Boolean(timelineReservation);

  return (
    <div className="reservations-page">
      <header className="reservations-page__header">
        <div>
          <h1>Gestionare Rezervări</h1>
          <p>Planifică, confirmă și urmărește rezervările din restaurant, cu timeline și rapoarte în timp real.</p>
        </div>
        <div className="reservations-page__header-actions">
          <button type="button" onClick={handleCreate}>
            ➕ Rezervare nouă
          </button>
          <button type="button" onClick={refreshAll}>
            🔄 Reîmprospătează datele
          </button>
        </div>
      </header>

      <section className="reservations-page__stats">
        <StatCard
          icon="📅"
          title="Rezervări astăzi"
          value={metrics ? String(metrics.today.total) : '—'}
          helper="Total programate pentru azi"
          footer={
            <span>
              Confirmate: <strong>{metrics ? metrics.today.confirmed : '—'}</strong> • Anulate:{' '}
              <strong>{metrics ? metrics.today.cancelled : '—'}</strong>
            </span>
          }
        />
        <StatCard
          icon="✅"
          title="Confirmări"
          value={metrics ? String(metrics.stats.confirmed_reservations) : '—'}
          helper="Interval selectat"
        />
        <StatCard
          icon="🚫"
          title="Anulări"
          value={metrics ? String(metrics.stats.cancelled_reservations) : '—'}
          helper="Include no-show"
        />
        <StatCard
          icon="📈"
          title="Grad ocupare"
          value={metrics ? `${metrics.occupancy.percentage}%` : '—'}
          helper={
            metrics
              ? `${metrics.occupancy.reservationsToday}/${metrics.occupancy.totalTables} mese astăzi`
              : 'Capacitate'
          }
        />
      </section>

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} /> : null}
      {reservationsState.error ? (
        <InlineAlert
          type="error"
          message={reservationsState.error}
          actionLabel="Reîncearcă"
          onAction={reservationsState.refetch}
        />
      ) : null}

      <ReservationFilters
        filters={reservationsState.filters}
        onFiltersChange={(partial) => reservationsState.updateFilters(partial)}
        onReset={resetFilters}
        onCreate={handleCreate}
        onExport={handleExport}
        onRefresh={refreshAll}
        loading={reservationsState.loading}
      />

      <section className="reservations-page__actions">
        <button type="button" onClick={handleEdit} disabled={!selectedReservation}>
          ✏️ Editează
        </button>
        <button type="button" onClick={() => handleStatusChange('confirmed')} disabled={!selectedReservation}>
          ✅ Confirmă
        </button>
        <button type="button" onClick={() => handleStatusChange('cancelled')} disabled={!selectedReservation}>
          ❌ Anulează
        </button>
        <button type="button" onClick={() => handleStatusChange('completed')} disabled={!selectedReservation}>
          🏁 Marchează finalizat
        </button>
        <button type="button" onClick={handleReminder} disabled={!selectedReservation}>
          🔔 Trimite reminder
        </button>
        <button type="button" onClick={() => setTimelineReservation(selectedReservation)} disabled={!selectedReservation}>
          🕒 Timeline
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


