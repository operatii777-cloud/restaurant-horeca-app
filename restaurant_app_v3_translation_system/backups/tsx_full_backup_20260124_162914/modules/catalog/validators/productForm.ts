// import { useTranslation } from '@/i18n/I18nContext';
import { z } from 'zod';

const parseNumber = (value: unknown) => {
  if (value === null || value === undefined) {
    return NaN;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return NaN;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? NaN : parsed;
  }
  return NaN;
};

const numericRequired = (message: string) =>
  z.preprocess(
    (value) => parseNumber(value),
    z.number({ invalid_type_error: message, required_error: message }),
  );

const numericOptional = () =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          return undefined;
        }
      }
      const parsed = parseNumber(value);
      return Number.isNaN(parsed) ? NaN : parsed;
    },
    z
      .number({
        invalid_type_error: 'Introduceți un număr valid.',
      })
      .optional(),
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

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Numele produsului este obligatoriu'),
    name_en: emptyToUndefined,
    category: z.string().trim().min(1, 'Categoria este obligatorie'),
    price: numericRequired('Prețul trebuie completat și să fie un număr.').refine((value) => value >= 0, {
      message: 'Prețul nu poate fi negativ',
    }),
    vat_rate: numericRequired('TVA-ul este obligatoriu.')
      .refine((value) => value >= 0, { message: 'TVA-ul nu poate fi negativ' })
      .refine((value) => value <= 100, { message: 'TVA-ul nu poate depăși 100%' }),
    unit: z.string().trim().min(1, 'Unitatea de măsură este obligatorie'),
    preparation_section: z.string().trim().optional(),
    preparation_section_custom: emptyToUndefined,
    stock_management: z.enum(['fifo', 'none'], { errorMap: () => ({ message: 'Selectează tipul de gestionare a stocului.' }) }),
    display_order: numericOptional()
      .refine((value) => value === undefined || Number.isInteger(value), {
        message: 'Ordinea în meniu trebuie să fie un număr întreg.',
      })
      .nullable()
      .optional(),
    for_sale: z.boolean(),
    has_recipe: z.boolean(),
    description: emptyToUndefined,
    description_en: emptyToUndefined,
  })
  .superRefine((values, ctx) => {
    if (values.preparation_section === '__custom__' && !values.preparation_section_custom) {
      ctx.addIssue({
        path: ['preparation_section_custom'],
        code: z.ZodIssueCode.custom,
        message: 'Introduceți denumirea secțiunii personalizate.',
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;


