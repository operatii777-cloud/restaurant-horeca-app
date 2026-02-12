import { useMemo, useState } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { useInterfacePins } from '@/modules/waiters/hooks/useInterfacePins';
import { computeRotationStatus, getInterfaceMetadata } from '@/modules/waiters/utils/pinUtils';
import type { InterfaceMetadata, RotationStatus } from '@/modules/waiters/utils/pinUtils';
import type { InterfacePin } from '@/types/pins';
import { DataGrid } from '@/shared/components/DataGrid';
import { TableFilter } from '@/shared/components/TableFilter';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { KPIBusinessSection } from '@/modules/dashboard/components/KPIBusinessSection';
import { useTranslation } from '@/i18n/I18nContext';
import './DashboardPage.css';

const getRotationPriority = (rotation: RotationStatus) => {
  if (rotation.kind === 'due') {
    return -1000 - (rotation.daysSinceRotation ?? 0);
  }
  if (rotation.kind === 'warning') {
    return rotation.daysUntilDue ?? Number.POSITIVE_INFINITY;
  }
  return Number.POSITIVE_INFINITY;
};

type RotationRow = {
  pin: InterfacePin;
  metadata: InterfaceMetadata;
  rotation: RotationStatus;
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { pins, loading: pinsLoading, error: pinsError, refresh: refreshPins } = useInterfacePins();
  const [rotationFilter, setRotationFilter] = useState('');
  const debouncedFilter = useDebouncedValue(rotationFilter, 200);

  const rotationRows = useMemo<RotationRow[]>(
    () => {
      if (!Array.isArray(pins)) {
        return [];
      }
      return pins.map((pin) => {
        const metadata = getInterfaceMetadata(pin.interface);
        const rotation = computeRotationStatus(pin);
        return { pin, metadata, rotation };
      });
    },
    [pins],
  );

  const upcomingRotations = useMemo(() => {
    return rotationRows
      .filter(({ rotation }) => rotation.kind === 'due' || rotation.kind === 'warning')
      .sort((a, b) => getRotationPriority(a.rotation) - getRotationPriority(b.rotation))
      .slice(0, 5);
  }, [rotationRows]);

  const rotationColumns = useMemo<ColDef<RotationRow>[]>(() => {
    return [
      {
        headerName: t('dashboard.pinRotation.interface'),
        valueGetter: (params) => params.data?.metadata.label ?? '',
        minWidth: 200,
        pinned: 'left',
      },
      {
        headerName: t('dashboard.pinRotation.category'),
        valueGetter: (params) => params.data?.metadata.category ?? '',
        minWidth: 160,
      },
      {
        headerName: t('dashboard.pinRotation.status'),
        valueGetter: (params) => params.data?.rotation.label ?? '',
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<RotationRow>) => {
          if (!params.data) return '';
          const { rotation } = params.data;
          const color =
            rotation.kind === 'due'
              ? '#b91c1c'
              : rotation.kind === 'warning'
                ? '#b45309'
                : rotation.kind === 'legacy'
                  ? '#1d4ed8'
                  : '#0f172a';
          return <span style={{ fontWeight: 600, color }}>{rotation.label}</span>;
        },
      },
      {
        headerName: t('dashboard.pinRotation.lastRotation'),
        valueGetter: (params) => params.data?.rotation.lastRotatedLabel ?? '—',
        minWidth: 190,
      },
      {
        headerName: t('dashboard.pinRotation.summary'),
        valueGetter: (params) => params.data?.rotation.summary ?? '',
        flex: 1,
        minWidth: 220,
        wrapText: true,
        autoHeight: true,
      },
    ];
  }, [t]);

  const filteredRotationRows = useMemo(() => {
    if (!debouncedFilter) {
      return rotationRows;
    }
    const query = debouncedFilter.toLowerCase();
    return rotationRows.filter(({ pin, metadata, rotation }) => {
      return (
        metadata.label.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query) ||
        pin.interface.toLowerCase().includes(query) ||
        rotation.label.toLowerCase().includes(query) ||
        rotation.summary.toLowerCase().includes(query)
      );
    });
  }, [rotationRows, debouncedFilter]);

  return (
    <div className="dashboard" data-page-ready="true">
      {/* KPI Business Section - Indicatori reali de business */}
      <KPIBusinessSection />

      <section className="dashboard__grid">
        <article className="dashboard__card dashboard__card--pins">
          <header>
            <h3>{t('dashboard.pinRotation.title')}</h3>
            <span>{t('dashboard.pinRotation.subtitle')}</span>
          </header>

          {pinsError ? (
            <InlineAlert
              type="error"
              message={`${t('dashboard.pinRotation.errorLoading')} ${pinsError}`}
              actionLabel={t('dashboard.pinRotation.retry')}
              onAction={refreshPins}
            />
          ) : null}

          {pinsLoading ? <InlineAlert type="info" message={t('dashboard.pinRotation.updating')} /> : null}

          {!pinsLoading && !pinsError ? (
            <>
              <TableFilter value={rotationFilter} onChange={setRotationFilter} placeholder={t('dashboard.pinRotation.filterPlaceholder')} />
              <DataGrid
                columnDefs={rotationColumns}
                rowData={filteredRotationRows}
                quickFilterText={debouncedFilter}
                height="340px"
                gridOptions={{
                  rowHeight: 56,
                  headerHeight: 46,
                  suppressScrollOnNewData: true,
                }}
              />
              <section>
                <h4 style={{ marginBottom: '8px' }}>{t('dashboard.pinRotation.urgentRotations')}</h4>
                {upcomingRotations.length === 0 ? (
                  <InlineAlert type="success" message={t('dashboard.pinRotation.noUrgentRotations')} />
                ) : (
                  <DataGrid
                    columnDefs={rotationColumns}
                    rowData={upcomingRotations}
                    height="220px"
                    gridOptions={{
                      rowHeight: 54,
                      headerHeight: 44,
                      suppressScrollOnNewData: true,
                    }}
                  />
                )}
              </section>
            </>
          ) : null}
        </article>
      </section>
    </div>
  );
};

