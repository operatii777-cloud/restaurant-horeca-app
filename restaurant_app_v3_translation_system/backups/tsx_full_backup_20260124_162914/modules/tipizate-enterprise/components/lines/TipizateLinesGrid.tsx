/**
 * PHASE S5.3 - Tipizate Lines Grid
 * Generic AG Grid component for tipizate document lines
 */

import type { TipizatLine, TipizatType } from "../../api/types";
import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { columnsFor } from '../../config/tipizate.config';

import { TipizateLineEditorModal } from './TipizateLineEditorModal';
// AG Grid CSS imported globally with theme="legacy"

interface TipizateLinesGridProps {
  type: TipizatType;
  lines: TipizatLine[];
  setLines: (lines: TipizatLine[]) => void;
  loading?: boolean;
  onAddLine?: () => void;
  onEditLine?: (line: TipizatLine, index: number) => void;
  onDeleteLine?: (index: number) => void;
}

export const TipizateLinesGrid: React.FC<TipizateLinesGridProps> = ({
  type,
  lines,
  setLines,
  loading = false,
  onAddLine,
  onEditLine,
  onDeleteLine,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<TipizatLine | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Set up global functions for AG Grid cell renderers
  React.useEffect(() => {
    (window as any).editLine = (index: number) => {
      const line = lines[index];
      if (line && onEditLine) {
        onEditLine(line, index);
      }
    };

    (window as any).deleteLine = (index: number) => {
      if (onDeleteLine) {
        onDeleteLine(index);
      }
    };

    return () => {
      delete (window as any).editLine;
      delete (window as any).deleteLine;
    };
  }, [lines, onEditLine, onDeleteLine]);
  const handleAddLine = () => {
    setEditingLine(null);
    setEditingIndex(-1);
    setModalOpen(true);
  };

  const handleEditLine = (line: TipizatLine, index: number) => {
    setEditingLine(line);
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveLine = (line: TipizatLine) => {
    const newLines = [...lines];
    if (editingIndex >= 0) {
      // Edit existing line
      newLines[editingIndex] = { ...line, lineNumber: editingIndex + 1 };
      if (onEditLine) onEditLine(line, editingIndex);
    } else {
      // Add new line
      newLines.push({ ...line, lineNumber: newLines.length + 1 });
      if (onAddLine) onAddLine();
    }
    setLines(newLines);
    setModalOpen(false);
    setEditingLine(null);
    setEditingIndex(-1);
  };

  const handleDeleteLine = (index: number) => {
    if (window.confirm('Sigur vrei să ștergi această linie?')) {
      const newLines = lines.filter((_, i) => i !== index);
      // Renumber lines
      newLines.forEach((line, i) => {
        line.lineNumber = i + 1;
      });
      setLines(newLines);
      if (onDeleteLine) onDeleteLine(index);
    }
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    const config = columnsFor(type);
    const cols = config.map((col) => ({
      field: col.field,
      headerName: col.headerName,
      editable: col.editable ?? false,
      width: col.width ?? 150,
      cellRenderer: col.type === 'currency' 
        ? (params: any) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(params.value || 0)
        : undefined,
      valueParser: col.type === 'number' || col.type === 'currency'
        ? (params: any) => parseFloat(params.newValue) || 0
        : undefined,
    }));

    // Add actions column with custom cell renderer
    cols.push({
      headerName: 'Acțiuni',
      width: 120,
      cellRenderer: (params: any) => {
        const index = params.rowIndex;
        return `
          <div class="flex gap-2 items-center">
            <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Editează"
                    onclick="window.editLine(${index})">✏️</button>
            <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Șterge"
                    onclick="window.deleteLine(${index})">🗑️</button>
          </div>
        `;
      },
      sortable: false,
      filter: false,
    });

    return cols;
  }, [type, lines]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const onCellValueChanged = (params: any) => {
    const newLines = [...lines];
    const index = params.rowIndex;
    newLines[index] = { ...newLines[index], [params.colDef.field]: params.newValue };
    
    // Auto-calculate totals if needed
    if (params.colDef.field === 'quantity' || params.colDef.field === 'unitPrice') {
      const line = newLines[index];
      const totalWithoutVat = (line.quantity || 0) * (line.unitPrice || 0);
      const totalVat = (totalWithoutVat * (line.vatRate || 0)) / 100;
      newLines[index] = {
        ...line,
        totalWithoutVat,
        totalVat,
        totalWithVat: totalWithoutVat + totalVat,
      };
    }
    
    setLines(newLines);
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Linii Document ({lines.length})
        </h3>
        <button
          onClick={handleAddLine}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm border-2 border-blue-700"
          style={{ 
            backgroundColor: '#1e40af !important', 
            color: '#ffffff !important', 
            fontWeight: 'bold'
          }}
        >
          + Adaugă Linie
        </button>
      </div>

      <div className="ag-theme-alpine-dark w-full" style={{ height: '500px', margin: 0, padding: 0 }}>
        <AgGridReact
          theme="legacy"
          rowData={lines}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          animateRows={true}
          rowSelection={{ mode: 'multiRow', enableClickSelection: false }}
          loading={loading}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]} // Dropdown for page size
        />
      </div>

      <TipizateLineEditorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLine(null);
          setEditingIndex(-1);
        }}
        onSave={handleSaveLine}
        line={editingLine}
        mode={editingIndex >= 0 ? 'edit' : 'create'}
        loading={loading}
      />
    </>
  );
};

