// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import { MaintenanceFormModal } from './MaintenanceFormModal';
// AG Grid CSS is imported globally with theme="legacy" to avoid #239 error
import './EquipmentMaintenanceTab.css';

export const EquipmentMaintenanceTab = () => {
//   const { t } = useTranslation();
  const [showFormModal, setShowFormModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { data: equipment } = useApiQuery('/api/compliance/equipment');
  // Construim URL-ul cu query params
  const maintenanceUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.append('status', filterStatus);
    const queryString = params.toString();
    return queryString ? `/api/compliance/equipment-maintenance?${queryString}` : '/api/compliance/equipment-maintenance';
  }, [filterStatus]);
  
  const { data: maintenance, loading, refetch } = useApiQuery(maintenanceUrl);

  const columnDefs = [
    { field: 'equipment_name', headerName: 'Echipament', width: 200 },
    { field: 'maintenance_type', headerName: 'Tip', width: 150, valueFormatter: (params: any) => {
      const types: any = {
        preventive: 'Preventivă',
        repair: 'Reparație',
        calibration: 'Calibrare',
      };
      return types[params.value] || params.value;
    }},
    { field: 'scheduled_date', headerName: 'Data Programată', width: 180, valueFormatter: (params: any) => {
      if (!params.value) return '-';
      return new Date(params.value).toLocaleString('ro-RO');
    }},
    { field: 'completed_date', headerName: 'Data Completată', width: 180, valueFormatter: (params: any) => {
      if (!params.value) return '-';
      return new Date(params.value).toLocaleString('ro-RO');
    }},
    { field: 'operator_name', headerName: 'Operator', width: 150 },
    { field: 'result', headerName: 'Rezultat', width: 120, cellRenderer: (params: any) => {
      const result = params.value;
      if (!result) return '-';
      const colors: any = {
        ok: 'success',
        needs_repair: 'warning',
        replaced: 'info',
      };
      const labels: any = {
        ok: 'OK',
        needs_repair: 'Necesită Reparație',
        replaced: 'Înlocuit',
      };
      return `<span class="badge bg-${colors[result] || 'secondary'}">${labels[result] || result}</span>`;
    }},
    { field: 'status', headerName: 'Status', width: 120 },
  ];

  const handleAddMaintenance = () => {
    setShowFormModal(true);
  };

  const handleSaveMaintenance = async (formData: any) => {
    try {
      await httpClient.post('/api/compliance/equipment-maintenance', formData);
      setShowFormModal(false);
      refetch();
    } catch (error) {
      console.error('Eroare la salvarea mentenanței:', error);
      alert('Eroare la salvarea mentenanței');
    }
  };

  return (
    <div className="equipment-maintenance-tab">
      <div className="tab-toolbar">
        <div className="filters">
          <select
            className="form-control form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            title="filtreaza dupa status"
            aria-label="filtreaza dupa status"
          >
            <option value="all">"toate statusurile"</option>
            <option value="scheduled">Programate</option>
            <option value="in_progress">"in progres"</option>
            <option value="completed">Completate</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddMaintenance}>
          <i className="fas fa-plus me-2"></i>"programeaza mentenanta"</button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine-dark">
          <AgGridReact
            theme="legacy"
            rowData={maintenance?.data || []}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            suppressCellFocus={true}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
          />
        </div>
      </div>

      {showFormModal && (
        <MaintenanceFormModal
          equipment={equipment?.data || []}
          onSave={handleSaveMaintenance}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
};




