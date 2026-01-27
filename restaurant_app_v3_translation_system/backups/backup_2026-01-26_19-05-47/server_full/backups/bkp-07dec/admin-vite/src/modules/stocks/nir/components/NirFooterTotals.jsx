import React from "react";
import { useNirStore } from "../state/nirStore";

export default function NirFooterTotals() {
  const { totals } = useNirStore();

  return (
    <section className="card grid gap-4 md:grid-cols-3">
      <div className="flex h-full flex-col justify-between rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Total valoare (fără TVA)</p>
        <p className="text-2xl font-semibold">
          {totals.total_value.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON
        </p>
      </div>
      <div className="flex h-full flex-col justify-between rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Total TVA</p>
        <p className="text-2xl font-semibold">
          {totals.total_tva.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON
        </p>
      </div>
      <div className="flex h-full flex-col justify-between rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Total general</p>
        <p className="text-2xl font-semibold">
          {totals.grand_total.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON
        </p>
      </div>
    </section>
  );
}
