/**
 * PHASE S5.7 - NIR List Page
 * Enterprise list page for NIR documents
 */

import React from 'react';
// import { useTranslation } from '@/i18n/I18nContext';
import { TipizateListPage } from '../components/TipizateListPage';

export default function NirListPage() {
//   const { t } = useTranslation();

  return (
    <TipizateListPage
      type="NIR"
      newRoute="/kiosk/tipizate-enterprise/nir/new"
      detailsRouteBase="/kiosk/tipizate-enterprise/nir"
      t={t}
    />
  );
}



