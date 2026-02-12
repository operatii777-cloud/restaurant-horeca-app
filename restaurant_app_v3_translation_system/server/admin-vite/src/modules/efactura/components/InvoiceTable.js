"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice Table Component
 *
 * Table displaying list of invoices.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceTable = InvoiceTable;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var InvoiceStatusBadge_1 = require("./InvoiceStatusBadge");
require("./InvoiceTable.css");
function InvoiceTable(_a) {
    var invoices = _a.invoices, total = _a.total, loading = _a.loading;
    //   const { t } = useTranslation();
    var navigate = (0, react_router_dom_1.useNavigate)();
    if (loading) {
        return (<div className="invoice-table-loading">
        <p>"se incarca facturile"</p>
      </div>);
    }
    if (invoices.length === 0) {
        return (<div className="invoice-table-empty">
        <p>"nu exista facturi care sa corespunda filtrelor"</p>
      </div>);
    }
    return (<div className="invoice-table-container">
      <div className="invoice-table-header">
        <p>Total: {total} facturi</p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>"nr factura"</th>
            <th>Client</th>
            <th>Suma</th>
            <th>Status</th>
            <th>Data</th>
            <th>Sursă</th>
            <th>"Acțiuni"</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(function (invoice) { return (<tr key={invoice.id} onClick={function () { return navigate("/efactura/".concat(invoice.id)); }}>
              <td className="invoice-number">{invoice.invoiceNumber}</td>
              <td>{invoice.customerName}</td>
              <td className="invoice-amount">
                {invoice.totalAmount.toFixed(2)} {invoice.currency}
              </td>
              <td>
                <InvoiceStatusBadge_1.InvoiceStatusBadge status={invoice.status}/>
              </td>
              <td>{new Date(invoice.createdAt).toLocaleDateString('ro-RO')}</td>
              <td>
                {invoice.orderId ? (<span className="invoice-source-badge invoice-source-orders">
                    Comandă #{invoice.orderId}
                  </span>) : invoice.tipizateId ? (<span className="invoice-source-badge invoice-source-tipizate">
                    {invoice.tipizateType} #{invoice.tipizateId}
                  </span>) : (<span>-</span>)}
              </td>
              <td>
                <button className="invoice-view-btn" onClick={function (e) {
                e.stopPropagation();
                navigate("/efactura/".concat(invoice.id));
            }}>
                  Vezi Detalii
                </button>
              </td>
            </tr>); })}
        </tbody>
      </table>
    </div>);
}
