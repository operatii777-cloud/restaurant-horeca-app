// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.B - Offline Mode Hook
 * 
 * Detects offline status and provides UI state
 */

import { useState, useEffect } from 'react';
import { isOnline, startAutoSync } from '../sync/sync.engine';

export function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sync when coming back online
      startAutoSync(30000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start auto-sync if online
    if (isOnline()) {
      startAutoSync(30000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOffline,
    syncStatus,
    setSyncStatus,
  };
}

