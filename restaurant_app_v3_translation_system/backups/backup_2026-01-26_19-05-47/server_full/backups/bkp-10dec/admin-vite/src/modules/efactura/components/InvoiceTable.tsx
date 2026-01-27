/**
 * PHASE S11 - Invoice Table Component
 * 
 * Table displaying list of invoices.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EFacturaInvoice } from '../../../types/invoice';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import './InvoiceTable.css';

interface InvoiceTableProps {
  invoices: EFacturaInvoice[];
  total: number;
  loading: boolean;
}

export function InvoiceTable({ invoices, total, loading }: InvoiceTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="invoice-table-loading">
        <p>Se încarcă facturile...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="invoice-table-empty">
        <p>Nu există facturi care să corespundă filtrelor</p>
      </div>
    );
  }

  return (
    <div className="invoice-table-container">
      <div className="invoice-table-header">
        <p>Total: {total} facturi</p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Nr. Factură</th>
            <th>Client</th>
            <th>Suma</th>
            <th>Status</th>
            <th>Data</th>
            <th>Sursă</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} onClick={() => navigate(`/efactura/${invoice.id}`)}>
              <td className="invoice-number">{invoice.invoiceNumber}</td>
              <td>{invoice.customerName}</td>
              <td className="invoice-amount">
                {invoice.totalAmount.toFixed(2)} {invoice.currency}
              </td>
              <td>
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td>{new Date(invoice.createdAt).toLocaleDateString('ro-RO')}</td>
              <td>
                {invoice.orderId ? (
                  <span className="invoice-source-badge invoice-source-orders">
                    Comandă #{invoice.orderId}
                  </span>
                ) : invoice.tipizateId ? (
                  <span className="invoice-source-badge invoice-source-tipizate">
                    {invoice.tipizateType} #{invoice.tipizateId}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </td>
              <td>
                <button
                  className="invoice-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/efactura/${invoice.id}`);
                  }}
                >
                  Vezi Detalii
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

