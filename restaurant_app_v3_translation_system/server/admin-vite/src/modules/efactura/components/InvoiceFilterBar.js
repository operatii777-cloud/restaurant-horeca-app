"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice Filter Bar Component
 *
 * Filter bar for e-Factura dashboard.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceFilterBar = InvoiceFilterBar;
var react_1 = require("react");
var efacturaStore_1 = require("../store/efacturaStore");
require("./InvoiceFilterBar.css");
function InvoiceFilterBar() {
    //   const { t } = useTranslation();
    var _a = (0, efacturaStore_1.useEFacturaStore)(), filter = _a.filter, setFilter = _a.setFilter;
    var statusOptions = [
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
    var sourceOptions = [
        { value: 'all', label: 'Toate' },
        { value: 'orders', label: 'Comenzi' },
        { value: 'tipizate', label: 'Tipizate' },
    ];
    return (<div className="invoice-filter-bar">
      <div className="filter-group">
        <label>Status:</label>
        <select value={filter.status || 'ALL'} onChange={function (e) { return setFilter({ status: e.target.value }); }}>
          {statusOptions.map(function (opt) { return (<option key={opt.value} value={opt.value}>
              {opt.label}
            </option>); })}
        </select>
      </div>

      <div className="filter-group">
        <label>"Sursă:"</label>
        <select value={filter.source || 'all'} onChange={function (e) { return setFilter({ source: e.target.value }); }}>
          {sourceOptions.map(function (opt) { return (<option key={opt.value} value={opt.value}>
              {opt.label}
            </option>); })}
        </select>
      </div>

      <div className="filter-group">
        <label>"de la"</label>
        <input type="date" value={filter.dateFrom || ''} onChange={function (e) { return setFilter({ dateFrom: e.target.value || undefined }); }}/>
      </div>

      <div className="filter-group">
        <label>"pana la"</label>
        <input type="date" value={filter.dateTo || ''} onChange={function (e) { return setFilter({ dateTo: e.target.value || undefined }); }}/>
      </div>

      <div className="filter-group">
        <label>"Căutare:"</label>
        <input type="text" placeholder="nr factura client cui" value={filter.search || ''} onChange={function (e) { return setFilter({ search: e.target.value || undefined }); }}/>
      </div>

      <button className="filter-reset-btn" onClick={function () { return setFilter({ status: 'ALL', source: 'all', dateFrom: undefined, dateTo: undefined, search: undefined }); }}>"Resetează"</button>
    </div>);
}
