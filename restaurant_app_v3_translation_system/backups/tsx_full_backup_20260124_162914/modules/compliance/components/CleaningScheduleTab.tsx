// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import { CleaningScheduleFormModal } from './CleaningScheduleFormModal';
import { CleaningTaskModal } from './CleaningTaskModal';
// AG Grid CSS is imported globally with theme="legacy" to avoid #239 error
import './CleaningScheduleTab.css';

export const CleaningScheduleTab = () => {
//   const { t } = useTranslation();
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
      return React.createElement('span', {
        className: `badge bg-${colors[status as keyof typeof colors] || 'secondary'}`
      }, labels[status as keyof typeof labels] || status);
    }},
    { field: 'checked_items', headerName: 'Progres', width: 120, valueGetter: (params: any) => {
      return `${params.data.checked_items || 0}/${params.data.total_items || 0}`;
    }},
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      cellRenderer: (params: any) => React.createElement('button', {
        className: 'btn-sm btn-primary',
        onClick: () => (window as any).handleViewTask(params.data.id)
      },
        React.createElement('i', { className: 'fas fa-eye' }),
        ' Vezi'
      ),
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
            title="filtreaza dupa status"
            aria-label="filtreaza dupa status"
          >
            <option value="all">"toate statusurile"</option>
            <option value="pending">În Așteptare</option>
            <option value="in_progress">"in progres"</option>
            <option value="completed">Completat</option>
            <option value="overdue">"Depășit"</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddTask}>
          <i className="fas fa-plus me-2"></i>"adauga task curatenie"</button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine-dark">
          <AgGridReact
            theme="legacy"
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




