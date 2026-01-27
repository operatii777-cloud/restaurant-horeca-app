// src/modules/tipizate/pages/FisaMagaziePage.jsx
// Pagină pentru generarea Fișei de Magazie

import React, { useState } from "react";
import { getFisaMagaziePdfUrl } from "../tipizateApi";
import DownloadPdfButton from "../DownloadPdfButton";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function FisaMagaziePage() {
  const [ingredientId, setIngredientId] = useState("");
  const [locationId, setLocationId] = useState("");

  const { data: ingredients } = useApiQuery("/api/admin/ingredients");
  const { data: locations } = useApiQuery("/api/admin/locations");

  const ingredientsList = Array.isArray(ingredients) ? ingredients : [];
  const locationsList = Array.isArray(locations) ? locations : [];

  const url =
    ingredientId && locationId
      ? getFisaMagaziePdfUrl(parseInt(ingredientId), parseInt(locationId))
      : null;

  return (
    <div className="p-4 flex flex-col gap-4 max-w-lg">
      <h1 className="text-xl font-semibold">Fișă de magazie</h1>
      <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-600">Ingredient</label>
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={ingredientId}
            onChange={(e) => setIngredientId(e.target.value)}
          >
            <option value="">Selectează ingredient</option>
            {ingredientsList.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
        </div>
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
        <div className="pt-2">
          {url ? (
            <DownloadPdfButton url={url} label="Descarcă Fișă Magazie PDF" />
          ) : (
            <span className="text-xs text-gray-500">
              Selectează ingredient și gestiune pentru a genera PDF.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

