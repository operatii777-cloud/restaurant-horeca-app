// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";

export default function OrderSummary({ order }) {
  return (
    <div className="order-summary">
      <h3>Comandă #{order.id} – Masa {order.table}</h3>
      <ul className="order-items">
        {(order.items || []).map((i, idx) => (
          <li key={idx} className="order-item">
            <span className="item-name">{i.name || i.productName || `Produs ${i.productId || ""}`}</span>
            <span className="item-qty">x{i.qty || i.quantity || 1}</span>
            <span className="item-total">{(i.total || i.price || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 })} lei</span>
          </li>
        ))}
      </ul>
      <div className="summary-total">
        Total: {Number(order.total || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 })} lei
      </div>
    </div>
  );
}


