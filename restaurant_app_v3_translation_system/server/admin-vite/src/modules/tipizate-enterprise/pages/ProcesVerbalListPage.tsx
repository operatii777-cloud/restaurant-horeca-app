// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Proces Verbal List Page
 * Enterprise list page for Proces Verbal documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function ProcesVerbalListPage() {
  return (
    <TipizateListPage
      type="PROCES_VERBAL"
      newRoute="/tipizate-enterprise/proces-verbal/new"
      detailsRouteBase="/tipizate-enterprise/p-ro-ce-sv-er-ba-l"
    />
  );
}



