import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Lock, Unlock, Edit, Save, X, RefreshCw, Shield, Users, Key } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';

interface PINInterface {
  id: string;
  name: string;
  displayName: string;
  currentPin: string;
  type: 'admin' | 'waiter' | 'supervisor';
  description: string;
  isActive: boolean;
  lastUpdated?: string;
}

export const PINManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [interfaces, setInterfaces] = useState<PINInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState<string>('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  useEffect(() => {
    loadPINs();
  }, []);

  const loadPINs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/admin/pins');
      const data = response.data;
      
      if (data.success && data.pins) {
        setInterfaces(data.pins);
      } else {
        // Mock data for demonstration if API is not ready
        setInterfaces(getDefaultInterfaces());
      }
    } catch (err: any) {
      console.error('Error loading PINs:', err);
      setError(err.response?.data?.error || 'Failed to load PINs');
      // Use mock data on error
      setInterfaces(getDefaultInterfaces());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultInterfaces = (): PINInterface[] => {
    const interfaces: PINInterface[] = [
      {
        id: 'admin',
        name: 'admin',
        displayName: t('pins.adminPanel') || 'Admin Panel',
        currentPin: '****',
        type: 'admin',
        description: t('pins.adminDescription') || 'Full system access',
        isActive: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    // Add waiters 1-10
    for (let i = 1; i <= 10; i++) {
      const startTable = (i - 1) * 20 + 1;
      const endTable = i * 20;
      interfaces.push({
        id: `livrare${i}`,
        name: `livrare${i}`,
        displayName: t(`pins.waiter${i}`) || `Waiter ${i}`,
        currentPin: '****',
        type: 'waiter',
        description: `${t('pins.tables') || 'Tables'} ${startTable}-${endTable}`,
        isActive: true,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Add supervisors 1-7
    for (let i = 1; i <= 7; i++) {
      interfaces.push({
        id: `comanda-supervisor${i}`,
        name: `comanda-supervisor${i}`,
        displayName: t(`pins.supervisor${i}`) || `Supervisor ${i}`,
        currentPin: '****',
        type: 'supervisor',
        description: t('pins.supervisorDescription') || 'Order supervision and management',
        isActive: true,
        lastUpdated: new Date().toISOString(),
      });
    }

    return interfaces;
  };

  const handleEditPin = (interfaceItem: PINInterface) => {
    setEditingId(interfaceItem.id);
    setEditingPin('');
    setError(null);
    setSuccess(null);
  };

  const handleSavePin = async (interfaceItem: PINInterface) => {
    if (!editingPin || editingPin.length < 4) {
      setError(t('pins.pinTooShort') || 'PIN must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // SECURITY NOTE: PIN is transmitted over HTTPS (enforced by httpClient)
      // Server-side validation should enforce:
      // - PIN strength requirements (min 4, recommended 6+ characters)
      // - PIN complexity rules if needed
      // - Rate limiting on PIN update attempts
      // - Audit logging of all PIN changes
      const response = await httpClient.post('/api/admin/pins/update', {
        interfaceId: interfaceItem.id,
        pin: editingPin,
      });

      if (response.data.success) {
        setSuccess(t('pins.pinUpdated') || `PIN updated successfully for ${interfaceItem.displayName}`);
        setEditingId(null);
        setEditingPin('');
        await loadPINs();
      }
    } catch (err: any) {
      console.error('Error updating PIN:', err);
      setError(err.response?.data?.error || 'Failed to update PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPin('');
    setError(null);
  };

  const toggleActive = async (interfaceItem: PINInterface) => {
    try {
      await httpClient.post('/api/admin/pins/toggle-active', {
        interfaceId: interfaceItem.id,
        isActive: !interfaceItem.isActive,
      });
      await loadPINs();
    } catch (err: any) {
      console.error('Error toggling PIN status:', err);
      setError(err.response?.data?.error || 'Failed to toggle PIN status');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'supervisor':
        return <Key className="w-5 h-5 text-yellow-500" />;
      case 'waiter':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'supervisor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'waiter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const ActionsCellRenderer = (props: ICellRendererParams<PINInterface>) => {
    const interfaceItem = props.data;
    if (!interfaceItem) return null;
    
    const isEditing = editingId === interfaceItem.id;

    return (
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => handleSavePin(interfaceItem)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-1"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {t('pins.save') || 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              {t('pins.cancel') || 'Cancel'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleEditPin(interfaceItem)}
              className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              {t('pins.edit') || 'Edit'}
            </button>
            <button
              onClick={() => toggleActive(interfaceItem)}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                interfaceItem.isActive
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {interfaceItem.isActive ? (
                <>
                  <Lock className="w-4 h-4" />
                  {t('pins.disable') || 'Disable'}
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  {t('pins.enable') || 'Enable'}
                </>
              )}
            </button>
          </>
        )}
      </div>
    );
  };

  const PINInputCellRenderer = (props: ICellRendererParams<PINInterface>) => {
    const interfaceItem = props.data;
    if (!interfaceItem) return null;
    
    const isEditing = editingId === interfaceItem.id;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={editingPin}
            onChange={(e) => setEditingPin(e.target.value)}
            placeholder={t('pins.enterNewPin') || 'Enter new PIN'}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 w-40"
            maxLength={16}
            minLength={4}
          />
          <span className="text-sm text-gray-500">{t('pins.minLength') || '4-16 characters'}</span>
        </div>
      );
    }

    return (
      <span className="text-gray-600 dark:text-gray-400 font-mono">
        {interfaceItem.currentPin}
      </span>
    );
  };

  const TypeCellRenderer = (props: ICellRendererParams<PINInterface>) => {
    const interfaceItem = props.data;
    if (!interfaceItem) return null;
    
    return (
      <div className="flex items-center gap-2">
        {getTypeIcon(interfaceItem.type)}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeClass(interfaceItem.type)}`}>
          {interfaceItem.type.toUpperCase()}
        </span>
      </div>
    );
  };

  const StatusCellRenderer = (props: ICellRendererParams<PINInterface>) => {
    const interfaceItem = props.data;
    if (!interfaceItem) return null;
    
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          interfaceItem.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}
      >
        {interfaceItem.isActive ? (t('pins.active') || 'Active') : (t('pins.inactive') || 'Inactive')}
      </span>
    );
  };

  const columnDefs: ColDef<PINInterface>[] = [
    {
      headerName: t('pins.interface') || 'Interface',
      field: 'displayName',
      flex: 2,
      sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: t('pins.description') || 'Description',
      field: 'description',
      flex: 2,
      sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: t('pins.type') || 'Type',
      field: 'type',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: TypeCellRenderer,
    },
    {
      headerName: t('pins.currentPin') || 'Current PIN',
      field: 'currentPin',
      flex: 2,
      cellRenderer: PINInputCellRenderer,
    },
    {
      headerName: t('pins.status') || 'Status',
      field: 'isActive',
      flex: 1,
      sortable: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: t('pins.actions') || 'Actions',
      cellRenderer: ActionsCellRenderer,
      flex: 2,
      sortable: false,
      filter: false,
    },
  ];

  const adminInterfaces = interfaces.filter(i => i.type === 'admin');
  const waiterInterfaces = interfaces.filter(i => i.type === 'waiter');
  const supervisorInterfaces = interfaces.filter(i => i.type === 'supervisor');

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-600" />
            {t('pins.title') || 'PIN Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('pins.subtitle') || 'Manage security PINs for admin panel, waiters, and supervisors'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pins.adminAccounts') || 'Admin Accounts'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {adminInterfaces.length}
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pins.waiterAccounts') || 'Waiter Accounts'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {waiterInterfaces.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pins.supervisorAccounts') || 'Supervisor Accounts'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {supervisorInterfaces.length}
                </p>
              </div>
              <Key className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={loadPINs}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {t('pins.refresh') || 'Refresh'}
          </button>
        </div>

        {/* AG Grid Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('pins.allInterfaces') || 'All Interfaces'}
          </h2>
          <div className="ag-theme-alpine dark:ag-theme-alpine-dark" style={{ height: 600, width: '100%' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <AgGridReact<PINInterface>
                rowData={interfaces}
                columnDefs={columnDefs}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  filter: true,
                }}
                pagination={true}
                paginationPageSize={20}
                onGridReady={(params) => setGridApi(params.api)}
              />
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                {t('pins.securityNoticeTitle') || 'Security Notice'}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('pins.securityNotice') || 'Always use strong PINs (at least 4-8 characters). Regularly update PINs to maintain security. Disabled interfaces cannot be accessed until re-enabled.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PINManagementPage;
