import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@/shared/components/DataGrid";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { useTransferList } from "../api/useTransfer";
import { httpClient } from "@/shared/api/httpClient";
import { exportTransferPdf } from "../utils/TransferPdfDocument";

export default function TransferListPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useTransferList({});
  const [exportingId, setExportingId] = useState(null);

  const handleExport = useCallback(async (row) => {
    if (!row?.id) return;
    setExportingId(row.id);
    try {
      const res = await httpClient.get(`/api/admin/transfers/${row.id}`);
      const payload = res.data;
      const { url } = await exportTransferPdf(payload);
      const docNo = payload.header?.document_number || row.document_number || row.id;
      const docDate = payload.header?.document_date || row.document_date || "";
      const a = document.createElement("a");
      a.href = url;
      a.download = `TRANSFER_${docNo}_${docDate || "doc"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Export transfer PDF eșuat:", err);
    } finally {
      setExportingId(null);
    }
  }, []);

  const columns = useMemo(
    () => [
      { headerName: "Număr", field: "document_number", width: 160 },
      {
        headerName: "Dată",
        field: "document_date",
        width: 140,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString("ro-RO") : "—"),
      },
      { headerName: "Sursă", field: "source_location", flex: 1, minWidth: 180 },
      { headerName: "Destinație", field: "target_location", flex: 1, minWidth: 180 },
      {
        headerName: "Valoare",
        field: "total_value",
        width: 140,
        valueFormatter: (p) => Number(p.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 2 }),
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
      const btn =
        event.event?.target instanceof HTMLElement ? event.event.target.closest("button[data-action]") : null;
      if (!btn || btn.hasAttribute("disabled")) return;
      const action = btn.getAttribute("data-action");
      if (action === "open" && event.data?.id) {
        navigate(`/stocks/transfer/${event.data.id}`);
        return;
      }
      if (action === "export") {
        handleExport(event.data);
      }
    },
    [handleExport, navigate],
  );

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Transferuri depozit</h1>
          <p className="text-sm text-neutral-500">Mutări de stoc între gestiuni/zone.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={refetch}>
            ⟳ Reîmprospătează
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/stocks/transfer/new")}>
            ➕ Transfer nou
          </button>
        </div>
      </header>
      {error ? <InlineAlert variant="error" title="Eroare" message="Nu s-au putut încărca transferurile." /> : null}
      <DataGrid
        columnDefs={columns}
        rowData={Array.isArray(data) ? data : []}
        loading={isLoading}
        height="65vh"
        agGridProps={{ onCellClicked: handleCellClicked }}
      />
    </div>
  );
}


