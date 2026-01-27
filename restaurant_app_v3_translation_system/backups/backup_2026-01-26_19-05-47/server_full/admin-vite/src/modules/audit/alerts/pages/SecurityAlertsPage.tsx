// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { AgGridTable } from '@/shared/components/AgGridTable';
import './SecurityAlertsPage.css';

interface SecurityAlert {
  id: number;
  alert_type: string;
  severity: string;
  message: string;
  user_id?: number;
  username?: string;
  ip_address?: string;
  timestamp: string;
  resolved: boolean;
}

export const SecurityAlertsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    loadSecurityAlerts();
  }, []);

  const loadSecurityAlerts = async () => {
    try {
      setLoading(true);
      // Folosim endpoint-ul cu reguli configurabile
      const response = await fetch('/api/audit/alerts');
      if (!response.ok) throw new Error('Failed to load security alerts');
      
      const data = await response.json();
      const alertsData = Array.isArray(data) ? data : [];
      
      setAlerts(alertsData);
      setActiveAlerts(alertsData.filter((a: SecurityAlert) => !a.resolved).length);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'alert_type', headerName: 'Tip AlertÄƒ', width: 200 },
    {
      field: 'severity',
      headerName: 'Severitate',
      width: 120,
      cellRenderer: (params: any) => {
        const severity = params.value;
        const colors: Record<string, string> = {
          'high': 'danger',
          'medium': 'warning',
          'low': 'info'
        };
        return `<span class="badge bg-${colors[severity] || 'secondary'}">${severity}</span>`;
      }
    },
    { field: 'message', headerName: 'Mesaj', width: 400 },
    { field: 'username', headerName: 'Utilizator', width: 150 },
    { field: 'ip_address', headerName: 'IP Address', width: 150 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') },
    {
      field: 'resolved',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => {
        return params.value ? '<span class="badge bg-success">Rezolvat</span>' : '<span class="badge bg-danger">Activ</span>';
      }
    }
  ];

  return (
    <div className="security-alerts-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-bell me-2"></i>"security alerts"</h1>
        <button className="btn btn-primary" onClick={loadSecurityAlerts}>
          <i className="fas fa-sync me-1"></i>"ReÃ®ncarcÄƒ"</button>
      </div>

      {activeAlerts > 0 && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>"AlertÄƒ:"</strong> {activeAlerts} alertÄƒri active necesitÄƒ atenÈ›ie!
        </div>
      )}

      <AgGridTable
        columnDefs={columnDefs}
        rowData={alerts}
        loading={loading}
        height={600}
      />
    </div>
  );
};





