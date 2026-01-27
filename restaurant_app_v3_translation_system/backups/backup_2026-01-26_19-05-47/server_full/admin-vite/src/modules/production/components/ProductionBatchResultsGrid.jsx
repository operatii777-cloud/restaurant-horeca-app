// src/modules/production/components/ProductionBatchResultsGrid.jsx
// Grid pentru rezultatele producției (editabil)

import React, { useMemo } from "react";
import { DataGrid } from "@/shared/components/DataGrid";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export default function ProductionBatchResultsGrid({ results = [], setResults }) {
  const { data: menuData } = useApiQuery("/api/admin/menu");

  const productsList = useMemo(() => {
    if (!menuData) return [];
    if (Array.isArray(menuData)) return menuData;
    return menuData.products || [];
  }, [menuData]);

  const productMap = useMemo(() => {
    const map = new Map();
    productsList.forEach((item) => {
      if (item.id) {
        map.set(Number(item.id), item);
      }
    });
    return map;
  }, [productsList]);

  const formatProductLabel = (id) => {
    if (!id && id !== 0) return "Selectează produs";
    const product = productMap.get(Number(id));
    if (!product) return "Selectează produs";
    return product.name || `Produs #"Id"`;
  };
  const onCellValueChanged = (params) => {
    if (!setResults) return;
    const updated = [...results];
    const rowIndex = params.rowIndex;
    if (updated[rowIndex]) {
      updated[rowIndex] = {
        ...updated[rowIndex],
        [params.colDef.field]: params.newValue,
      };
      
      // Dacă s-a schimbat product_id, actualizează product_name și unit
      if (params.colDef.field === "product_id") {
        const product = productMap.get(Number(params.newValue));
        if (product) {
          updated[rowIndex].product_name = product.name || `Produs #${params.newValue}`;
          updated[rowIndex].unit = product.unit || "buc";
        }
      }
      
      // Recalculează total_cost dacă s-a schimbat quantity_produced sau cost_per_unit
      if (params.colDef.field === "quantity_produced" || params.colDef.field === "cost_per_unit") {
        const qty = Number(updated[rowIndex].quantity_produced || 0);
        const cost = Number(updated[rowIndex].cost_per_unit || 0);
        updated[rowIndex].total_cost = qty * cost;
      }
      setResults(updated);
    }
  };

  const columns = [
    {
      headerName: "Produs",
      field: "product_id",
      flex: 1,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: productsList.map((item) => String(item.id)).filter(Boolean),
        formatValue: (value) => {
          if (!value) return "Selectează produs";
          const product = productMap.get(Number(value));
          return product ? product.name : "Selectează produs";
        },
      },
      valueFormatter: (params) => {
        if (!params.value) return "Selectează produs";
        return formatProductLabel(params.value);
      },
      tooltipValueGetter: (params) => formatProductLabel(params.value),
      valueParser: (params) => {
        const val = Number(params.newValue);
        return isNaN(val) ? null : val;
      },
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: "#fff5f5" }; // Highlight pentru linii fără produs
        }
        return null;
      },
    },
    { headerName: "UM", field: "unit", width: 80, editable: false },
    {
      headerName: "Cantitate produsă",
      field: "quantity_produced",
      width: 160,
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
    {
      headerName: "Lot",
      field: "lot_number",
      width: 120,
      editable: true,
    },
  ];

  const rowData = results.map((item) => ({
    ...item,
    product_name: item.product_name || `Produs #${item.product_id}`,
    unit: item.unit || "buc",
  }));

  return (
    <div className="bg-white border rounded-xl p-3">
      <h3 className="text-sm font-semibold mb-2">Rezultate producție</h3>
      <DataGrid
        rowData={rowData}
        columnDefs={columns}
        height={250}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}

