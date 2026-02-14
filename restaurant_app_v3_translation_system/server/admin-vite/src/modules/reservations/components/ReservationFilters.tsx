import { useTranslation } from '@/i18n/I18nContext';
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

const STATUS_ORDER: ReservationStatus[] = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

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
  const { t } = useTranslation();
  const activeStatuses = useMemo(() => new Set(filters.statuses ?? []), [filters.statuses]);
  const searchValue = filters.search ?? '';

  const handleStatusToggle = (status: ReservationStatus) => {
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
            {t('reservations.filters.from')}
            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) => onFiltersChange({ startDate: event.target.value || undefined })}
            />
          </label>
          <label className="reservation-filters__label">
            {t('reservations.filters.to')}
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => onFiltersChange({ endDate: event.target.value || undefined })}
            />
          </label>
          <div className="reservation-filters__quick-range">
            <button type="button" onClick={() => handleQuickRange('today')}>
              {t('reservations.list.today')}
            </button>
            <button type="button" onClick={() => handleQuickRange('next7')}>
              {t('reservations.filters.next7Days')}
            </button>
            <button type="button" onClick={() => handleQuickRange('all')}>{t('common.all')}</button>
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
                {t(`reservations.status.${status}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="reservation-filters__right">
        <div className="reservation-filters__search">
          <input
            type="search"
            placeholder={t('reservations.filters.searchPlaceholder')}
            value={searchValue}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
          />
          <label className="reservation-filters__toggle">
            <input
              type="checkbox"
              checked={Boolean(filters.includeCancelled)}
              onChange={(event) => onFiltersChange({ includeCancelled: event.target.checked })}
            />{t('reservations.filters.includeCancelled')}</label>
        </div>

        <div className="reservation-filters__actions">
          <button type="button" className="ghost" onClick={onRefresh} disabled={loading}>
            {t('actions.refresh')}
          </button>
          <button type="button" className="ghost" onClick={onExport}>
            {t('reservations.filters.exportCsv')}
          </button>
          <button type="button" className="ghost" onClick={onReset}>
            {t('actions.reset')}
          </button>
          <button type="button" className="primary" onClick={onCreate}>
            {t('reservations.new.title')}
          </button>
        </div>
      </div>
    </section>
  );
}
