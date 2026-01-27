// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useState } from "react";
import { useNirStore } from "../state/nirStore";
import { deleteNir, saveNir } from "../api/useNir";
import { validateNir } from "../utils/validateNir";
import { toNirPayload } from "../utils/nirMapper";

// type NirActionsBarProps = {
//   nirId?: number | null;
//   onAfterSave?: () => Promise<void> | void;
//   onAfterDelete?: () => Promise<void> | void;
//   onExportPdf?: () => Promise<void> | void;
//   isExporting?: boolean;
// };

export default function NirActionsBar({
  nirId,
  onAfterSave,
  onAfterDelete,
  onExportPdf,
  isExporting = false,
}) {
  const { header, lines, totals, reset, setValidation, validation, clearValidation } = useNirStore();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");

  const runValidation = () => {
    const result = validateNir({ header, lines, totals });
    setValidation(result);
    return result;
  };

  const handleSave = async () => {
    const validationResult = runValidation();
    if (!validationResult.isValid) {
      setFeedback("Corectează câmpurile marcate pentru a putea salva NIR-ul.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    setFeedback("");
    try {
      const payload = toNirPayload({ header, lines, totals });
      await saveNir(payload);
      clearValidation();
      setFeedback("NIR salvat cu succes.");
      setFeedbackType("success");
      onAfterSave?.();
    } catch (error) {
      console.error("❌ [NirActionsBar] Failed to save NIR:", error);
      setFeedback("Nu s-a putut salva NIR-ul. Încearcă din nou.");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!nirId) return;
    if (!confirm("Ești sigur că vrei să ștergi acest NIR? Toate mișcările de stoc asociate vor fi eliminate.")) return;
    setDeleting(true);
    try {
      await deleteNir(nirId);
      clearValidation();
      onAfterDelete?.();
    } catch (error) {
      console.error("❌ [NirActionsBar] Failed to delete NIR:", error);
      setFeedback("Nu s-a putut șterge NIR-ul. Verifică consola pentru detalii.");
      setFeedbackType("error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="card flex flex-col gap-3">
      {feedback ? (
        <div
          className={`rounded border px-3 py-2 text-sm ${
            feedbackType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : feedbackType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-neutral-200 bg-neutral-50 text-neutral-700"
          }`}
        >
          {feedback}
        </div>
      ) : null}

      {validation?.generalErrors?.length ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-semibold">Erori generale:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {validation.generalErrors.map((message, idx) => (
              <li key={idx}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              clearValidation();
              reset();
            }}
            disabled={saving || deleting}
          >
            ↺ Resetează formularul
          </button>
          {nirId ? (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting || saving}>
              {deleting ? "Se șterge…" : "Șterge NIR"}
            </button>
          ) : null}
          {nirId && onExportPdf ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onExportPdf}
              disabled={saving || deleting || isExporting}
            >
              {isExporting ? "Se generează…" : "Export PDF"}
            </button>
          ) : null}
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || deleting}>
          {saving ? "Se salvează…" : "💾 Salvează NIR"}
        </button>
      </div>
    </section>
  );
}
