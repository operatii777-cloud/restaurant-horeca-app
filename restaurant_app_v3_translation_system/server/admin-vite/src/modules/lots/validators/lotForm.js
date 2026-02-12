"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lotFormSchema = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var zod_1 = require("zod");
var numericOptional = function (message) {
    return zod_1.z.preprocess(function (value) {
        if (value === '' || value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === 'string') {
            var trimmed = value.trim();
            if (trimmed === '') {
                return undefined;
            }
            var parsed = Number(trimmed);
            return Number.isNaN(parsed) ? NaN : parsed;
        }
        if (typeof value === 'number') {
            return value;
        }
        return NaN;
    }, zod_1.z
        .number({
        invalid_type_error: message,
        required_error: message,
    })
        .nonnegative(message));
};
var numericRequired = function (message) {
    return zod_1.z.preprocess(function (value) {
        if (typeof value === 'string') {
            var trimmed = value.trim();
            if (trimmed === '') {
                return NaN;
            }
            var parsed = Number(trimmed);
            return Number.isNaN(parsed) ? NaN : parsed;
        }
        if (typeof value === 'number') {
            return value;
        }
        return NaN;
    }, zod_1.z.number({ invalid_type_error: message, required_error: message }));
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
var emptyToNull = zod_1.z
    .string()
    .optional()
    .transform(function (value) {
    if (value === undefined || value === null) {
        return null;
    }
    var trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
});
exports.lotFormSchema = zod_1.z.object({
    batch_number: zod_1.z.string().trim().min(1, 'Numărul lotului este obligatoriu'),
    barcode: emptyToUndefined,
    quantity: numericRequired('Cantitatea recepționată trebuie completată').refine(function (value) { return value > 0; }, {
        message: 'Cantitatea trebuie să fie mai mare decât 0',
    }),
    unit_cost: numericOptional('Costul trebuie să fie o valoare numerică pozitivă').optional(),
    purchase_date: zod_1.z.string().min(1, 'Data recepției este obligatorie'),
    expiry_date: emptyToNull,
    supplier: emptyToUndefined,
    invoice_number: emptyToUndefined,
});
