// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport Lunar List Page
 * Enterprise list page for Raport Lunar documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function RaportLunarListPage() {
  return (
    <TipizateListPage
      type="RAPORT_LUNAR"
      newRoute="/tipizate-enterprise/raport-lunar/new"
      detailsRouteBase="/tipizate-enterprise/r-ap-or-tl-un-ar"
    />
  );
}



