import React from "react";
import { useInventoryStore } from "../store/inventoryStore";

export default function InventoryHeaderForm() {
  const { header, setHeader, validation } = useInventoryStore();
  const headerErrors = validation?.headerErrors ?? {};

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    setHeader(field, value);
  };

  const inputClass = (field) =>
    ["input", headerErrors[field] ? "border border-red-500 focus:ring-red-200" : ""].filter(Boolean).join(" ");

  const renderError = (field) =>
    headerErrors[field] ? (
      <p className="text-xs text-red-600" role="alert">
        {headerErrors[field]}
      </p>
    ) : null;

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Inventar nr:</span>
          <span>{header.document_number || "—"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Data:</span>
          <span>{header.document_date || "—"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Locație:</span>
          <span>{header.location || "—"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventory-document-number">
            Număr inventar <span className="text-red-500">*</span>
          </label>
          <input
            id="inventory-document-number"
            type="text"
            className={inputClass("document_number")}
            value={header.document_number}
            onChange={handleChange("document_number")}
            placeholder="Ex: INV-001"
          />
          {renderError("document_number")}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventory-document-date">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            id="inventory-document-date"
            type="date"
            className={inputClass("document_date")}
            value={header.document_date}
            onChange={handleChange("document_date")}
          />
          {renderError("document_date")}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventory-location">
            Locație / Depozit <span className="text-red-500">*</span>
          </label>
          <input
            id="inventory-location"
            type="text"
            className={inputClass("location")}
            value={header.location}
            onChange={handleChange("location")}
            placeholder="Ex: Depozit Central"
          />
          {renderError("location")}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventory-responsible">
            Responsabil inventar <span className="text-red-500">*</span>
          </label>
          <input
            id="inventory-responsible"
            type="text"
            className={inputClass("responsible")}
            value={header.responsible}
            onChange={handleChange("responsible")}
            placeholder="Ex: Popescu Ana"
          />
          {renderError("responsible")}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="inventory-notes">
          Observații
        </label>
        <textarea
          id="inventory-notes"
          className="input min-h-[80px]"
          value={header.notes}
          onChange={handleChange("notes")}
          placeholder="Note suplimentare despre inventar"
        />
      </div>
    </section>
  );
}

