/**
 * PHASE S11 - Invoice Status Timeline Component
 * 
 * Timeline showing invoice status progression.
 */

import React from 'react';
import type { EFacturaInvoice } from '../../../types/invoice';
import './InvoiceStatusTimeline.css';

export function InvoiceStatusTimeline({ invoice }: { invoice: EFacturaInvoice }) {
  const steps = [
    {
      label: 'Generată',
      date: invoice.createdAt,
      active: ['GENERATED', 'PENDING_SUBMIT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'ERROR'].includes(invoice.status),
      completed: ['PENDING_SUBMIT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'ERROR'].includes(invoice.status),
    },
    {
      label: 'Trimisă la ANAF',
      date: invoice.submittedAt,
      active: ['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(invoice.status),
      completed: ['ACCEPTED', 'REJECTED'].includes(invoice.status),
    },
    {
      label: invoice.status === 'ACCEPTED' ? 'Acceptată' : invoice.status === 'REJECTED' ? 'Respinsă' : 'Finalizată',
      date: invoice.acceptedAt || invoice.rejectedAt,
      active: ['ACCEPTED', 'REJECTED'].includes(invoice.status),
      completed: ['ACCEPTED', 'REJECTED'].includes(invoice.status),
    },
  ];

  return (
    <div className="invoice-status-timeline">
      <h3 className="timeline-title">Status Timeline</h3>
      <div className="timeline-steps">
        {steps.map((step, idx) => (
          <div key={idx} className={`timeline-step ${step.completed ? 'completed' : step.active ? 'active' : 'pending'}`}>
            <div className="timeline-step-marker">
              {step.completed ? '✓' : step.active ? '●' : '○'}
            </div>
            <div className="timeline-step-content">
              <div className="timeline-step-label">{step.label}</div>
              {step.date && (
                <div className="timeline-step-date">
                  {new Date(step.date).toLocaleString('ro-RO')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {invoice.anafMessage && (
        <div className="timeline-message">
          <strong>Mesaj ANAF:</strong> {invoice.anafMessage}
        </div>
      )}
    </div>
  );
}

