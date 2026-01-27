// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Transfer List Page
 * Enterprise list page for Transfer documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function TransferListPage() {
//   const { t } = useTranslation();
  return (
    <TipizateListPage
      type="TRANSFER"
      newRoute="/tipizate-enterprise/transfer/new"
      detailsRouteBase="/tipizate-enterprise/transfer"
      t={t}
    />
  );
}



