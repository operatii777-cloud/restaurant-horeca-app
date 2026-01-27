/**
 * PHASE S4.2 - Transfer Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface TransferLine extends TipizatLine {
  ingredientId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
}

export interface TransferDocument extends TipizatBase {
  type: 'TRANSFER';
  
  // PHASE S6.3 - Locații/Gestiuni
  fromLocationId: number;
  fromLocationName: string;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toLocationId: number;
  toLocationName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  
  // PHASE S6.3 - Transport
  transportMethod?: 'internal' | 'courier' | 'own_vehicle' | null; // PHASE S6.3 - Metodă transport
  driverName?: string | null; // PHASE S6.3 - Șofer (dacă own_vehicle)
  vehicleInfo?: string | null; // PHASE S6.3 - Mașină (ex: BMW X5 - B 123 ABC)
  estimatedArrival?: string | null; // PHASE S6.3 - Dată estimată sosire
  actualArrival?: string | null; // PHASE S6.3 - Dată reală sosire
  
  // PHASE S6.3 - Responsabili
  shippedBy?: number | null; // PHASE S6.3 - User ID expediere
  shippedByName?: string | null; // PHASE S6.3 - Nume expediere (ex: Depozitar)
  shippedAt?: string | null; // PHASE S6.3 - Data expediere
  receivedBy?: number | null; // PHASE S6.3 - User ID recepție
  receivedByName?: string | null; // PHASE S6.3 - Nume recepție
  receivedAt?: string | null; // PHASE S6.3 - Data recepție
  
  // PHASE S6.3 - Tracking
  trackingNumber?: string | null; // PHASE S6.3 - Referință curier
  shippingNotes?: string | null; // PHASE S6.3 - Note expediere
  
  // PHASE S6.3 - Totaluri
  totalItems?: number | null; // PHASE S6.3 - Număr total produse
  
  lines: TransferLine[];
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    vatBreakdown: Array<{
      vatRate: number;
      baseAmount: number;
      vatAmount: number;
    }>;
  };
}

