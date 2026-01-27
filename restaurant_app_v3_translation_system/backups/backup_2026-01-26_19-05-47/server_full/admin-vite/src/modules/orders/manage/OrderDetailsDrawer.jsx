import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

async function createInvoiceFromPosOrder(orderId) {
  const r = await fetch(`/api/admin/invoices/from-pos-order/${Number(orderId)}`, { method: "POST" });
  if (!r.ok) throw new Error("Eroare la generarea facturii");
  return r.json(); // { invoice_id }
}

export default function OrderDetailsDrawer({ orderId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/admin/pos/order/${orderId}`);
        const json = await r.json();
        if (mounted) setData(json);
      } catch (e) {
        console.error("load order details failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end">
      <div className="w-full max-w-xl bg-white h-full p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Comanda #{orderId}</h2>
          <button className="btn btn-ghost" onClick={onClose}>✖</button>
        </div>

        {loading ? <div>Se încarcă…</div> : null}
        {error ? <div className="text-red-600 text-xs mb-2">{error}</div> : null}
        {data ? (
          <div className="space-y-4">
            <section className="p-3 border rounded">
              <div className="text-sm text-neutral-600">Detalii</div>
              <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto">
                {JSON.stringify(
                  {
                    id: data.id,
                    table_number: data.table_number,
                    total: data.total,
                    is_paid: data.is_paid,
                    has_fiscal_receipt: data.has_fiscal_receipt,
                  },
                  null,
                  2
                )}
              </pre>
            </section>
            <section className="p-3 border rounded">
              <div className="text-sm font-medium">Articole</div>
              <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto">
                {JSON.stringify(data.items || [], null, 2)}
              </pre>
            </section>
            <section className="p-3 border rounded">
              <div className="text-sm font-medium">Plăți POS</div>
              <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto">
                {JSON.stringify(data.payments || [], null, 2)}
              </pre>
            </section>
            <section className="p-3 border rounded">
              <div className="text-sm font-medium">Bonuri fiscale</div>
              <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto">
                {JSON.stringify(data.fiscal_receipts || [], null, 2)}
              </pre>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-secondary" onClick={() => window.open(`/pos/${orderId}`, "_blank")}>
                  Deschide POS
                </button>
                {data.has_fiscal_receipt ? (
                  data.invoice_id ? (
                    <button className="btn btn-link" onClick={() => navigate(`/invoices/${data.invoice_id}`)}>
                      Vezi factura
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      disabled={creating}
                      onClick={async () => {
                        setError(null);
                        try {
                          setCreating(true);
                          const res = await createInvoiceFromPosOrder(orderId);
                          if (res?.invoice_id) {
                            navigate(`/invoices/${res.invoice_id}`);
                          }
                        } catch (e) {
                          setError(e?.message || "Nu s-a putut genera factura.");
                        } finally {
                          setCreating(false);
                        }
                      }}
                    >
                      {creating ? "Se generează factura…" : "Generează factură"}
                    </button>
                  )
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}


