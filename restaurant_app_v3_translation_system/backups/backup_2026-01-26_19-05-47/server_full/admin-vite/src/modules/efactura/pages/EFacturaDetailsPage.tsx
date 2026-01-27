// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Details Page
 * 
 * Invoice details page with XML viewer, logs, and retry actions (S11 Part 2 + Part 3).
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEFacturaDetails } from '../hooks/useEFacturaDetails';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { InvoiceStatusTimeline } from '../components/InvoiceStatusTimeline';
import { InvoiceXmlViewer } from '../components/InvoiceXmlViewer';
import { InvoiceLogsPanel } from '../components/InvoiceLogsPanel';
import { RetryActionsBar } from '../components/RetryActionsBar';
import './EFacturaDetailsPage.css';

/**
 * e-Factura Details Page Component
 */
export function EFacturaDetailsPage() {
//   const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { invoice, xml, loading, setInvoice } = useEFacturaDetails(id);

  if (loading) {
    return (
      <div className="efactura-details-loading">
        <p>"se incarca factura"</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="efactura-details-error">
        <p>"factura nu a fost gasita"</p>
        <button onClick={() => navigate('/efactura')}>"inapoi la lista"</button>
      </div>
    );
  }

  return (
    <div className="efactura-details">
      <header className="efactura-details-header">
        <div>
          <h1 className="efactura-details-title">Factura #{invoice.invoiceNumber}</h1>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <button className="efactura-back-btn" onClick={() => navigate('/efactura')}>
          ← Înapoi la listă
        </button>
      </header>

      <section className="efactura-summary">
        <div className="summary-item">
          <label>Client:</label>
          <span>{invoice.customerName}</span>
        </div>
        {invoice.customerVatId && (
          <div className="summary-item">
            <label>"CUI:"</label>
            <span>{invoice.customerVatId}</span>
          </div>
        )}
        <div className="summary-item">
          <label>Suma:</label>
          <span className="summary-amount">
            {invoice.totalAmount.toFixed(2)} {invoice.currency}
          </span>
        </div>
        {invoice.orderId && (
          <div className="summary-item">
            <label>"Comandă:"</label>
            <span>#{invoice.orderId}</span>
          </div>
        )}
        {invoice.tipizateId && (
          <div className="summary-item">
            <label>Tipizat:</label>
            <span>{invoice.tipizateType} #{invoice.tipizateId}</span>
          </div>
        )}
        <div className="summary-item">
          <label>"data crearii"</label>
          <span>{new Date(invoice.createdAt).toLocaleString('ro-RO')}</span>
        </div>
      </section>

      {/* S11 Part 3 - Retry Actions */}
      <RetryActionsBar invoice={invoice} onUpdate={setInvoice} />

      {/* S11 Part 2 - Status Timeline */}
      <InvoiceStatusTimeline invoice={invoice} />

      {/* S11 Part 2 - XML Viewer & Logs */}
      <div className="efactura-details-layout">
        <InvoiceXmlViewer xml={xml || ''} invoiceId={invoice.id} />
        <InvoiceLogsPanel invoiceId={invoice.id} />
      </div>
    </div>
  );
}




