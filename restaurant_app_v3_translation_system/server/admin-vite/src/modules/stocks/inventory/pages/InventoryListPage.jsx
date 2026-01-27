import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
// import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/components/DataGrid";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { useInventoryList } from "../api/useInventory";
import { httpClient } from "@/shared/api/httpClient";
import { exportInventoryPdf } from "../utils/InventoryPdfDocument";
import { InvoiceImportModal } from "../components/InvoiceImportModal";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function InventoryListPage() {
  const navigate = useNavigate();
  const { inventories, loading, error, refetch } = useInventoryList();
  const [exportingId, setExportingId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExportRow = useCallback(async (row) => {
    if (!row?.id) return;
    setExportingId(row.id);
    try {
      const payload = await httpClient.get(`/api/admin/inventories/${row.id}`).then((res) => res.data);
      if (!payload) {
        throw new Error("Inventarul nu a putut fi încărcat pentru export.");
      }
      const { url } = await exportInventoryPdf(payload);
      const docNo = payload.header?.document_number || row.document_number || row.id;
      const docDate = payload.header?.document_date || row.document_date || "";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `INVENTAR_${docNo}_${docDate || "document"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("❌ Export inventar PDF din listă eșuat:", exportError);
    } finally {
      setExportingId(null);
    }
  }, []);

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 90 },
      { headerName: "Număr inventar", field: "document_number", width: 160 },
      {
        headerName: "Data",
        field: "document_date",
        width: 140,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString("ro-RO") : "—"),
      },
      { headerName: "Locație", field: "location", flex: 1, minWidth: 180 },
      { headerName: "Responsabil", field: "responsible", flex: 1, minWidth: 160 },
      {
        headerName: "Total plus",
        field: "total_positive",
        width: 140,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 }),
      },
      {
        headerName: "Total minus",
        field: "total_negative",
        width: 140,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 }),
      },
      {
        headerName: "Acțiuni",
        colId: "actions",
        width: 260,
        pinned: "right",
        cellRenderer: (params) => {
          const row = params.data;
          const isExporting = exportingId === row?.id;
          return `
            <div class="flex gap-2">
              <button class="btn btn-link px-1 text-primary-600" data-action="open">Deschide</button>
              <button class="btn btn-link px-1 text-primary-600" data-action="export" ${isExporting ? "disabled" : ""}>
                ${isExporting ? "Se generează…" : "Export PDF"}
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
      const action = (
        event.event?.target instanceof HTMLElement ? event.event.target.closest("button[data-action]") : null
      )?.getAttribute("data-action");
      if (action === "open" && event.data?.id) {
        navigate(`/stocks/inventory/${event.data.id}`);
        return;
      }
      if (action === "export") {
        handleExportRow(event.data);
      }
    },
    [handleExportRow, navigate],
  );

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Inventare stoc</h1>
          <p className="text-sm text-neutral-500">Centralizează toate inventarele și ajustările realizate.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={() => setShowImportModal(true)}>
            <i className="fas fa-file-upload me-1"></i>Import Factură
          </Button>
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/stocks/inventory/new")}>
            ➕ Inventar nou
          </button>
        </div>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}

      <DataGrid
        columnDefs={columnDefs}
        rowData={inventories}
        loading={loading}
        height="65vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
        }}
      />

      <InvoiceImportModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}

