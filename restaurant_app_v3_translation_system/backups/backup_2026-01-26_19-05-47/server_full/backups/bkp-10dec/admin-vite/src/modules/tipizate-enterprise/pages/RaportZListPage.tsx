/**
 * PHASE S5.7 - Raport Z List Page
 * Enterprise list page for Raport Z documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function RaportZListPage() {
  return (
    <TipizateListPage
      type="RAPORT_Z"
      newRoute="/tipizate-enterprise/raport-z/new"
      detailsRouteBase="/tipizate-enterprise/raport-z"
    />
  );
}
