import { z } from 'zod';

const numericOptional = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          return undefined;
        }
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? NaN : parsed;
      }
      if (typeof value === 'number') {
        return value;
      }
      return NaN;
    },
    z
      .number({
        invalid_type_error: message,
        required_error: message,
      })
      .nonnegative(message),
  );

const numericRequired = (message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          return NaN;
        }
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? NaN : parsed;
      }
      if (typeof value === 'number') {
        return value;
      }
      return NaN;
    },
    z.number({ invalid_type_error: message, required_error: message }),
  );

const emptyToUndefined = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

const emptyToNull = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

export const lotFormSchema = z.object({
  batch_number: z.string().trim().min(1, 'Numărul lotului este obligatoriu'),
  barcode: emptyToUndefined,
  quantity: numericRequired('Cantitatea recepționată trebuie completată').refine((value) => value > 0, {
    message: 'Cantitatea trebuie să fie mai mare decât 0',
  }),
  unit_cost: numericOptional('Costul trebuie să fie o valoare numerică pozitivă').optional(),
  purchase_date: z.string().min(1, 'Data recepției este obligatorie'),
  expiry_date: emptyToNull,
  supplier: emptyToUndefined,
  invoice_number: emptyToUndefined,
});

export type LotFormValues = z.infer<typeof lotFormSchema>;


