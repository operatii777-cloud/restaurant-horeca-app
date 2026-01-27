// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { useTransfer } from "../api/useTransfer";
import { useTransferStore } from "../store/useTransferStore";
import { fromTransferPayload } from "../utils/transferMapper";
import { exportTransferPdf } from "../utils/TransferPdfDocument";
import { deleteTransfer } from "../api/useTransfer";

export default function TransferDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const transferId = Number(id);
  const { data, isLoading, error, refetch } = useTransfer(Number.isFinite(transferId) ? transferId : null);
  const { loadFromPayload, header, lines, totals, reset } = useTransferStore();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      loadFromPayload(fromTransferPayload(data));
    }
  }, [data, loadFromPayload]);

  const handleExport = useCallback(async () => {
    if (!data) return;
    setExporting(true);
    try {
      const { url } = await exportTransferPdf({ header, lines, totals });
      const docNo = header?.document_number || transferId;
      const docDate = header?.document_date || "";
      const a = document.createElement("a");
      a.href = url;
      a.download = `TRANSFER_${docNo}_${docDate || "doc"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Export transfer PDF eșuat:", err);
    } finally {
      setExporting(false);
    }
  }, [data, header, lines, totals, transferId]);

  const handleDelete = useCallback(async () => {
    if (!transferId) return;
    if (!window.confirm("Ștergi definitiv acest transfer?")) return;
    setDeleting(true);
    try {
      await deleteTransfer(transferId);
      navigate("/stocks/transfer");
    } catch (err) {
      console.error("❌ Ștergere transfer eșuată:", err);
      alert("Nu s-a putut șterge transferul.");
    } finally {
      setDeleting(false);
    }
  }, [navigate, transferId]);

  if (!transferId) {
    return <InlineAlert variant="error" title="Transfer invalid" message="ID invalid." />;
  }

  return (
    <div className="page space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Detalii transfer #{transferId}</h1>
          <p className="text-sm text-neutral-500">Mutare între gestiuni/zone.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleExport} disabled={exporting || deleting}>
            {exporting ? "Se generează…" : "Export PDF"}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={exporting || deleting}>
            {deleting ? "Se șterge…" : "Șterge"}
          </button>
        </div>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message="Nu s-au putut încărca detaliile." /> : null}
      {isLoading && !data ? <InlineAlert variant="info" title="Se încarcă" message="Încărcare..." /> : null}

      <section className="card grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm">
            <span className="font-medium">Număr: </span>
            {header.document_number || "—"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Dată: </span>
            {header.document_date || "—"}
          </div>
        </div>
        <div>
          <div className="text-sm">
            <span className="font-medium">Sursă: </span>
            {header.source_location || "—"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Destinație: </span>
            {header.target_location || "—"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Responsabil: </span>
            {header.responsible || "—"}
          </div>
        </div>
        {header.notes ? (
          <div className="md:col-span-2 text-sm">
            <span className="font-medium">Observații: </span>
            {header.notes}
          </div>
        ) : null}
      </section>

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Linii transfer</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-2">Ingredient</th>
                <th className="py-2 pr-2">UM</th>
                <th className="py-2 pr-2 text-right">Cantitate</th>
                <th className="py-2 pr-2 text-right">Cost unitar</th>
                <th className="py-2 pr-2 text-right">Valoare</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 pr-2">{l.ingredient_name || l.ingredient_id}</td>
                  <td className="py-2 pr-2">{l.unit || "—"}</td>
                  <td className="py-2 pr-2 text-right">{Number(l.quantity || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 })}</td>
                  <td className="py-2 pr-2 text-right">{Number(l.cost_unit || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 })}</td>
                  <td className="py-2 pr-2 text-right">{Number(l.value_total || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-end">
        <div className="px-3 py-2 rounded border bg-slate-50 text-sm">
          <span className="font-semibold">Total: </span>
          {Number(totals.total_value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 })}
        </div>
      </section>
    </div>
  );
}


