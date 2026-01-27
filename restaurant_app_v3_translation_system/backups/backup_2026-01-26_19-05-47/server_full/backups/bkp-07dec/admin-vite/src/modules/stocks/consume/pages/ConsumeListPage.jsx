import React, { useMemo, useCallback, useState } from "react";
// import { ColDef } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@/shared/components/DataGrid";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { httpClient } from "@/shared/api/httpClient";
import { useConsumeList } from "../api/useConsume";
import { exportConsumePdf } from "../utils/ConsumePdfDocument";

export default function ConsumeListPage() {
  const navigate = useNavigate();
  const { consumptionNotes, loading, error, refetch } = useConsumeList();
  const [quickFilter, setQuickFilter] = useState("");
  const [exportingId, setExportingId] = useState(null);

  const handleExportRow = useCallback(async (row) => {
    if (!row?.id) return;
    setExportingId(row.id);
    try {
      const response = await httpClient.get(`/api/admin/consumption-notes/${row.id}`);
      const payload = response.data ?? row;
      const { url } = await exportConsumePdf(payload);
      const docNo = payload?.header?.document_number || payload.document_number || row.id;
      const rawDate = payload?.header?.document_date || payload.document_date || payload.date || "";
      const dateStr = typeof rawDate === "string" ? rawDate : rawDate?.toISOString?.().slice(0, 10) || "";
      const fileName = `CONSUME_${docNo}_${dateStr || "document"}.pdf`;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("❌ Export consume PDF from list failed:", exportError);
      alert("Nu s-a putut exporta PDF-ul. Încearcă din nou.");
    } finally {
      setExportingId(null);
    }
  }, []);

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 80 },
      { headerName: "Număr document", field: "document_number", width: 160 },
      {
        headerName: "Data",
        field: "document_date",
        width: 140,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString("ro-RO") : "—"),
      },
      { headerName: "Destinație", field: "destination", flex: 1, minWidth: 180 },
      { headerName: "Motiv", field: "reason", flex: 1, minWidth: 160 },
      {
        headerName: "Total cantitate",
        field: "total_quantity",
        width: 150,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 }),
      },
      {
        headerName: "Acțiuni",
        colId: "actions",
        width: 220,
        pinned: "right",
        cellRenderer: (params) => {
          const row = params.data;
          const isExporting = exportingId === row?.id;
          const disabledAttr = isExporting ? "disabled" : "";
          const exportText = isExporting ? "Export..." : "Export PDF";
          return `
            <div class="flex gap-2">
              <button class="btn btn-link px-1 text-primary-600" data-action="open" data-id="${row?.id}">Deschide</button>
              <button class="btn btn-link px-1 text-primary-600" data-action="export" data-id="${row?.id}" ${disabledAttr}>
                ${exportText}
              </button>
            </div>
          `;
        },
      },
    ],
    [exportingId],
  );

  const handleCellClicked = useCallback(
    (event) => {
      if (event.colDef?.colId !== "actions") return;
      const button =
        event.event?.target instanceof HTMLElement ? event.event.target.closest("button[data-action]") : null;
      if (!button || button.hasAttribute("disabled")) return;
      const action = button.getAttribute("data-action");
      const row = event.data;
      if (action === "open" && row?.id) {
        navigate(`/stocks/consume/${row.id}`);
      }
      if (action === "export") {
        handleExportRow(row);
      }
    },
    [handleExportRow, navigate],
  );

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Bonuri de consum</h1>
          <p className="text-sm text-neutral-500">Gestionează bonurile de consum și livrează rapid stocul către destinații interne.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/stocks/consume/new")}>
            ➕ Bon nou
          </button>
        </div>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <div className="flex items-center justify-between">
        <input
          type="text"
          className="input w-64"
          placeholder="Filtru rapid"
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
        />
      </div>

      <DataGrid
        columnDefs={columnDefs}
        rowData={consumptionNotes}
        loading={loading}
        height="65vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
        }}
        quickFilterText={quickFilter}
      />
    </div>
  );
}

