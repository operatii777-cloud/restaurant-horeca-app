import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InventoryHeaderForm from "../components/InventoryHeaderForm";
import InventoryLinesGrid from "../components/InventoryLinesGrid";
// import InventoryFooterSummary from "../components/InventoryFooterSummary";
import InventoryActionsBar from "../components/InventoryActionsBar";
// import NirErrorPanel from "../../nir/components/NirErrorPanel"; // Component removed
import { useInventory } from "../api/useInventory";
import { useInventoryStore } from "../store/inventoryStore";
import { fromInventoryPayload } from "../utils/inventoryMapper";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { exportInventoryPdf } from "../utils/InventoryPdfDocument";

export default function InventoryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inventoryId = Number(id);
  const { inventory, loading, error, refetch } = useInventory(Number.isFinite(inventoryId) ? inventoryId : null);
  const { loadFromPayload, reset, validation, header, lines, totals } = useInventoryStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (inventory) {
      loadFromPayload(fromInventoryPayload(inventory));
    }
  }, [inventory, loadFromPayload]);

  if (!inventoryId) {
    return <InlineAlert variant="error" title="Inventar invalid" message="Nu a fost specificat un ID valid pentru inventar." />;
  }

  const handleExportPdf = useCallback(async () => {
    if (!inventory) return;
    setExporting(true);
    try {
      const pdfLines =
        Array.isArray(inventory?.lines) && inventory.lines.length ? inventory.lines : lines;
      const payload = {
        header: {
          ...inventory.header,
          document_number: header?.document_number ?? inventory.header?.document_number,
          document_date: header?.document_date ?? inventory.header?.document_date,
          location: header?.location ?? inventory.header?.location,
          responsible: header?.responsible ?? inventory.header?.responsible,
          notes: header?.notes ?? inventory.header?.notes,
        },
        lines: pdfLines ?? [],
        totals: totals ?? inventory.totals ?? {},
      };
      const { url } = await exportInventoryPdf(payload);
      const docNo = payload.header?.document_number || inventoryId;
      const docDate = payload.header?.document_date || "";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `INVENTAR_${docNo}_${docDate || "document"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("❌ Export inventar PDF eșuat:", exportError);
    } finally {
      setExporting(false);
    }
  }, [header, inventory, inventoryId, lines, totals]);

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Detalii inventar #{inventoryId}</h1>
          <p className="text-sm text-neutral-500">Revizuiește și ajustează diferențele inventarului.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={refetch}>
          ⟳ Reîmprospătează
        </button>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
      {loading && !inventory ? (
        <InlineAlert variant="info" title="Se încarcă" message="Se încarcă detaliile inventarului..." />
      ) : null}

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
      <InventoryActionsBar
        mode="details"
        onAfterSave={refetch}
        onAfterDelete={() => {
          navigate("/stocks/inventory");
        }}
        onExportPdf={handleExportPdf}
        isExporting={exporting}
      />
    </div>
  );
}

