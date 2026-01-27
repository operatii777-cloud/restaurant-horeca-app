// src/modules/production/components/ProductionBatchIngredientsGrid.jsx
// Grid pentru ingredientele necesare (din recipe_items sau items)

import React, { useMemo } from "react";
import { DataGrid } from "@/shared/components/DataGrid";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function ProductionBatchIngredientsGrid({ ingredients = [], setIngredients }) {
  const { data: ingredientsData } = useApiQuery("/api/admin/ingredients");

  const ingredientOptions = useMemo(() => {
    const data = ingredientsData?.data || (Array.isArray(ingredientsData) ? ingredientsData : []);
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      id: item.id ?? item.ingredient_id ?? null,
      name: item.name ?? item.official_name ?? `Ingredient ${item.id ?? ""}`,
      unit: item.unit ?? "buc",
      stock: Number(item.current_stock ?? item.stock ?? 0),
    })).filter(option => option.id !== null);
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

  const columns = [
    {
      headerName: "Ingredient",
      field: "ingredient_id",
      flex: 1,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ingredientOptions.map((option) => String(option.id)).filter(Boolean),
        formatValue: (value) => {
          if (!value) return "Selectează ingredient";
          const option = ingredientMap.get(Number(value));
          return option ? `${option.name} (${option.stock} ${option.unit} în stoc)` : "Selectează ingredient";
        },
      },
      valueFormatter: (params) => {
        if (!params.value) return "Selectează ingredient";
        return formatIngredientLabel(params.value);
      },
      tooltipValueGetter: (params) => formatIngredientLabel(params.value),
      valueParser: (params) => {
        const val = Number(params.newValue);
        return isNaN(val) ? null : val;
      },
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: "#fff5f5" }; // Highlight pentru linii fără ingredient
        }
        return null;
      },
    },
    { headerName: "UM", field: "unit", width: 80, editable: false },
    {
      headerName: "Cantitate planificată",
      field: "quantity_planned",
      width: 150,
      editable: true,
      valueParser: (p) => {
        const val = Number(p.newValue);
        return isNaN(val) ? 0 : val;
      },
      valueFormatter: (p) => (p.value ? Number(p.value).toFixed(3) : "0.000"),
    },
    {
      headerName: "Cantitate folosită",
      field: "quantity_used",
      width: 150,
      editable: true,
      valueParser: (p) => {
        const val = Number(p.newValue);
        return isNaN(val) ? 0 : val;
      },
      valueFormatter: (p) => (p.value ? Number(p.value).toFixed(3) : "0.000"),
    },
    {
      headerName: "Cost unitar",
      field: "cost_per_unit",
      width: 120,
      editable: true,
      valueParser: (p) => {
        const val = Number(p.newValue);
        return isNaN(val) ? 0 : val;
      },
      valueFormatter: (p) => (p.value ? Number(p.value).toFixed(4) : "0.0000"),
    },
    {
      headerName: "Cost total",
      field: "total_cost",
      width: 120,
      editable: false,
      valueFormatter: (p) => (p.value ? Number(p.value).toFixed(2) : "0.00"),
    },
  ];

  const onCellValueChanged = (params) => {
    if (!setIngredients) return;
    const updated = [...ingredients];
    const rowIndex = params.rowIndex;
    if (updated[rowIndex]) {
      updated[rowIndex] = {
        ...updated[rowIndex],
        [params.colDef.field]: params.newValue,
      };
      
      // Dacă s-a schimbat ingredient_id, actualizează ingredient_name și unit
      if (params.colDef.field === "ingredient_id") {
        const option = ingredientMap.get(Number(params.newValue));
        if (option) {
          updated[rowIndex].ingredient_name = option.name;
          updated[rowIndex].unit = option.unit;
        }
      }
      
      // Recalculează total_cost dacă s-a schimbat quantity_used sau cost_per_unit
      if (params.colDef.field === "quantity_used" || params.colDef.field === "cost_per_unit") {
        const qty = Number(updated[rowIndex].quantity_used || 0);
        const cost = Number(updated[rowIndex].cost_per_unit || 0);
        updated[rowIndex].total_cost = qty * cost;
      }
      setIngredients(updated);
    }
  };

  const rowData = ingredients.map((item) => ({
    ...item,
    ingredient_name: item.ingredient_name || `Ingredient #${item.ingredient_id}`,
    unit: item.unit || "buc",
  }));

  return (
    <div className="bg-white border rounded-xl p-3">
      <DataGrid 
        rowData={rowData} 
        columnDefs={columns} 
        height={250}
        onCellValueChanged={onCellValueChanged}
      />
      <p className="text-xs text-gray-500 mt-2">
        Notă: Ingredientele pot fi adăugate manual sau încărcate din rețetă (dacă este selectată).
      </p>
    </div>
  );
}

