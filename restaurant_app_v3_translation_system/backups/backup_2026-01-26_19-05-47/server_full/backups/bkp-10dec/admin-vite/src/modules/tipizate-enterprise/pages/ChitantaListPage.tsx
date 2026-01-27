/**
 * PHASE S5.7 - Chitanță List Page
 * Enterprise list page for Chitanță documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function ChitantaListPage() {
  return (
    <TipizateListPage
      type="CHITANTA"
      newRoute="/tipizate-enterprise/chitanta/new"
      detailsRouteBase="/tipizate-enterprise/chitanta"
    />
  );
}
