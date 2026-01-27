import React, { useCallback, useMemo } from "react";
// import { CellClickedEvent, CellValueChangedEvent, ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/components/DataGrid";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useNirStore } from "../state/nirStore";
import "./NirLinesGrid.css";

export default function NirLinesGrid() {
  const { lines, addLine, removeLine, updateLine, validation } = useNirStore();
  const lineErrors = validation?.lineErrors ?? {};
  const { data: ingredientsData, loading } = useApiQuery("/api/ingredients");

  const ingredientOptions = useMemo(() => {
    if (!Array.isArray(ingredientsData)) return [];
    return ingredientsData.map((item) => ({
      id: item.id ?? item.ingredient_id ?? null,
      name: item.name ?? item.official_name ?? `Ingredient ${item.id ?? ""}`,
      unit: item.unit ?? "buc",
      stock: Number(item.current_stock ?? item.stock ?? 0),
    }));
  }, [ingredientsData]);

  const ingredientMap = useMemo(() => {
    const map = new Map();
    ingredientOptions.forEach((option) => {
      if (option.id !== null) {
        map.set(Number(option.id), option);
      }
    });
    return map;
  }, [ingredientOptions]);

  const formatIngredientLabel = (id) => {
    if (!id && id !== 0) return "Selectează ingredient";
    const option = ingredientMap.get(Number(id));
    if (!option) return "Selectează ingredient";
    const stockLabel = Number.isFinite(option.stock) ? ` • ${option.stock} ${option.unit ?? ""} în stoc` : "";
    return `${option.name}${stockLabel}`;
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "!",
        field: "__status",
        width: 50,
        pinned: "left",
        cellRenderer: (params) => {
          const rowIndex = params.node.rowIndex ?? 0;
          const errorEntry = lineErrors[rowIndex];
          if (!errorEntry || !Object.keys(errorEntry).length) {
            return "";
          }
          const tooltip = Object.values(errorEntry).join(" • ");
          return `<span class="nir-grid-error-icon" title="${tooltip}">⚠</span>`;
        },
      },
      {
        headerName: "#",
        field: "index",
        width: 80,
        valueGetter: (params) => params.node?.rowIndex + 1,
        editable: false,
      },
      {
        headerName: "Ingredient",
        field: "ingredient_id",
        minWidth: 220,
        editable: true,
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
          values: ingredientOptions.map((option) => String(option.id)),
          searchDebounceDelay: 0,
          cellRenderer: (params) => formatIngredientLabel(params.value),
        },
        valueFormatter: (params) => {
          if (!params.value) return "Selectează ingredient";
          return formatIngredientLabel(params.value);
        },
        tooltipValueGetter: (params) => formatIngredientLabel(params.value),
      },
      {
        headerName: "Cantitate",
        field: "quantity",
        width: 140,
        editable: true,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { maximumFractionDigits: 3 }),
      },
      {
        headerName: "Preț unitar (RON)",
        field: "unit_price",
        width: 160,
        editable: true,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        headerName: "TVA (%)",
        field: "tva_percent",
        width: 120,
        editable: true,
      },
      {
        headerName: "Total linie (RON)",
        field: "total_line",
        width: 160,
        editable: false,
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        headerName: "",
        colId: "actions",
        width: 100,
        editable: false,
        cellRenderer: () => `<button class="btn btn-link text-red-500" data-action="remove">Șterge</button>`,
      },
    ],
    [ingredientMap, ingredientOptions, lineErrors],
  );

  const handleCellValueChanged = useCallback(
    (event) => {
      if (!event.data?.id || !event.colDef.field) return;
      const lineId = event.data.id;
      const field = event.colDef.field;
      let value = event.value;

      if (field === "ingredient_id") {
        value = value ? Number(value) : null;
      }

      if (field === "quantity" || field === "unit_price" || field === "tva_percent") {
        value = Number(value) || 0;
      }

      updateLine(lineId, field, value);
    },
    [updateLine],
  );

  const handleCellClicked = useCallback(
    (event) => {
      if (event.colDef.colId !== "actions") return;
      const lineId = event.data?.id;
      const action = event.event?.target?.closest?.("button[data-action]")?.getAttribute("data-action");
      if (action === "remove" && lineId) {
        removeLine(lineId);
      }
    },
    [removeLine],
  );

  const lineErrorEntries = useMemo(() => {
    return Object.entries(lineErrors).map(([index, fields]) => ({
      index: Number(index),
      messages: Object.values(fields),
    }));
  }, [lineErrors]);

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Produse recepționate</h3>
          <p className="text-sm text-neutral-500">Adaugă ingredientele și valorile recepționate în acest NIR.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={addLine}>
          ➕ Adaugă linie
        </button>
      </div>

      <DataGrid
        columnDefs={columnDefs}
        rowData={lines}
        loading={loading}
        height="45vh"
        gridOptions={{
          stopEditingWhenCellsLoseFocus: true,
          getRowClass: (params) => {
            const idx = params.node?.rowIndex ?? 0;
            const rowErrors = lineErrors[idx];
            return rowErrors && Object.keys(rowErrors).length ? "nir-line-error-row" : "";
          },
        }}
        agGridProps={{
          onCellValueChanged: handleCellValueChanged,
          onCellClicked: handleCellClicked,
          getRowId: (params) => params.data?.id ?? String(params.node?.rowIndex ?? 0),
        }}
      />

      {lineErrorEntries.length ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">Corectează erorile de mai jos:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {lineErrorEntries.map((entry) => (
              <li key={entry.index}>
                Linia {entry.index + 1}: {entry.messages.join(" ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
