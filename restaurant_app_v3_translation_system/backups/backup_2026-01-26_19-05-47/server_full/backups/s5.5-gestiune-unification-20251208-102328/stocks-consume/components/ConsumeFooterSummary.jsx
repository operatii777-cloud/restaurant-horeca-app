// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";
import { useConsumeStore } from "../store/consumeStore";

export default function ConsumeFooterSummary() {
  const totals = useConsumeStore((state) => state.totals);

  return (
    <section className="card">
      <div className="flex items-center justify-end gap-2 text-sm text-neutral-700">
        <span className="font-semibold">Total cantitate:</span>
        <span>{(totals?.total_quantity ?? 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 })}</span>
      </div>
    </section>
  );
}

