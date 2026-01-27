import React, { useEffect } from "react";
import InventoryHeaderForm from "../components/InventoryHeaderForm";
import InventoryLinesGrid from "../components/InventoryLinesGrid";
// import InventoryFooterSummary from "../components/InventoryFooterSummary";
import InventoryActionsBar from "../components/InventoryActionsBar";
// import NirErrorPanel from "../../nir/components/NirErrorPanel"; // Component removed
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

      {validation?.generalErrors?.length > 0 && (
        <div className="alert alert-danger">
          {validation.generalErrors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
      {validation?.warnings?.length > 0 && (
        <div className="alert alert-warning">
          {validation.warnings.map((warning, i) => (
            <div key={i}>{warning}</div>
          ))}
        </div>
      )}

      <InventoryHeaderForm />
      <InventoryLinesGrid />
      {/* <InventoryFooterSummary /> */}
      <InventoryActionsBar mode="create" />
    </div>
  );
}

