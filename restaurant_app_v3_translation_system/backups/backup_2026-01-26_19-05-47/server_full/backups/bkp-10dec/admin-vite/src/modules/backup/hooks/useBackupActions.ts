import { useCallback, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';

export type AlertType = 'success' | 'info' | 'error';

export type AlertState =
  | {
      type: AlertType;
      message: string;
    }
  | null;

export type ArchiveRange = {
  startDate: string;
  endDate: string;
};

type UseBackupActionsOptions = {
  onBackupsRefresh: () => Promise<void>;
  onArchiveRefresh: () => Promise<void>;
};

type UseBackupActionsResult = {
  alert: AlertState;
  showAlert: (message: string, type?: AlertType) => void;
  clearAlert: () => void;
  creatingBackup: boolean;
  restoringBackup: boolean;
  deletingBackup: boolean;
  downloadingBackup: boolean;
  archivingOrders: boolean;
  exportingArchive: boolean;
  deletingArchiveRange: boolean;
  createBackup: () => Promise<void>;
  restoreBackup: (fileName: string) => Promise<void>;
  deleteBackup: (fileName: string) => Promise<void>;
  downloadBackup: (fileName: string) => Promise<void>;
  archiveOrders: () => Promise<void>;
  exportArchive: (range: ArchiveRange) => Promise<void>;
  deleteArchiveRange: (range: ArchiveRange) => Promise<void>;
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown; statusText?: string } }).response;
    if (response?.data && typeof response.data === 'object' && 'error' in (response.data as Record<string, unknown>)) {
      return String((response.data as Record<string, unknown>).error);
    }
    if (response?.statusText) {
      return response.statusText;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'A apărut o eroare neașteptată';
};

export const useBackupActions = ({
  onBackupsRefresh,
  onArchiveRefresh,
}: UseBackupActionsOptions): UseBackupActionsResult => {
  const [alert, setAlert] = useState<AlertState>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [deletingBackup, setDeletingBackup] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [archivingOrders, setArchivingOrders] = useState(false);
  const [exportingArchive, setExportingArchive] = useState(false);
  const [deletingArchiveRange, setDeletingArchiveRange] = useState(false);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    setAlert({ message, type });
  }, []);

  const clearAlert = useCallback(() => setAlert(null), []);

  const createBackup = useCallback(async () => {
    clearAlert();
    setCreatingBackup(true);
    try {
      await httpClient.post('/api/admin/backup-database');
      showAlert('Backup creat cu succes.', 'success');
      await onBackupsRefresh();
    } catch (error) {
      showAlert(getErrorMessage(error), 'error');
    } finally {
      setCreatingBackup(false);
    }
  }, [clearAlert, onBackupsRefresh, showAlert]);

  const restoreBackup = useCallback(
    async (fileName: string) => {
      clearAlert();
      setRestoringBackup(true);
      try {
        await httpClient.post('/api/admin/restore-database', { backupFileName: fileName });
        showAlert('Restaurare finalizată. Verifică aplicația și rulează testele de integritate.', 'success');
        await Promise.all([onBackupsRefresh(), onArchiveRefresh()]);
      } catch (error) {
        showAlert(getErrorMessage(error), 'error');
      } finally {
        setRestoringBackup(false);
      }
    },
    [clearAlert, onArchiveRefresh, onBackupsRefresh, showAlert],
  );

  const deleteBackup = useCallback(
    async (fileName: string) => {
      clearAlert();
      setDeletingBackup(true);
      try {
        await httpClient.delete(`/api/admin/backups/${encodeURIComponent(fileName)}`);
        showAlert('Backup șters.', 'success');
        await onBackupsRefresh();
      } catch (error) {
        showAlert(getErrorMessage(error), 'error');
      } finally {
        setDeletingBackup(false);
      }
    },
    [clearAlert, onBackupsRefresh, showAlert],
  );

  const downloadBackup = useCallback(
    async (fileName: string) => {
      clearAlert();
      setDownloadingBackup(true);
      try {
        const response = await httpClient.get<ArrayBuffer>(`/api/admin/backups/download/${encodeURIComponent(fileName)}`, {
          responseType: 'arraybuffer',
        });
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showAlert('Descărcare inițiată.', 'info');
      } catch (error) {
        showAlert(getErrorMessage(error), 'error');
      } finally {
        setDownloadingBackup(false);
      }
    },
    [clearAlert, showAlert],
  );

  const archiveOrders = useCallback(async () => {
    clearAlert();
    setArchivingOrders(true);
    try {
      await httpClient.post('/api/admin/archive-orders');
      showAlert('Procesul de arhivare a fost pornit.', 'success');
      await onArchiveRefresh();
    } catch (error) {
      showAlert(getErrorMessage(error), 'error');
    } finally {
      setArchivingOrders(false);
    }
  }, [clearAlert, onArchiveRefresh, showAlert]);

  const exportArchive = useCallback(
    async (range: ArchiveRange) => {
      clearAlert();
      setExportingArchive(true);
      try {
        const response = await httpClient.get<ArrayBuffer>('/api/admin/export-archived', {
          params: range,
          responseType: 'arraybuffer',
        });
        const fileName = `comenzi_arhivate_${range.startDate.slice(0, 10)}_${range.endDate.slice(0, 10)}.csv`;
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showAlert('Exportul arhivei a fost generat.', 'success');
      } catch (error) {
        showAlert(getErrorMessage(error), 'error');
      } finally {
        setExportingArchive(false);
      }
    },
    [clearAlert, showAlert],
  );

  const deleteArchiveRange = useCallback(
    async (range: ArchiveRange) => {
      clearAlert();
      setDeletingArchiveRange(true);
      try {
        await httpClient.delete('/api/admin/delete-archived', {
          data: range,
        });
        showAlert('Comenzile arhivate din interval au fost șterse.', 'success');
        await onArchiveRefresh();
      } catch (error) {
        showAlert(getErrorMessage(error), 'error');
      } finally {
        setDeletingArchiveRange(false);
      }
    },
    [clearAlert, onArchiveRefresh, showAlert],
  );

  return {
    alert,
    showAlert,
    clearAlert,
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
  };
};

