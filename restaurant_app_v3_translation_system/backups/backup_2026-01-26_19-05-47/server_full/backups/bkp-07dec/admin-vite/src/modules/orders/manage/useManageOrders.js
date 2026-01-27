import { useEffect, useState } from "react";
import { subscribeManagerWs } from "./managerWs";

export function useManageOrders() {
  const [orders, setOrders] = useState([]);
  const [filters, setFiltersState] = useState({ tab: "all" });
  const [summary, setSummary] = useState({ total: 0, unpaid: 0, amount: 0, fiscalized: 0 });
  const [wsEvents, setWsEvents] = useState(0);

  function setFilters(patch) {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }

  async function load() {
    const params = new URLSearchParams();
    if (filters.orderId) params.set("order_id", filters.orderId);
    if (filters.status) params.set("status", filters.status);
    if (filters.date) params.set("date", filters.date);
    // server supports limit/page; we can set a sensible default
    params.set("limit", "500");

    const res = await fetch(`/api/admin/orders/all?${params.toString()}`);
    const json = await res.json();
    const rows = Array.isArray(json.orders) ? json.orders : [];

    // map items preview
    const mapped = rows.map((o) => {
      let itemsPreview = "";
      try {
        const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || "[]");
        if (items.length > 0) {
          const names = items.slice(0, 2).map((it) => it.name || it.productName || `#${it.productId || ""}`);
          const extra = items.length > 2 ? ` +${items.length - 2}` : "";
          itemsPreview = `${names.join(", ")}${extra}`;
        }
      } catch {
        // ignore
      }
      return {
        ...o,
        items_preview: itemsPreview,
      };
    });

    // client-side unpaid tab filter
    let finalRows = mapped;
    if (filters.tab === "unpaid") {
      finalRows = mapped.filter((r) => Number(r.is_paid || 0) === 0 && (r.status === "delivered" || r.status === "pending_payment"));
    }

    setOrders(finalRows);

    // summary
    const total = finalRows.length;
    const unpaid = finalRows.filter((r) => Number(r.is_paid || 0) === 0).length;
    const amount = finalRows.reduce((acc, r) => acc + (Number(r.total || 0) || 0), 0);
    const fiscalized = finalRows.filter((r) => Number(r.has_fiscal_receipt || 0) > 0).length;
    setSummary({ total, unpaid, amount, fiscalized });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    const unsub = subscribeManagerWs(() => {
      setWsEvents((n) => n + 1);
      load();
    });
    return () => {
      try { unsub?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/excessive-dependencies
  }, []);

  return { orders, filters, setFilters, summary, wsEvents, refresh: load };
}


