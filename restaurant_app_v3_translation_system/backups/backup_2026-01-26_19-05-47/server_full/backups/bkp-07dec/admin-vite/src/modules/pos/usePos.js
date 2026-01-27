import { usePosStore } from "./posStore";
import { getOrderForPos, sendPayment, fiscalizeOrder } from "./api/posApi";
import { computeRemaining } from "./utils/paymentHelpers";

export function usePos(orderId) {
  const {
    setOrder,
    setPayments,
    setFiscalReceipt,
    setLoading,
    setError,
    reset,
  } = usePosStore.getState();

  async function load() {
    try {
      setLoading(true);
      const data = await getOrderForPos(orderId);
      if (data && data.order) {
        setOrder(data.order);
        setPayments(data.payments || []);
        setFiscalReceipt((data.fiscalReceipt || (Array.isArray(data.fiscal_receipts) ? data.fiscal_receipts[0] : null)) || null);
      } else {
        // backward compatibility with old mock shape
        setOrder(data);
      }
    } catch (e) {
      setError(e?.message || "Nu s-a putut încărca comanda.");
    } finally {
      setLoading(false);
    }
  }

  async function processPayment(payment) {
    await sendPayment(orderId, payment);
    await load();
  }

  async function fiscalize() {
    // Optional guard: ensure no remaining amount
    const state = usePosStore.getState();
    const remaining = computeRemaining(state?.order?.total || 0, state?.payments || []);
    if (remaining > 0) {
      throw new Error("Nu poți fiscaliza: există sumă neîncasată.");
    }
    const res = await fiscalizeOrder(orderId);
    await load();
    return res;
  }

  return { load, processPayment, fiscalize, reset };
}


