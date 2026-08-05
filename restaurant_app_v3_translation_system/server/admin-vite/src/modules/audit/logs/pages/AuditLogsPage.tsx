import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

/** Minimal Audit Logs page (was missing — blocks admin-vite build). */
export const AuditLogsPage: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit/logs?limit=200');
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : data.data || data.logs || []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: 'User', width: 140 },
    { field: 'action', headerName: 'Acțiune', width: 160 },
    { field: 'resource_type', headerName: 'Resursă', width: 120 },
    { field: 'resource_id', headerName: 'Res. ID', width: 100 },
    {
      field: 'timestamp',
      headerName: 'Când',
      width: 180,
      valueFormatter: (p: any) => {
        const v = p.value || p.data?.created_at;
        return v ? new Date(v).toLocaleString('ro-RO') : '-';
      },
    },
  ];

  return (
    <div className="padding-20">
      <div className="page-header margin-bottom-20 d-flex justify-content-between">
        <h1>
          <i className="fas fa-clipboard-list me-2"></i>Audit Log
        </h1>
        <button className="btn btn-primary" onClick={load}>
          Reîncarcă
        </button>
      </div>
      <div className="ag-theme-alpine-dark" style={{ height: 600, width: '100%' }}>
        <AgGridReact theme="legacy" rowData={rows} columnDefs={columnDefs as any} loading={loading} defaultColDef={{ sortable: true, filter: true }} />
      </div>
    </div>
  );
};

export default AuditLogsPage;
