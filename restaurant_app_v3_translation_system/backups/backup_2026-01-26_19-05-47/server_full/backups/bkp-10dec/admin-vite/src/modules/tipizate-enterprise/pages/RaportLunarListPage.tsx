/**
 * PHASE S5.7 - Raport Lunar List Page
 * Enterprise list page for Raport Lunar documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function RaportLunarListPage() {
  return (
    <TipizateListPage
      type="RAPORT_LUNAR"
      newRoute="/tipizate-enterprise/raport-lunar/new"
      detailsRouteBase="/tipizate-enterprise/raport-lunar"
    />
  );
}
