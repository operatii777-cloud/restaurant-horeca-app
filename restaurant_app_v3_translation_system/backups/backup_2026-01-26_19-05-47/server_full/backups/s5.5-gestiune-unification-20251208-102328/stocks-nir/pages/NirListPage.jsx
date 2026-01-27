// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/components/DataGrid";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { useNirList } from "../api/useNir";
import { exportNirPdf } from "../utils/NirPdfDocument";
import { httpClient } from "@/shared/api/httpClient";

export default function NirListPage() {
  const navigate = useNavigate();
  const { nirs, loading, error, refetch } = useNirList();
  const [exportingId, setExportingId] = useState(null);
  const normalizeNumber = useCallback((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }, []);

  const handleExportFromList = useCallback(
    async (row) => {
      if (!row) return;
      setExportingId(row.id);
      try {
        const details = await httpClient
          .get(`/api/admin/nir/${row.id}`)
          .then((response) => response.data)
          .catch(() => null);

        const totalValue = normalizeNumber(row.total_value ?? details?.total_value);
        const totalTva = normalizeNumber(row.total_tva ?? details?.total_tva);
        const payload = {
          header: {
            id: row.id,
            supplier_id: row.supplier_id,
            supplier_name: row.supplier_name,
            document_number: row.document_number,
            document_date: row.document_date,
            notes: row.notes,
            ...(details ?? {}),
          },
          lines: details?.lines ?? row.lines ?? [],
          totals: {
            total_value: totalValue,
            total_tva: totalTva,
            grand_total: normalizeNumber(details?.grand_total ?? row.grand_total ?? totalValue + totalTva),
          },
        };

        const { url } = await exportNirPdf(payload);
        const docNo = payload.header.document_number || payload.header.id;
        const docDate = payload.header.document_date || "";
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `NIR_${docNo}_${docDate || "document"}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      } catch (exportError) {
        console.error("❌ Export NIR PDF din listă eșuat:", exportError);
      } finally {
        setExportingId(null);
      }
    },
    [normalizeNumber],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 90 },
      { headerName: "Furnizor", field: "supplier_name", flex: 1, minWidth: 180 },
      { headerName: "Număr document", field: "document_number", minWidth: 160 },
      {
        headerName: "Data",
        field: "document_date",
        width: 140,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString("ro-RO") : "—"),
      },
      {
        headerName: "Total (RON)",
        field: "total_value",
        width: 150,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 }),
      },
      {
        headerName: "Acțiuni",
        colId: "actions",
        width: 220,
        pinned: "right",
        cellRenderer: (params) => {
          const isExporting = exportingId === params.data?.id;
          return (
            <div className="flex gap-2">
              <button type="button" className="btn btn-link px-1 text-primary-600" data-action="open">
                Deschide
              </button>
              <button type="button" className="btn btn-link px-1 text-primary-600" data-action="export" disabled={isExporting}>
                {isExporting ? "Se generează…" : "Export PDF"}
              </button>
            </div>
          );
        },
      },
    ],
    [exportingId],
  );

  const handleRowDoubleClick = useCallback(
    (event) => {
      if (!event.data?.id) return;
      navigate(`/stocks/nir/${event.data.id}`);
    },
    [navigate],
  );

  const handleCellClicked = useCallback(
    (event) => {
      if (event.colDef?.colId !== "actions") return;
      const button =
        event.event?.target instanceof HTMLElement ? event.event.target.closest("button[data-action]") : null;
      if (!button || button.hasAttribute("disabled")) return;
      const action = button.getAttribute("data-action");
      if (!action) return;
      if (action === "open" && event.data?.id) {
        navigate(`/stocks/nir/${event.data.id}`);
        return;
      }
      if (action === "export") {
        handleExportFromList(event.data);
      }
    },
    [handleExportFromList, navigate],
  );

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">NIR-uri</h1>
          <p className="text-sm text-neutral-500">Urmărește recepțiile salvate și creează documente noi.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/stocks/nir/new")}>
            ➕ NIR nou
          </button>
        </div>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <DataGrid
        columnDefs={columnDefs}
        rowData={nirs}
        loading={loading}
        height="65vh"
        agGridProps={{
          onRowDoubleClicked: handleRowDoubleClick,
          onCellClicked: handleCellClicked,
        }}
      />
    </div>
  );
}