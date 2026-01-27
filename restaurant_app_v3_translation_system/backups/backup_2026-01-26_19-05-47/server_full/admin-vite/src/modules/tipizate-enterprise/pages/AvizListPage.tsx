// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Aviz List Page
 * Enterprise list page for Aviz documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';


export default function AvizListPage() {
  return (
    <TipizateListPage
      type="AVIZ"
      newRoute="/tipizate-enterprise/aviz/new"
      detailsRouteBase="/tipizate-enterprise/a-vi-z"
    />
  );
}



