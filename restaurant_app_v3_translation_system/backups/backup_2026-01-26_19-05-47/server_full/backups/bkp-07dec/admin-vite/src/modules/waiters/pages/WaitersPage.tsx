import { useCallback, useMemo, useState } from 'react';
import type { ColDef, ICellRendererParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { TableFilter } from '@/shared/components/TableFilter';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { DataGrid } from '@/shared/components/DataGrid';
import { Modal } from '@/shared/components/Modal';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { useInterfacePins } from '@/modules/waiters/hooks/useInterfacePins';
import { PinEditorModal } from '@/modules/waiters/components/PinEditorModal';
import {
  computeRotationStatus as computePinRotationStatus,
  getInterfaceMetadata,
  summarizeRotationStatuses,
  type InterfaceMetadata,
  type RotationStatus,
  type RotationStatusKind,
} from '@/modules/waiters/utils/pinUtils';
import type { InterfacePin } from '@/types/pins';
import { KioskUsersSection } from '@/modules/waiters/components/KioskUsersSection';
import './WaitersPage.css';

type PinRow = InterfacePin & {
  metadata: InterfaceMetadata;
  label: string;
  category: string;
  sortIndex: number;
  rotation: RotationStatus;
  statusKind: RotationStatusKind;
  statusLabel: string;
  statusSummary: string;
  lastRotatedLabel: string;
};

type DeleteConfirmModalProps = {
  open: boolean;
  interfaceLabel: string;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};


const DeleteConfirmModal = ({
  open,
  interfaceLabel,
  loading,
  error,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) => (
  <Modal
    isOpen={open}
    onClose={onCancel}
    title="Ștergere PIN interfață"
    description="Confirmă ștergerea PIN-ului. Interfața va rămâne fără cod de acces până la configurarea unui PIN nou."
    size="sm"
  >
    {error ? <InlineAlert type="error" message={error} /> : null}
    <p className="pin-delete__message">
      Ești sigur că vrei să elimini PIN-ul pentru <strong>{interfaceLabel}</strong>?
    </p>
    <div className="pin-delete__actions">
      <button type="button" onClick={onCancel} className="pin-delete__button pin-delete__button--secondary">
        Anulează
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="pin-delete__button pin-delete__button--danger"
        disabled={loading}
      >
        {loading ? 'Se șterge…' : 'Șterge PIN'}
      </button>
    </div>
  </Modal>
);

export const WaitersPage = () => {
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebouncedValue(filter, 250);
  const [selectedPin, setSelectedPin] = useState<PinRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PinRow | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pins' | 'kiosk-users'>('pins');

  const { pins, loading, error, refresh } = useInterfacePins();
  const {
    mutate: deletePin,
    loading: deleteLoading,
    error: deleteError,
    reset: resetDeleteMutation,
  } = useApiMutation();

  const pinRows = useMemo<PinRow[]>(() => {
    return pins
      .map<PinRow>((pin) => {
        const metadata = getInterfaceMetadata(pin.interface);
        const rotation = computePinRotationStatus(pin);

        return {
          ...pin,
          metadata,
          label: metadata.label,
          category: metadata.category,
          sortIndex: metadata.sortIndex,
          rotation,
          statusKind: rotation.kind,
          statusLabel: rotation.label,
          statusSummary: rotation.summary,
          lastRotatedLabel: rotation.lastRotatedLabel,
        };
      })
      .sort((a, b) => a.sortIndex - b.sortIndex);
  }, [pins]);

  const filteredRows = useMemo<PinRow[]>(() => {
    if (!debouncedFilter) {
      return pinRows;
    }

    const query = debouncedFilter.toLowerCase();
    return pinRows.filter(
      (row) =>
        row.label.toLowerCase().includes(query) ||
        row.interface.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query),
    );
  }, [pinRows, debouncedFilter]);

  const rotationSummary = useMemo(() => summarizeRotationStatuses(pins), [pins]);

  const stats = useMemo(
    () => ({
      total: rotationSummary.total,
      configured: rotationSummary.configured,
      legacy: rotationSummary.legacy,
      due: rotationSummary.due,
      warning: rotationSummary.warning,
      missing: rotationSummary.missing,
    }),
    [rotationSummary],
  );

  const handleOpenEditor = useCallback((row: PinRow) => {
    setSelectedPin(row);
    setEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const handleEditorSuccess = useCallback(
    async () => {
      setFeedback({ type: 'success', message: 'PIN-ul a fost actualizat cu succes.' });
      await refresh();
    },
    [refresh],
  );

  const handleDeleteClick = useCallback((row: PinRow) => {
    resetDeleteMutation();
    setPendingDelete(row);
  }, [resetDeleteMutation]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }

    const result = await deletePin({
      url: '/api/admin/delete-pin',
      method: 'post',
      data: {
        interface: pendingDelete.interface,
      },
    });

    if (result !== null) {
      setFeedback({
        type: 'success',
        message: `PIN-ul pentru ${pendingDelete.label} a fost șters.`,
      });
      setPendingDelete(null);
      await refresh();
    }
  }, [pendingDelete, deletePin, refresh]);

  const columnDefs = useMemo<ColDef<PinRow>[]>(() => {
    return [
      {
        headerName: 'Interfață',
        field: 'label',
        pinned: 'left',
        minWidth: 240,
        cellRenderer: (params: ICellRendererParams<PinRow>) => {
          const row = params.data as PinRow | undefined;
          if (!row) {
            return params.value;
          }
          return (
            <div className="pin-grid__interface">
              <span className="pin-grid__interface-label">{row.label}</span>
              <span className="pin-grid__interface-code">{row.interface}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Categorie',
        field: 'category',
        minWidth: 160,
      },
      {
        headerName: 'Status PIN',
        field: 'statusLabel',
        minWidth: 170,
        cellRenderer: (params: ICellRendererParams<PinRow>) => {
          const row = params.data as PinRow | undefined;
          if (!row) {
            return params.value;
          }

          return <span className={`pin-status pin-status--${row.statusKind}`}>{row.statusLabel}</span>;
        },
      },
      {
        headerName: 'Ultima rotație',
        field: 'lastRotatedLabel',
        minWidth: 200,
      },
      {
        headerName: 'Rotit de',
        field: 'rotatedBy',
        minWidth: 180,
        valueGetter: (params: ValueGetterParams<PinRow, string>) => params.data?.rotatedBy ?? '—',
      },
      {
        headerName: 'Politică',
        field: 'policyVersion',
        minWidth: 120,
        valueFormatter: (params: ValueFormatterParams<PinRow, number>) =>
          params.value ? `v${params.value}` : '—',
      },
      {
        headerName: 'Algoritm',
        field: 'algorithm',
        minWidth: 140,
        valueFormatter: (params: ValueFormatterParams<PinRow, string>) => params.value ?? '—',
      },
      {
        headerName: 'Acțiuni',
        field: 'interface',
        pinned: 'right',
        minWidth: 230,
        cellRenderer: (params: ICellRendererParams<PinRow>) => {
          const row = params.data as PinRow | undefined;
          if (!row) {
            return null;
          }

          const label = row.hasPin ? 'Actualizează PIN' : 'Setează PIN';

          return (
            <div className="pin-actions">
              <button type="button" onClick={() => handleOpenEditor(row)} className="pin-actions__button">
                {label}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(row)}
                className="pin-actions__button pin-actions__button--delete"
                disabled={!row.hasPin || deleteLoading}
              >
                Șterge
              </button>
            </div>
          );
        },
      },
    ];
  }, [handleOpenEditor, handleDeleteClick, deleteLoading]);

  const isReady = !loading;

  return (
    <div className="waiters-page" data-page-ready={isReady ? 'true' : 'false'}>
      <PageHeader
        title="Gestionare PIN-uri interfețe"
        description="Administrează codurile de acces pentru Admin Panel, ospătari POS, KDS și stațiile de bar. Rotația PIN-urilor garantează securitatea operațională."
        actions={[
          {
            label: '↻ Reîncarcă lista',
            variant: 'secondary',
            onClick: () => {
              void refresh();
            },
          },
        ]}
      />

      {/* Tabs pentru PIN-uri și Utilizatori KIOSK */}
      <div className="waiters-tabs" style={{ marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pins')}
          className={`waiters-tab ${activeTab === 'pins' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'pins' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'pins' ? '#007bff' : '#666',
            fontWeight: activeTab === 'pins' ? '600' : '400',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fas fa-key me-2"></i>PIN-uri Interfețe
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kiosk-users')}
          className={`waiters-tab ${activeTab === 'kiosk-users' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'kiosk-users' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'kiosk-users' ? '#007bff' : '#666',
            fontWeight: activeTab === 'kiosk-users' ? '600' : '400',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fas fa-users me-2"></i>Utilizatori KIOSK
        </button>
      </div>

      {activeTab === 'kiosk-users' && <KioskUsersSection />}

      {activeTab === 'pins' && (
        <>

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} /> : null}
      {error ? <InlineAlert type="error" message={error} /> : null}

      <section className="waiters-stats">
        <StatCard title="Interfețe totale" value={`${stats.total}`} helper="conectate la POS" />
        <StatCard
          title="PIN-uri active (hash)"
          value={`${stats.configured}`}
          helper={`${stats.missing + stats.legacy} nesetate sau legacy`}
        />
        <StatCard title="Rotație întârziată" value={`${stats.due}`} helper="necesită acțiune imediată" />
        <StatCard title="Atenție rotație" value={`${stats.warning}`} helper="sub 5 zile până la expirare" />
        <StatCard title="PIN-uri legacy" value={`${stats.legacy}`} helper="de migrat la hash" />
      </section>

      <section className="waiters-toolbar">
        <TableFilter value={filter} onChange={setFilter} placeholder="Caută după interfață, cod sau categorie" />
      </section>

      <section className="pin-grid-section">
        <DataGrid<PinRow>
          columnDefs={columnDefs}
          rowData={filteredRows}
          loading={loading}
          quickFilterText={debouncedFilter}
          height="60vh"
        />
      </section>

      <PinEditorModal
        open={editorOpen}
        interfaceId={selectedPin?.interface ?? null}
        interfaceLabel={selectedPin?.label ?? ''}
        onClose={handleCloseEditor}
        onSuccess={handleEditorSuccess}
      />

      <DeleteConfirmModal
        open={Boolean(pendingDelete)}
        interfaceLabel={pendingDelete?.label ?? ''}
        loading={deleteLoading}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
        </>
      )}
    </div>
  );
};

