export default function OrdersActionsRenderer(params) {
  const { data } = params;
  const orderId = data?.id;
  const onSelectOrder = params?.onSelectOrder;
  const onActionDone = params?.onActionDone;

  async function markPaid() {
    try {
      await fetch(`/api/orders/${orderId}/mark-paid`, { method: "PUT" });
      onActionDone?.();
    } catch (e) {
      console.error("mark-paid failed", e);
    }
  }

  async function cancelOrder() {
    try {
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Manager cancel" }),
      });
      onActionDone?.();
    } catch (e) {
      console.error("cancel failed", e);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="btn btn-link" onClick={() => window.open(`/pos/${orderId}`, "_blank")}>
        POS
      </button>
      <button className="btn btn-link" onClick={() => onSelectOrder?.(orderId)}>
        Detalii
      </button>
      <button className="btn btn-link" onClick={markPaid}>
        Plătit
      </button>
      <button className="btn btn-link text-red-600" onClick={cancelOrder}>
        Anulează
      </button>
    </div>
  );
}


