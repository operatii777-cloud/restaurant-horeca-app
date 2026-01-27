/**
 * PHASE S5.7 - NIR List Page
 * Enterprise list page for NIR documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function NirListPage() {
  return (
    <TipizateListPage
      type="NIR"
      newRoute="/tipizate-enterprise/nir/new"
      detailsRouteBase="/tipizate-enterprise/nir"
    />
  );
}
