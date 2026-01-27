// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Dashboard Page
 * 
 * Main dashboard for e-Factura management (S11 Part 1 + Part 5).
 * Displays invoice list, filters, and statistics.
 */

import React from 'react';
import { useEFacturaList } from '../hooks/useEFacturaList';
import { useEFacturaStore } from '../store/efacturaStore';
import { InvoiceFilterBar } from '../components/InvoiceFilterBar';
import { InvoiceTable } from '../components/InvoiceTable';
import { EFacturaStatsCards } from '../components/EFacturaStatsCards';
import { EFacturaCharts } from '../components/EFacturaCharts';
import './EFacturaDashboardPage.css';

/**
 * e-Factura Dashboard Page Component
 */
export function EFacturaDashboardPage() {
//   const { t } = useTranslation();
  const { list, total } = useEFacturaList();
  const loading = useEFacturaStore((s) => s.loading);
  const { page, pageSize, setPage } = useEFacturaStore();

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="efactura-dashboard">
      <header className="efactura-page-header">
        <h1 className="efactura-page-title">e-Factura ANAF</h1>
        <p className="efactura-page-subtitle">"gestionare facturi electronice si trimiteri catre "</p>
      </header>

      {/* S11 Part 5 - Statistics Cards */}
      <EFacturaStatsCards />

      {/* S11 Part 5 - Charts */}
      <EFacturaCharts />

      {/* S11 Part 1 - Filters */}
      <InvoiceFilterBar />

      {/* S11 Part 1 - Invoice Table */}
      <InvoiceTable invoices={list} total={total} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="efactura-pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Pagina {page} din {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Următor →
          </button>
        </div>
      )}
    </div>
  );
}




