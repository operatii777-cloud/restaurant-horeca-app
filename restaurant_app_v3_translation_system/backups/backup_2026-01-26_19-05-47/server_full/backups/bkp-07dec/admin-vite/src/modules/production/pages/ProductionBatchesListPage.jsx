// src/modules/production/pages/ProductionBatchesListPage.jsx
// Pagină pentru listarea batch-urilor de producție

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useProductionBatches,
  useDeleteBatch,
} from "../hooks/useProductionBatches";
import { finalizeBatch } from "../api/productionApi";

export default function ProductionBatchesListPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProductionBatches();
  const deleteBatch = useDeleteBatch();

  const handleDelete = async (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest batch? Această acțiune va șterge și mișcările de stoc asociate.")) {
      return;
    }
    try {
      await deleteBatch.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error("❌ Eroare la ștergerea batch-ului:", err);
      alert("Nu s-a putut șterge batch-ul.");
    }
  };

  const handleFinalize = async (batchId) => {
    if (!window.confirm("Ești sigur că vrei să finalizezi acest batch? Această acțiune va genera mișcările de stoc (PRODUCTION_OUT/IN).")) {
      return;
    }
    try {
      await finalizeBatch(batchId);
      alert("Batch finalizat cu succes!");
      refetch();
    } catch (err) {
      console.error("❌ Eroare la finalizarea batch-ului:", err);
      alert(err.message || "Nu s-a putut finaliza batch-ul.");
    }
  };

  if (isLoading) return <div className="p-4">Se încarcă...</div>;
  if (error) return <div className="p-4 text-red-600">Eroare la încărcare.</div>;

  const batches = Array.isArray(data) ? data : [];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Producție – Batches</h1>
        <Link
          to="/production/batches/new"
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Crează batch
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Batch #</th>
              <th className="px-3 py-2 text-left">Rețetă/Produs</th>
              <th className="px-3 py-2 text-left">Gestiune</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Responsabil</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{b.batch_number || `#${b.id}`}</td>
                <td className="px-3 py-2">{b.recipe_name || "-"}</td>
                <td className="px-3 py-2">{b.location_name || "-"}</td>
                <td className="px-3 py-2">
                  {b.batch_date || b.created_at?.substring(0, 10) || "-"}
                </td>
                <td className="px-3 py-2">{b.responsible || "-"}</td>
                <td className="px-3 py-2">
                  {b.status === "completed" ? (
                    <span className="text-green-600 font-medium">Finalizat</span>
                  ) : b.status === "in_progress" ? (
                    <span className="text-blue-600 font-medium">În progres</span>
                  ) : (
                    <span className="text-yellow-700">Draft</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link
                      to={`/production/batches/${b.id}`}
                      className="text-blue-600 underline text-xs hover:text-blue-800"
                    >
                      Editare
                    </Link>
                    {b.status !== "completed" && (
                      <button
                        className="text-green-700 underline text-xs hover:text-green-900"
                        onClick={() => handleFinalize(b.id)}
                      >
                        Finalizează
                      </button>
                    )}
                    <button
                      className="text-red-600 underline text-xs hover:text-red-800"
                      onClick={() => handleDelete(b.id)}
                      disabled={deleteBatch.isPending}
                    >
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!batches.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  Nu există batches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

