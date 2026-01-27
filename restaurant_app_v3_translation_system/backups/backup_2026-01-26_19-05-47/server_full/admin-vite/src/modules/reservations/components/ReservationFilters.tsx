// import { useTranslation } from '@/i18n/I18nContext';
import { useMemo } from 'react';
import type { ReservationFilters, ReservationStatus } from '@/types/reservations';
import './ReservationFilters.css';

interface ReservationFiltersProps {
  filters: ReservationFilters;
  onFiltersChange: (next: Partial<ReservationFilters>) => void;
  onReset: () => void;
  onCreate: () => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  seated: 'La masă',
  completed: 'Finalizată',
  cancelled: 'Anulată',
  no_show: 'Nu s-a prezentat',
};

const STATUS_ORDER: ReservationStatus[] = ["Pending:", 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function ReservationFilters({
  filters,
  onFiltersChange,
  onReset,
  onCreate,
  onExport,
  onRefresh,
  loading = false,
}: ReservationFiltersProps) {
//   const { t } = useTranslation();
  const activeStatuses = useMemo(() => new Set(filters.statuses ?? []), [filters.statuses]);
  const searchValue = filters.search ?? '';

  const handleStatusToggle = (status: ReservationStatus) => {
//   const { t } = useTranslation();
    const next = new Set(activeStatuses);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    onFiltersChange({ statuses: Array.from(next) });
  };

  const handleQuickRange = (range: 'today' | 'next7' | 'all') => {
    const today = new Date();
    if (range === 'today') {
      onFiltersChange({
        startDate: formatDate(today),
        endDate: formatDate(today),
      });
      return;
    }

    if (range === 'next7') {
      const end = new Date(today);
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

  return (
    <section className="reservation-filters">
      <div className="reservation-filters__left">
        <div className="reservation-filters__dates">
          <label className="reservation-filters__label">
            De la
            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) => onFiltersChange({ startDate: event.target.value || undefined })}
            />
          </label>
          <label className="reservation-filters__label">
            Până la
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => onFiltersChange({ endDate: event.target.value || undefined })}
            />
          </label>
          <div className="reservation-filters__quick-range">
            <button type="button" onClick={() => handleQuickRange('today')}>
              Azi
            </button>
            <button type="button" onClick={() => handleQuickRange('next7')}>
              Următoarele 7 zile
            </button>
            <button type="button" onClick={() => handleQuickRange('all')}>Toate</button>
          </div>
        </div>

        <div className="reservation-filters__statuses">
          {STATUS_ORDER.map((status) => {
            const active = activeStatuses.has(status);
            return (
              <button
                key={status}
                type="button"
                className={active ? 'status-pill status-pill--active' : 'status-pill'}
                onClick={() => handleStatusToggle(status)}
              >
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="reservation-filters__right">
        <div className="reservation-filters__search">
          <input
            type="search"
            placeholder='[🔍_cauta_dupa_client_telefon_email_sau_cod]'
            value={searchValue}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
          />
          <label className="reservation-filters__toggle">
            <input
              type="checkbox"
              checked={Boolean(filters.includeCancelled)}
              onChange={(event) => onFiltersChange({ includeCancelled: event.target.checked })}
            />Include anulările</label>
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
    </section>
  );
}






