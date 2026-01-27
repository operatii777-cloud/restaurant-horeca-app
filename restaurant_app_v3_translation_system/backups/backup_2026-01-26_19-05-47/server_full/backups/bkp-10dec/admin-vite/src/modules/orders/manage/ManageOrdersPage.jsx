import { useState } from "react";
import ManageOrdersGrid from "./ManageOrdersGrid";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import { useManageOrders } from "./useManageOrders";

export default function ManageOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { filters, setFilters, summary } = useManageOrders();

  return (
    <div className="orders-manage-page space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="page-title">Gestionare Comenzi</h1>
      </header>

      <section className="orders-summary grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-neutral-600">Total comenzi</div>
          <div className="text-xl font-semibold">{summary.total ?? 0}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-neutral-600">Neplătite</div>
          <div className="text-xl font-semibold">{summary.unpaid ?? 0}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-neutral-600">Valoare totală</div>
          <div className="text-xl font-semibold">{(summary.amount ?? 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 })} lei</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-neutral-600">Fiscalizate</div>
          <div className="text-xl font-semibold">{summary.fiscalized ?? 0}</div>
        </div>
      </section>

      <section className="orders-filters flex flex-wrap gap-2 items-center">
        <input
          className="input"
          placeholder="ID comandă"
          value={filters.orderId || ""}
          onChange={(e) => setFilters({ orderId: e.target.value })}
        />
        <input
          className="input"
          type="date"
          value={filters.date || ""}
          onChange={(e) => setFilters({ date: e.target.value })}
        />
        <select
          className="input"
          value={filters.status || ""}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">Status</option>
          <option value="pending">pending</option>
          <option value="preparing">preparing</option>
          <option value="delivered">delivered</option>
          <option value="paid">paid</option>
          <option value="cancelled">cancelled</option>
        </select>
        <button className="btn btn-secondary" onClick={() => setFilters({ tab: "unpaid" })}>De plătit</button>
        <button className="btn btn-ghost" onClick={() => setFilters({ tab: "all", status: "", orderId: "", date: "" })}>Toate</button>
      </section>

      <ManageOrdersGrid onSelectOrder={setSelectedOrder} />

      <OrderDetailsDrawer
        orderId={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}


