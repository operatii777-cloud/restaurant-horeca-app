/**
 * PHASE S5.7 - Transfer List Page
 * Enterprise list page for Transfer documents
 */

import React from 'react';
import { TipizateListPage } from '../components/TipizateListPage';

export default function TransferListPage() {
  return (
    <TipizateListPage
      type="TRANSFER"
      newRoute="/tipizate-enterprise/transfer/new"
      detailsRouteBase="/tipizate-enterprise/transfer"
    />
  );
}
