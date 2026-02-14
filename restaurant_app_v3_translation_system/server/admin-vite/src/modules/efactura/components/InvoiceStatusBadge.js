"use strict";
// ﻿import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice Status Badge Component
 *
 * Displays invoice status with color coding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStatusBadge = InvoiceStatusBadge;
var react_1 = require("react");
require("./InvoiceStatusBadge.css");
var labels = {
    PENDING_GENERATION: 'În așteptare',
    GENERATED: 'Generată',
    PENDING_SUBMIT: 'În coadă ANAF',
    SUBMITTED: 'Trimisă',
    ACCEPTED: 'Acceptată',
    REJECTED: 'Respinsă',
    ERROR: 'Eroare',
    CANCELLED: 'Anulată',
};
function InvoiceStatusBadge(_a) {
    var status = _a.status;
    //   const { t } = useTranslation();
    return (<span className={"invoice-status-badge invoice-status-badge--".concat(status.toLowerCase().replace(/_/g, '-'))}>
      {labels[status]}
    </span>);
}
