import React from "react";

export default function PaymentMethodSelector({ value, onChange }) {
  const methods = [
    { id: "CASH", label: "Cash" },
    { id: "CARD", label: "Card" },
    { id: "VOUCHER", label: "Voucher" },
  ];
  return (
    <div className="payment-methods flex gap-2">
      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`btn ${value === m.id ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange?.(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}


