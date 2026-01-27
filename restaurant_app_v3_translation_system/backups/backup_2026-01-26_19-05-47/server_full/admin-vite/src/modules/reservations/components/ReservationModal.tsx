// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useReservationTables } from '@/modules/reservations/hooks/useReservationTables';
import type { Reservation, ReservationStatus, ReservationTableOption } from '@/types/reservations';
import { reservationFormSchema, type ReservationFormValues } from '@/modules/reservations/validators/reservationForm';
import './ReservationModal.css';

type ReservationModalMode = 'create' | 'edit';

interface ReservationModalProps {
  open: boolean;
  mode: ReservationModalMode;
  reservation?: Reservation | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const DEFAULT_TIME = '19:00';
const DEFAULT_DURATION = 120;

function getDefaultDate(): string {
  return new Date().toISOString().split('T')[0];
}

const STATUS_OPTIONS: ReservationStatus[] = ["Pending:", 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

export function ReservationModal({ open, mode, reservation, onClose, onSaved }: ReservationModalProps) {
//   const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useApiMutation<Reservation>();

  const defaultValues = useMemo<ReservationFormValues>(() => {
    if (mode === 'edit' && reservation) {
      return {
        customerName: reservation.customer_name ?? '',
        customerPhone: reservation.customer_phone ?? '',
        customerEmail: reservation.customer_email ?? undefined,
        reservationDate: reservation.reservation_date ?? getDefaultDate(),
        reservationTime: reservation.reservation_time ?? DEFAULT_TIME,
        durationMinutes: reservation.duration_minutes ?? DEFAULT_DURATION,
        partySize: reservation.party_size ?? 2,
        tableId: reservation.table_id ?? 0,
        specialRequests: reservation.special_requests ?? undefined,
        status: reservation.status ?? "Pending:",
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

  const {
    control,
    handleSubmit,
    reset,
    register,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);
    }
  }, [open, defaultValues, reset]);

  const reservationDate = watch('reservationDate');
  const reservationTime = watch('reservationTime');
  const partySize = watch('partySize');

  const tablesState = useReservationTables({
    date: reservationDate,
    time: reservationTime,
    partySize: partySize || 1,
    enabled: open,
  });

  const tableOptions: ReservationTableOption[] = useMemo(() => {
    const list = tablesState.tables ?? [];
    if (mode === 'edit' && reservation?.table_id) {
      const exists = list.some((table) => table.id === reservation.table_id);
      if (!exists) {
        return [
          ...list,
          {
            id: reservation.table_id,
            tableNumber: reservation.table_number ?? `Masă ${reservation.table_id}`,
            capacity: reservation.capacity ?? reservation.party_size ?? partySize ?? 1,
            location: reservation.location ?? undefined,
            isAvailable: true,
          },
        ];
      }
    }
    return list;
  }, [tablesState.tables, mode, reservation, partySize]);

  const onSubmit = async (values: ReservationFormValues) => {
    if (mutation.loading) return;
    setFormError(null);

    const payload = {
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

    const method = mode === 'create' ? 'post' : 'put';
    const url = mode === 'create' ? '/api/admin/reservations' : `/api/admin/reservations/${reservation?.id ?? 0}`;
    const data =
      mode === 'create'
        ? payload
        : {
            ...payload,
            status: values.status,
          };

    const result = await mutation.mutate({
      url,
      method,
      data,
    });

    if (!result) {
      setFormError(mutation.error ?? 'Nu am putut salva rezervarea.');
      return;
    }

    const message = mode === 'create' ? 'Rezervare creată cu succes.' : 'Rezervare actualizată.';
    onSaved(message);
    reset(defaultValues);
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === 'create' ? 'Rezervare nouă' : `Editează rezervarea #${reservation?.confirmation_code ?? reservation?.id}`}
      size="lg"
    >
      <form className="reservation-modal__form" onSubmit={handleSubmit(onSubmit)}>
        {formError ? <InlineAlert type="error" message={formError} /> : null}

        <div className="reservation-modal__grid">
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerName">Client</label>
            <input
              id="reservationCustomerName"
              type="text"
              placeholder="Nume complet"
              {...register('customerName')}
            />
            {errors.customerName ? <small className="reservation-modal__error">{errors.customerName.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerPhone">Telefon</label>
            <input
              id="reservationCustomerPhone"
              type="tel"
              placeholder="07xx xxx xxx"
              {...register('customerPhone')}
            />
            {errors.customerPhone ? <small className="reservation-modal__error">{errors.customerPhone.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationCustomerEmail">Email</label>
            <input
              id="reservationCustomerEmail"
              type="email"
              placeholder='[client@emailcom]'
              {...register('customerEmail')}
            />
            {errors.customerEmail ? <small className="reservation-modal__error">{errors.customerEmail.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationDate">Data</label>
            <input id="reservationDate" type="date" {...register('reservationDate')} />
            {errors.reservationDate ? <small className="reservation-modal__error">{errors.reservationDate.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationTime">Ora</label>
            <input id="reservationTime" type="time" {...register('reservationTime')} />
            {errors.reservationTime ? <small className="reservation-modal__error">{errors.reservationTime.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationPartySize">Persoane</label>
            <input
              id="reservationPartySize"
              type="number"
              min={1}
              {...register('partySize', { valueAsNumber: true })}
            />
            {errors.partySize ? <small className="reservation-modal__error">{errors.partySize.message}</small> : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationDuration">Durată (minute)</label>
            <input
              id="reservationDuration"
              type="number"
              min={30}
              step={15}
              {...register('durationMinutes', { valueAsNumber: true })}
            />
            {errors.durationMinutes ? (
              <small className="reservation-modal__error">{errors.durationMinutes.message}</small>
            ) : null}
          </div>
          <div className="reservation-modal__field">
            <label htmlFor="reservationTable">Masă</label>
            <Controller
              name="tableId"
              control={control}
              render={({ field }) => (
                <select
                  id="reservationTable"
                  value={field.value && field.value > 0 ? field.value : ''}
                  onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                >
                  <option value="">Selectează masa</option>
                  {tableOptions.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.tableNumber} • {table.capacity} pers. {table.location ? `• ${table.location}` : ''}' '
                      {!table.isAvailable && table.id !== reservation?.table_id ? '(ocupată)' : ''}
                    </option>
                  ))}
                </select>
              )}
            />
            {tablesState.loading ? <small className="reservation-modal__hint">Se verifică disponibilitatea meselor...</small> : null}
            {tablesState.error ? <small className="reservation-modal__error">Eroare la încărcarea meselor: {tablesState.error}</small> : null}
            {errors.tableId ? <small className="reservation-modal__error">{errors.tableId.message}</small> : null}
          </div>
          <div className="reservation-modal__field reservation-modal__field--full">
            <label htmlFor="reservationSpecialRequests">Note client</label>
            <textarea
              id="reservationSpecialRequests"
              placeholder="Preferințe, alergii, cereri speciale"
              rows={3}
              {...register('specialRequests')}
            />
          </div>
          {mode === 'edit' ? (
            <div className="reservation-modal__field">
              <label htmlFor="reservationStatus">Status</label>
              <select id="reservationStatus" {...register('status')}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {mode === 'create' ? (
            <div className="reservation-modal__field reservation-modal__field--full">
              <label htmlFor="reservationNotes">Note interne</label>
              <textarea
                id="reservationNotes"
                placeholder="Instrucțiuni pentru staff, notificări către host"
                rows={2}
                {...register('notes')}
              />
            </div>
          ) : null}
        </div>

        <footer className="reservation-modal__footer">
          <button type="button" className="ghost" onClick={onClose} disabled={mutation.loading}>Anulează</button>
          <button type="submit" className="primary" disabled={mutation.loading}>
            {mutation.loading ? 'Se salvează...' : mode === 'create' ? 'Creează rezervare' : 'Salvează modificările'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}





