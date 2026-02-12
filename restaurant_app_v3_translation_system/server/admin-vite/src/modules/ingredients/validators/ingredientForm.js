"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientFormSchema = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var zod_1 = require("zod");
var parseNumber = function (value) {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (trimmed === '') {
            return 0;
        }
        var parsed = Number(trimmed);
        return Number.isNaN(parsed) ? NaN : parsed;
    }
    return NaN;
};
var numericOptional = function () {
    return zod_1.z.preprocess(function (value) {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === 'string' && value.trim() === '') {
            return undefined;
        }
        var parsed = parseNumber(value);
        return Number.isNaN(parsed) ? NaN : parsed;
    }, zod_1.z.number({ invalid_type_error: 'Introduceți o valoare numerică.' }).optional());
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
exports.ingredientFormSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Numele ingredientului este obligatoriu'),
    official_name: emptyToUndefined,
    category: zod_1.z.string().trim().min(1, 'Categoria este obligatorie'),
    category_custom: emptyToUndefined,
    unit: zod_1.z.string().trim().min(1, 'Unitatea de măsură este obligatorie'),
    unit_custom: emptyToUndefined,
    current_stock: numericOptional(),
    min_stock: numericOptional(),
    max_stock: numericOptional(), // ✅ SĂPTĂMÂNA 1 - ZIUA 4
    safety_stock: numericOptional(), // ✅ SĂPTĂMÂNA 1 - ZIUA 4
    reorder_quantity: numericOptional(), // ✅ SĂPTĂMÂNA 1 - ZIUA 4
    purchase_unit: emptyToUndefined, // ✅ SĂPTĂMÂNA 2 - ZIUA 4
    recipe_unit: emptyToUndefined, // ✅ SĂPTĂMÂNA 2 - ZIUA 4
    inventory_unit: emptyToUndefined, // ✅ SĂPTĂMÂNA 2 - ZIUA 4
    purchase_to_inventory_factor: numericOptional(), // ✅ SĂPTĂMÂNA 2 - ZIUA 4
    inventory_to_recipe_factor: numericOptional(), // ✅ SĂPTĂMÂNA 2 - ZIUA 4
    cost_per_unit: numericOptional(),
    origin_country: emptyToUndefined,
    default_supplier_id: zod_1.z
        .union([
        zod_1.z
            .preprocess(function (value) {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            if (value === '__custom__') {
                return '__custom__';
            }
            var parsed = Number(value);
            return Number.isNaN(parsed) ? NaN : parsed;
        }, zod_1.z.number().nullable())
            .nullable(),
        zod_1.z.literal('__custom__'),
    ])
        .optional(),
    default_supplier_id_custom: emptyToUndefined,
    haccp_notes: emptyToUndefined,
    is_visible: zod_1.z.boolean(),
}).superRefine(function (values, ctx) {
    if (values.category === '__custom__' && !values.category_custom) {
        ctx.addIssue({
            path: ['category_custom'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Introduceți denumirea categoriei personalizate.',
        });
    }
    if (values.unit === '__custom__' && !values.unit_custom) {
        ctx.addIssue({
            path: ['unit_custom'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Introduceți unitatea de măsură personalizată.',
        });
    }
    if (values.default_supplier_id === '__custom__' && !values.default_supplier_id_custom) {
        ctx.addIssue({
            path: ['default_supplier_id_custom'],
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Introduceți numele furnizorului nou.',
        });
    }
});
