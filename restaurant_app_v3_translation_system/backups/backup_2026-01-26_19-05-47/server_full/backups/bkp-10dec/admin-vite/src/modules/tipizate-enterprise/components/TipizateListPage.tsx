/**
 * PHASE S5.7 - Tipizate List Page Component
 * Generic list page component for all tipizate documents
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useTipizatList } from '../hooks/useTipizatList';
import { TipizatType } from '../api/types';
import { nameFor } from '../config/tipizate.config';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface TipizateListPageProps {
  type: TipizatType;
  newRoute: string;
  detailsRouteBase: string;
}

export const TipizateListPage: React.FC<TipizateListPageProps> = ({
  type,
  newRoute,
  detailsRouteBase,
}) => {
  const navigate = useNavigate();
  const {
    name,
    filters,
    setFilters,
    rows,
    isLoading,
    error,
    refetch,
    pagination,
    setPage,
    setPageSize,
  } = useTipizatList({ type });

  // Default columns for list view
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'number',
      headerName: 'Număr',
      width: 120,
      cellRenderer: (params: any) => {
        const value = params.value || '';
        return `<span class="font-semibold">${value}</span>`;
      },
    },
    {
      field: 'series',
      headerName: 'Serie',
      width: 100,
    },
    {
      field: 'date',
      headerName: 'Data',
      width: 120,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      cellRenderer: (params: any) => {
        const status = params.value || 'DRAFT';
        const statusConfig: Record<string, { label: string; classes: string; icon: string }> = {
          DRAFT: {
            label: 'Ciornă',
            classes: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
            icon: '📝',
          },
          VALIDATED: {
            label: 'Validat',
            classes: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
            icon: '✓',
          },
          SIGNED: {
            label: 'Semnat',
            classes: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
            icon: '✍️',
          },
          LOCKED: {
            label: 'Blocat',
            classes: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600',
            icon: '🔒',
          },
          ARCHIVED: {
            label: 'Arhivat',
            classes: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600',
            icon: '📦',
          },
        };
        const config = statusConfig[status] || statusConfig.DRAFT;
        return `
          <span class="inline-flex items-center gap-1.5 ${config.classes} border rounded-full px-2 py-0.5 text-xs font-semibold">
            <span>${config.icon}</span>
            <span>${config.label}</span>
          </span>
        `;
      },
    },
    {
      field: 'locationName',
      headerName: 'Locație',
      width: 150,
    },
    {
      field: 'totals',
      headerName: 'Total',
      width: 120,
      cellRenderer: (params: any) => {
        if (!params.value) return '0.00 RON';
        const total = typeof params.value === 'object' ? params.value.total : params.value;
        return new Intl.NumberFormat('ro-RO', {
          style: 'currency',
          currency: 'RON',
          minimumFractionDigits: 2,
        }).format(total || 0);
      },
    },
    {
      field: 'createdByName',
      headerName: 'Creat de',
      width: 150,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const onRowClicked = (params: any) => {
    if (params.data?.id) {
      navigate(`${detailsRouteBase}/${params.data.id}`);
    }
  };

  const handleNewDocument = () => {
    navigate(newRoute);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters({
      ...filters,
      [field]: value || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {name}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reîmprospătează
          </button>
          <button
            onClick={handleNewDocument}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <i className="bi bi-plus-circle me-1"></i>
            Document nou
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            De la dată
          </label>
          <input
            type="date"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.fromDate || ''}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Până la dată
          </label>
          <input
            type="date"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.toDate || ''}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Toate</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validat</option>
            <option value="SIGNED">Semnat</option>
            <option value="LOCKED">Blocat</option>
            <option value="ARCHIVED">Arhivat</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Locație
          </label>
          <input
            type="text"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Filtrează după locație..."
            value={filters.locationId || ''}
            onChange={(e) => handleFilterChange('locationId', e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-800 dark:text-red-200">
            <strong>Eroare:</strong> {error.message}
          </p>
        </div>
      )}

      {/* AG Grid */}
      <div className="ag-theme-alpine dark:ag-theme-alpine-dark w-full" style={{ height: '600px' }}>
        <AgGridReact
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={onRowClicked}
          animateRows={true}
          rowSelection="single"
          loading={isLoading}
          pagination={true}
          paginationPageSize={pagination.pageSize}
          paginationPageSizeSelector={[25, 50, 100]}
          onPaginationChanged={(params) => {
            if (params.api.paginationGetCurrentPage() !== undefined) {
              setPage(params.api.paginationGetCurrentPage());
            }
            if (params.api.paginationGetPageSize() !== undefined) {
              setPageSize(params.api.paginationGetPageSize());
            }
          }}
          getRowStyle={(params) => {
            if (params.node.rowIndex % 2 === 0) {
              return { backgroundColor: 'rgba(0, 0, 0, 0.02)' };
            }
            return {};
          }}
        />
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>
          Total: {pagination.total} documente
        </span>
        <span>
          Pagina {pagination.page + 1} din {Math.ceil(pagination.total / pagination.pageSize) || 1}
        </span>
      </div>
    </div>
  );
};

