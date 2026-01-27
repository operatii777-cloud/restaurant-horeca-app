// import { useTranslation } from '@/i18n/I18nContext';
import { useMemo } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { ReservationTimelineEvent } from '@/types/reservations';
import './ReservationTimeline.css';

interface ReservationTimelineProps {
  open: boolean;
  reservationId: number | null;
  confirmationCode?: string | null;
  onClose: () => void;
}

const EVENT_ICONS: Record<string, string> = {
  created: '🆕',
  updated: '✏️',
  status_changed: '🔁',
  reminder_sent: '🔔',
  notification: '✉️',
  note_added: '🗒️',
  deleted: '🗑️',
};

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return `${date.toLocaleDateString('ro-RO')} ${date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
}

function stringifyPayload(payload?: Record<string, unknown> | null): string | null {
  if (!payload) {
    return null;
  }
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export function ReservationTimeline({ open, reservationId, confirmationCode, onClose }: ReservationTimelineProps) {
//   const { t } = useTranslation();
  const endpoint = reservationId ? `/api/admin/reservations/${reservationId}/timeline` : null;
  const { data, loading, error, refetch } = useApiQuery<ReservationTimelineEvent[]>(endpoint);

  const events = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="md"
      title={`Timeline rezervare ${confirmationCode ? `#${confirmationCode}` : ''}`}
    >
      <div className="reservation-timeline">
        {loading ? <InlineAlert type="info" message="Se încarcă istoricul evenimentelor..." /> : null}
        {error ? (
          <div className="reservation-timeline__error">
            <InlineAlert type="error" message={`Nu am putut încărca timeline-ul: "Error"`} />
            <button type="button" className="reservation-timeline__retry" onClick={() => void refetch()}>Reîncearcă</button>
          </div>
        ) : null}
        {!loading && events.length === 0 ? <InlineAlert type="info" message="Nu există evenimente înregistrate pentru această rezervare." /> : null}

        <ol className="reservation-timeline__list">
          {events.map((event) => {
            const icon = EVENT_ICONS[event.eventType] ?? '📌';
            const payload = stringifyPayload(event.payload ?? null);
            return (
              <li key={event.id} className="reservation-timeline__item">
                <div className="reservation-timeline__icon">{icon}</div>
                <div className="reservation-timeline__details">
                  <header>
                    <span className="reservation-timeline__event-type">{event.eventType.replace(/_/g, ' ')}</span>
                    <time>{formatDateTime(event.createdAt)}</time>
                  </header>
                  <p className="reservation-timeline__meta">
                    {event.createdBy ? `Operat de ${event.createdBy}` : 'Operat din sistem'}
                  </p>
                  {payload ? (
                    <pre className="reservation-timeline__payload">
                      <code>{payload}</code>
                    </pre>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Modal>
  );
}





