import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useManageOrders } from "./useManageOrders";
import { getOrdersColumns } from "./OrdersColumns";
import { useCreateInvoiceFromPosOrder } from "../../invoices/useInvoices";

export default function ManageOrdersGrid({ onSelectOrder }) {
  const gridRef = useRef(null);
  const { orders, refresh, wsEvents } = useManageOrders();
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoiceFromPosOrder();

  useEffect(() => {
    if (wsEvents && gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
    }
  }, [wsEvents]);

  const gridContext = {
    navigate,
    createInvoice: (orderId) => {
      createInvoiceMutation.mutate(orderId, {
        onSuccess: (data) => {
          if (data?.invoice_id) {
            navigate(`/invoices/${data.invoice_id}`);
          }
        },
      });
    },
  };

  const getRowClass = (params) => {
    if (params?.data?.invoice_id) {
      return "bg-green-50";
    }
    return "";
  };

  return (
    <div className="ag-theme-alpine" style={{ height: "70vh", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={orders}
        columnDefs={getOrdersColumns(onSelectOrder, refresh)}
        context={gridContext}
        animateRows={true}
        rowHeight={48}
        getRowClass={getRowClass}
      />
    </div>
  );
}


