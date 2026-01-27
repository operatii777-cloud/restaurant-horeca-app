/**
 * PHASE S11 - e-Factura Button Component
 * 
 * Button to generate e-Factura for an order (S11 Part 4).
 * Displays status badge if invoice already exists.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { efacturaApi } from '../../../core/api/efacturaApi';
import { InvoiceStatusBadge } from '../../efactura/components/InvoiceStatusBadge';
import type { EFacturaStatus } from '../../../types/invoice';
import './EFacturaButton.css';

interface EFacturaButtonProps {
  orderId: number;
  efacturaStatus?: EFacturaStatus | null;
  efacturaInvoiceId?: number | null;
  onUpdate?: () => void;
}

export function EFacturaButton({
  orderId,
  efacturaStatus,
  efacturaInvoiceId,
  onUpdate,
}: EFacturaButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const invoice = await efacturaApi.createForOrder(orderId);
      // Navigate to invoice details
      navigate(`/efactura/${invoice.id}`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la generarea e-Factura');
      console.error('[EFacturaButton] Error generating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = () => {
    if (efacturaInvoiceId) {
      navigate(`/efactura/${efacturaInvoiceId}`);
    }
  };

  // If invoice exists, show status badge
  if (efacturaStatus && efacturaInvoiceId) {
    return (
      <div className="efactura-button-container">
        <InvoiceStatusBadge status={efacturaStatus} />
        <button
          className="efactura-view-btn"
          onClick={handleViewInvoice}
          title="Vezi e-Factura"
        >
          Vezi e-Factura
        </button>
      </div>
    );
  }

  // If no invoice, show generate button
  return (
    <div className="efactura-button-container">
      <button
        className="efactura-generate-btn"
        onClick={handleGenerate}
        disabled={loading}
        title="Generează e-Factura pentru această comandă"
      >
        {loading ? '⏳ Se generează...' : '📄 Generează e-Factura'}
      </button>
      {error && (
        <div className="efactura-error">
          {error}
        </div>
      )}
    </div>
  );
}

