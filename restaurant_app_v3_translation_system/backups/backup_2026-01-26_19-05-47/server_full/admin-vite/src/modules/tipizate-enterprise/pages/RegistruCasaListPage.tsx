// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Registru Casă List Page
 * Enterprise list page for Registru Casă documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function RegistruCasaListPage() {
//   const { t } = useTranslation();
  return (
    <TipizateListPage
      type="REGISTRU_CASA"
      newRoute="/tipizate-enterprise/registru-casa/new"
      detailsRouteBase="/tipizate-enterprise/r-eg-is-tr-uc-as-a"
      t={t}
    />
  );
}



