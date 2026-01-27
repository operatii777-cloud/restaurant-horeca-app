import React from "react";

export default function PosHeader({ order, kiosk = false }) {
  return (
    <div className={`pos-header ${kiosk ? "pos-header--kiosk" : ""}`}>
      <h2>POS – Masa {order.table}</h2>
      {order.hasFiscal ? <span className="badge">Fiscal</span> : null}
      {order.isPaid ? <span className="badge badge-success">Plătită</span> : null}
    </div>
  );
}


