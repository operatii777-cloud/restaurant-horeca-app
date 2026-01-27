// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { DataGrid } from '@/shared/components/DataGrid';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { TableFilter } from '@/shared/components/TableFilter';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import './UserPinsSection.css';

interface UserPin {
  id: string;
  user_id?: number;
  username: string;
  pin: string;
  role: string;
  type: 'user' | 'waiter' | 'legacy';
  email?: string;
  is_active?: boolean;
  is_default?: boolean;
  created_at?: string;
  last_used?: string;
}

export const UserPinsSection = () => {
//   const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebouncedValue(filter, 250);

  const { data, loading, error } = useApiQuery<{ success: boolean; pins: UserPin[] }>('/api/admin/user-pins');

  const pins = useMemo(() => {
    if (!data || !data.pins) return [];
    return data.pins;
  }, []);

  const filteredPins = useMemo(() => {
    if (!debouncedFilter) return pins;
    const lowerFilter = debouncedFilter.toLowerCase();
    return pins.filter(
      (p) =>
        p.username?.toLowerCase().includes(lowerFilter) ||
        p.pin?.includes(debouncedFilter) ||
        p.role?.toLowerCase().includes(lowerFilter) ||
        p.email?.toLowerCase().includes(lowerFilter)
    );
  }, [pins, debouncedFilter]);

  const columnDefs: ColDef<UserPin>[] = [
    {
      headerName: 'Utilizator',
      field: 'username',
      pinned: 'left',
      minWidth: 180,
      cellRenderer: (params: ICellRendererParams<UserPin>) => {
        const pin = params.data;
        if (!pin) return params.value;
        return (
          <div className="user-pin__user">
            <span className="user-pin__username">{pin.username}</span>
            {pin.is_default && (
              <span className="user-pin__badge" title="PIN default sistem">Default</span>
            )}
            {pin.type === 'legacy' && (
              <span className="user-pin__badge user-pin__badge--legacy" title="PIN legacy">
                Legacy
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'PIN',
      field: 'pin',
      width: 120,
      cellRenderer: (params: ICellRendererParams<UserPin>) => {
        const pin = params.value;
        if (!pin) return '—';
        return <span className="user-pin__pin-value">{pin}</span>;
      },
    },
    {
      headerName: 'Rol',
      field: 'role',
      width: 120,
      cellRenderer: (params: ICellRendererParams<UserPin>) => {
        const role = params.value;
        const roleLabels: Record<string, string> = {
          admin: 'Administrator',
          manager: 'Manager',
          waiter: 'Ospătar',
          chef: 'Bucătar',
          supervisor: 'Supervisor',
        };
        return <span>{roleLabels[role] || role}</span>;
      },
    },
    {
      headerName: 'Email',
      field: "Email:",
      minWidth: 200,
      valueFormatter: (params) => params.value || '—',
    },
    {
      headerName: 'Tip',
      field: 'type',
      width: 100,
      cellRenderer: (params: ICellRendererParams<UserPin>) => {
        const type = params.value;
        const typeLabels: Record<string, string> = {
          user: 'Utilizator',
          waiter: 'Ospătar',
          legacy: 'Legacy',
        };
        return <span>{typeLabels[type] || type}</span>;
      },
    },
    {
      headerName: 'Status',
      field: 'is_active',
      width: 100,
      cellRenderer: (params: ICellRendererParams<UserPin>) => {
        const isActive = params.data?.is_active;
        if (isActive === undefined) return '—';
        return (
          <span className={isActive ? 'user-pin__status--active' : 'user-pin__status--inactive'}>
            {isActive ? 'Activ' : 'Inactiv'}
          </span>
        );
      },
    },
    {
      headerName: 'Ultima utilizare',
      field: 'last_used',
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '—';
        try {
          const date = new Date(params.value);
          return date.toLocaleString('ro-RO');
        } catch {
          return params.value;
        }
      },
    },
  ];

  return (
    <div className="user-pins-section">
      <div className="user-pins-section__header">
        <h3>PIN-uri Utilizatori</h3>
        <p className="user-pins-section__description">Lista tuturor PIN-urilor pentru utilizatori, ospătari și administratori din aplicație.</p>
      </div>

      {error && (
        <div className="user-pins-section__error">
          Eroare la încărcarea PIN-urilor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>
      )}

      <section className="user-pins-section__toolbar">
        <TableFilter
          value={filter}
          onChange={setFilter}
          placeholder="cauta dupa utilizator pin rol sau email"
        />
      </section>

      <section className="user-pins-section__grid">
        <DataGrid<UserPin>
          columnDefs={columnDefs}
          rowData={filteredPins}
          loading={loading}
          quickFilterText={debouncedFilter}
          height="60vh"
        />
      </section>
    </div>
  );
};



