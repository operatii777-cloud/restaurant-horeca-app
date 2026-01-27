import { mapOrderApiToStore } from "../posMapper";

export async function getOrderForPos(orderId) {
  // Try real backend first
  try {
    const r = await fetch(`/api/admin/pos/order/${Number(orderId)}`);
    if (r.ok) {
      const data = await r.json();
      return {
        order: mapOrderApiToStore(data),
        payments: data?.payments || [],
        fiscalReceipt: Array.isArray(data?.fiscal_receipts) ? data.fiscal_receipts[0] : null,
      };
    }
  } catch {}
  // Fallback mock
  return {
    order: mapOrderApiToStore({
      id: Number(orderId),
      table_number: 5,
      total: 42.5,
      items: [],
      is_paid: 0,
      has_fiscal_receipt: 0,
    }),
    payments: [],
    fiscalReceipt: null,
  };
}

export async function sendPayment(orderId, payment) {
  const r = await fetch(`/api/admin/pos/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: Number(orderId), type: payment?.type, amount: Number(payment?.amount || 0) }),
  });
  if (!r.ok) throw new Error("Eroare la înregistrarea plății");
  return r.json();
}

export async function fiscalizeOrder(orderId) {
  const r = await fetch(`/api/admin/pos/fiscalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: Number(orderId), payment_method: "cash" }),
  });
  if (!r.ok) throw new Error("Eroare la fiscalizare");
  return r.json();
}



