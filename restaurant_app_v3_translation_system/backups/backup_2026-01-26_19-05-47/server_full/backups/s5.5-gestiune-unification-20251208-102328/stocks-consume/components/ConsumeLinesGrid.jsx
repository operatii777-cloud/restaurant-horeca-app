// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useCallback, useMemo } from "react";
// import { CellClickedEvent, CellValueChangedEvent, ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/components/DataGrid";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useConsumeStore } from "../store/consumeStore";
import "./ConsumeLinesGrid.css";

export default function ConsumeLinesGrid() {
  const { lines, addLine, removeLine, updateLine, validation } = useConsumeStore();
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

  const formatIngredientLabel = (value) => {
    if (!value && value !== 0) return "Selectează ingredient";
    const option = ingredientMap.get(Number(value));
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
          const idx = params.node?.rowIndex ?? 0;
          const errors = lineErrors[idx];
          if (!errors || !Object.keys(errors).length) {
            return "";
          }
          const tooltip = Object.values(errors).join(" • ");
          return `<span class="consume-grid-error-icon" title="${tooltip}">⚠</span>`;
        },
      },
      {
        headerName: "#",
        field: "index",
        width: 70,
        valueGetter: (params) => params.node?.rowIndex + 1,
        editable: false,
        pinned: "left",
      },
      {
        headerName: "Ingredient",
        field: "ingredient_id",
        minWidth: 220,
        editable: true,
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
          values: ingredientOptions.map((option) => String(option.id)),
          cellRenderer: (params) => formatIngredientLabel(params.value),
          searchDebounceDelay: 0,
        },
        valueFormatter: (params) => formatIngredientLabel(params.value),
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
        headerName: "TVA (%)",
        field: "tva_percent",
        width: 110,
        editable: true,
      },
      {
        headerName: "",
        colId: "actions",
        width: 110,
        cellRenderer: () => '<button class="btn btn-link text-red-500" data-action="remove">Șterge</button>',
      },
    ],
    [ingredientOptions, lineErrors, ingredientMap],
  );

  const handleCellValueChanged = useCallback(
    (event) => {
      const lineId = event.data?.id;
      const field = event.colDef.field;
      if (!lineId || !field || field === "__status" || field === "index") return;
      let value = event.value;
      if (field === "ingredient_id") {
        value = value ? Number(value) : null;
      }
      if (field === "quantity" || field === "tva_percent") {
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

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Linii bon consum</h3>
          <p className="text-sm text-neutral-500">Selectează ingredientele și cantitățile consumate.</p>
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
            const errors = lineErrors[idx];
            return errors && Object.keys(errors).length ? "consume-row-error" : "";
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

