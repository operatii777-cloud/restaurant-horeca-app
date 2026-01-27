// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Chitanță List Page
 * Enterprise list page for Chitanță documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function ChitantaListPage() {
//   const { t } = useTranslation();
  return (
    <TipizateListPage
      type="CHITANTA"
      newRoute="/tipizate-enterprise/chitanta/new"
      detailsRouteBase="/tipizate-enterprise/c-hi-ta-nt-a"
      t={t}
    />
  );
}



