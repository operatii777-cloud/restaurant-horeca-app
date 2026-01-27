// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";

export default function NirErrorPanel({ generalErrors = [], warnings = [] }) {
  const hasErrors = Array.isArray(generalErrors) && generalErrors.length > 0;
  const hasWarnings = Array.isArray(warnings) && warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className="space-y-2">
      {hasErrors ? (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          <div className="mb-1 font-semibold">Nu poți salva acest NIR:</div>
          <ul className="ml-5 list-disc">
            {generalErrors.map((message, index) => (
              <li key={`err-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasWarnings ? (
        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <div className="mb-1 font-semibold">Atenție (nu blochează salvarea):</div>
          <ul className="ml-5 list-disc">
            {warnings.map((message, index) => (
              <li key={`warn-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

