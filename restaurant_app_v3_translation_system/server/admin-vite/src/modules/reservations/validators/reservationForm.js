"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationFormSchema = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var zod_1 = require("zod");
var STATUS_OPTIONS = ["Pending:", 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
var positiveNumber = function (message) {
    return zod_1.z.preprocess(function (value) {
        if (value === '' || value === null || value === undefined) {
            return NaN;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            var parsed = Number(value);
            return Number.isNaN(parsed) ? NaN : parsed;
        }
        return NaN;
    }, zod_1.z.number({ invalid_type_error: message, required_error: message }).min(1, message));
};
exports.reservationFormSchema = zod_1.z.object({
    customerName: zod_1.z.string().trim().min(1, 'Numele clientului este obligatoriu'),
    customerPhone: zod_1.z.string().trim().min(1, 'Numărul de telefon este obligatoriu'),
    customerEmail: zod_1.z
        .string()
        .trim()
        .optional()
        .transform(function (value) { return (value && value.length > 0 ? value : undefined); })
        .refine(function (value) { return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }, {
        message: 'Introduceți o adresă de email validă',
    }),
    reservationDate: zod_1.z.string().min(1, 'Data rezervării este obligatorie'),
    reservationTime: zod_1.z.string().min(1, 'Ora rezervării este obligatorie'),
    durationMinutes: positiveNumber('Durata trebuie să fie un număr pozitiv'),
    partySize: positiveNumber('Numărul de persoane trebuie să fie mai mare ca 0'),
    tableId: positiveNumber('Selectați o masă disponibilă'),
    specialRequests: zod_1.z
        .string()
        .optional()
        .transform(function (value) { return (value && value.trim().length > 0 ? value.trim() : undefined); }),
    status: zod_1.z.enum(STATUS_OPTIONS),
    notes: zod_1.z
        .string()
        .optional()
        .transform(function (value) { return (value && value.trim().length > 0 ? value.trim() : undefined); }),
});
