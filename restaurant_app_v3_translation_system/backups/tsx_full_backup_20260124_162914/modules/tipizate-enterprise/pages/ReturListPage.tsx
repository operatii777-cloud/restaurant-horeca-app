// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Retur List Page
 * Enterprise list page for Retur documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function ReturListPage() {
  return (
    <TipizateListPage
      type="RETUR"
      newRoute="/tipizate-enterprise/retur/new"
      detailsRouteBase="/tipizate-enterprise/r-et-ur"
    />
  );
}



