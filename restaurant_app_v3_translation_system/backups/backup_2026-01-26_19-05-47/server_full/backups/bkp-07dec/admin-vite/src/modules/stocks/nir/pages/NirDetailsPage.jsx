import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InlineAlert } from "@/shared/components/InlineAlert";
import NirHeaderForm from "../components/NirHeaderForm";
import NirLinesGrid from "../components/NirLinesGrid";
import NirFooterTotals from "../components/NirFooterTotals";
import NirActionsBar from "../components/NirActionsBar";
import { useNir } from "../api/useNir";
import { useNirStore } from "../state/nirStore";
import { fromNirPayload } from "../utils/nirMapper";
import { exportNirPdf } from "../utils/NirPdfDocument";
import NirErrorPanel from "../components/NirErrorPanel";

export default function NirDetailsPage() {
  const { id } = useParams();
  const nirId = Number(id);
  const navigate = useNavigate();
  const { nir, loading, error, refetch } = useNir(Number.isFinite(nirId) ? nirId : null);
  const { reset, loadFromPayload, header, totals, validation } = useNirStore();
  const [exporting, setExporting] = useState(false);
  const generalErrors = validation?.generalErrors ?? [];
  const warnings = validation?.warnings ?? [];

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (nir) {
      loadFromPayload(fromNirPayload(nir));
    }
  }, [nir, loadFromPayload]);

  const handleExportPdf = useCallback(async () => {
    if (!nir) return;
    setExporting(true);
    try {
      const payload = {
        header: {
          id: nir.id,
          supplier_id: nir.supplier_id,
          supplier_name: nir.supplier_name,
          document_number: nir.document_number,
          document_date: nir.document_date,
          notes: nir.notes,
        },
        lines: nir.lines ?? [],
        totals: {
          total_value: nir.total_value ?? 0,
          total_tva: nir.total_tva ?? 0,
          grand_total: (nir.total_value ?? 0) + (nir.total_tva ?? 0),
        },
      };
      const { url } = await exportNirPdf(payload);
      const docNo = payload.header.document_number || payload.header.id;
      const docDate = payload.header.document_date || "";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `NIR_${docNo}_${docDate || "document"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("❌ Export NIR PDF failed:", exportError);
    } finally {
      setExporting(false);
    }
  }, [nir]);

  if (!nirId) {
    return <InlineAlert variant="error" title="NIR invalid" message="Nu a fost specificat un ID de NIR valid." />;
  }

  return (
    <div className="page space-y-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Detalii NIR #{nirId}</h1>
            <p className="text-sm text-neutral-500">Vizualizează și editează informațiile recepției.</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
        </div>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
      {loading && !nir ? <InlineAlert variant="info" title="Se încarcă" message="Se încarcă detaliile NIR..." /> : null}

      <NirErrorPanel generalErrors={generalErrors} warnings={warnings} />

      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">NIR #{header?.document_number || nirId}</span>
          <span className="text-neutral-400">•</span>
          <span>Data: {header?.document_date || "—"}</span>
          <span className="text-neutral-400">•</span>
          <span>Furnizor: {nir?.supplier_name || "—"}</span>
        </div>
        <div className="font-semibold text-neutral-900">
          Total: {(totals?.grand_total ?? 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 })}
        </div>
      </div>

      <NirHeaderForm />
      <NirLinesGrid />
      <NirFooterTotals />
      <NirActionsBar
        nirId={nirId}
        onAfterSave={refetch}
        onAfterDelete={() => {
          navigate("/stocks/nir");
        }}
        onExportPdf={handleExportPdf}
        isExporting={exporting}
      />
    </div>
  );
}
