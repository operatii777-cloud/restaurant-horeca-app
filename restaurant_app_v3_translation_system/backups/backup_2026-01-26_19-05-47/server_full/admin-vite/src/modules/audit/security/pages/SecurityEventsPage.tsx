// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"
import './SecurityEventsPage.css';

interface SecurityEvent {
  id: number;
  user_id: number;
  username?: string;
  event_type: string;
  severity: string;
  ip_address: string;
  user_agent: string;
  description: string;
  timestamp: string;
}

export const SecurityEventsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      // Folosim endpoint-ul dedicat pentru security events
      const response = await fetch('/api/audit/security?limit=500');
      if (!response.ok) throw new Error('Failed to load security events');
      
      const data = await response.json();
      const securityEvents = Array.isArray(data) ? data : [];
      
      setEvents(securityEvents.map((log: any) => ({
        ...log,
        event_type: log.action || 'unknown',
        severity: log.status === 'error' || log.action?.includes('FAILED') || log.action?.includes('failed') ? 'high' : 
                  log.action?.includes('login') || log.action?.includes('logout') ? 'medium' : 'low',
        description: log.details?.description || `${log.action || 'unknown'} - ${log.module || log.entity_type || log.resource_type || 'N/A'}`,
        ip_address: log.ip_address || 'N/A',
        user_agent: log.user_agent || 'N/A'
      })));
      
      setSuspiciousCount(securityEvents.filter((e: any) => e.action?.includes('FAILED')).length);
    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: 'Utilizator', width: 150 },
    { field: 'event_type', headerName: 'Tip Eveniment', width: 200 },
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
    { field: 'ip_address', headerName: 'IP Address', width: 150 },
    { field: "Description", headerName: 'Descriere', width: 300 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') }
  ];

  return (
    <div className="security-events-page">
      <div className="security-events-page-header">
        <h1><i className="fas fa-shield-alt me-2"></i>"security events"</h1>
        <button className="btn btn-primary" onClick={loadSecurityEvents}>
          <i className="fas fa-sync me-1"></i>"ReÃ®ncarcÄƒ"</button>
      </div>

      {suspiciousCount > 0 && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>"AlertÄƒ:"</strong> {suspiciousCount} evenimente suspicioase detectate!
        </div>
      )}

      <div className="ag-theme-alpine-dark security-events-grid">
        <AgGridReact
          theme="legacy"
          rowData={events}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};





