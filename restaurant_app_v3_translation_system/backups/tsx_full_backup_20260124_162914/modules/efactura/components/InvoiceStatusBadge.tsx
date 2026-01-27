// ﻿import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice Status Badge Component
 * 
 * Displays invoice status with color coding.
 */

import React from 'react';
import type { EFacturaStatus } from '@/types/invoice';
import './InvoiceStatusBadge.css';

const labels: Record<EFacturaStatus, string> = {
  PENDING_GENERATION: 'În așteptare',
  GENERATED: 'Generată',
  PENDING_SUBMIT: 'În coadă ANAF',
  SUBMITTED: 'Trimisă',
  ACCEPTED: 'Acceptată',
  REJECTED: 'Respinsă',
  ERROR: 'Eroare',
  CANCELLED: 'Anulată',
};

export function InvoiceStatusBadge({ status }: { status: EFacturaStatus }) {
//   const { t } = useTranslation();
  return (
    <span className={`invoice-status-badge invoice-status-badge--${status.toLowerCase().replace(/_/g, '-')}`}>
      {labels[status]}
    </span>
  );
}



