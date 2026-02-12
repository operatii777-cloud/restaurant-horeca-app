"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Dashboard Page
 *
 * Main dashboard for e-Factura management (S11 Part 1 + Part 5).
 * Displays invoice list, filters, and statistics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFacturaDashboardPage = EFacturaDashboardPage;
var react_1 = require("react");
var useEFacturaList_1 = require("../hooks/useEFacturaList");
var efacturaStore_1 = require("../store/efacturaStore");
var InvoiceFilterBar_1 = require("../components/InvoiceFilterBar");
var InvoiceTable_1 = require("../components/InvoiceTable");
var EFacturaStatsCards_1 = require("../components/EFacturaStatsCards");
var EFacturaCharts_1 = require("../components/EFacturaCharts");
require("./EFacturaDashboardPage.css");
/**
 * e-Factura Dashboard Page Component
 */
function EFacturaDashboardPage() {
    //   const { t } = useTranslation();
    var _a = (0, useEFacturaList_1.useEFacturaList)(), list = _a.list, total = _a.total;
    var loading = (0, efacturaStore_1.useEFacturaStore)(function (s) { return s.loading; });
    var _b = (0, efacturaStore_1.useEFacturaStore)(), page = _b.page, pageSize = _b.pageSize, setPage = _b.setPage;
    var totalPages = Math.ceil(total / pageSize);
    return (<div className="efactura-dashboard">
      <header className="efactura-page-header">
        <h1 className="efactura-page-title">e-Factura ANAF</h1>
        <p className="efactura-page-subtitle">"gestionare facturi electronice si trimiteri catre "</p>
      </header>

      {/* S11 Part 5 - Statistics Cards */}
      <EFacturaStatsCards_1.EFacturaStatsCards />

      {/* S11 Part 5 - Charts */}
      <EFacturaCharts_1.EFacturaCharts />

      {/* S11 Part 1 - Filters */}
      <InvoiceFilterBar_1.InvoiceFilterBar />

      {/* S11 Part 1 - Invoice Table */}
      <InvoiceTable_1.InvoiceTable invoices={list} total={total} loading={loading}/>

      {/* Pagination */}
      {totalPages > 1 && (<div className="efactura-pagination">
          <button onClick={function () { return setPage(Math.max(1, page - 1)); }} disabled={page === 1} className="pagination-btn">
            ← Anterior
          </button>
          <span className="pagination-info">
            Pagina {page} din {totalPages}
          </span>
          <button onClick={function () { return setPage(Math.min(totalPages, page + 1)); }} disabled={page === totalPages} className="pagination-btn">
            Următor →
          </button>
        </div>)}
    </div>);
}
