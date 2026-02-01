/**
 * PHASE S5.7 - Tipizate List Page Component
 * Generic list page component for all tipizate documents
 */

import type { TipizatType } from "../api/types";
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { useTipizatList } from '../hooks/useTipizatList';
import { LocationSwitcher } from '@/modules/layout/components/LocationSwitcher';

import { nameFor, columnsFor, schemaFor } from '../config/tipizate.config';
// AG Grid CSS imported globally with theme="legacy"

interface TipizateListPageProps {
  type: TipizatType;
  newRoute: string;
  detailsRouteBase: string;
  titleStyle?: React.CSSProperties;
}

export const TipizateListPage: React.FC<TipizateListPageProps> = ({
  type,
  newRoute,
  detailsRouteBase,
  titleStyle,
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

  // Get type-specific columns from config
  const schemaColumns = columnsFor(type);

  // Build column definitions based on schema + common columns
  const columnDefs = useMemo<ColDef[]>(() => {
    const cols: ColDef[] = [
      {
        field: 'number',
        headerName: 'Număr',
        width: 120,
        pinned: 'left',
        cellRenderer: (params: any) => {
          const value = params.value || '';
          return React.createElement('span', { className: 'font-semibold' }, value);
        },
      },
      {
        field: 'series',
        headerName: 'Serie',
        width: 100,
        pinned: 'left',
      },
      {
        field: 'date',
        headerName: 'Data',
        width: 120,
        pinned: 'left',
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
    ];

    // Add type-specific columns from schema
    schemaColumns.forEach((col) => {
      const colDef: ColDef = {
        field: col.field,
        headerName: col.headerName,
        width: col.width || 120,
        editable: col.editable || false,
      };

      // Format based on column type
      if (col.type === 'currency') {
        colDef.cellRenderer = (params: any) => {
          const value = params.value || 0;
          return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2,
          }).format(value);
        };
      } else if (col.type === 'number') {
        colDef.cellRenderer = (params: any) => {
          const value = params.value || 0;
          return new Intl.NumberFormat('ro-RO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          }).format(value);
        };
      }

      cols.push(colDef);
    });

    // Add common columns at the end
    cols.push(
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        cellRenderer: (params: any) => {
          const status = params.value || 'draft';
          const statusConfig: Record<string, { label: string; classes: string; icon: string }> = {
            draft: {
              label: 'Ciornă',
              classes: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
              icon: '📝',
            },
            saved: {
              label: 'Salvat',
              classes: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
              icon: '💾',
            },
            approved: {
              label: 'Aprobat',
              classes: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
              icon: '✅',
            },
            cancelled: {
              label: 'Anulat',
              classes: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600',
              icon: '❌',
            },
            archived: {
              label: 'Arhivat',
              classes: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600',
              icon: '📦',
            },
          };
          const config = statusConfig[status] || statusConfig.draft;
          return React.createElement('span', {
            className: `inline-flex items-center gap-1.5 ${config.classes} border rounded-full px-2 py-0.5 text-xs font-semibold`
          },
            React.createElement('span', {}, config.icon),
            React.createElement('span', {}, config.label)
          );
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
          const safeTotal = isNaN(total) ? 0 : (total || 0);
          return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2,
          }).format(safeTotal);
        },
      },
      {
        field: 'createdByName',
        headerName: 'Creat de',
        width: 150,
      }
    );

    return cols;
  }, [type, schemaColumns]);

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

  // Helper function to determine filter columns count
  const getFilterColumnsCount = (docType: TipizatType): string => {
    const specificFilters: Record<TipizatType, number> = {
      NIR: 5,           // dateFrom, dateTo, status, supplier, location
      FACTURA: 5,       // dateFrom, dateTo, status, client, location
      CHITANTA: 5,      // dateFrom, dateTo, status, paymentMethod, location
      BON_CONSUM: 5,    // dateFrom, dateTo, status, consumptionReason, location
      TRANSFER: 5,      // dateFrom, dateTo, status, toLocation, location
      INVENTAR: 4,      // dateFrom, dateTo, status, location
      WASTE: 4,         // dateFrom, dateTo, status, location
      RETUR: 4,         // dateFrom, dateTo, status, location
      AVIZ: 4,          // dateFrom, dateTo, status, location
      PROCES_VERBAL: 4, // dateFrom, dateTo, status, location
      RAPORT_X: 4,      // dateFrom, dateTo, status, location
      RAPORT_Z: 4,      // dateFrom, dateTo, status, location
      RAPORT_LUNAR: 4,  // dateFrom, dateTo, status, location
      RAPORT_GESTIUNE: 4, // dateFrom, dateTo, status, location
      REGISTRU_CASA: 4, // dateFrom, dateTo, status, location
    };
    return String(specificFilters[docType] || 4);
  };

  return (
    <div className="flex flex-col gap-4" style={{ margin: 0, padding: '16px', width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          style={titleStyle}
        >
          {name}
        </h1>
        <div className="flex gap-2 items-center">
          {/* Location Switcher - doar pentru Transferuri Gestiuni */}
          {type === 'TRANSFER' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Locație:</span>
              <LocationSwitcher />
            </div>
          )}
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>Reîmprospătează</button>
          <button
            onClick={handleNewDocument}
            className="px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900 text-black dark:text-white hover:bg-blue-200 dark:hover:bg-blue-800 font-bold shadow-sm border-2 border-blue-600 dark:border-blue-500"
            style={{
              backgroundColor: '#dbeafe !important',
              color: '#000000 !important',
              fontWeight: 'bold'
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>Document nou</button>
        </div>
      </div>

      {/* Filters - Type-specific */}
      <div className={`grid grid-cols-1 md:grid-cols-${getFilterColumnsCount(type)} gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">De la dată</label>
          <input
            type="date"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.fromDate || ''}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            title="Data de început"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Până la dată</label>
          <input
            type="date"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.toDate || ''}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            title="Data de sfârșit"
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
            title="Status document"
          >
            <option value="">Toate</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validat</option>
            <option value="SIGNED">Semnat</option>
            <option value="LOCKED">Blocat</option>
            <option value="ARCHIVED">Arhivat</option>
          </select>
        </div>
        {/* Type-specific filters */}
        {type === 'NIR' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Furnizor
            </label>
            <input
              type="text"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="filtreaza dupa furnizor"
              value={filters.supplierName || ''}
              onChange={(e) => handleFilterChange('supplierName', e.target.value)}
            />
          </div>
        )}
        {type === 'FACTURA' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Client
            </label>
            <input
              type="text"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="filtreaza dupa client"
              value={filters.clientName || ''}
              onChange={(e) => handleFilterChange('clientName', e.target.value)}
            />
          </div>
        )}
        {type === 'CHITANTA' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Metodă Plată
            </label>
            <select
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={filters.paymentMethod || ''}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              title="Metodă de plată"
            >
              <option value="">Toate</option>
              <option value="cash">Numerar</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="check">Cec</option>
            </select>
          </div>
        )}
        {type === 'BON_CONSUM' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motiv Consum
            </label>
            <select
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={filters.consumptionReason || ''}
              onChange={(e) => handleFilterChange('consumptionReason', e.target.value)}
              title="Motiv consum"
            >
              <option value="">Toate</option>
              <option value="kitchen_use">Uz bucătărie</option>
              <option value="spoilage">Stricare</option>
              <option value="sample">Mostră</option>
              <option value="staff_meal">Masă angajat</option>
              <option value="promotion">Promoție</option>
              <option value="waste">Deșeu</option>
              <option value="other">Altul</option>
            </select>
          </div>
        )}
        {type === 'TRANSFER' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Locație destinație</label>
            <input
              type="text"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="filtreaza dupa destinatie"
              value={filters.toLocationId || ''}
              onChange={(e) => handleFilterChange('toLocationId', e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Locație
          </label>
          <input
            type="text"
            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="filtreaza dupa locatie"
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

      {/* AG Grid - Edge to Edge - Excel-like (alb/negru) */}
      <div className="ag-theme-alpine w-full" style={{ height: 'calc(100vh - 320px)', margin: 0, padding: 0 }}>
        <AgGridReact
          theme="legacy"
          rowData={Array.isArray(rows) ? rows : []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={onRowClicked}
          animateRows={true}
          rowSelection={{ mode: 'singleRow' }}
          loading={isLoading}
          pagination={true}
          paginationPageSize={pagination.pageSize}
          paginationPageSizeSelector={[10, 25, 50, 100]} // Dropdown for page size
          onPaginationChanged={(params) => {
            if (params.api.paginationGetCurrentPage() !== undefined) {
              setPage(params.api.paginationGetCurrentPage());
            }
            if (params.api.paginationGetPageSize() !== undefined) {
              setPageSize(params.api.paginationGetPageSize());
            }
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





