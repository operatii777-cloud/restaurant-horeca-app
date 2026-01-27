// import { useTranslation } from '@/i18n/I18nContext';
import type { BackupInfo } from '@/types/backup';
import type { BackupProgressEvent } from '../hooks/useBackupProgress';
import './BackupJobDetailsDrawer.css';

type BackupJobDetailsDrawerProps = {
  open: boolean;
  backup: BackupInfo | null;
  progress: BackupProgressEvent | null;
  source: 'sse' | 'poll' | null;
  lastError: string | null;
  onClose: () => void;
  onRefresh?: () => void;
  onRestartProgress?: () => void;
  onDownloadLog?: () => Promise<void>;
};

const getStatusLabel = (status?: string | null) => {
//   const { t } = useTranslation();
  if (!status) {
    return '—';
  }
  switch (status) {
    case 'running':
      return 'În curs';
    case 'success':
      return 'Complet';
    case 'error':
      return 'Eșuat';
    default:
      return status;
  }
};

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

export const BackupJobDetailsDrawer = ({
  open,
  backup,
  progress,
  source,
  lastError,
  onClose,
  onRefresh,
  onRestartProgress,
  onDownloadLog,
}: BackupJobDetailsDrawerProps) => {
//   const { t } = useTranslation();
  const percent = progress?.percent ?? null;
  const status = progress?.status ?? backup?.status ?? null;
  const jobId = progress?.jobId ?? backup?.jobId ?? 'N/A';

  const handleDownloadLog = async () => {
    if (!onDownloadLog) return;
    await onDownloadLog();
  };

  return (
    <aside
      className={`backup-drawer ${open ? 'backup-drawer--open' : ''}`}
      aria-hidden={!open}
      data-qa="backup-job-details"
    >
      <div className="backup-drawer__header">
        <div>
          <h3>"detalii job backup"</h3>
          <small>ID job: {jobId}</small>
        </div>
        <button type="button" onClick={onClose} className="backup-drawer__close">"Închide"</button>
      </div>

      <div className="backup-drawer__content">
        {backup ? (
          <section>
            <h4>Backup selectat</h4>
            <dl className="backup-drawer__definition">
              <div>
                <dt>"Fișier"</dt>
                <dd>{backup.fileName}</dd>
              </div>
              <div>
                <dt>"status curent"</dt>
                <dd>{getStatusLabel(status)}</dd>
              </div>
              <div>
                <dt>"creat la"</dt>
                <dd>{formatDateTime(backup.createdAt)}</dd>
              </div>
              <div>
                <dt>Utilizator</dt>
                <dd>{backup.createdBy ?? '—'}</dd>
              </div>
              <div>
                <dt>"Durată"</dt>
                <dd>{backup.durationMs ? `${Math.round(backup.durationMs / 1000)} sec.` : '—'}</dd>
              </div>
              <div>
                <dt>Locație</dt>
                <dd>{backup.location ?? '—'}</dd>
              </div>
              <div>
                <dt>Log</dt>
                <dd>{backup.logAvailable ? (backup.logFile ?? 'Disponibil') : '—'}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <p>"selecteaza un backup din lista pentru a vedea deta"</p>
        )}

        <section>
          <h4>Progres live</h4>
          {progress ? (
            <div className="backup-drawer__progress">
              <div className="backup-drawer__progress-bar">
                <div
                  className={`backup-drawer__progress-inner backup-drawer__progress-inner--${progress.status}`}
                  style={{ width: percent != null ? `${Math.min(100, Math.max(0, percent))}%` : '100%' }}
                />
              </div>
              <ul>
                <li>
                  <strong>Status:</strong> {getStatusLabel(progress.status)}
                </li>
                <li>
                  <strong>"pas curent"</strong> {progress.stepLabel ?? progress.step ?? '—'}
                </li>
                <li>
                  <strong>Procent:</strong> {percent != null ? `${percent.toFixed(1)}%` : 'n/a'}
                </li>
                <li>
                  <strong>"timp estimat ramas"</strong>' '
                  {progress.estimatedSecondsRemaining != null
                    ? `${progress.estimatedSecondsRemaining}s`
                    : 'n/a'}
                </li>
                <li>
                  <strong>Surse update:</strong> {source === 'sse' ? 'SSE live' : source === 'poll' ? 'Pooling' : '—'}
                </li>
                <li>
                  <strong>"actualizat la"</strong> {formatDateTime(progress.updatedAt)}
                </li>
              </ul>
              {progress.message ? <p className="backup-drawer__message">{progress.message}</p> : null}
            </div>
          ) : (
            <p className="backup-drawer__placeholder">"nu exista date live pentru acest job selecteaza un"</p>
          )}
          {lastError ? <p className="backup-drawer__error">Eroare progres: {lastError}</p> : null}
        </section>

        <section className="backup-drawer__actions">
          {onRestartProgress ? (
            <button type="button" onClick={onRestartProgress}>"reporneste monitorizarea"</button>
          ) : null}
          {onRefresh ? (
            <button type="button" onClick={onRefresh} className="secondary">"reimprospateaza lista backup urilor"</button>
          ) : null}
          {backup?.logAvailable && onDownloadLog ? (
            <button
              type="button"
              onClick={handleDownloadLog}
              className="secondary"
              data-qa="download-backup-log"
            >"descarca log job"</button>
          ) : null}
        </section>
      </div>
    </aside>
  );
};





