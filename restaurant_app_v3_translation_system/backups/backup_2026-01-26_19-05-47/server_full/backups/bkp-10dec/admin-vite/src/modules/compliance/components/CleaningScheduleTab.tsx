import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import { CleaningScheduleFormModal } from './CleaningScheduleFormModal';
import { CleaningTaskModal } from './CleaningTaskModal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './CleaningScheduleTab.css';

export const CleaningScheduleTab = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Construim URL-ul cu query params
  const scheduleUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.append('status', filterStatus);
    if (filterStatus === 'overdue') params.append('overdue', 'true');
    const queryString = params.toString();
    return queryString ? `/api/compliance/cleaning-schedule?${queryString}` : '/api/compliance/cleaning-schedule';
  }, [filterStatus]);
  
  const { data: schedules, loading, refetch } = useApiQuery(scheduleUrl);

  const columnDefs = [
    { field: 'title', headerName: 'Titlu', width: 200 },
    { field: 'frequency', headerName: 'Frecvență', width: 120 },
    { field: 'shift_type', headerName: 'Tură', width: 120 },
    { field: 'assigned_to_name', headerName: 'Atribuit', width: 150 },
    { field: 'due_date', headerName: 'Termen', width: 180, valueFormatter: (params: any) => {
      if (!params.value) return '-';
      return new Date(params.value).toLocaleString('ro-RO');
    }},
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: (params: any) => {
      const status = params.value;
      const colors = {
        pending: 'secondary',
        in_progress: 'info',
        completed: 'success',
        overdue: 'danger',
      };
      const labels = {
        pending: 'În Așteptare',
        in_progress: 'În Progres',
        completed: 'Completat',
        overdue: 'Depășit',
      };
      return `<span class="badge bg-${colors[status as keyof typeof colors] || 'secondary'}">${labels[status as keyof typeof labels] || status}</span>`;
    }},
    { field: 'checked_items', headerName: 'Progres', width: 120, valueGetter: (params: any) => {
      return `${params.data.checked_items || 0}/${params.data.total_items || 0}`;
    }},
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => `
        <button class="btn-sm btn-primary" onclick="window.handleViewTask(${params.data.id})">
          <i class="fas fa-eye"></i> Vezi
        </button>
      `,
    },
  ];

  React.useEffect(() => {
    (window as any).handleViewTask = (taskId: number) => {
      const task = schedules?.data?.find((t: any) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setShowTaskModal(true);
      }
    };
  }, [schedules]);

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowFormModal(true);
  };

  const handleSaveTask = async (formData: any) => {
    try {
      await httpClient.post('/api/compliance/cleaning-schedule', formData);
      setShowFormModal(false);
      refetch();
    } catch (error) {
      console.error('Eroare la salvarea task-ului:', error);
      alert('Eroare la salvarea task-ului');
    }
  };

  return (
    <div className="cleaning-schedule-tab">
      <div className="tab-toolbar">
        <div className="filters">
          <select
            className="form-control form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            title="Filtrează după status"
            aria-label="Filtrează după status"
          >
            <option value="all">Toate Statusurile</option>
            <option value="pending">În Așteptare</option>
            <option value="in_progress">În Progres</option>
            <option value="completed">Completat</option>
            <option value="overdue">Depășit</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddTask}>
          <i className="fas fa-plus me-2"></i>
          Adaugă Task Curățenie
        </button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine">
          <AgGridReact
            rowData={schedules?.data || []}
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
        <CleaningScheduleFormModal
          onSave={handleSaveTask}
          onClose={() => setShowFormModal(false)}
        />
      )}

      {showTaskModal && selectedTask && (
        <CleaningTaskModal
          task={selectedTask}
          onComplete={async () => {
            await refetch();
            setShowTaskModal(false);
          }}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
};

