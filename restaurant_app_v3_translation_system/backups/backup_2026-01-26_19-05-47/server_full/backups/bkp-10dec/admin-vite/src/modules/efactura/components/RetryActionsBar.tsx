/**
 * PHASE S11 - Retry Actions Bar Component
 * 
 * Action buttons for retry, cancel, and refresh (S11 Part 3).
 */

import React, { useState } from 'react';
import { efacturaApi } from '../../../core/api/efacturaApi';
import type { EFacturaInvoice } from '../../../types/invoice';
import './RetryActionsBar.css';

interface RetryActionsBarProps {
  invoice: EFacturaInvoice;
  onUpdate: (inv: EFacturaInvoice) => void;
}

export function RetryActionsBar({ invoice, onUpdate }: RetryActionsBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      await efacturaApi.retryInvoice(invoice.id);
      const updated = await efacturaApi.refreshStatus(invoice.id);
      onUpdate(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la retry');
      console.error('[RetryActionsBar] Error retrying invoice:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Sigur vrei să anulezi această factură?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await efacturaApi.cancelInvoice(invoice.id);
      const updated = await efacturaApi.refreshStatus(invoice.id);
      onUpdate(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la anulare');
      console.error('[RetryActionsBar] Error cancelling invoice:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const updated = await efacturaApi.refreshStatus(invoice.id);
      onUpdate(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la reîncărcare');
      console.error('[RetryActionsBar] Error refreshing invoice:', err);
    } finally {
      setLoading(false);
    }
  }

  const canRetry = ['ERROR', 'REJECTED', 'PENDING_SUBMIT'].includes(invoice.status);
  const canCancel = ['GENERATED', 'PENDING_SUBMIT', 'SUBMITTED'].includes(invoice.status);

  return (
    <div className="retry-actions-bar">
      {error && (
        <div className="retry-error">
          <strong>Eroare:</strong> {error}
        </div>
      )}

      <div className="retry-actions">
        {canRetry && (
          <button
            className="retry-btn retry-btn--retry"
            onClick={handleRetry}
            disabled={loading}
          >
            {loading ? '⏳ Se procesează...' : '🔄 Retry e-Factura'}
          </button>
        )}

        {canCancel && (
          <button
            className="retry-btn retry-btn--cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? '⏳ Se procesează...' : '❌ Anulează'}
          </button>
        )}

        <button
          className="retry-btn retry-btn--refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '⏳ Se reîncarcă...' : '🔄 Reîncarcă Status'}
        </button>
      </div>
    </div>
  );
}

