// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import { DataGrid } from '@/shared/components/DataGrid';
import type { ColDef } from 'ag-grid-community';
import { TableEditorModal } from '../components/TableEditorModal';
import { BulkTableConfigModal } from '../components/BulkTableConfigModal';
import './TablesConfigPage.css';

interface Table {
  id: number;
  table_number: string;
  capacity: number;
  location: string | null;
  is_active: boolean;
  seats?: number;
  shape?: string;
  area_id?: number | null;
  area_name?: string;
}

interface Zone {
  id: number;
  name: string;
  type?: string;
  is_active: boolean;
}

export const TablesConfigPage = () => {
//   const { t } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBulkConfigOpen, setIsBulkConfigOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: tablesData, loading: tablesLoading, refetch: refetchTables } = useApiQuery<any>('/api/tables');
  const { data: zonesData } = useApiQuery<any>('/api/locations?type=operational');
  const { mutate: updateTable, loading: isUpdating } = useApiMutation();

  useEffect(() => {
    if (tablesData?.data) {
      setTables(tablesData.data);
    }
  }, [tablesData]);

  useEffect(() => {
    if (zonesData?.data) {
      setZones(zonesData.data);
    }
  }, [zonesData]);

  const filteredTables = tables.filter((table) => {
    if (areaFilter && table.area_id?.toString() !== areaFilter) return false;
    if (statusFilter === 'configured' && (!table.area_id || !table.is_active)) return false;
    if (statusFilter === 'unconfigured' && (table.area_id && table.is_active)) return false;
    return true;
  });

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setIsEditorOpen(true);
  };

  const handleSaveTable = async (tableData: Partial<Table>) => {
    if (!selectedTable) return;

    try {
      await updateTable({
        url: `/api/tables/${selectedTable.id}`,
        method: 'PUT',
        data: {
          table_number: tableData.table_number || selectedTable.table_number,
          area_id: tableData.area_id || null,
          seats: tableData.seats || tableData.capacity || 4,
          capacity: tableData.capacity || tableData.seats || 4,
          shape: tableData.shape || 'square',
          is_active: tableData.is_active !== undefined ? tableData.is_active : true,
          location: tableData.location || null,
        },
      });

      setFeedback({ type: 'success', message: 'Masă actualizată cu succes!' });
      setIsEditorOpen(false);
      setSelectedTable(null);
      refetchTables();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Eroare la actualizarea mesei' });
    }
  };

  const handleBulkConfig = () => {
    setIsBulkConfigOpen(true);
  };

  const columnDefs: ColDef<Table>[] = [
    {
      headerName: 'Masă #',
      field: "Table Number",
      width: 100,
      cellRenderer: (params: any) => (
        <strong>Masă #{params.value}</strong>
      ),
    },
    {
      headerName: 'Zonă',
      field: 'area_name',
      width: 150,
      cellRenderer: (params: any) => {
        if (params.value) {
          return <span className="tables-config-zone-badge">{params.value}</span>;
        }
        return <span className="tables-config-zone-none">"Neasociată"</span>;
      },
    },
    {
      headerName: 'Locuri',
      field: 'seats',
      width: 100,
      cellRenderer: (params: any) => {
        const seats = params.value || params.data?.capacity || '-';
        return `"Seats" locuri`;
      },
    },
    {
      headerName: 'Formă',
      field: 'shape',
      width: 100,
      cellRenderer: (params: any) => params.value || '-',
    },
    {
      headerName: 'Status',
      field: 'is_active',
      width: 120,
      cellRenderer: (params: any) => {
        const isActive = params.value;
        const isConfigured = params.data?.area_id;
        return (
          <div className="tables-config-status">
            {isActive ? (
              <span className="tables-config-status-badge tables-config-status-badge--active">Activ</span>
            ) : (
              <span className="tables-config-status-badge tables-config-status-badge--inactive">Inactiv</span>
            )}
            {!isConfigured && (
              <span className="tables-config-status-badge tables-config-status-badge--warning">Neconfigurat</span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Acțiuni',
      width: 120,
      cellRenderer: (params: any) => (
        <button
          className="tables-config-action-btn"
          onClick={() => handleEditTable(params.data)}
        >
          ⚙️ Config
        </button>
      ),
    },
  ];

  return (
    <div className="tables-config-page">
      <div className="tables-config-page__header">
        <div>
          <h3>🪑 Configurare Mese (1-200)</h3>
          <p className="tables-config-page__subtitle">Configurează fiecare masă: zonă, număr locuri, formă</p>
        </div>
        <div className="tables-config-page__actions">
          <button className="tables-config-page__btn tables-config-page__btn--secondary" onClick={() => refetchTables()}>
            🔄 Refresh
          </button>
          <button className="tables-config-page__btn tables-config-page__btn--primary" onClick={handleBulkConfig}>
            📦 Configurare Bulk
          </button>
        </div>
      </div>

      {feedback && (
        <InlineAlert
          variant={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="tables-config-page__filters">
        <div className="tables-config-page__filter">
          <label htmlFor="areaFilter" className="tables-config-page__filter-label">Filtrează după zonă</label>
          <select
            id="areaFilter"
            className="tables-config-page__filter-select"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">"toate zonele"</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tables-config-page__filter">
          <label htmlFor="statusFilter" className="tables-config-page__filter-label">
            Status:
          </label>
          <select
            id="statusFilter"
            className="tables-config-page__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">"Toate"</option>
            <option value="configured">Configurate</option>
            <option value="unconfigured">Neconfigurate</option>
          </select>
        </div>
      </div>

      <div className="tables-config-page__grid">
        <DataGrid<Table>
          columnDefs={columnDefs}
          rowData={filteredTables}
          loading={tablesLoading}
          rowSelection="single"
          height="clamp(400px, 60vh, 800px)"
        />
      </div>

      {isEditorOpen && selectedTable && (
        <TableEditorModal
          table={selectedTable}
          zones={zones}
          onSave={handleSaveTable}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedTable(null);
          }}
        />
      )}

      {isBulkConfigOpen && (
        <BulkTableConfigModal
          tables={tables}
          zones={zones}
          onSave={async () => {
            setFeedback({ type: 'success', message: 'Configurare bulk aplicată cu succes!' });
            setIsBulkConfigOpen(false);
            refetchTables();
          }}
          onClose={() => setIsBulkConfigOpen(false)}
        />
      )}
    </div>
  );
};



