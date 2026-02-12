"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Details Page
 *
 * Invoice details page with XML viewer, logs, and retry actions (S11 Part 2 + Part 3).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFacturaDetailsPage = EFacturaDetailsPage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useEFacturaDetails_1 = require("../hooks/useEFacturaDetails");
var InvoiceStatusBadge_1 = require("../components/InvoiceStatusBadge");
var InvoiceStatusTimeline_1 = require("../components/InvoiceStatusTimeline");
var InvoiceXmlViewer_1 = require("../components/InvoiceXmlViewer");
var InvoiceLogsPanel_1 = require("../components/InvoiceLogsPanel");
var RetryActionsBar_1 = require("../components/RetryActionsBar");
require("./EFacturaDetailsPage.css");
/**
 * e-Factura Details Page Component
 */
function EFacturaDetailsPage() {
    //   const { t } = useTranslation();
    var params = (0, react_router_dom_1.useParams)();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var id = Number(params.id);
    var _a = (0, useEFacturaDetails_1.useEFacturaDetails)(id), invoice = _a.invoice, xml = _a.xml, loading = _a.loading, setInvoice = _a.setInvoice;
    if (loading) {
        return (<div className="efactura-details-loading">
        <p>"se incarca factura"</p>
      </div>);
    }
    if (!invoice) {
        return (<div className="efactura-details-error">
        <p>"factura nu a fost gasita"</p>
        <button onClick={function () { return navigate('/efactura'); }}>"inapoi la lista"</button>
      </div>);
    }
    return (<div className="efactura-details">
      <header className="efactura-details-header">
        <div>
          <h1 className="efactura-details-title">Factura #{invoice.invoiceNumber}</h1>
          <InvoiceStatusBadge_1.InvoiceStatusBadge status={invoice.status}/>
        </div>
        <button className="efactura-back-btn" onClick={function () { return navigate('/efactura'); }}>
          ← Înapoi la listă
        </button>
      </header>

      <section className="efactura-summary">
        <div className="summary-item">
          <label>Client:</label>
          <span>{invoice.customerName}</span>
        </div>
        {invoice.customerVatId && (<div className="summary-item">
            <label>"CUI:"</label>
            <span>{invoice.customerVatId}</span>
          </div>)}
        <div className="summary-item">
          <label>Suma:</label>
          <span className="summary-amount">
            {invoice.totalAmount.toFixed(2)} {invoice.currency}
          </span>
        </div>
        {invoice.orderId && (<div className="summary-item">
            <label>"Comandă:"</label>
            <span>#{invoice.orderId}</span>
          </div>)}
        {invoice.tipizateId && (<div className="summary-item">
            <label>Tipizat:</label>
            <span>{invoice.tipizateType} #{invoice.tipizateId}</span>
          </div>)}
        <div className="summary-item">
          <label>"data crearii"</label>
          <span>{new Date(invoice.createdAt).toLocaleString('ro-RO')}</span>
        </div>
      </section>

      {/* S11 Part 3 - Retry Actions */}
      <RetryActionsBar_1.RetryActionsBar invoice={invoice} onUpdate={setInvoice}/>

      {/* S11 Part 2 - Status Timeline */}
      <InvoiceStatusTimeline_1.InvoiceStatusTimeline invoice={invoice}/>

      {/* S11 Part 2 - XML Viewer & Logs */}
      <div className="efactura-details-layout">
        <InvoiceXmlViewer_1.InvoiceXmlViewer xml={xml || ''} invoiceId={invoice.id}/>
        <InvoiceLogsPanel_1.InvoiceLogsPanel invoiceId={invoice.id}/>
      </div>
    </div>);
}
