// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useMemo } from "react";
import { useNirStore } from "../state/nirStore";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// type NirHeaderFormProps = {
//   onHeaderChange?: (field: string, value: unknown) => void;
// };

export default function NirHeaderForm({ onHeaderChange }) {
  const { header, setHeader, validation } = useNirStore();
  const headerErrors = validation?.headerErrors ?? {};
  const { data: suppliersData } = useApiQuery("/api/suppliers");

  const supplierOptions = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData
      .map((item) => ({
        id: item.id ?? item.supplier_id ?? item.code ?? null,
        name: item.company_name ?? item.name ?? `Furnizor ${item.id ?? ""}`,
      }))
      .filter((item) => item.id !== null);
  }, [suppliersData]);

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    const parsedValue = field === "supplier_id" ? Number(value) || "" : value;
    setHeader(field, parsedValue);
    onHeaderChange?.(field, parsedValue);
  };

  const fieldClassName = (field) =>
    ["input", headerErrors?.[field] ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""]
      .filter(Boolean)
      .join(" ");

  const renderError = (field) =>
    headerErrors?.[field] ? (
      <p className="text-xs text-red-600" role="alert">
        {headerErrors[field]}
      </p>
    ) : null;

  const documentNumberDisplay = header.document_number || header.nir_number || header.number || "—";
  const documentDateDisplay = header.document_date
    ? new Date(header.document_date).toLocaleDateString("ro-RO")
    : "—";

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
        <div>
          <span className="font-medium text-neutral-800">Număr NIR:&nbsp;</span>
          <span>{documentNumberDisplay}</span>
        </div>
        <div>
          <span className="font-medium text-neutral-800">Data document:&nbsp;</span>
          <span>{documentDateDisplay}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="nir-supplier">
          Furnizor <span className="text-red-500">*</span>
        </label>
        <select
          id="nir-supplier"
          className={fieldClassName("supplier_id")}
          required
          value={header.supplier_id ?? ""}
          onChange={handleChange("supplier_id")}
        >
          <option value="">Selectează furnizor</option>
          {supplierOptions.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        {renderError("supplier_id")}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="nir-document-number">
            Număr document <span className="text-red-500">*</span>
          </label>
          <input
            id="nir-document-number"
            type="text"
            className={fieldClassName("document_number")}
            placeholder="Ex: NIR-00123"
            required
            value={header.document_number ?? ""}
            onChange={handleChange("document_number")}
          />
          {renderError("document_number")}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="nir-document-date">
            Data documentului <span className="text-red-500">*</span>
          </label>
          <input
            id="nir-document-date"
            type="date"
            className={fieldClassName("document_date")}
            required
            value={header.document_date ?? ""}
            onChange={handleChange("document_date")}
          />
          {renderError("document_date")}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="nir-notes">
          Note
        </label>
        <textarea
          id="nir-notes"
          className="input min-h-[90px]"
          placeholder="Detalii suplimentare despre recepție"
          value={header.notes ?? ""}
          onChange={handleChange("notes")}
        />
      </div>
    </section>
  );
}
