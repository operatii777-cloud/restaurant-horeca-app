import React, { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InlineAlert } from "@/shared/components/InlineAlert";
import { DataGrid } from "@/shared/components/DataGrid";
import useStockMoves from "../api/useStockMoves";
import { useStockMovesStore } from "../state/stockMovesStore";

export default function StockMovesPage() {
  const navigate = useNavigate();
  const { moves, filters, setFilter, setMoves, filteredMoves } = useStockMovesStore();
  const { data, isLoading, error } = useStockMoves(filters);

  useEffect(() => {
    if (Array.isArray(data)) {
      setMoves(data);
    }
  }, [data, setMoves]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Data",
        field: "date",
        width: 140,
        pinned: "left",
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString("ro-RO") : "—"),
      },
      {
        headerName: "Tip",
        field: "type",
        width: 130,
        pinned: "left",
        cellRenderer: (params) => {
          const type = params.value;
          const baseClass = "px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center";
          if (type === "NIR") {
            return `<span class="${baseClass} bg-green-100 text-green-800">NIR</span>`;
          }
          if (type === "CONSUME") {
            return `<span class="${baseClass} bg-red-100 text-red-800">CONSUME</span>`;
          }
          if (type === "ADJUST") {
            return `<span class="${baseClass} bg-sky-100 text-sky-800">ADJUST</span>`;
          }
          if (type === "TRANSFER") {
            return `<span class="${baseClass} bg-violet-100 text-violet-800">TRANSFER</span>`;
          }
          return `<span class="${baseClass} bg-slate-100 text-slate-800">${type ?? "—"}</span>`;
        },
      },
      { headerName: "Ingredient", field: "ingredient_name", flex: 1, minWidth: 180, pinned: "left" },
      {
        headerName: "Document",
        field: "reference_document",
        flex: 1,
        valueGetter: (params) =>
          params.data?.nir_document_number ||
          params.data?.consume_document_number ||
          params.data?.transfer_document_number ||
          params.data?.inventory_document_number ||
          params.data?.reference_id ||
          "—",
      },
      {
        headerName: "Partener",
        field: "reference_partner",
        flex: 1,
        valueGetter: (params) =>
          params.data?.nir_supplier_name ||
          params.data?.consume_destination ||
          // Pentru transfer, afișăm sursa pentru OUT, destinația pentru IN (heuristic bazat pe qty)
          (Number(params.data?.quantity_out || 0) > 0 ? params.data?.transfer_source_location : params.data?.transfer_target_location) ||
          params.data?.inventory_location ||
          params.data?.inventory_responsible ||
          params.data?.reference_supplier ||
          "—",
      },
      {
        headerName: "Cantitate IN",
        field: "quantity_in",
        width: 140,
        pinned: "right",
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 }),
      },
      {
        headerName: "Cantitate OUT",
        field: "quantity_out",
        width: 140,
        pinned: "right",
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 }),
      },
      {
        headerName: "Referință",
        colId: "reference",
        minWidth: 200,
        cellRenderer: (params) => {
          const type = params.data?.type;
          const refId = params.data?.reference_id;
          const docNumber =
            params.data?.nir_document_number ||
            params.data?.consume_document_number ||
            params.data?.transfer_document_number ||
            params.data?.inventory_document_number ||
            "";
          if (!type || !refId) return "";
          if (type === "NIR") {
            return `<button class="btn btn-link px-1 text-primary-600" data-action="view-nir" data-id="${refId}">NIR #${docNumber || refId}</button>`;
          }
          if (type === "CONSUME") {
            return `<button class="btn btn-link px-1 text-primary-600" data-action="view-consume" data-id="${refId}">Bon consum #${docNumber || refId}</button>`;
          }
          if (type === "ADJUST") {
            return `<button class="btn btn-link px-1 text-primary-600" data-action="view-inventory" data-id="${refId}">Inventar #${docNumber || refId}</button>`;
          }
          if (type === "TRANSFER") {
            return `<button class="btn btn-link px-1 text-primary-600" data-action="view-transfer" data-id="${refId}">Transfer #${docNumber || refId}</button>`;
          }
          return "";
        },
      },
    ],
    [],
  );

  const handleCellClicked = useCallback(
    (event) => {
      if (event.colDef?.colId !== "reference") return;
      const target = event.event?.target instanceof HTMLElement ? event.event.target.closest("button[data-action]") : null;
      if (!target) return;
      const refId = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      if (action === "view-nir" && refId) {
        navigate(`/stocks/nir/${refId}`);
      }
      if (action === "view-consume" && refId) {
        navigate(`/stocks/consume/${refId}`);
      }
      if (action === "view-inventory" && refId) {
        navigate(`/stocks/inventory/${refId}`);
      }
      if (action === "view-transfer" && refId) {
        navigate(`/stocks/transfer/${refId}`);
      }
    },
    [navigate],
  );

  const rows = filteredMoves();

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, move) => {
          acc.totalIn += Number(move.quantity_in || move.qty_in || 0);
          acc.totalOut += Number(move.quantity_out || move.qty_out || 0);
          acc.net = acc.totalIn - acc.totalOut;
          return acc;
        },
        { totalIn: 0, totalOut: 0, net: 0 },
      ),
    [rows],
  );

  const handleFilterChange = (field) => (event) => {
    setFilter(field, event.target.value);
  };

  const handleExportCsv = useCallback(() => {
    const dataRows = filteredMoves();
    if (!dataRows.length) return;
    const headers = ["date", "type", "ingredient", "qty_in", "qty_out", "document", "partner"];
    const csvLines = [
      headers.join(","),
      ...dataRows.map((row) =>
        [
          row.date,
          row.type,
          `"${row.ingredient_name || ""}"`,
          Number(row.quantity_in || 0),
          Number(row.quantity_out || 0),
          row.nir_document_number || row.consume_document_number || row.inventory_document_number || row.reference_id || "",
          `"${row.nir_supplier_name || row.consume_destination || row.inventory_location || ""}"`,
        ].join(","),
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stock_moves.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [filteredMoves]);

  return (
    <div className="page space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Mișcări de stoc</h1>
          <p className="text-sm text-neutral-500">Monitorizează toate intrările și ieșirile de stoc.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleExportCsv}>
          ⬇ Export CSV
        </button>
      </header>

      <section className="card flex flex-wrap gap-4">
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">Tip</label>
          <select className="input mt-1" value={filters.type} onChange={handleFilterChange("type")}>
            <option value="ALL">Toate</option>
            <option value="NIR">NIR</option>
            <option value="CONSUME">CONSUME</option>
            <option value="ADJUST">ADJUST</option>
          </select>
        </div>
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">ID Ingredient</label>
          <input
            className="input mt-1"
            type="text"
            value={filters.ingredient_id}
            onChange={handleFilterChange("ingredient_id")}
            placeholder="Ex: 101"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">Furnizor / Destinație</label>
          <input
            className="input mt-1"
            type="text"
            value={filters.supplier}
            onChange={handleFilterChange("supplier")}
            placeholder="Ex: Metro"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">Număr document</label>
          <input
            className="input mt-1"
            type="text"
            value={filters.document_number}
            onChange={handleFilterChange("document_number")}
            placeholder="Ex: NIR-123"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">Dată start</label>
          <input className="input mt-1" type="date" value={filters.date_from} onChange={handleFilterChange("date_from")} />
        </div>
        <div className="flex flex-col text-sm">
          <label className="font-medium text-neutral-700">Dată sfârșit</label>
          <input className="input mt-1" type="date" value={filters.date_to} onChange={handleFilterChange("date_to")} />
        </div>
      </section>

      {error ? <InlineAlert variant="error" title="Eroare" message="Nu s-au putut încărca mișcările de stoc." /> : null}

      <DataGrid
        columnDefs={columnDefs}
        rowData={rows}
        loading={isLoading}
        height="60vh"
        agGridProps={{
          onCellClicked: handleCellClicked,
        }}
      />

      <div className="flex flex-wrap justify-end gap-6 text-sm">
        <div>
          <span className="font-semibold">Total intrări:&nbsp;</span>
          {totals.totalIn.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}
        </div>
        <div>
          <span className="font-semibold">Total ieșiri:&nbsp;</span>
          {totals.totalOut.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}
        </div>
        <div>
          <span className="font-semibold">Sold net:&nbsp;</span>
          {totals.net.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
