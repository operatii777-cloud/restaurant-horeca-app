export type BackupInfo = {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  type?: 'backup' | 'archive';
  jobId?: string;
  status?: 'success' | 'error' | 'running';
  createdBy?: string | null;
  durationMs?: number | null;
  location?: string | null;
  logFile?: string | null;
  logAvailable?: boolean;
};

export type BackupStats = {
  totalBackups: number;
  lastBackupAt: string | null;
  retentionCount: number;
  lastArchiveAt?: string | null;
  watchdogActive?: boolean | null;
  storageUsedMB?: number | null;
  storageQuotaMB?: number | null;
};

export type BackupResponse = {
  backups: BackupInfo[];
  stats: BackupStats;
};

export type ArchiveStats = {
  activeOrders: number;
  archivedOrders: number;
  oldestArchive: string | null;
  totalSize: number;
  lastArchiveAt?: string | null;
  watchdogActive?: boolean | null;
  storageUsedMB?: number | null;
  storageQuotaMB?: number | null;
};

