// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransferStore } from "../store/useTransferStore";
import { validateTransfer } from "../utils/validateTransfer";
import { toTransferPayload } from "../utils/transferMapper";
import { saveTransfer } from "../api/useTransfer";
import { InlineAlert } from "@/shared/components/InlineAlert";

export default function TransferCreatePage() {
  const navigate = useNavigate();
  const store = useTransferStore();
  const { header, lines, totals, validation } = store;

  useEffect(() => {
    // reset form when mounting
    store.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddLine = () => {
    store.addLine();
  };

  const handleSave = async () => {
    const check = validateTransfer({ header, lines, totals });
    store.setValidation(check);
    if (!check.isValid) return;
    try {
      const payload = toTransferPayload({ header, lines });
      const data = await saveTransfer(payload);
      navigate(`/stocks/transfer/${data.id}`);
    } catch (e) {
      console.error("❌ Salvare transfer eșuată:", e);
      alert("Nu s-a putut salva transferul.");
    }
  };

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Transfer depozit - creare</h1>
          <p className="text-sm text-neutral-500">Completează datele și liniile de transfer.</p>
        </div>
      </header>

      {validation?.generalErrors?.length ? (
        <InlineAlert variant="error" title="Verifică datele" message={validation.generalErrors.join(" • ")} />
      ) : null}

      <section className="card grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Număr</label>
          <input
            className={`input mt-1 ${validation?.headerErrors?.document_number ? "border border-red-500" : ""}`}
            value={header.document_number}
            onChange={(e) => store.setHeader("document_number", e.target.value)}
            placeholder="TR-001"
          />
          {validation?.headerErrors?.document_number ? (
            <p className="text-xs text-red-600">{validation.headerErrors.document_number}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium">Dată</label>
          <input
            type="date"
            className={`input mt-1 ${validation?.headerErrors?.document_date ? "border border-red-500" : ""}`}
            value={header.document_date}
            onChange={(e) => store.setHeader("document_date", e.target.value)}
          />
          {validation?.headerErrors?.document_date ? (
            <p className="text-xs text-red-600">{validation.headerErrors.document_date}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium">Sursă</label>
          <input
            className={`input mt-1 ${validation?.headerErrors?.source_location ? "border border-red-500" : ""}`}
            value={header.source_location}
            onChange={(e) => store.setHeader("source_location", e.target.value)}
            placeholder="Depozit Central"
          />
          {validation?.headerErrors?.source_location ? (
            <p className="text-xs text-red-600">{validation.headerErrors.source_location}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium">Destinație</label>
          <input
            className={`input mt-1 ${validation?.headerErrors?.target_location ? "border border-red-500" : ""}`}
            value={header.target_location}
            onChange={(e) => store.setHeader("target_location", e.target.value)}
            placeholder="Bucătărie"
          />
          {validation?.headerErrors?.target_location ? (
            <p className="text-xs text-red-600">{validation.headerErrors.target_location}</p>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Responsabil</label>
          <input
            className={`input mt-1 ${validation?.headerErrors?.responsible ? "border border-red-500" : ""}`}
            value={header.responsible}
            onChange={(e) => store.setHeader("responsible", e.target.value)}
            placeholder="Nume responsabil"
          />
          {validation?.headerErrors?.responsible ? (
            <p className="text-xs text-red-600">{validation.headerErrors.responsible}</p>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Observații</label>
          <textarea
            className="input mt-1 min-h-[80px]"
            value={header.notes}
            onChange={(e) => store.setHeader("notes", e.target.value)}
            placeholder="Notă opțională"
          />
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Linii transfer</h3>
          <button type="button" className="btn btn-ghost" onClick={handleAddLine}>
            + Adaugă linie
          </button>
        </div>
        <div className="space-y-3">
          {lines.map((l, idx) => {
            const err = validation?.lineErrors?.[idx] || {};
            return (
              <div key={idx} className="grid md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Ingredient</label>
                  <input
                    className={`input mt-1 ${err.ingredient_id ? "border border-red-500" : ""}`}
                    value={l.ingredient_id || ""}
                    onChange={(e) =>
                      store.updateLine(idx, { ingredient_id: Number(e.target.value) || null })
                    }
                    placeholder="ID ingredient"
                  />
                  {err.ingredient_id ? <p className="text-xs text-red-600">{err.ingredient_id}</p> : null}
                </div>
                <div>
                  <label className="text-sm font-medium">UM</label>
                  <input
                    className="input mt-1"
                    value={l.unit || ""}
                    onChange={(e) => store.updateLine(idx, { unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cantitate</label>
                  <input
                    className={`input mt-1 ${err.quantity ? "border border-red-500" : ""}`}
                    value={l.quantity}
                    onChange={(e) => store.updateLine(idx, { quantity: Number(e.target.value) || 0 })}
                  />
                  {err.quantity ? <p className="text-xs text-red-600">{err.quantity}</p> : null}
                </div>
                <div>
                  <button type="button" className="btn btn-danger" onClick={() => store.removeLine(idx)}>
                    Șterge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => store.reset()}>
            ↺ Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Salvează
          </button>
        </div>
      </section>
    </div>
  );
}


