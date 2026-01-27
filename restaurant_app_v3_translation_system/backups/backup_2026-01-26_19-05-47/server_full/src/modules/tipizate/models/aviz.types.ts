/**
 * PHASE S4.3 - Aviz de Însoțire Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export interface AvizLine extends TipizatLine {
  productId: number;
  destinationLocationId?: number | null;
  transportMethod?: string | null;
  weight?: number | null; // PHASE S6.3 - Greutate (kg)
}

export interface AvizDocument extends TipizatBase {
  type: 'AVIZ';
  
  // PHASE S6.3 - Timp emisiei
  avizTime?: string | null; // PHASE S6.3 - Ora emisiei (HH:mm:ss)
  
  // PHASE S6.3 - Conexiuni
  facturaId?: number | null; // PHASE S6.3 - FK factura_headers
  orderId?: number | null; // PHASE S6.3 - FK orders
  
  // PHASE S6.3 - Emitent (Expeditor/Vânzător)
  supplierId?: number | null;
  supplierName?: string | null;
  supplierCUI?: string | null; // PHASE S6.3 - CUI expeditor
  supplierAddress?: string | null; // PHASE S6.3 - Adresă expeditor
  
  // PHASE S6.3 - Destinatar (Cumpărător)
  destinationLocationId?: number | null;
  destinationLocationName?: string | null;
  receiverName?: string | null; // PHASE S6.3 - Nume destinatar
  receiverCUI?: string | null; // PHASE S6.3 - CUI destinatar
  receiverAddress?: string | null; // PHASE S6.3 - Adresă destinatar
  receiverPhone?: string | null; // PHASE S6.3 - Telefon destinatar
  receiverEmail?: string | null; // PHASE S6.3 - Email destinatar
  
  // PHASE S6.3 - Transport
  transportMethod?: 'own_vehicle' | 'courier' | 'customer' | null;
  transportCompany?: string | null;
  vehicleNumber?: string | null; // PHASE S6.3 - Înmatriculare
  driverName?: string | null;
  driverLicense?: string | null; // PHASE S6.3 - Permis șofer
  
  // PHASE S6.3 - Totaluri
  totalItems?: number | null; // PHASE S6.3 - Număr total articole
  totalWeight?: number | null; // PHASE S6.3 - Greutate totală (kg)
  totalValue?: number | null; // PHASE S6.3 - Valoare totală
  
  // PHASE S6.3 - Tracking
  estimatedDelivery?: string | null; // PHASE S6.3 - Dată estimată livrare
  actualDelivery?: string | null; // PHASE S6.3 - Dată reală livrare
  trackingNumber?: string | null; // PHASE S6.3 - Referință tracking
  
  // PHASE S6.3 - Semnături
  signedByShipper?: number | null; // PHASE S6.3 - User ID expeditor
  signedByShipperName?: string | null; // PHASE S6.3 - Nume expeditor
  signedByReceiver?: number | null; // PHASE S6.3 - User ID destinatar
  signedByReceiverName?: string | null; // PHASE S6.3 - Nume destinatar
  signatureTime?: string | null; // PHASE S6.3 - Data semnătură
  
  // PHASE S6.3 - Metadata
  deliveredAt?: string | null; // PHASE S6.3 - Data livrare efectivă
  
  lines: AvizLine[];
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

