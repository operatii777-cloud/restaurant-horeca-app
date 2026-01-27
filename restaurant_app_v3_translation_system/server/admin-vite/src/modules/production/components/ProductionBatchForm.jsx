// src/modules/production/components/ProductionBatchForm.jsx
// Formular principal pentru Production Batch

import React from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function ProductionBatchForm({ form, setForm }) {
  const { data: locations } = useApiQuery("/api/settings/locations");
  const { data: menuData } = useApiQuery("/api/admin/menu");
  const { data: recipesData } = useApiQuery("/api/recipes/");

  const locationsList = locations?.locations || (Array.isArray(locations) ? locations : []);
  // Menu data poate fi un obiect cu products array sau direct array
  const productsList = Array.isArray(menuData) 
    ? menuData 
    : (menuData?.products || []);
  // Recipes data: endpoint-ul /api/recipes/ returnează {success: true, data: [...]}
  const recipesList = recipesData?.data || (Array.isArray(recipesData) ? recipesData : []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">Data producției</label>
        <input
          type="date"
          className="border rounded-md px-2 py-1 text-sm"
          value={form.batch_date || ""}
          onChange={(e) => setForm({ ...form, batch_date: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">Gestiune</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={form.location_id || ""}
          onChange={(e) =>
            setForm({ ...form, location_id: Number(e.target.value) || null })
          }
        >
          <option value="">Selectează</option>
          {locationsList.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">Rețetă (opțional)</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={form.recipe_id || ""}
          onChange={(e) => {
            const recipeId = Number(e.target.value) || null;
            setForm({ ...form, recipe_id: recipeId });
            // Dacă există rețetă, încarcă ingredientele
            if (recipeId) {
              const recipe = recipesList.find((r) => r.id === recipeId);
              if (recipe) {
                setForm({
                  ...form,
                  recipe_id: recipeId,
                  recipe_name: recipe.name || recipe.recipe_name || "",
                });
              }
            }
          }}
        >
          <option value="">Selectează rețetă</option>
          {recipesList.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || r.recipe_name || `Rețetă #${r.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">Responsabil</label>
        <input
          type="text"
          className="border rounded-md px-2 py-1 text-sm"
          value={form.responsible || ""}
          onChange={(e) => setForm({ ...form, responsible: e.target.value })}
          placeholder="Nume responsabil"
        />
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-xs text-gray-600">Observații</label>
        <textarea
          className="border rounded-md px-2 py-1 text-sm"
          rows={2}
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Observații despre batch-ul de producție"
        />
      </div>
    </div>
  );
}

