/**
 * PHASE S11 - Invoice Filter Bar Component
 * 
 * Filter bar for e-Factura dashboard.
 */

import React from 'react';
import { useEFacturaStore } from '../store/efacturaStore';
import type { EFacturaStatus } from '../../../types/invoice';
import './InvoiceFilterBar.css';

export function InvoiceFilterBar() {
  const { filter, setFilter } = useEFacturaStore();

  const statusOptions: Array<{ value: EFacturaStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Toate' },
    { value: 'PENDING_GENERATION', label: 'În așteptare' },
    { value: 'GENERATED', label: 'Generată' },
    { value: 'PENDING_SUBMIT', label: 'În coadă ANAF' },
    { value: 'SUBMITTED', label: 'Trimisă' },
    { value: 'ACCEPTED', label: 'Acceptată' },
    { value: 'REJECTED', label: 'Respinsă' },
    { value: 'ERROR', label: 'Eroare' },
    { value: 'CANCELLED', label: 'Anulată' },
  ];

  const sourceOptions = [
    { value: 'all', label: 'Toate' },
    { value: 'orders', label: 'Comenzi' },
    { value: 'tipizate', label: 'Tipizate' },
  ];

  return (
    <div className="invoice-filter-bar">
      <div className="filter-group">
        <label>Status:</label>
        <select
          value={filter.status || 'ALL'}
          onChange={(e) => setFilter({ status: e.target.value as any })}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Sursă:</label>
        <select
          value={filter.source || 'all'}
          onChange={(e) => setFilter({ source: e.target.value as any })}
        >
          {sourceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>De la:</label>
        <input
          type="date"
          value={filter.dateFrom || ''}
          onChange={(e) => setFilter({ dateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="filter-group">
        <label>Până la:</label>
        <input
          type="date"
          value={filter.dateTo || ''}
          onChange={(e) => setFilter({ dateTo: e.target.value || undefined })}
        />
      </div>

      <div className="filter-group">
        <label>Căutare:</label>
        <input
          type="text"
          placeholder="Nr. factură, client, CUI..."
          value={filter.search || ''}
          onChange={(e) => setFilter({ search: e.target.value || undefined })}
        />
      </div>

      <button
        className="filter-reset-btn"
        onClick={() => setFilter({ status: 'ALL', source: 'all', dateFrom: undefined, dateTo: undefined, search: undefined })}
      >
        Resetează
      </button>
    </div>
  );
}

