// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useEffect } from "react";
import NirHeaderForm from "../components/NirHeaderForm";
import NirLinesGrid from "../components/NirLinesGrid";
import NirFooterTotals from "../components/NirFooterTotals";
import NirActionsBar from "../components/NirActionsBar";
import NirErrorPanel from "../components/NirErrorPanel";
import { useNirStore } from "../state/nirStore";

export default function NirCreatePage() {
  const { reset, lines, addLine, header, totals, validation } = useNirStore();

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!lines.length) {
      addLine();
    }
  }, [lines.length, addLine]);

  return (
    <div className="page space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">Creare NIR</h1>
        <p className="text-sm text-neutral-500">Completează datele recepției și salvează un nou NIR în sistem.</p>
      </header>

      <NirErrorPanel generalErrors={validation?.generalErrors} warnings={validation?.warnings} />

      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">NIR (draft)</span>
          <span className="text-neutral-400">•</span>
          <span>Data: {header?.document_date || "—"}</span>
          <span className="text-neutral-400">•</span>
          <span>Furnizor ID: {header?.supplier_id || "—"}</span>
        </div>
        <div className="font-semibold text-neutral-900">
          Total: {(totals?.grand_total ?? 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 })}
        </div>
      </div>

      <NirHeaderForm />
      <NirLinesGrid />
      <NirFooterTotals />
      <NirActionsBar />
    </div>
  );
}
