import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DataGrid } from '@/shared/components/DataGrid';
import { StatCard } from '@/shared/components/StatCard';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { ArchiveStats, BackupInfo, BackupResponse } from '@/types/backup';
import { useBackupActions } from '../hooks/useBackupActions';
import { BackupJobDetailsDrawer } from '../components/BackupJobDetailsDrawer';
import { useBackupProgress } from '../hooks/useBackupProgress';
import './BackupPage.css';
import { httpClient } from '@/shared/api/httpClient';

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('ro-RO', { hour12: false });
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatBytes = (bytes: number | null | undefined) => {
  if (!Number.isFinite(Number(bytes))) {
    return '—';
  }

  const safeBytes = Number(bytes);
  if (safeBytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(safeBytes) / Math.log(k));
  const value = safeBytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
};

const formatDuration = (durationMs?: number | null) => {
  if (typeof durationMs !== 'number' || Number.isNaN(durationMs) || durationMs <= 0) {
    return '—';
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

const todayISO = new Date().toISOString().slice(0, 10);
const oneYearAgoISO = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
})();

const statusLabelMap: Record<string, string> = {
  success: 'Complet',
  error: 'Eșuat',
  running: 'În curs',
};

export const BackupPage = () => {
  const {
    data: backupData,
    loading: backupsLoading,
    error: backupsError,
    refetch: refetchBackups,
  } = useApiQuery<BackupResponse>('/api/admin/backups');
  const {
    data: archiveStats,
    loading: archiveLoading,
    error: archiveError,
    refetch: refetchArchiveStats,
  } = useApiQuery<ArchiveStats>('/api/admin/archive-stats');

  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [exportStartDate, setExportStartDate] = useState(oneYearAgoISO);
  const [exportEndDate, setExportEndDate] = useState(todayISO);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  const { progress, source, lastError, restart } = useBackupProgress(selectedBackup?.jobId ?? null, {
    enabled: isDetailsOpen && Boolean(selectedBackup?.jobId),
  });

  useEffect(() => {
    if (!selectedBackup && isDetailsOpen) {
      setDetailsOpen(false);
    }
  }, [isDetailsOpen, selectedBackup]);

  const backups = useMemo(() => backupData?.backups ?? [], [backupData]);
  const backupStats = backupData?.stats;
  const archiveMetrics = archiveStats ?? null;

  const {
    alert,
    showAlert,
    creatingBackup,
    restoringBackup,
    deletingBackup,
    downloadingBackup,
    archivingOrders,
    exportingArchive,
    deletingArchiveRange,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    archiveOrders,
    exportArchive,
    deleteArchiveRange,
  } = useBackupActions({
    onBackupsRefresh: refetchBackups,
    onArchiveRefresh: refetchArchiveStats,
  });

  const handleViewDetails = useCallback(() => {
    if (!selectedBackup) {
      showAlert('Selectează un backup din listă pentru a vedea detaliile.', 'info');
      return;
    }
    setDetailsOpen(true);
  }, [selectedBackup, showAlert]);

  const columnDefs = useMemo<ColDef<BackupInfo>[]>(() => {
    return [
      {
        headerName: 'Tip',
        field: 'type',
        width: 120,
        valueFormatter: ({ value }) => (value === 'archive' ? 'Arhivă' : 'Backup'),
      },
      {
        headerName: 'Fișier',
        field: 'fileName',
        flex: 1,
        minWidth: 260,
      },
      {
        headerName: 'Creat la',
        field: 'createdAt',
        minWidth: 200,
        valueFormatter: ({ value }) => formatDateTime(value as string),
      },
      {
        headerName: 'Durată',
        field: 'durationMs',
        width: 140,
        valueFormatter: ({ value }) => formatDuration(value as number | null),
      },
      {
        headerName: 'Dimensiune',
        field: 'sizeBytes',
        width: 150,
        valueFormatter: ({ value }) => formatBytes(value as number),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 140,
        valueFormatter: ({ value }) => statusLabelMap[String(value)] ?? 'Disponibil',
      },
      {
        headerName: 'Utilizator',
        field: 'createdBy',
        minWidth: 160,
      },
    ];
  }, []);

  const handleSelectedRowsChange = useCallback((rows: BackupInfo[]) => {
    const backup = rows[0] ?? null;
    setSelectedBackup(backup);
    if (backup?.jobId) {
      setDetailsOpen(true);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([refetchBackups(), refetchArchiveStats()]);
  }, [refetchArchiveStats, refetchBackups]);

  const handleCreateBackup = useCallback(async () => {
    await createBackup();
  }, [createBackup]);

  const handleRestoreBackup = useCallback(async () => {
    if (!selectedBackup) {
      showAlert('Selectează mai întâi un backup din listă.', 'info');
      return;
    }
    if (!window.confirm(`Confirmați restaurarea backup-ului "${selectedBackup.fileName}"?`)) {
      return;
    }
    await restoreBackup(selectedBackup.fileName);
  }, [restoreBackup, selectedBackup, showAlert]);

  const handleDeleteBackup = useCallback(async () => {
    if (!selectedBackup) {
      showAlert('Nu ai selectat niciun backup de șters.', 'info');
      return;
    }
    if (!window.confirm(`Ștergeți backup-ul "${selectedBackup.fileName}"?`)) {
      return;
    }
    await deleteBackup(selectedBackup.fileName);
    setSelectedBackup(null);
  }, [deleteBackup, selectedBackup, showAlert]);

  const handleDownloadBackup = useCallback(async () => {
    if (!selectedBackup) {
      showAlert('Selectează mai întâi un backup pentru descărcare.', 'info');
      return;
    }
    await downloadBackup(selectedBackup.fileName);
  }, [downloadBackup, selectedBackup, showAlert]);

  const handleDownloadLog = useCallback(async () => {
    if (!selectedBackup) {
      showAlert('Selectează un backup pentru a descărca logul.', 'info');
      return;
    }
    if (!selectedBackup.logAvailable) {
      showAlert('Nu există log pentru acest backup.', 'info');
      return;
    }
    try {
      const response = await httpClient.get<ArrayBuffer>(
        `/api/admin/backups/${encodeURIComponent(selectedBackup.fileName)}/log`,
        { responseType: 'arraybuffer' },
      );
      const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedBackup.fileName}.log`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Eroare descărcare log backup:', error);
      showAlert('Nu am putut descărca logul backup-ului.', 'error');
    }
  }, [selectedBackup, showAlert]);

  const handleArchiveManual = useCallback(async () => {
    await archiveOrders();
  }, [archiveOrders]);

  const buildIsoRange = useCallback(() => {
    const startDateIso = new Date(`${exportStartDate}T00:00:00`).toISOString();
    const endDateIso = new Date(`${exportEndDate}T23:59:59`).toISOString();
    return { startDate: startDateIso, endDate: endDateIso };
  }, [exportEndDate, exportStartDate]);

  const handleExportArchive = useCallback(async () => {
    await exportArchive(buildIsoRange());
  }, [buildIsoRange, exportArchive]);

  const handleDeleteArchiveRange = useCallback(async () => {
    if (!window.confirm('Confirmați ștergerea comenzilor arhivate din intervalul selectat?')) {
      return;
    }
    await deleteArchiveRange(buildIsoRange());
  }, [buildIsoRange, deleteArchiveRange]);

  const timelineItems = useMemo(() => {
    return backups.map((backup) => ({
      id: backup.jobId ?? backup.fileName,
      title: backup.fileName,
      status: backup.status ?? 'success',
      subtitle: `${formatDateTime(backup.createdAt)} • ${formatBytes(backup.sizeBytes)}${
        backup.createdBy ? ` • ${backup.createdBy}` : ''
      }`,
    }));
  }, [backups]);

  const retentionCount = backupStats?.retentionCount ?? 2;
  const watchdogActive = backupStats?.watchdogActive ?? archiveMetrics?.watchdogActive ?? null;

  const storageUsedRaw = archiveMetrics?.storageUsedMB ?? backupStats?.storageUsedMB;
  const storageQuotaRaw = archiveMetrics?.storageQuotaMB ?? backupStats?.storageQuotaMB;
  const storageUsed = typeof storageUsedRaw === 'number' ? storageUsedRaw : null;
  const storageQuota = typeof storageQuotaRaw === 'number' ? storageQuotaRaw : null;
  const storageText =
    storageUsed !== null && storageQuota !== null
      ? `${storageUsed.toFixed(1)} MB / ${storageQuota.toFixed(1)} MB`
      : storageUsed !== null
      ? `${storageUsed.toFixed(1)} MB utilizați`
      : '—';

  const isBusy =
    archivingOrders ||
    creatingBackup ||
    restoringBackup ||
    deletingBackup ||
    downloadingBackup ||
    exportingArchive ||
    deletingArchiveRange ||
    backupsLoading ||
    archiveLoading;

  return (
    <div className="backup-page" data-page-ready="true">
      <PageHeader
        title="Backup & Arhivă"
        description="Administrează backup-urile bazei de date și arhivarea comenzilor, conform politicilor ANPC/ANSVSA."
      />

      {alert ? <InlineAlert message={alert.message} type={alert.type} /> : null}
      {backupsError ? <InlineAlert message={backupsError} type="error" /> : null}
      {archiveError ? <InlineAlert message={archiveError} type="error" /> : null}

      <section className="backup-page__stats">
        <StatCard
          title="Backup-uri disponibile"
          value={backupStats ? backupStats.totalBackups.toString() : '—'}
          helper="Total fișiere păstrate în retenție"
          icon="💾"
          footer={
            <span>
              Ultimul backup:{' '}
              <strong>{backupStats?.lastBackupAt ? formatDateTime(backupStats.lastBackupAt) : 'N/A'}</strong>
            </span>
          }
        />
        <StatCard
          title="Comenzi active"
          value={archiveMetrics ? archiveMetrics.activeOrders.toString() : '—'}
          helper="În baza de date curentă"
          icon="📋"
        />
        <StatCard
          title="Comenzi arhivate"
          value={archiveMetrics ? archiveMetrics.archivedOrders.toString() : '—'}
          helper={
            archiveMetrics?.oldestArchive
              ? `Arhivă din ${formatDate(archiveMetrics.oldestArchive)}`
              : 'Arhivele sunt goale'
          }
          icon="🗂️"
        />
        <StatCard
          title="Retenție activă"
          value={`${retentionCount} fiș.`}
          helper="create-backup-06nov.ps1 – păstrează ultimele backup-uri"
          icon="♻️"
          footer={<span>Ultima verificare: {formatDateTime(backupStats?.lastBackupAt ?? null)}</span>}
        />
        <StatCard
          title="Watchdog server"
          value={
            watchdogActive == null ? 'N/A' : watchdogActive ? 'ONLINE' : 'OFFLINE'
          }
          helper="watchdog.ps1 – monitorizare și autorestart Node.js"
          icon={watchdogActive ? '🟢' : '🔴'}
        />
        <StatCard
          title="Spațiu arhivă"
          value={storageText}
          helper="Estimare spațiu utilizat de backup-uri/arhivă"
          icon="🧮"
        />
      </section>

      <section className="backup-page__timeline">
        <header>
          <div>
            <h3>Activitate recentă</h3>
            <small>Ultimele backup-uri și arhive generate</small>
          </div>
          <button type="button" onClick={handleRefreshAll} disabled={isBusy}>
            Reîmprospătează
          </button>
        </header>
        <ul className="backup-page__timeline-list">
          {timelineItems.length === 0 ? (
            <li className="backup-page__timeline-empty">Nu există încă backup-uri înregistrate.</li>
          ) : (
            timelineItems.map((item) => (
              <li
                key={item.id}
                className={`backup-page__timeline-item backup-page__timeline-item--${item.status}`}
              >
                <span className="backup-page__timeline-dot" aria-hidden="true" />
                <div className="backup-page__timeline-content">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="backup-page__actions">
        <div className="backup-page__action-group">
          <h3>Backup bază de date</h3>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleCreateBackup} disabled={creatingBackup}>
              {creatingBackup ? 'Se creează backup...' : 'Creează backup nou'}
            </button>
            <button
              type="button"
              onClick={handleRestoreBackup}
              disabled={!selectedBackup || restoringBackup}
              className="secondary"
            >
              {restoringBackup ? 'Restaurare...' : 'Restaurează backup selectat'}
            </button>
            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={!selectedBackup || downloadingBackup}
              className="secondary"
            >
              {downloadingBackup ? 'Se descarcă...' : 'Descarcă backup'}
            </button>
            <button
              type="button"
              onClick={handleDeleteBackup}
              disabled={!selectedBackup || deletingBackup}
              className="danger"
            >
              {deletingBackup ? 'Ștergere...' : 'Șterge backup'}
            </button>
          </div>
          <small>
            Selecția se face din tabelul de mai jos. Retenția automată păstrează ultimele {retentionCount} backup-uri.
          </small>
        </div>

        <div className="backup-page__action-group">
          <h3>Arhivă comenzi</h3>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleArchiveManual} disabled={archivingOrders}>
              {archivingOrders ? 'Arhivare în curs...' : 'Arhivează manual'}
            </button>
          </div>
          <div className="backup-page__date-range">
            <label>
              De la
              <input
                type="date"
                max={exportEndDate}
                value={exportStartDate}
                onChange={(event) => setExportStartDate(event.target.value)}
              />
            </label>
            <label>
              Până la
              <input
                type="date"
                min={exportStartDate}
                max={todayISO}
                value={exportEndDate}
                onChange={(event) => setExportEndDate(event.target.value)}
              />
            </label>
          </div>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleExportArchive} disabled={exportingArchive} className="secondary">
              {exportingArchive ? 'Generez export...' : 'Exportă arhiva CSV'}
            </button>
            <button
              type="button"
              onClick={handleDeleteArchiveRange}
              disabled={deletingArchiveRange}
              className="danger"
            >
              {deletingArchiveRange ? 'Ștergere...' : 'Șterge arhiva (interval)'}
            </button>
          </div>
          <small>Intervalul selectat este utilizat atât pentru export, cât și pentru ștergere.</small>
        </div>
      </section>

      <section className="backup-page__grid">
        <header>
          <h3>Backup-uri disponibile</h3>
          <div className="backup-page__grid-actions">
            {isBusy ? <span className="backup-page__status">Operațiune în curs...</span> : null}
            <button
              type="button"
              className="backup-page__drawer-button secondary"
              onClick={handleViewDetails}
              disabled={!selectedBackup}
              data-qa="open-backup-drawer"
            >
              Detalii job
            </button>
          </div>
        </header>
        <DataGrid<BackupInfo>
          columnDefs={columnDefs}
          rowData={backups}
          loading={backupsLoading}
          rowSelection="single"
          onSelectedRowsChange={handleSelectedRowsChange}
          height="clamp(300px, 45vh, 600px)"
        />
      </section>
      <BackupJobDetailsDrawer
        open={isDetailsOpen && Boolean(selectedBackup)}
        backup={selectedBackup}
        progress={progress}
        source={source}
        lastError={lastError}
        onClose={() => setDetailsOpen(false)}
        onRefresh={handleRefreshAll}
        onRestartProgress={restart}
        onDownloadLog={handleDownloadLog}
      />
    </div>
  );
};

