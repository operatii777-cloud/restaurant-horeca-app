// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

// src/modules/tipizate/pages/RegistruCasaPage.jsx
// Pagină pentru generarea Registrului de Casă

import React, { useState } from "react";
import { getRegistruCasaPdfUrl } from "../tipizateApi";
import DownloadPdfButton from "../DownloadPdfButton";

export default function RegistruCasaPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const url = from && to ? getRegistruCasaPdfUrl(from, to) : null;

  return (
    <div className="p-4 flex flex-col gap-4 max-w-lg">
      <h1 className="text-xl font-semibold">Registru de casă</h1>
      <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">De la data</label>
          <input
            type="date"
            className="border rounded-md px-2 py-1 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Până la data</label>
          <input
            type="date"
            className="border rounded-md px-2 py-1 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="pt-2">
          {url ? (
            <DownloadPdfButton url={url} label="Descarcă Registru PDF" />
          ) : (
            <span className="text-xs text-gray-500">
              Selectează perioada pentru a genera PDF.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

