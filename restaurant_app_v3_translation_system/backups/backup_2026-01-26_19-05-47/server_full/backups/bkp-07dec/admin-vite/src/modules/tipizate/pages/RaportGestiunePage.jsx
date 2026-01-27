// src/modules/tipizate/pages/RaportGestiunePage.jsx
// Pagină pentru generarea Raportului de Gestiune

import React, { useState } from "react";
import { getRaportGestiunePdfUrl } from "../tipizateApi";
import DownloadPdfButton from "../DownloadPdfButton";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function RaportGestiunePage() {
  const [locationId, setLocationId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: locations } = useApiQuery("/api/admin/locations");
  const locationsList = Array.isArray(locations) ? locations : [];

  const url =
    locationId && from && to
      ? getRaportGestiunePdfUrl(parseInt(locationId), from, to)
      : null;

  return (
    <div className="p-4 flex flex-col gap-4 max-w-lg">
      <h1 className="text-xl font-semibold">Raport de gestiune</h1>
      <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Gestiune</label>
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">Selectează gestiune</option>
            {locationsList.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
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
            <DownloadPdfButton url={url} label="Descarcă Raport PDF" />
          ) : (
            <span className="text-xs text-gray-500">
              Selectează gestiune și perioada pentru a genera PDF.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

