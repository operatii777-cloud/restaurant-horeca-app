import React, { useCallback, useMemo } from "react";
// import { CellValueChangedEvent, ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/components/DataGrid";
import { useInventoryStore } from "../store/inventoryStore";
import "./InventoryLinesGrid.css";

export default function InventoryLinesGrid() {
  const { lines, updateLine, addLine, removeLine, validation } = useInventoryStore();
  const lineErrors = validation?.lineErrors ?? {};

  const columnDefs = useMemo(
    () => [
      {
        headerName: "!",
        field: "__status",
        width: 40,
        pinned: "left",
        cellRenderer: (params) => {
          const idx = params.node?.rowIndex ?? 0;
          const errors = lineErrors[idx];
          if (!errors || !Object.keys(errors).length) return "";
          const tooltip = Object.values(errors).join(" • ");
          return `<span class="inventory-grid-error-icon" title=""Tooltip"">⚠</span>`;
        },
      },
      {
        headerName: "#",
        field: "index",
        width: 70,
        valueGetter: (params) => params.node?.rowIndex + 1,
        pinned: "left",
      },
      {
        headerName: "Ingredient",
        field: "ingredient_name",
        flex: 1,
        minWidth: 180,
        editable: false,
      },
      {
        headerName: "Unitate",
        field: "unit",
        width: 100,
        editable: false,
      },
      {
        headerName: "Stoc scriptic",
        field: "stock_system",
        width: 140,
        editable: true,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 }),
      },
      {
        headerName: "Stoc faptic",
        field: "stock_counted",
        width: 140,
        editable: true,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 }),
      },
      {
        headerName: "Diferență",
        field: "diff",
        width: 120,
        editable: false,
        cellStyle: (params) => {
          const diff = Number(params.value || 0);
          if (diff > 0) return { color: "#15803d", fontWeight: 600 };
          if (diff < 0) return { color: "#b91c1c", fontWeight: 600 };
          return {};
        },
      },
      {
        headerName: "",
        colId: "actions",
        width: 110,
        cellRenderer: () => React.createElement('button', {
          className: 'btn btn-link text-red-500',
          'data-action': 'remove'
        }, 'Șterge'),
      },
    ],
    [lineErrors],
  );

  const handleCellValueChanged = useCallback(
    (event) => {
      const lineId = event.data?.id;
      const field = event.colDef.field;
      if (!lineId || !field || field === "__status" || field === "index") return;
      updateLine(lineId, field, Number(event.value) || 0);
    },
    [updateLine],
  );

  const handleCellClicked = useCallback(
    (event) => {
      if (event.colDef?.colId !== "actions") return;
      const lineId = event.data?.id;
      const action = event.event?.target?.closest?.("button[data-action]")?.getAttribute("data-action");
      if (action === "remove" && lineId) {
        removeLine(lineId);
      }
    },
    [removeLine],
  );

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Linii inventar</h3>
          <p className="text-sm text-neutral-500">Introdu stocul scriptic și stocul numărat pentru fiecare ingredient.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={addLine}>
          ➕ Adaugă linie
        </button>
      </div>

      <DataGrid
        columnDefs={columnDefs}
        rowData={lines}
        height="50vh"
        gridOptions={{
          stopEditingWhenCellsLoseFocus: true,
          getRowClass: (params) => {
            const idx = params.node?.rowIndex ?? 0;
            const errors = lineErrors[idx];
            return errors && Object.keys(errors).length ? "inventory-row-error" : "";
          },
        }}
        agGridProps={{
          onCellValueChanged: handleCellValueChanged,
          onCellClicked: handleCellClicked,
          getRowId: (params) => params.data?.id ?? String(params.node?.rowIndex ?? 0),
        }}
      />
    </section>
  );
}

