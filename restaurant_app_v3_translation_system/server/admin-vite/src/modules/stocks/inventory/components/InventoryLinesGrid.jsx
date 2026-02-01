import React, { useMemo } from "react";
import { useInventoryStore } from "../store/inventoryStore";
import "./InventoryLinesGrid.css";

export default function InventoryLinesGrid() {
  const { lines, updateLine, addLine, removeLine, validation } = useInventoryStore();
  const lineErrors = validation?.lineErrors ?? {};

  return (
    <section className="card space-y-3 h-[600px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Linii inventar</h3>
          <p className="text-sm text-neutral-500">Introdu stocul faptic (coloana albastră).</p>
        </div>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
          ➕ Adaugă linie
        </button>
      </div>

      <div className="overflow-auto flex-1 border rounded-lg shadow-inner bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 w-10">!</th>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Ingredient</th>
              <th className="px-4 py-3 w-24">Unitate</th>
              <th className="px-4 py-3 w-32 text-right">Stoc Scriptic</th>
              <th className="px-4 py-3 w-32 text-right">Stoc Faptic</th>
              <th className="px-4 py-3 w-32 text-right">Diferență</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Nu există linii de inventar.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const error = lineErrors[index];
                const diff = (line.stock_counted || 0) - (line.stock_system || 0);
                const diffColor = diff > 0 ? "text-green-700 font-bold" : diff < 0 ? "text-red-700 font-bold" : "text-gray-500";

                return (
                  <tr key={line.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {error && Object.keys(error).length > 0 && (
                        <span className="text-red-500 font-bold cursor-help" title={Object.values(error).join(" • ")}>⚠</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{line.ingredient_name || line.name || "-"}</td>
                    <td className="px-4 py-2 text-gray-500">{line.unit}</td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        className="input-ghost text-right w-full"
                        value={line.stock_system ?? 0}
                        onChange={(e) => updateLine(line.id, "stock_system", Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right bg-blue-50">
                      <input
                        type="number"
                        className="input-ghost text-right w-full bg-transparent font-medium"
                        placeholder="0"
                        value={line.stock_counted ?? ""}
                        onChange={(e) => updateLine(line.id, "stock_counted", Number(e.target.value))}
                      />
                    </td>
                    <td className={`px-4 py-2 text-right ${diffColor}`}>
                      {Number(diff).toLocaleString("ro-RO", { maximumFractionDigits: 3 })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => removeLine(line.id)}
                        title="Șterge linie"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

