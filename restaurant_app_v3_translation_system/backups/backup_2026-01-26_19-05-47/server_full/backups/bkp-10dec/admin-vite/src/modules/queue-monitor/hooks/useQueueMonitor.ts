import { useState, useEffect, useCallback } from 'react';
import { fetchQueueMonitor, QueueMonitorData } from '../api/queueApi';

const REFRESH_INTERVAL = 3000; // 3 seconds

export function useQueueMonitor(autoRefresh = true) {
  const [data, setData] = useState<QueueMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchQueueMonitor();
      setData(result);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load queue monitor');
      setError(error);
      setLoading(false);
      console.error('❌ Eroare la încărcarea Queue Monitor:', err);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadData();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(loadData, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [loadData, autoRefresh]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

