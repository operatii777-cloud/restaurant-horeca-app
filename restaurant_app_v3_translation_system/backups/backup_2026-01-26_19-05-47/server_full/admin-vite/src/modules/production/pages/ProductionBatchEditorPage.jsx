// src/modules/production/pages/ProductionBatchEditorPage.jsx
// Pagină pentru crearea/editarea unui batch de producție

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useProductionBatch,
  useCreateBatch,
  useUpdateBatch,
  useFinalizeBatch,
} from "../hooks/useProductionBatches";
import ProductionBatchForm from "../components/ProductionBatchForm";
import ProductionBatchIngredientsGrid from "../components/ProductionBatchIngredientsGrid";
import ProductionBatchResultsGrid from "../components/ProductionBatchResultsGrid";
// import DownloadPdfButton from "../../tipizate/DownloadPdfButton"; // Component removed
// import { getProductionBatchPdfUrl } from "../../tipizate/tipizateApi"; // API removed
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function ProductionBatchEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const batchQuery = useProductionBatch(isNew ? null : id);
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch(id);
  const finalizeBatchMutation = useFinalizeBatch(id);

  const [form, setForm] = useState({
    batch_date: "",
    location_id: null,
    recipe_id: null,
    recipe_name: "",
    responsible: "",
    notes: "",
  });

  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);

  // Load existing batch
  useEffect(() => {
    if (!isNew && batchQuery.data) {
      const b = batchQuery.data;
      setForm({
        batch_date: b.batch_date || b.created_at?.substring(0, 10) || "",
        location_id: b.location_id || null,
        recipe_id: b.recipe_id || null,
        recipe_name: b.recipe_name || "",
        responsible: b.responsible || "",
        notes: b.notes || "",
      });
      setItems(b.items || []);
      setResults(b.results || []);
    }
  }, [batchQuery.data, isNew]);

  // Load recipe items when recipe_id changes
  // Notă: Backend-ul nu are endpoint direct pentru recipe_id, ci pentru product_id
  // Trebuie să adaptăm sau să folosim datele din batch existent
  useEffect(() => {
    if (form.recipe_id && !isNew) {
      // Pentru batch-uri existente, items sunt deja încărcate din batchQuery.data
      // Nu trebuie să le reîncărcăm
      return;
    }
    // Pentru batch-uri noi, dacă avem recipe_id, ar trebui să avem și product_id
    // Momentan, lăsăm items goale și utilizatorul le va completa manual
    if (!form.recipe_id) {
      setItems([]);
    }
  }, [form.recipe_id, isNew]);

  // Initialize results - pentru batch-uri noi, utilizatorul va adăuga manual rezultatele
  // Pentru batch-uri existente, results sunt deja încărcate din batchQuery.data

  const handleSave = async () => {
    if (!form.batch_date || !form.responsible) {
      alert("Completează data și responsabilul.");
      return;
    }

    if (items.length === 0 && results.length === 0) {
      alert("Adaugă cel puțin un ingredient sau un rezultat.");
      return;
    }

    // Validare: toate ingredientele trebuie să aibă ingredient_id setat
    const invalidIngredients = items.filter((item) => !item.ingredient_id);
    if (invalidIngredients.length > 0) {
      alert(`Eroare: ${invalidIngredients.length} linie(i) de ingrediente nu au ingredient selectat. Selectează un ingredient pentru fiecare linie.`);
      return;
    }

    // Validare: toate rezultatele trebuie să aibă product_id setat
    const invalidResults = results.filter((result) => !result.product_id);
    if (invalidResults.length > 0) {
      alert(`Eroare: ${invalidResults.length} linie(i) de rezultate nu au produs selectat. Selectează un produs pentru fiecare linie.`);
      return;
    }

    const payload = {
      batch_date: form.batch_date,
      recipe_id: form.recipe_id || null,
      recipe_name: form.recipe_name || null,
      responsible: form.responsible,
      location_id: form.location_id || 1,
      notes: form.notes || null,
      items: items.map((item) => ({
        ingredient_id: item.ingredient_id,
        quantity_planned: Number(item.quantity_planned) || 0,
        quantity_used: Number(item.quantity_used) || 0,
        unit: item.unit || "buc",
        cost_per_unit: Number(item.cost_per_unit) || 0,
        total_cost: Number(item.total_cost) || 0,
      })),
      results: results.map((result) => ({
        product_id: result.product_id,
        quantity_produced: Number(result.quantity_produced) || 0,
        unit: result.unit || "buc",
        cost_per_unit: Number(result.cost_per_unit) || 0,
        total_cost: Number(result.total_cost) || 0,
        lot_number: result.lot_number || null,
        expiry_date: result.expiry_date || null,
      })),
    };

    try {
      if (isNew) {
        const newBatch = await createBatch.mutateAsync(payload);
        navigate(`/production/batches/${newBatch.id}`);
      } else {
        await updateBatch.mutateAsync(payload);
        alert("Batch actualizat cu succes!");
      }
    } catch (err) {
      console.error("❌ Eroare la salvarea batch-ului:", err);
      alert(err.message || "Nu s-a putut salva batch-ul.");
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm("Ești sigur că vrei să finalizezi acest batch? Această acțiune va genera mișcările de stoc (PRODUCTION_OUT/IN) și nu poate fi anulată.")) {
      return;
    }

    try {
      await finalizeBatchMutation.mutateAsync();
      alert("Batch finalizat cu succes! Mișcările de stoc au fost generate.");
      navigate("/production/batches");
    } catch (err) {
      console.error("❌ Eroare la finalizarea batch-ului:", err);
      alert(err.message || "Nu s-a putut finaliza batch-ul.");
    }
  };

  if (!isNew && batchQuery.isLoading) {
    return <div className="p-4">Se încarcă...</div>;
  }

  const batch = batchQuery.data;
  const canFinalize = !isNew && batch && batch.status !== "completed";

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          {isNew ? "Creare Batch Producție" : `Editare Batch #"Id"`}
        </h1>
        {!isNew && batch?.status === "completed" && (
          <button
            onClick={() => window.open(`/api/tipizate/production-batch/"Id"/pdf`, '_blank')}
            className="btn btn-sm btn-outline-primary text-xs"
          >
            <i className="fas fa-file-pdf me-1"></i>PDF Fișă fabricație
          </button>
        )}
      </div>

      <ProductionBatchForm form={form} setForm={setForm} />

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Ingredientele necesare</h3>
        <button
          onClick={() => {
            const newItem = {
              ingredient_id: null,
              ingredient_name: "",
              quantity_planned: 0,
              quantity_used: 0,
              unit: "buc",
              cost_per_unit: 0,
              total_cost: 0,
            };
            setItems([...items, newItem]);
          }}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300"
        >
          + Adaugă ingredient
        </button>
      </div>
      <ProductionBatchIngredientsGrid ingredients={items} setIngredients={setItems} />

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Rezultate producție</h3>
        <button
          onClick={() => {
            const newResult = {
              product_id: null,
              product_name: "",
              quantity_produced: 0,
              unit: "buc",
              cost_per_unit: 0,
              total_cost: 0,
            };
            setResults([...results, newResult]);
          }}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300"
        >
          + Adaugă rezultat
        </button>
      </div>
      <ProductionBatchResultsGrid results={results} setResults={setResults} />

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => navigate("/production/batches")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
        >
          Anulează
        </button>
        <button
          onClick={handleSave}
          disabled={createBatch.isPending || updateBatch.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {createBatch.isPending || updateBatch.isPending ? "Se salvează..." : "Salvează"}
        </button>
        {canFinalize && (
          <button
            onClick={handleFinalize}
            disabled={finalizeBatchMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {finalizeBatchMutation.isPending ? "Se finalizează..." : "Finalizează Producția"}
          </button>
        )}
      </div>
    </div>
  );
}

