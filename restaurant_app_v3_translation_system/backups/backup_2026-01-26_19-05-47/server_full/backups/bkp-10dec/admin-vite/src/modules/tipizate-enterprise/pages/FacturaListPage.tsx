/**
 * PHASE S5.7 - Factură List Page
 * Enterprise list page for Factură documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function FacturaListPage() {
  return (
    <TipizateListPage
      type="FACTURA"
      newRoute="/tipizate-enterprise/factura/new"
      detailsRouteBase="/tipizate-enterprise/factura"
    />
  );
}
