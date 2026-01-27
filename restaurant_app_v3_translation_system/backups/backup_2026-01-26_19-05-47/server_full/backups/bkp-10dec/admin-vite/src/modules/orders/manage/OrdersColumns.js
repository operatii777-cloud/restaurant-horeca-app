import OrdersFiscalRenderer from "./OrdersFiscalRenderer";
import OrdersActionsRenderer from "./OrdersActionsRenderer";

export function getOrdersColumns(onSelectOrder, onActionDone) {
  return [
    {
      headerName: "ID",
      field: "id",
      width: 90,
      pinned: "left",
      onCellClicked: (p) => onSelectOrder?.(p.data?.id),
    },
    { headerName: "Masă", field: "table_number", width: 90 },
    { headerName: "Articole", field: "items_preview", flex: 2 },
    {
      headerName: "Total",
      field: "total",
      width: 120,
      valueFormatter: (p) => (Number(p.value || 0)).toLocaleString("ro-RO", { maximumFractionDigits: 2 })
    },
    {
      headerName: "Status",
      field: "status",
      width: 160,
      cellRenderer: (params) => {
        const o = params.data || {};
        const statusText = params.value ?? "";
        const badge = o.invoice_id
          ? '<span class="text-xs bg-green-600 text-white px-2 py-[2px] rounded-full">Facturată</span>'
          : "";
        return `<div class="flex items-center gap-2"><span>${statusText}</span>${badge}</div>`;
      },
    },
    {
      headerName: "Fiscal",
      field: "has_fiscal_receipt",
      width: 100,
      cellRenderer: OrdersFiscalRenderer,
    },
    {
      headerName: "Factură",
      field: "invoice_id",
      width: 160,
      sortable: true,
      cellRenderer: (params) => {
        const o = params.data;
        if (o?.invoice_id) {
          return `
            <span class="inline-flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800" title="Deschide factura">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 3v4a1 1 0 001 1h4" />
                <path d="M5 21h14a2 2 0 002-2V9.5L14.5 3H7a2 2 0 00-2 2v16z" />
              </svg>
              FR${o.invoice_number || o.invoice_id}
            </span>
          `;
        }
        if (!o?.has_fiscal_receipt) {
          return '<span class="text-gray-400 text-xs" title="Nu există bon fiscal">—</span>';
        }
        return '<span class="text-yellow-700 hover:text-yellow-900 underline text-xs" title="Generează factura">Generează</span>';
      },
      onCellClicked: (params) => {
        const o = params.data;
        if (!params?.context) return;
        if (o?.invoice_id) {
          params.context.navigate(`/invoices/${o.invoice_id}`);
          return;
        }
        if (o?.has_fiscal_receipt && !o?.invoice_id) {
          params.context.createInvoice(o.id);
        }
      },
    },
    {
      headerName: "Acțiuni",
      field: "actions",
      width: 260,
      pinned: "right",
      cellRenderer: OrdersActionsRenderer,
      cellRendererParams: { onSelectOrder, onActionDone },
    },
  ];
}


