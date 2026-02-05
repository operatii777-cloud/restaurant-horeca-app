// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { TemperatureLogFormModal } from './TemperatureLogFormModal';
import { TemperatureChart } from './TemperatureChart';
import { httpClient } from '@/shared/api/httpClient';
import { AgGridTable } from '@/shared/components/AgGridTable';
import './TemperatureLogTab.css';

export const TemperatureLogTab = () => {
  //   const { t } = useTranslation();
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: equipmentData, refetch: refetchEquipment } = useApiQuery('/api/compliance/equipment');
  const equipment = (equipmentData as any)?.data || [];

  // Construim URL-ul cu query params
  const temperatureLogUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedEquipment) params.append('equipment_id', selectedEquipment.toString());
    if (dateRange.start) params.append('start_date', dateRange.start);
    if (dateRange.end) params.append('end_date', dateRange.end);
    const queryString = params.toString();
    return queryString ? `/api/compliance/temperature-log?${queryString}` : '/api/compliance/temperature-log';
  }, [selectedEquipment, dateRange]);

  const { data: logsData, loading, refetch } = useApiQuery(temperatureLogUrl);
  const logs = (logsData as any)?.data || [];

  const columnDefs = [
    {
      field: 'created_at', headerName: 'Data/Ora', width: 180, valueFormatter: (params: any) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleString('ro-RO');
      }
    },
    { field: 'equipment_name', headerName: 'Echipament', width: 200 },
    {
      field: 'temperature', headerName: 'Temperatură (°C)', width: 150, cellRenderer: (params: any) => {
        const temp = params.value;
        const status = params.data.status;
        const color = status === 'ok' ? 'green' : status === 'warning' ? 'orange' : 'red';
        return <span style={{ color, fontWeight: 'bold' }}>{temp}°C</span>;
      }
    },
    {
      field: 'status', headerName: 'Status', width: 120, cellRenderer: (params: any) => {
        const status = params.value as 'ok' | 'warning' | 'critical';
        if (status === 'ok') return <span className="text-success"><i className="fas fa-check-circle"></i> OK</span>;
        if (status === 'warning') return <span className="text-warning"><i className="fas fa-exclamation-triangle"></i> Warning</span>;
        if (status === 'critical') return <span className="text-danger"><i className="fas fa-times-circle"></i> Critical</span>;
        return <span>{status}</span>;
      }
    },
    { field: 'operator_name', headerName: 'Operator', width: 150 },
    { field: 'notes', headerName: 'Note', width: 200, flex: 1 },
  ];

  const filteredLogs = useMemo(() => {
    return logs;
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
            title="selecteaza echipamentul"
            aria-label="selecteaza echipamentul"
          >
            <option value="">Toate echipamentele</option>
            {equipment.map((eq: any) => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>
            ))}
          </select>

          <input
            type="date"
            className="form-control"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            placeholder="De la"
            title="data de inceput"
            aria-label="data de inceput"
          />

          <input
            type="date"
            className="form-control"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            placeholder="Până la"
            title="data de sfarsit"
            aria-label="data de sfarsit"
          />
        </div>

        <button className="btn btn-primary" onClick={handleAddLog}>
          <i className="fas fa-plus me-2"></i>Adaugă Temperatură</button>
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
          equipment={equipment}
          onSave={handleSaveLog}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
};




