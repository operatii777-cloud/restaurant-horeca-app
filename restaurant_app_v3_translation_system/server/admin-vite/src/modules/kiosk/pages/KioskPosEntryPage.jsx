/**
 * Kiosk POS entry — supports ?mode=drivethru for dedicated drive-thru order creation.
 * Create UI: modules/delivery/pages/DriveThruPage (POS simplificat drive-thru).
 * Default: unified PosPage.
 */
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PosPage } from '@/modules/pos/pages/PosPage';
import { DriveThruPage as DriveThruCreatePage } from '@/modules/delivery/pages/DriveThruPage';

export default function KioskPosEntryPage() {
  const [params] = useSearchParams();
  const mode = useMemo(
    () => (params.get('mode') || '').toLowerCase().replace(/[_-]/g, ''),
    [params]
  );
  const isDriveThru = mode === 'drivethru';

  if (isDriveThru) {
    return <DriveThruCreatePage />;
  }
  return <PosPage />;
}
