// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useEffect } from "react";
import ConsumeHeaderForm from "../components/ConsumeHeaderForm";
import ConsumeLinesGrid from "../components/ConsumeLinesGrid";
import ConsumeFooterSummary from "../components/ConsumeFooterSummary";
import ConsumeActionsBar from "../components/ConsumeActionsBar";
import NirErrorPanel from "../../nir/components/NirErrorPanel";
import { useConsumeStore } from "../store/consumeStore";

export default function ConsumeCreatePage() {
  const { reset, validation } = useConsumeStore();

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="page space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">Bon consum nou</h1>
        <p className="text-sm text-neutral-500">Completează detaliile bonului de consum și scade stocul aferent.</p>
      </header>

      <NirErrorPanel generalErrors={validation?.generalErrors} warnings={validation?.warnings} />

      <ConsumeHeaderForm />
      <ConsumeLinesGrid />
      <ConsumeFooterSummary />
      <ConsumeActionsBar mode="create" />
    </div>
  );
}

