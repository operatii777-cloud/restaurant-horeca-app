// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Inventar List Page
 * Enterprise list page for Inventar documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function InventarListPage() {
//   const { t } = useTranslation();
  return (
    <TipizateListPage
      type="INVENTAR"
      newRoute="/tipizate-enterprise/inventar/new"
      detailsRouteBase="/tipizate-enterprise/i-nv-en-ta-r"
      t={t}
    />
  );
}



