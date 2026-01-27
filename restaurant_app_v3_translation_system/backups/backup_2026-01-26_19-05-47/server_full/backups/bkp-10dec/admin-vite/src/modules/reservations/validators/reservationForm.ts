import { z } from 'zod';

const STATUS_OPTIONS = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'] as const;

const positiveNumber = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? NaN : parsed;
      }
      return NaN;
    },
    z.number({ invalid_type_error: message, required_error: message }).min(1, message),
  );

export const reservationFormSchema = z.object({
  customerName: z.string().trim().min(1, 'Numele clientului este obligatoriu'),
  customerPhone: z.string().trim().min(1, 'Numărul de telefon este obligatoriu'),
  customerEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: 'Introduceți o adresă de email validă',
    }),
  reservationDate: z.string().min(1, 'Data rezervării este obligatorie'),
  reservationTime: z.string().min(1, 'Ora rezervării este obligatorie'),
  durationMinutes: positiveNumber('Durata trebuie să fie un număr pozitiv'),
  partySize: positiveNumber('Numărul de persoane trebuie să fie mai mare ca 0'),
  tableId: positiveNumber('Selectați o masă disponibilă'),
  specialRequests: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  status: z.enum(STATUS_OPTIONS),
  notes: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;


