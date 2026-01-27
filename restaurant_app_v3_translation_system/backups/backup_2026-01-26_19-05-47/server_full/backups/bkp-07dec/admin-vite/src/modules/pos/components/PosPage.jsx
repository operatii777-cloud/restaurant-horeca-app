import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePos } from "../usePos";
import { usePosStore } from "../posStore";
import OrderSummary from "./OrderSummary";
import PaymentSheet from "./PaymentSheet";
import PosHeader from "./PosHeader";
import PosFooter from "./PosFooter";

export default function PosPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const kiosk = searchParams.get("kiosk") === "1";

  const pos = usePos(orderId);
  const order = usePosStore((s) => s.order);
  const loading = usePosStore((s) => s.loading);
  const error = usePosStore((s) => s.error);

  useEffect(() => {
    pos.load();
    return () => pos.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading && !order) return <div>Se încarcă…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!order) return <div>Comanda nu a fost găsită.</div>;

  return (
    <div className={`pos-container ${kiosk ? "pos-kiosk" : ""}`}>
      <PosHeader order={order} kiosk={kiosk} />
      <div className="pos-main">
        <OrderSummary order={order} />
        <PaymentSheet onAddPayment={pos.processPayment} />
      </div>
      <PosFooter pos={pos} />
    </div>
  );
}


