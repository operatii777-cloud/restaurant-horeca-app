import React from "react";

export default function SplitBill({ total, onSplit }) {
  return (
    <div className="split-bill">
      <h4>Split Bill</h4>
      <div className="text-sm text-neutral-600">Total: {Number(total || 0).toFixed(2)} lei</div>
      {/* TODO: adaugă UI pentru împărțire pe persoane / sume */}
      <button type="button" className="btn btn-ghost" onClick={() => onSplit?.([])}>
        Aplică split
      </button>
    </div>
  );
}


