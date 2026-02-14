import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.B - Offline Banner Component
 * 
 * Displays banner when offline mode is active
 */

import { Alert } from 'react-bootstrap';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}

export function OfflineBanner({ isOffline, syncStatus }: OfflineBannerProps) {
  const { t } = useTranslation();
  if (!isOffline) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-3 d-flex align-items-center gap-2">
      <WifiOff size={20} />
      <div className="flex-grow-1">
        <strong>{t('pos.offline.title')}</strong>
        <br />
        <small>{t('pos.offline.ordersSaved')}</small>
      </div>
    </Alert>
  );
}




