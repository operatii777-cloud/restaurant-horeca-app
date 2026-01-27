import { useState, useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { TemperatureLogFormModal } from './TemperatureLogFormModal';
import { TemperatureChart } from './TemperatureChart';
import { httpClient } from '@/shared/api/httpClient';
import { AgGridTable } from '@/shared/components/AgGridTable';
import './TemperatureLogTab.css';

export const TemperatureLogTab = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const { data: equipment, refetch: refetchEquipment } = useApiQuery('/api/compliance/equipment');
  
  // Construim URL-ul cu query params
  const temperatureLogUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedEquipment) params.append('equipment_id', selectedEquipment.toString());
    if (dateRange.start) params.append('start_date', dateRange.start);
    if (dateRange.end) params.append('end_date', dateRange.end);
    const queryString = params.toString();
    return queryString ? `/api/compliance/temperature-log?${queryString}` : '/api/compliance/temperature-log';
  }, [selectedEquipment, dateRange]);
  
  const { data: logs, loading, refetch } = useApiQuery(temperatureLogUrl);

  const columnDefs = [
    { field: 'created_at', headerName: 'Data/Ora', width: 180, valueFormatter: (params: any) => {
      if (!params.value) return '-';
      return new Date(params.value).toLocaleString('ro-RO');
    }},
    { field: 'equipment_name', headerName: 'Echipament', width: 200 },
    { field: 'temperature', headerName: 'Temperatură (°C)', width: 150, cellRenderer: (params: any) => {
      const temp = params.value;
      const status = params.data.status;
      const color = status === 'ok' ? 'green' : status === 'warning' ? 'orange' : 'red';
      return `<span style="color: ${color}; font-weight: bold;">${temp}°C</span>`;
    }},
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: (params: any) => {
      const status = params.value;
      const icons = {
        ok: '<i class="fas fa-check-circle text-success"></i> OK',
        warning: '<i class="fas fa-exclamation-triangle text-warning"></i> Warning',
        critical: '<i class="fas fa-times-circle text-danger"></i> Critical'
      };
      return icons[status as keyof typeof icons] || status;
    }},
    { field: 'operator_name', headerName: 'Operator', width: 150 },
    { field: 'notes', headerName: 'Note', width: 200, flex: 1 },
  ];

  const filteredLogs = useMemo(() => {
    if (!logs?.data) return [];
    return logs.data;
  }, [logs]);

  const handleAddLog = () => {
    setShowFormModal(true);
  };

  const handleSaveLog = async (formData: any) => {
    try {
      await httpClient.post('/api/compliance/temperature-log', formData);
      setShowFormModal(false);
      refetch();
    } catch (error) {
      console.error('Eroare la salvarea înregistrării temperaturi:', error);
      alert('Eroare la salvarea înregistrării');
    }
  };

  return (
    <div className="temperature-log-tab">
      <div className="tab-toolbar">
        <div className="filters">
          <select
            className="form-control form-select"
            value={selectedEquipment || ''}
            onChange={(e) => setSelectedEquipment(e.target.value ? parseInt(e.target.value) : null)}
            title="Selectează echipamentul"
            aria-label="Selectează echipamentul"
          >
            <option value="">Toate echipamentele</option>
            {equipment?.data?.map((eq: any) => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>
            ))}
          </select>
          
          <input
            type="date"
            className="form-control"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            placeholder="De la"
            title="Data de început"
            aria-label="Data de început"
          />
          
          <input
            type="date"
            className="form-control"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            placeholder="Până la"
            title="Data de sfârșit"
            aria-label="Data de sfârșit"
          />
        </div>
        
        <button className="btn btn-primary" onClick={handleAddLog}>
          <i className="fas fa-plus me-2"></i>
          Adaugă Temperatură
        </button>
      </div>

      {/* Grafic Temperaturi */}
      {selectedEquipment && filteredLogs.length > 0 && (
        <div className="chart-section">
          <TemperatureChart logs={filteredLogs} equipmentId={selectedEquipment} />
        </div>
      )}

      {/* Tabelă AG Grid - Standardizat */}
      <div className="ag-grid-container">
        <AgGridTable
          columnDefs={columnDefs}
          rowData={filteredLogs}
          loading={loading}
          height={500}
          gridOptions={{
            suppressCellFocus: true,
          }}
        />
      </div>

      {showFormModal && (
        <TemperatureLogFormModal
          equipment={equipment?.data || []}
          onSave={handleSaveLog}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
};

