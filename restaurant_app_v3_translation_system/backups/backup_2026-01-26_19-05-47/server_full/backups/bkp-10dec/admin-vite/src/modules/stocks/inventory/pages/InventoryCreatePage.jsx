import React, { useEffect } from "react";
import InventoryHeaderForm from "../components/InventoryHeaderForm";
import InventoryLinesGrid from "../components/InventoryLinesGrid";
// import InventoryFooterSummary from "../components/InventoryFooterSummary";
import InventoryActionsBar from "../components/InventoryActionsBar";
import NirErrorPanel from "../../nir/components/NirErrorPanel";
import { useInventoryStore } from "../store/inventoryStore";

export default function InventoryCreatePage() {
  const { reset, validation } = useInventoryStore();

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="page space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">Inventar nou</h1>
        <p className="text-sm text-neutral-500">Completează stocul scriptic vs. faptic și salvează ajustările necesare.</p>
      </header>

      <NirErrorPanel generalErrors={validation?.generalErrors} warnings={validation?.warnings} />

      <InventoryHeaderForm />
      <InventoryLinesGrid />
      {/* <InventoryFooterSummary /> */}
      <InventoryActionsBar mode="create" />
    </div>
  );
}

