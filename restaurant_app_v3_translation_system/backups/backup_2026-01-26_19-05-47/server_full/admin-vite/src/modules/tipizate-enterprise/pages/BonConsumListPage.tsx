// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Bon Consum List Page
 * Enterprise list page for Bon Consum documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function BonConsumListPage() {
  return (
    <TipizateListPage
      type="BON_CONSUM"
      newRoute="/tipizate-enterprise/bon-consum/new"
      detailsRouteBase="/tipizate-enterprise/b-on-co-ns-um"
    />
  );
}



