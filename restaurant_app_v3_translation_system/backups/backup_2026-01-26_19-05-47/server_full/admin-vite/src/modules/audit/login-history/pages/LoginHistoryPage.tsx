// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"

interface LoginHistory {
  id: number;
  user_id: number;
  username: string;
  role: string;
  device_id: string;
  ip: string;
  login_time: string;
  logout_time: string | null;
  duration_minutes?: number;
}

export const LoginHistoryPage: React.FC = () => {
//   const { t } = useTranslation();
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedLogins, setFailedLogins] = useState(0);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      // Folosim endpoint-ul unificat pentru toÈ›i utilizatorii (admin + KIOSK)
      const response = await fetch('/api/audit/login-history?limit=500');
      if (!response.ok) throw new Error('Failed to load login history');
      
      const data = await response.json();
      const historyData = Array.isArray(data) ? data : [];
      
      // CalculeazÄƒ durata pentru fiecare sesiune
      const historyWithDuration = historyData.map((entry: any) => {
        let duration = null;
        if (entry.logout_time) {
          const loginTime = new Date(entry.login_time).getTime();
          const logoutTime = new Date(entry.logout_time).getTime();
          duration = Math.round((logoutTime - loginTime) / 1000 / 60); // minutes
        }
        return { ...entry, duration_minutes: duration };
      });
      
      setHistory(historyWithDuration);
      
      // NumÄƒrÄƒ login-uri eÈ™uate
      const failedResponse = await fetch('/api/audit/login-history/failed');
      if (failedResponse.ok) {
        const failedData = await failedResponse.json();
        setFailedLogins(Array.isArray(failedData) ? failedData.length : 0);
      }
    } catch (error) {
      console.error('Error loading login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: 'Utilizator', width: 150 },
    { field: 'role', headerName: 'Rol', width: 120 },
    { field: 'source', headerName: 'SursÄƒ', width: 100 },
    { field: 'ip', headerName: 'IP Address', width: 150 },
    { field: 'device_id', headerName: 'Device ID', width: 200 },
    { field: 'login_time', headerName: 'Login Time', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') },
    { field: 'logout_time', headerName: 'Logout Time', width: 180, valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleString('ro-RO') : 'Active' },
    {
      field: 'duration_minutes',
      headerName: 'DuratÄƒ',
      width: 120,
      valueFormatter: (params: any) => {
        if (params.value === null) return 'Active';
        return `${params.value} min`;
      }
    },
    {
      field: 'success',
      headerName: 'Status',
      width: 100,
      cellRenderer: (params: any) => {
        if (params.value === false || params.value === 0) {
          return `<span class="badge bg-danger">EÈ™uat</span>`;
        }
        return `<span class="badge bg-success">Succes</span>`;
      }
    }
  ];

  return (
    <div className="padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-history me-2"></i>Login History</h1>
        <button className="btn btn-primary" onClick={loadLoginHistory}>
          <i className="fas fa-sync me-1"></i>"ReÃ®ncarcÄƒ"</button>
      </div>

      {failedLogins > 0 && (
        <div className="alert alert-warning mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>"login uri esuate"</strong> {failedLogins} Ã®ncercÄƒri eÈ™uate detectate
        </div>
      )}

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          theme="legacy"
          rowData={history}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};





