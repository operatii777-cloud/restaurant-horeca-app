// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Waste List Page
 * Enterprise list page for Waste documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function WasteListPage() {
  return (
    <TipizateListPage
      type="WASTE"
      newRoute="/tipizate-enterprise/waste/new"
      detailsRouteBase="/tipizate-enterprise/w-as-te"
    />
  );
}




