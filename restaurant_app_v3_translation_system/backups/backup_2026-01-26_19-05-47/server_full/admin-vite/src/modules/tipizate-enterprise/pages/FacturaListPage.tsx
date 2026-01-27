// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Factură List Page
 * Enterprise list page for Factură documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function FacturaListPage() {
//   const { t } = useTranslation();
  return (
    <TipizateListPage
      type="FACTURA"
      newRoute="/tipizate-enterprise/factura/new"
      detailsRouteBase="/tipizate-enterprise/f-ac-tu-ra"
      t={t}
    />
  );
}



