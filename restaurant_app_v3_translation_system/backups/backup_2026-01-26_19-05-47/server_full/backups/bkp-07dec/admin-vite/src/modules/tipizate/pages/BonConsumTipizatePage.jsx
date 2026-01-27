// src/modules/tipizate/pages/BonConsumTipizatePage.jsx
// Pagină pentru listarea bonurilor de consum cu buton PDF

import React from "react";
import DownloadPdfButton from "../DownloadPdfButton";
import { getBonConsumPdfUrl } from "../tipizateApi";
import { useConsumeList } from "../../stocks/consume/api/useConsume";

export default function BonConsumTipizatePage() {
  const { consumptionNotes, loading, error } = useConsumeList();

  if (loading)
    return <div className="p-4">Se încarcă bonurile de consum...</div>;
  if (error) return <div className="p-4 text-red-600">Eroare la încărcare.</div>;

  const items = Array.isArray(consumptionNotes) ? consumptionNotes : [];

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Bonuri de consum – tipizate</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Număr</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Sursă</th>
              <th className="px-3 py-2 text-left">Destinație</th>
              <th className="px-3 py-2 text-right">Tipizat</th>
            </tr>
          </thead>
          <tbody>
            {items.map((bon) => (
              <tr key={bon.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{bon.document_number || bon.id}</td>
                <td className="px-3 py-2">
                  {bon.date || bon.created_at?.substring(0, 10)}
                </td>
                <td className="px-3 py-2">{bon.source || "-"}</td>
                <td className="px-3 py-2">{bon.destination || "-"}</td>
                <td className="px-3 py-2 text-right">
                  <DownloadPdfButton
                    url={getBonConsumPdfUrl(bon.id)}
                    label="PDF Bon consum"
                    className="text-[11px]"
                  />
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  Nu există bonuri de consum.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

