"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFormSchema = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var zod_1 = require("zod");
var parseNumber = function (value) {
    if (value === null || value === undefined) {
        return NaN;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (trimmed === '') {
            return NaN;
        }
        var parsed = Number(trimmed);
        return Number.isNaN(parsed) ? NaN : parsed;
    }
    return NaN;
};
var numericRequired = function (message) {
    return zod_1.z.preprocess(function (value) { return parseNumber(value); }, zod_1.z.number({ invalid_type_error: message, required_error: message }));
};
var numericOptional = function () {
    return zod_1.z.preprocess(function (value) {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === 'string') {
            var trimmed = value.trim();
            if (trimmed === '') {
                return undefined;
            }
        }
        var parsed = parseNumber(value);
        return Number.isNaN(parsed) ? NaN : parsed;
    }, zod_1.z
        .number({
        invalid_type_error: 'Introduceți un număr valid.',
    })
        .optional());
};
var emptyToUndefined = zod_1.z
    .string()
    .optional()
    .transform(function (value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    var trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
});
exports.productFormSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, 'Numele produsului este obligatoriu'),
    name_en: emptyToUndefined,
    category: zod_1.z.string().trim().min(1, 'Categoria este obligatorie'),
    price: numericRequired('Prețul trebuie completat și să fie un număr.').refine(function (value) { return value >= 0; }, {
        message: 'Prețul nu poate fi negativ',
    }),
    vat_rate: numericRequired('TVA-ul este obligatoriu.')
        .refine(function (value) { return value >= 0; }, { message: 'TVA-ul nu poate fi negativ' })
        .refine(function (value) { return value <= 100; }, { message: 'TVA-ul nu poate depăși 100%' }),
    unit: zod_1.z.string().trim().min(1, 'Unitatea de măsură este obligatorie'),
    preparation_section: zod_1.z.string().trim().optional(),
    preparation_section_custom: emptyToUndefined,
    stock_management: zod_1.z.enum(['fifo', 'none'], { errorMap: function () { return ({ message: 'Selectează tipul de gestionare a stocului.' }); } }),
    display_order: numericOptional()
        .refine(function (value) { return value === undefined || Number.isInteger(value); }, {
        message: 'Ordinea în meniu trebuie să fie un număr întreg.',
    })
        .nullable()
        .optional(),
    for_sale: zod_1.z.boolean(),
    has_recipe: zod_1.z.boolean(),
    description: emptyToUndefined,
    description_en: emptyToUndefined,
})
    .superRefine(function (values, ctx) {
    if (values.preparation_section === '__custom__' && !values.preparation_section_custom) {
        ctx.addIssue({
            path: ['preparation_section_custom'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Introduceți denumirea secțiunii personalizate.',
        });
    }
});
