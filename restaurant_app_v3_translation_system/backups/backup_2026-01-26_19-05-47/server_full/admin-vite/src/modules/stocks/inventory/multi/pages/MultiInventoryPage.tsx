// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"
import './MultiInventoryPage.css';

interface InventorySession {
  id: number;
  session_type: string;
  scope: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  started_by: string;
  item_count?: number;
  difference_count?: number;
}

export const MultiInventoryPage: React.FC = () => {
//   const { t } = useTranslation();
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: ''
  });
  const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSession, setNewSession] = useState({
    session_type: 'daily',
    scope: 'global',
    location_ids: [] as number[],
    started_by: ''
  });

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`/api/inventory/sessions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load sessions');
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.status]);

  const loadLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to load locations');
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadLocations();
  }, [loadSessions, loadLocations]);

  const handleStartSession = async () => {
    try {
      const payload = {
        session_type: newSession.session_type,
        started_by: newSession.started_by,
        location_ids: newSession.scope === 'global' ? null : newSession.location_ids
      };

      const response = await fetch('/api/inventory/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to start session');
      
      setShowNewModal(false);
      setNewSession({ session_type: 'daily', scope: 'global', location_ids: [], started_by: '' });
      loadSessions();
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Eroare la crearea sesiunii de inventar');
    }
  };

  const columnDefs = [
    { field: 'id', headerName: 'ID Sesiune', width: 100 },
    { field: 'session_type', headerName: 'Tip', width: 100, valueFormatter: (params: any) => params.value === 'daily' ? 'Zilnic' : 'Lunar' },
    { field: "Scope:", headerName: 'Scope', width: 120, valueFormatter: (params: any) => params.value === 'global' ? 'Toate Gestiunile' : 'Specifice' },
    { field: 'started_at', headerName: 'DatÄƒ ÃŽnceput', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') },
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: (params: any) => {
      const status = params.value;
      const colors: Record<string, string> = {
        "ÃŽn progres": 'warning',
        'completed': 'success',
        'archived': 'secondary'
      };
      return `<span class="badge bg-${colors[status] || 'secondary'}">${status}</span>`;
    }},
    { field: 'item_count', headerName: 'Items', width: 100 },
    { field: 'difference_count', headerName: 'DiferenÈ›Äƒ', width: 120 },
    {
      headerName: 'AcÈ›iuni',
      width: 200,
      cellRenderer: (params: any) => {
        const session = params.data;
        return `
          <div>
            <button class="btn btn-sm btn-primary" onclick="window.viewSession(${session.id})">"VizualizeazÄƒ"</button>
            ${session.status === "ÃŽn progres" ? `<button class="btn btn-sm btn-success" onclick="window.finalizeSession(${session.id})">"FinalizeazÄƒ"</button>` : ''}
          </div>
        `;
      }
    }
  ];

  return (
    <div className="multi-inventory-page">
      <div className="page-header">
        <h1><i className="fas fa-warehouse me-2"></i>Inventar Multi-Gestiune</h1>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          <i className="fas fa-plus me-1"></i>"sesiune noua"</button>
      </div>

      <div className="filters-section">
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Tip:</label>
            <select className="form-select" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} title="Tip inventar">
              <option value="">"Toate"</option>
              <option value="daily">Zilnic</option>
              <option value="monthly">Lunar</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Status:</label>
            <select className="form-select" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} title="Status inventar">
              <option value="">"Toate"</option>
              <option value="ÃŽn progres">"in progres"</option>
              <option value="completed">Completate</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Gestiune:</label>
            <select className="form-select" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} title="SelecteazÄƒ gestiunea">
              <option value="">"Toate"</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-secondary w-100" onClick={loadSessions}>
              <i className="fas fa-sync me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="ag-theme-alpine-dark multi-inventory-grid">
        <AgGridReact
          theme="legacy"
          rowData={sessions}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>

      {showNewModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title"><i className="fas fa-warehouse me-2"></i>"sesiune inventar noua"</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewModal(false)} title="ÃŽnchide"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tip Inventar:</label>
                  <select className="form-select" value={newSession.session_type} onChange={(e) => setNewSession({...newSession, session_type: e.target.value})} title="Tip Inventar">
                    <option value="daily">Inventar Zilnic</option>
                    <option value="monthly">Inventar Lunar</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">"Scope:"</label>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="scope" id="scopeGlobal" value="global" checked={newSession.scope === 'global'} onChange={(e) => setNewSession({...newSession, scope: e.target.value, location_ids: []})} />
                    <label className="form-check-label" htmlFor="scopeGlobal">"toate gestiunile"</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="scope" id="scopeSpecific" value="specific" checked={newSession.scope === 'specific'} onChange={(e) => setNewSession({...newSession, scope: e.target.value})} />
                    <label className="form-check-label" htmlFor="scopeSpecific">"gestiuni specifice"</label>
                  </div>
                </div>
                {newSession.scope === 'specific' && (
                  <div className="mb-3">
                    <label className="form-label">"selecteaza gestiuni"</label>
                    {locations.map(loc => (
                      <div key={loc.id} className="form-check">
                        <input className="form-check-input" type="checkbox" checked={newSession.location_ids.includes(loc.id)} onChange={(e) => {
                          if (e.target.checked) {
                            setNewSession({...newSession, location_ids: [...newSession.location_ids, loc.id]});
                          } else {
                            setNewSession({...newSession, location_ids: newSession.location_ids.filter(id => id !== loc.id)});
                          }
                        }} title={loc.name} />
                        <label className="form-check-label">{loc.name}</label>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Responsabil:</label>
                  <input type="text" className="form-control" value={newSession.started_by} onChange={(e) => setNewSession({...newSession, started_by: e.target.value})} placeholder="ex maria ionescu" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>"AnuleazÄƒ"</button>
                <button type="button" className="btn btn-success" onClick={handleStartSession}>Pornire Sesiune</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





