import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { httpClient } from '@/shared/api/httpClient';

interface ApprovalEntry {
  id: number | string;
  type: 'void' | 'discount';
  orderId: number | null;
  amount: number;
  reasonOrPercent?: string;
  initiatedBy?: string | number;
  approvedById?: number | null;
  approvedByUsername?: string;
  at?: string;
}

export const ManagerApprovalsPage: React.FC = () => {
  const [rows, setRows] = useState<ApprovalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'all' | 'void' | 'discount'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { type, limit: '500' };
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await httpClient.get('/api/orders/manager-approvals', { params });
      const body = res.data as any;
      if (body?.success === false) {
        setError(body.error || 'Eroare la încărcare');
        setRows([]);
        return;
      }
      setRows(Array.isArray(body?.data) ? body.data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Eroare la încărcarea jurnalului de aprobări';
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [type, from, to]);

  const columnDefs = useMemo(
    () => [
      { field: 'at', headerName: 'Data', flex: 1.2 },
      { field: 'type', headerName: 'Tip', width: 110 },
      { field: 'orderId', headerName: 'Order ID', width: 110 },
      {
        field: 'amount',
        headerName: 'Sumă',
        width: 120,
        valueFormatter: (p: any) => `${Number(p.value || 0).toFixed(2)} RON`,
      },
      { field: 'reasonOrPercent', headerName: 'Motiv / %', flex: 1.4 },
      { field: 'initiatedBy', headerName: 'Inițiat de', flex: 1 },
      { field: 'approvedByUsername', headerName: 'Aprobat de', flex: 1 },
      { field: 'approvedById', headerName: 'Approver ID', width: 120 },
    ],
    []
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Jurnal aprobări manager (void / discount)</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <label>
          Tip{' '}
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="all">Toate</option>
            <option value="void">Void</option>
            <option value="discount">Discount</option>
          </select>
        </label>
        <label>
          De la <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Până la <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="button" onClick={() => void load()}>
          Reîncarcă
        </button>
      </div>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}
      <div className="ag-theme-alpine" style={{ height: '70vh', width: '100%' }}>
        <AgGridReact rowData={rows} columnDefs={columnDefs as any} loading={loading} getRowId={(p) => `${p.data.type}-${p.data.id}`} />
      </div>
    </div>
  );
};
