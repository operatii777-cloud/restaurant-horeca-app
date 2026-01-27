// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport Gestiune List Page
 * Enterprise list page for Raport Gestiune documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function RaportGestiuneListPage() {
  return (
    <TipizateListPage
      type="RAPORT_GESTIUNE"
      newRoute="/tipizate-enterprise/raport-gestiune/new"
      detailsRouteBase="/tipizate-enterprise/r-ap-or-tg-es-ti-un-e"
      // t prop removed, use direct Romanian text in TipizateListPage if needed
    />
  );
}



