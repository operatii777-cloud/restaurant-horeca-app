// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";
import { useConsumeStore } from "../store/consumeStore";

export default function ConsumeHeaderForm() {
  const { header, setHeader, validation } = useConsumeStore();
  const headerErrors = validation?.headerErrors ?? {};

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    setHeader(field, value);
  };

  const classNameFor = (field) =>
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
          <span className="font-semibold text-neutral-900">Bon consum nr:</span>
          <span>{header.document_number || "—"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">Data:</span>
          <span>{header.document_date || "—"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">Destinație:</span>
          <span>{header.destination || "—"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="consume-document-number">
            Număr document <span className="text-red-500">*</span>
          </label>
          <input
            id="consume-document-number"
            type="text"
            className={classNameFor("document_number")}
            value={header.document_number}
            onChange={handleChange("document_number")}
            placeholder="Ex: BC-00123"
          />
          {renderError("document_number")}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="consume-document-date">
            Data documentului <span className="text-red-500">*</span>
          </label>
          <input
            id="consume-document-date"
            type="date"
            className={classNameFor("document_date")}
            value={header.document_date}
            onChange={handleChange("document_date")}
          />
          {renderError("document_date")}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="consume-destination">
            Destinație <span className="text-red-500">*</span>
          </label>
          <input
            id="consume-destination"
            type="text"
            className={classNameFor("destination")}
            value={header.destination}
            onChange={handleChange("destination")}
            placeholder="Ex: Bucătărie, Eveniment special"
          />
          {renderError("destination")}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="consume-reason">
            Motiv <span className="text-red-500">*</span>
          </label>
          <input
            id="consume-reason"
            type="text"
            className={classNameFor("reason")}
            value={header.reason}
            onChange={handleChange("reason")}
            placeholder="Ex: Producție, Personal, Pierderi"
          />
          {renderError("reason")}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="consume-notes">
          Observații
        </label>
        <textarea
          id="consume-notes"
          className="input min-h-[80px]"
          value={header.notes}
          onChange={handleChange("notes")}
          placeholder="Detalii suplimentare"
        />
      </div>
    </section>
  );
}

