import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      // Folosim audit_log pentru security events (filtrăm după acțiuni de securitate)
      const response = await fetch('/api/admin/audit-log?limit=500');
      if (!response.ok) throw new Error('Failed to load security events');
      
      const data = await response.json();
      // Filtrează evenimente de securitate (login failed, access denied, etc.)
      const securityEvents = (Array.isArray(data) ? data : []).filter((log: any) => 
        log.action?.includes('LOGIN') || 
        log.action?.includes('ACCESS') || 
        log.action?.includes('SECURITY') ||
        log.resource_type === 'security'
      );
      
      setEvents(securityEvents.map((log: any) => ({
        ...log,
        event_type: log.action,
        severity: log.action?.includes('FAILED') ? 'high' : 'medium',
        description: `${log.action} - ${log.resource_type || 'N/A'}`
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
    { field: 'description', headerName: 'Descriere', width: 300 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-shield-alt me-2"></i>Security Events</h1>
        <button className="btn btn-primary" onClick={loadSecurityEvents}>
          <i className="fas fa-sync me-1"></i>Actualizează
        </button>
      </div>

      {suspiciousCount > 0 && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Alertă:</strong> {suspiciousCount} evenimente suspicioase detectate!
        </div>
      )}

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={events}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};

