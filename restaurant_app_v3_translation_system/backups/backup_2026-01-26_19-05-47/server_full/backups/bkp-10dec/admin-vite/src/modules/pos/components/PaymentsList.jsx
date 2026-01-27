// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";

export default function PaymentsList({ payments }) {
  if (!payments?.length) {
    return <div className="payments-list empty">Nu există plăți înregistrate.</div>;
  }
  return (
    <div className="payments-list">
      <h4>Plăți efectuate</h4>
      {payments.map((p, idx) => (
        <div key={idx} className="payment-row">
          <span className="payment-type">{p.type}</span>
          <span className="payment-amount">
            {Number(p.amount || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 })} lei
          </span>
        </div>
      ))}
    </div>
  );
}


