// import { useTranslation } from '@/i18n/I18nContext';
import { z } from 'zod';

const parseNumber = (value: unknown) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return 0;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? NaN : parsed;
  }
  return NaN;
};

const numericOptional = () =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      const parsed = parseNumber(value);
      return Number.isNaN(parsed) ? NaN : parsed;
    },
    z.number({ invalid_type_error: 'Introduceți o valoare numerică.' }).optional(),
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

export const ingredientFormSchema = z.object({
  name: z.string().trim().min(1, 'Numele ingredientului este obligatoriu'),
  official_name: emptyToUndefined,
  category: z.string().trim().min(1, 'Categoria este obligatorie'),
  category_custom: emptyToUndefined,
  unit: z.string().trim().min(1, 'Unitatea de măsură este obligatorie'),
  unit_custom: emptyToUndefined,
  current_stock: numericOptional(),
  min_stock: numericOptional(),
  max_stock: numericOptional(),  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  safety_stock: numericOptional(),  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  reorder_quantity: numericOptional(),  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  purchase_unit: emptyToUndefined,  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  recipe_unit: emptyToUndefined,  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  inventory_unit: emptyToUndefined,  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  purchase_to_inventory_factor: numericOptional(),  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  inventory_to_recipe_factor: numericOptional(),  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  cost_per_unit: numericOptional(),
  origin_country: emptyToUndefined,
  default_supplier_id: z
    .union([
      z
        .preprocess(
          (value) => {
            if (value === null || value === undefined || value === '') {
              return null;
            }
            if (value === '__custom__') {
              return '__custom__';
            }
            const parsed = Number(value);
            return Number.isNaN(parsed) ? NaN : parsed;
          },
          z.number().nullable(),
        )
        .nullable(),
      z.literal('__custom__'),
    ])
    .optional(),
  default_supplier_id_custom: emptyToUndefined,
  haccp_notes: emptyToUndefined,
  is_visible: z.boolean(),
}).superRefine((values, ctx) => {
  if (values.category === '__custom__' && !values.category_custom) {
    ctx.addIssue({
      path: ['category_custom'],
      code: z.ZodIssueCode.custom,
      message: 'Introduceți denumirea categoriei personalizate.',
    });
  }

  if (values.unit === '__custom__' && !values.unit_custom) {
    ctx.addIssue({
      path: ['unit_custom'],
      code: z.ZodIssueCode.custom,
      message: 'Introduceți unitatea de măsură personalizată.',
    });
  }

  if (values.default_supplier_id === '__custom__' && !values.default_supplier_id_custom) {
    ctx.addIssue({
      path: ['default_supplier_id_custom'],
      code: z.ZodIssueCode.custom,
      message: 'Introduceți numele furnizorului nou.',
    });
  }
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;


