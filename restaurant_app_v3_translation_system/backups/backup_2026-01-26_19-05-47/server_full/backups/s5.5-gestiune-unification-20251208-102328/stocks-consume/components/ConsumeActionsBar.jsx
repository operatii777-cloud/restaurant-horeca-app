// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConsumeStore } from "../store/consumeStore";
import { validateConsume } from "../utils/validateConsume";
import { toConsumePayload } from "../utils/consumeMapper";
import { deleteConsume, saveConsume } from "../api/useConsume";
import { exportConsumePdf } from "../utils/ConsumePdfDocument";

export default function ConsumeActionsBar({ mode = "create", onAfterSave, onAfterDelete }) {
  const navigate = useNavigate();
  const { header, lines, totals, setValidation, reset, clearValidation } = useConsumeStore();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const busy = saving || deleting || exporting;

  const handleSave = async () => {
    const state = { header, lines, totals };
    const validationResult = validateConsume(state);
    setValidation(validationResult);
    if (!validationResult.isValid) return;

    setSaving(true);
    try {
      const payload = toConsumePayload(state);
      await saveConsume(payload);
      clearValidation();
      onAfterSave?.();
      navigate("/stocks/consume");
    } catch (error) {
      console.error("❌ [ConsumeActionsBar] Failed to save consumption note:", error);
      alert("Nu s-a putut salva bonul de consum. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!header?.id) return;
    if (
      !window.confirm(
        "Ești sigur că vrei să ștergi acest bon de consum? Această acțiune va șterge și mișcările de stoc aferente.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteConsume(header.id);
      clearValidation();
      onAfterDelete?.();
      navigate("/stocks/consume");
    } catch (error) {
      console.error("❌ [ConsumeActionsBar] Failed to delete consumption note:", error);
      alert("Nu s-a putut șterge bonul de consum.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPdf = async () => {
    const state = { header, lines, totals };
    const validationResult = validateConsume(state);
    setValidation(validationResult);
    if (!validationResult.isValid) return;

    setExporting(true);
    try {
      const { url } = await exportConsumePdf(state);
      const docNo = header.document_number || header.id || "CONSUME";
      const rawDate = header.document_date || header.date || "";
      const dateStr = typeof rawDate === "string" ? rawDate : rawDate?.toISOString?.().slice(0, 10) || "";
      const fileName = `CONSUME_${docNo}_${dateStr || "document"}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ [ConsumeActionsBar] Failed to export consumption note PDF:", error);
      alert("Nu s-a putut genera PDF-ul. Încearcă din nou.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="card flex flex-wrap justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            clearValidation();
            reset();
          }}
          disabled={busy}
        >
          ↺ Resetează formularul
        </button>
        {mode === "details" && header?.id ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={handleExportPdf} disabled={busy}>
              {exporting ? "Se generează…" : "Export PDF"}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
              {deleting ? "Se șterge…" : "Șterge"}
            </button>
          </>
        ) : null}
      </div>
      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={busy}>
        {saving ? "Se salvează…" : "💾 Salvează"}
      </button>
    </section>
  );
}
