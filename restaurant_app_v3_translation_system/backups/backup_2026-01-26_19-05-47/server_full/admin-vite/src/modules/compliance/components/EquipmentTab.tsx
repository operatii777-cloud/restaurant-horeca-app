// ﻿import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpClient } from '@/shared/api/httpClient';
import { EquipmentFormModal } from './EquipmentFormModal';
/* COMMENTED OUT TO FIX THEMING API WARNING */
/* import 'ag-grid-community/styles/ag-grid.css'; */
/* import 'ag-grid-community/styles/ag-theme-alpine.css'; */
import './EquipmentTab.css';

interface Equipment {
  id: number;
  name: string;
  type: string;
  location: string | null;
  min_temp: number | null;
  max_temp: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EquipmentTab = () => {
//   const { t } = useTranslation();
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const { data: equipment, loading, refetch } = useApiQuery('/api/compliance/equipment');

  const typeLabels: Record<string, string> = {
    fridge: 'Frigider',
    freezer: 'Congelator',
    hot_holding: 'Menținere Caldă',
    receiving: 'Recepție',
    other: 'Altele',
  };

  const columnDefs = [
    { field: 'name', headerName: 'Nume', width: 250, flex: 1 },
    { 
      field: 'type', 
      headerName: 'Tip', 
      width: 180,
      valueFormatter: (params: any) => typeLabels[params.value] || params.value,
    },
    { field: 'location', headerName: 'Locație', width: 200, valueFormatter: (params: any) => params.value || '-' },
    { 
      field: 'min_temp', 
      headerName: 'Temp. Min (Â°C)', 
      width: 150,
      valueFormatter: (params: any) => params.value !== null ? `${params.value}Â°C` : '-',
    },
    { 
      field: 'max_temp', 
      headerName: 'Temp. Max (Â°C)', 
      width: 150,
      valueFormatter: (params: any) => params.value !== null ? `${params.value}Â°C` : '-',
    },
    {
      field: 'temp_range',
      headerName: 'Interval',
      width: 180,
      valueGetter: (params: any) => {
        const min = params.data.min_temp;
        const max = params.data.max_temp;
        if (min !== null && max !== null) {
          return `"Min"Â°C - "Max"Â°C`;
        }
        return '-';
      },
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => {
        const isActive = params.value;
        return isActive 
          ? '<span class="badge bg-success">Activ</span>'
          : '<span class="badge bg-secondary">Inactiv</span>';
      },
    },
    { 
      field: 'created_at', 
      headerName: 'Data Creării', 
      width: 180,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('ro-RO');
      },
    },
    {
      field: 'actions',
      headerName: 'Acțiuni',
      width: 150,
      pinned: 'right',
      cellRenderer: (params: any) => {
        const eq = params.data as Equipment;
        const editBtn = `<button class="btn btn-sm btn-outline-primary me-1 action-btn-edit" data-id="${eq.id}" title="Editează"><i class="fas fa-edit"></i></button>`;
        const deleteBtn = eq.is_active 
          ? `<button class="btn btn-sm btn-outline-danger action-btn-delete" data-id="${eq.id}" title="Dezactivează"><i class="fas fa-trash"></i></button>`
          : '';
        return `<div class="action-buttons">${editBtn}${deleteBtn}</div>`;
      },
      sortable: false,
      filter: false,
    },
  ];

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setShowFormModal(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowFormModal(true);
  };

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (!confirm(`Ești sigur că vrei să dezactivezi echipamentul "${equipment.name}"?`)) {
      return;
    }

    try {
      await httpClient.put(`/api/compliance/equipment/${equipment.id}`, {
        ...equipment,
        is_active: false,
      });
      refetch();
    } catch (error) {
      console.error('Eroare la dezactivarea echipamentului:', error);
      alert('Eroare la dezactivarea echipamentului');
    }
  };

  const handleSaveEquipment = async (formData: any) => {
    try {
      if (formData.id) {
        // Edit mode
        await httpClient.put(`/api/compliance/equipment/${formData.id}`, formData);
      } else {
        // Add mode
        await httpClient.post('/api/compliance/equipment', formData);
      }
      setShowFormModal(false);
      setSelectedEquipment(null);
      refetch();
    } catch (error: any) {
      console.error('Eroare la salvarea echipamentului:', error);
      alert(error.response?.data?.error || 'Eroare la salvarea echipamentului');
    }
  };

  const handleRowDoubleClick = (event: any) => {
    handleEditEquipment(event.data);
  };

  return (
    <div className="equipment-tab">
      <div className="tab-toolbar">
        <div className="toolbar-info">
          <p className="text-muted mb-0">
            <i className="fas fa-info-circle me-2"></i>
            Gestionează echipamentele pentru monitorizarea temperaturilor. 
            Adaugă echipamente noi sau editează cele existente.
          </p>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddEquipment}>
          <i className="fas fa-plus me-2"></i>"adauga echipament"</button>
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine-dark">
          <AgGridReact
            theme="legacy"
            rowData={equipment?.data || []}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            suppressCellFocus={true}
            onRowDoubleClicked={handleRowDoubleClick}
            onCellClicked={(params: any) => {
              if (params.colDef.field === 'actions') {
                const target = params.event?.target as HTMLElement;
                if (target?.closest('.action-btn-edit')) {
                  handleEditEquipment(params.data);
                } else if (target?.closest('.action-btn-delete')) {
                  handleDeleteEquipment(params.data);
                }
              }
            }}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
          />
        </div>
      </div>

      {showFormModal && (
        <EquipmentFormModal
          equipment={selectedEquipment}
          onSave={handleSaveEquipment}
          onClose={() => {
            setShowFormModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};






