/**
 * PHASE S5.7 - Raport Gestiune List Page
 * Enterprise list page for Raport Gestiune documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function RaportGestiuneListPage() {
  return (
    <TipizateListPage
      type="RAPORT_GESTIUNE"
      newRoute="/tipizate-enterprise/raport-gestiune/new"
      detailsRouteBase="/tipizate-enterprise/raport-gestiune"
    />
  );
}
