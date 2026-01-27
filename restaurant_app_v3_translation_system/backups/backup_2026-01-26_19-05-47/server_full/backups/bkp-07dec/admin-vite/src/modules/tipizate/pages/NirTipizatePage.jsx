// src/modules/tipizate/pages/NirTipizatePage.jsx
// Pagină pentru listarea NIR-urilor cu buton PDF

import React from "react";
import DownloadPdfButton from "../DownloadPdfButton";
import { getNirPdfUrl } from "../tipizateApi";
import { useNirList } from "../../stocks/nir/api/useNir";

export default function NirTipizatePage() {
  const { nirs, loading, error } = useNirList();

  if (loading) return <div className="p-4">Se încarcă NIR-urile...</div>;
  if (error) return <div className="p-4 text-red-600">Eroare la încărcare.</div>;

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">NIR – tipizate</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Număr</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Furnizor</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Tipizat</th>
            </tr>
          </thead>
          <tbody>
            {nirs.map((nir) => (
              <tr key={nir.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{nir.document_number || nir.id}</td>
                <td className="px-3 py-2">
                  {nir.document_date || nir.created_at?.substring(0, 10)}
                </td>
                <td className="px-3 py-2">{nir.supplier_name || "-"}</td>
                <td className="px-3 py-2 text-right">
                  {nir.total_value
                    ? `${(nir.total_value + (nir.total_tva || 0)).toFixed(2)} lei`
                    : "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  <DownloadPdfButton
                    url={getNirPdfUrl(nir.id)}
                    label="PDF NIR"
                    className="text-[11px]"
                  />
                </td>
              </tr>
            ))}
            {!nirs.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  Nu există NIR-uri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

