import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventoryStore } from "../store/inventoryStore";
import { validateInventory } from "../utils/validateInventory";
import { toInventoryPayload } from "../utils/inventoryMapper";
import { deleteInventory, saveInventory, finalizeInventory } from "../api/useInventory";

export default function InventoryActionsBar({
  mode = "create",
  onAfterSave,
  onAfterDelete,
  onExportPdf,
  isExporting = false,
}) {
  const navigate = useNavigate();
  const { header, lines, totals, setValidation, reset, clearValidation } = useInventoryStore();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    const state = { header, lines, totals };
    const validationResult = validateInventory(state);
    setValidation(validationResult);
    if (!validationResult.isValid) return;

    setSaving(true);
    try {
      const payload = toInventoryPayload(state);
      await saveInventory(payload);
      clearValidation?.();
      onAfterSave?.();
      navigate("/stocks/inventory");
    } catch (error) {
      console.error("❌ [InventoryActionsBar] Failed to save inventory:", error);
      alert("Nu s-a putut salva inventarul. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!header?.id) return;
    if (!window.confirm("Ești sigur că vrei să ștergi acest inventar? Ajustările aferente vor fi anulate.")) return;
    setDeleting(true);
    try {
      await deleteInventory(header.id);
      clearValidation?.();
      onAfterDelete?.();
      navigate("/stocks/inventory");
    } catch (error) {
      console.error("❌ [InventoryActionsBar] Failed to delete inventory:", error);
      alert("Nu s-a putut șterge inventarul.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="card flex flex-wrap justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            clearValidation?.();
            reset();
          }}
          disabled={saving || deleting}
        >
          ↺ Resetează formularul
        </button>
        {mode === "details" && header?.id && onExportPdf ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onExportPdf}
            disabled={saving || deleting || isExporting}
          >
            {isExporting ? "Se generează…" : "Export PDF"}
          </button>
        ) : null}
        {mode === "details" && header?.id ? (
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving || deleting}>
            {deleting ? "Se șterge…" : "Șterge"}
          </button>
        ) : null}
      </div>
      <div className="flex gap-2">
        {mode === "details" && header?.id ? (
          <button
            type="button"
            className="btn btn-success"
            onClick={async () => {
              if (!window.confirm("Ești sigur că vrei să finalizezi inventarul? Stocurile vor fi actualizate permanently.")) return;
              setSaving(true);
              try {
                await finalizeInventory(header.id);
                alert("Inventar finalizat cu succes! Stocurile au fost actualizate.");
                navigate("/stocks/inventory/multi");
              } catch (e) {
                console.error(e);
                alert("Eroare la finalizare: " + e.message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || deleting}
          >
            ✅ Finalizează și Actualizează Stoc
          </button>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || deleting}>
          {saving ? "Se salvează…" : "💾 Salvează (Interimar)"}
        </button>
      </div>
    </section>
  );
}

