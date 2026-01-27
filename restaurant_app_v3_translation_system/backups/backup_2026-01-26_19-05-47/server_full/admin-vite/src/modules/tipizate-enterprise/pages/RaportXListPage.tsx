// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport X List Page
 * Enterprise list page for Raport X documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function RaportXListPage() {
  return (
    <TipizateListPage
      type="RAPORT_X"
      newRoute="/tipizate-enterprise/raport-x/new"
      detailsRouteBase="/tipizate-enterprise/r-ap-or-tx"
    />
  );
}



