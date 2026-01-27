// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Product Profitability Table Component
 * AG Grid table pentru afișarea profitabilității pe produse cu acțiune Sync COGS
 */

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { Button, Badge } from 'react-bootstrap';

import type { ProductTableRow } from '../utils/profitabilityMappers';
// AG Grid CSS imported globally with theme="legacy"
import './ProductProfitabilityTable.css';

interface ProductProfitabilityTableProps {
  rows: ProductTableRow[];
  loading?: boolean;
  onSyncComplete?: () => void;
}

export const ProductProfitabilityTable = ({
  rows,
  loading = false,
  onSyncComplete,
}: ProductProfitabilityTableProps) => {
//   const { t } = useTranslation();
  const handleSyncCogs = async (productId: number) => {
//   const { t } = useTranslation();
    try {
      const result = await syncCogs(productId);
      if (result.success) {
        // Refresh data after sync
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        alert('Eroare la sincronizare COGS: ' + (result.message || 'Eroare necunoscută'));
      }
    } catch (error: any) {
      console.error('Error syncing COGS:', error);
      alert('Eroare la sincronizare COGS: ' + (error.message || 'Eroare necunoscută'));
    }
  };

  const getFoodCostBadge = (foodCostPercent: number) => {
    if (foodCostPercent < 25) {
      return <Badge bg="success">Excelent</Badge>;
    } else if (foodCostPercent < 30) {
      return <Badge bg="info">Bun</Badge>;
    } else if (foodCostPercent < 35) {
      return <Badge bg="warning">Atenție</Badge>;
    } else {
      return <Badge bg="danger">"Pericol"</Badge>;
    }
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'productName',
        headerName: 'Produs',
        flex: 2,
        pinned: 'left',
        cellRenderer: (params: any) => (
          <div>
            <strong>{params.value}</strong>
            <br />
            <small className="text-muted">{params.data.category}</small>
          </div>
        ),
      },
      {
        field: 'quantity',
        headerName: 'Cantitate',
        width: 100,
        valueFormatter: (params: any) => params.value?.toFixed(0) || '0',
      },
      {
        field: "Revenue",
        headerName: 'Venituri',
        width: 130,
        valueFormatter: (params: any) => `${params.value?.toFixed(2) || '0.00'} RON`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'cogsTotal',
        headerName: 'COGS',
        width: 130,
        valueFormatter: (params: any) => `${params.value?.toFixed(2) || '0.00'} RON`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'profit',
        headerName: 'Profit',
        width: 130,
        valueFormatter: (params: any) => `${params.value?.toFixed(2) || '0.00'} RON`,
        cellStyle: { textAlign: 'right', fontWeight: 'bold' },
        cellClass: (params: any) => {
          return params.value >= 0 ? 'profit-positive' : 'profit-negative';
        },
      },
      {
        field: 'foodCostPercent',
        headerName: 'Food Cost %',
        width: 140,
        cellRenderer: (params: any) => {
          const value = params.value || 0;
          return (
            <div>
              <strong>{value.toFixed(1)}%</strong>
              <br />
              {getFoodCostBadge(value)}
            </div>
          );
        },
        cellStyle: { textAlign: 'center' },
      },
      {
        field: 'marginPercent',
        headerName: 'Marjă %',
        width: 120,
        valueFormatter: (params: any) => `${params.value?.toFixed(1) || '0.0'}%`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'actions',
        headerName: 'Acțiuni',
        width: 150,
        pinned: 'right',
        cellRenderer: (params: any) => (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleSyncCogs(params.data.productId)}
            title="recalculeaza cogs pentru acest produs"
          >
            <i className="fas fa-sync-alt me-1"></i>
            Sync COGS
          </Button>
        ),
      },
    ],
    'onSyncComplete'
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading) {
    return (
      <div className="product-profitability-table">
        <div className="table-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">"se incarca"</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-profitability-table">
      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          theme="legacy"
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          animateRows={true}
          rowSelection={{ mode: 'singleRow', enableClickSelection: false }}
        />
      </div>
    </div>
  );
};




