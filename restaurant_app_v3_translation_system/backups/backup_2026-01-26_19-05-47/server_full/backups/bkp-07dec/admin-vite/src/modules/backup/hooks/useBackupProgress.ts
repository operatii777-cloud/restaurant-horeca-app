import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';

export type BackupProgressEvent = {
  jobId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  percent?: number | null;
  step?: string | null;
  stepLabel?: string | null;
  message?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  estimatedSecondsRemaining?: number | null;
  updatedAt?: string | null;
};

type UseBackupProgressOptions = {
  enabled?: boolean;
  pollIntervalMs?: number;
};

type UseBackupProgressResult = {
  progress: BackupProgressEvent | null;
  source: 'sse' | 'poll' | null;
  lastError: string | null;
  restart: () => void;
};

const parsePayload = (raw: unknown): BackupProgressEvent | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const payload = raw as Record<string, unknown>;
  const jobId = typeof payload.jobId === 'string' ? payload.jobId : null;
  const status =
    typeof payload.status === 'string' && ['pending', 'running', 'success', 'error'].includes(payload.status)
      ? (payload.status as BackupProgressEvent['status'])
      : null;
  if (!jobId || !status) {
    return null;
  }
  const normalizeNumber = (value: unknown) => {
    if (value == null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };
  const normalizeString = (value: unknown) => (typeof value === 'string' ? value : null);
  return {
    jobId,
    status,
    percent: normalizeNumber(payload.percent),
    step: normalizeString(payload.step),
    stepLabel: normalizeString(payload.stepLabel),
    message: normalizeString(payload.message),
    startedAt: normalizeString(payload.startedAt),
    finishedAt: normalizeString(payload.finishedAt),
    estimatedSecondsRemaining: normalizeNumber(payload.estimatedSecondsRemaining),
    updatedAt: normalizeString(payload.updatedAt) ?? new Date().toISOString(),
  };
};

export const useBackupProgress = (
  jobId: string | null | undefined,
  options: UseBackupProgressOptions = {},
): UseBackupProgressResult => {
  const { enabled = true, pollIntervalMs = 2000 } = options;
  const [progress, setProgress] = useState<BackupProgressEvent | null>(null);
  const [source, setSource] = useState<'sse' | 'poll' | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const restartTokenRef = useRef(0);

  const cleanupConnections = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleUpdate = useCallback((payload: unknown, origin: 'sse' | 'poll') => {
    const parsed = parsePayload(payload);
    if (!parsed) {
      return;
    }
    setProgress(parsed);
    setSource(origin);
    setLastError(null);
  }, []);

  const startPolling = useCallback(
    (activeJobId: string) => {
      cleanupConnections();
      const poll = async () => {
        try {
          const { data } = await httpClient.get(`/api/admin/backup-progress/${encodeURIComponent(activeJobId)}`, {
            params: { format: 'json' },
          });
          handleUpdate(data, 'poll');
        } catch (error) {
          setLastError(error instanceof Error ? error.message : 'Eroare la actualizarea progresului.');
        } finally {
          pollTimerRef.current = window.setTimeout(poll, pollIntervalMs);
        }
      };
      pollTimerRef.current = window.setTimeout(poll, 0);
    },
    [cleanupConnections, handleUpdate, pollIntervalMs],
  );

  const startSse = useCallback(
    (activeJobId: string) => {
      cleanupConnections();
      try {
        const es = new EventSource(`/api/admin/backup-progress/${encodeURIComponent(activeJobId)}`);
        eventSourceRef.current = es;
        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            handleUpdate(payload, 'sse');
          } catch {
            // dacă payload-ul nu este JSON valid, îl ignorăm
          }
        };
        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          startPolling(activeJobId);
        };
      } catch (error) {
        setLastError(error instanceof Error ? error.message : 'Nu se poate iniția conexiunea SSE.');
        startPolling(activeJobId);
      }
    },
    [cleanupConnections, handleUpdate, startPolling],
  );

  useEffect(() => {
    if (!jobId || !enabled) {
      cleanupConnections();
      setProgress(null);
      setSource(null);
      return;
    }
    const token = restartTokenRef.current;
    setProgress(null);
    setSource(null);
    setLastError(null);
    startSse(jobId);
    return () => {
      // dacă token-ul s-a schimbat, conexiunea a fost restartată manual
      if (token === restartTokenRef.current) {
        cleanupConnections();
      }
    };
  }, [cleanupConnections, enabled, jobId, startSse]);

  const restart = useCallback(() => {
    if (!jobId) {
      return;
    }
    restartTokenRef.current += 1;
    cleanupConnections();
    setProgress(null);
    setSource(null);
    setLastError(null);
    startSse(jobId);
  }, [cleanupConnections, jobId, startSse]);

  const result = useMemo<UseBackupProgressResult>(
    () => ({
      progress,
      source,
      lastError,
      restart,
    }),
    [lastError, progress, restart, source],
  );

  return result;
};


