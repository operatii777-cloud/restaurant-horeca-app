import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

interface ApprovalEntry {
  id: string;
  journal_type: 'void' | 'discount';
  record_id: number;
  order_id: number | null;
  order_item_id?: number | null;
  action: string;
  amount: number;
  reason?: string;
  initiated_by?: number;
  initiated_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  pin_verified?: boolean;
  source?: string;
  created_at?: string;
  table_number?: number | null;
  order_type?: string;
}

export const ManagerApprovalsPage: React.FC = () => {
  const [rows, setRows] = useState<ApprovalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'all' | 'void' | 'discount'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState<{ voids_count: number; voids_total: number; discounts_count: number; discounts_total: number } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type, limit: '500' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const [listRes, sumRes] = await Promise.all([
        fetch(`/api/manager-approvals?${params}`),
        fetch('/api/manager-approvals/summary'),
      ]);
      const listData = await listRes.json();
      const sumData = await sumRes.json();
      if (listData.success) setRows(listData.data || []);
      if (sumData.success) setSummary(sumData.data);
    } catch (err) {
      console.error('Error loading manager approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  const columnDefs = useMemo(
    () => [
      {
        field: 'journal_type',
        headerName: 'Tip',
        width: 110,
        cellRenderer: (p: any) =>
          p.value === 'void' ? (
            <span className="badge bg-danger">VOID</span>
          ) : (
            <span className="badge bg-warning text-dark">DISCOUNT</span>
          ),
      },
      { field: 'order_id', headerName: 'Comandă', width: 100 },
      { field: 'table_number', headerName: 'Masă', width: 80 },
      { field: 'action', headerName: 'Acțiune', width: 120 },
      {
        field: 'amount',
        headerName: 'Sumă',
        width: 110,
        valueFormatter: (p: any) =>
          p.value != null ? `${Number(p.value).toFixed(2)} RON` : '-',
      },
      { field: 'reason', headerName: 'Motiv', flex: 1, minWidth: 160 },
      { field: 'initiated_by_name', headerName: 'Inițiat de', width: 140 },
      { field: 'approved_by_name', headerName: 'Aprobat de (PIN)', width: 160 },
      {
        field: 'pin_verified',
        headerName: 'PIN',
        width: 80,
        cellRenderer: (p: any) =>
          p.value ? (
            <span className="badge bg-success">Da</span>
          ) : (
            <span className="badge bg-secondary">Nu</span>
          ),
      },
      {
        field: 'approved_at',
        headerName: 'Când',
        width: 180,
        valueFormatter: (p: any) =>
          p.value ? new Date(p.value).toLocaleString('ro-RO') : '-',
      },
      { field: 'source', headerName: 'Sursă', width: 120 },
    ],
    []
  );

  return (
    <div className="padding-20">
      <div className="page-header margin-bottom-20 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h1>
          <i className="fas fa-user-shield me-2"></i>
          Jurnal aprobări manager
        </h1>
        <button className="btn btn-primary" onClick={load}>
          <i className="fas fa-sync me-1"></i>Reîncarcă
        </button>
      </div>

      {summary && (
        <div className="row mb-3">
          <div className="col-md-3">
            <div className="card p-3">
              <div className="text-muted small">Void-uri</div>
              <strong>{summary.voids_count}</strong>
              <div>{Number(summary.voids_total).toFixed(2)} RON</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">
              <div className="text-muted small">Discount-uri aprobate</div>
              <strong>{summary.discounts_count}</strong>
              <div>{Number(summary.discounts_total).toFixed(2)} RON</div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3 align-items-end">
        <div>
          <label className="form-label small mb-1">Tip</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="all">Toate</option>
            <option value="void">Void</option>
            <option value="discount">Discount</option>
          </select>
        </div>
        <div>
          <label className="form-label small mb-1">De la</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label small mb-1">Până la</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="btn btn-outline-secondary" onClick={load}>
          Filtrează
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          theme="legacy"
          rowData={rows}
          columnDefs={columnDefs as any}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          loading={loading}
          getRowId={(p) => p.data.id}
        />
      </div>
    </div>
  );
};

export default ManagerApprovalsPage;
