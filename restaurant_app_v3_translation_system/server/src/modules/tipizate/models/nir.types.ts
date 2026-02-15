/**
 * PHASE S4.2 - NIR Document Types
 * PHASE S6.2 - Enhanced with Boogit-compatible fields
 * PHASE S8.9 - ANAF Compliance Enhancement - Romanian Fiscal Legislation
 */

import { TipizatBase, TipizatLine, FiscalHeader } from './tipizate.types';

export interface NirLine extends TipizatLine {
  ingredientId: number;
  lotId?: number | null;
  purchasePrice: number;
  supplierInvoiceLineId?: number | null;
}

export interface NirDocument extends TipizatBase {
  type: 'NIR';
  
  // Furnizor - PHASE S8.9: Complete supplier info per ANAF requirements
  supplierId: number;
  supplierName: string;
  supplierCUI?: string | null;
  supplierRegCom?: string | null; // PHASE S8.9 - Reg. Com. furnizor (ANAF required)
  supplierAddress?: string | null; // PHASE S6.2 - Adresă furnizor
  supplierCity?: string | null; // PHASE S8.9 - Oraș furnizor
  supplierPostalCode?: string | null; // PHASE S8.9 - Cod poștal furnizor
  supplierCountry?: string | null; // PHASE S8.9 - Țară furnizor (ISO 3166-1)
  supplierContact?: string | null; // PHASE S6.2 - Contact furnizor (tel/email)
  supplierEmail?: string | null; // PHASE S6.2 - Email furnizor
  supplierBankAccount?: string | null; // PHASE S8.9 - IBAN furnizor (ANAF required)
  supplierBankName?: string | null; // PHASE S8.9 - Nume bancă furnizor
  
  // Factură Sursă
  invoiceNumber: string;
  invoiceSeries?: string | null;
  invoiceDate?: string | null;
  invoiceId?: number | null; // PHASE S6.2 - FK invoices table
  invoiceTotalAmount?: number | null; // PHASE S6.2 - Total factură (cached)
  invoiceTvaAmount?: number | null; // PHASE S6.2 - TVA factură (cached)
  invoiceTvaRate?: number | null; // PHASE S6.2 - Cota TVA factură (9 sau 19)
  invoiceStatus?: 'draft' | 'partial' | 'paid' | 'cancelled' | null; // PHASE S6.2 - Status factură
  
  // Transport & Delivery - PHASE S8.9: ANAF e-Transport compliance
  deliveryNote?: string | null;
  transportDocumentNumber?: string | null; // PHASE S8.9 - Nr. document transport (CMR, AWB)
  transportDocumentType?: 'CMR' | 'AWB' | 'INTERNAL' | 'OTHER' | null; // PHASE S8.9 - Tip document transport
  transportDate?: string | null; // PHASE S8.9 - Data transport (ISO 8601)
  transportTime?: string | null; // PHASE S8.9 - Ora transport (HH:mm)
  driverName?: string | null; // PHASE S8.9 - Nume șofer
  driverLicense?: string | null; // PHASE S8.9 - Nr. permis conducere
  vehicleRegistration?: string | null; // PHASE S8.9 - Nr. înmatriculare vehicul
  
  // Quality Control & Acceptance - PHASE S8.9: ANAF/HACCP compliance
  acceptanceStatus?: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING' | null; // PHASE S8.9 - Status acceptare
  qualityInspectionRequired?: boolean | null; // PHASE S8.9 - Necesită inspecție calitate
  qualityInspectionDate?: string | null; // PHASE S8.9 - Data inspecție (ISO 8601)
  qualityInspectionTime?: string | null; // PHASE S8.9 - Ora inspecție (HH:mm)
  qualityInspectorId?: number | null; // PHASE S8.9 - FK users (inspector calitate)
  qualityInspectorName?: string | null; // PHASE S8.9 - Nume inspector
  qualityNotes?: string | null; // PHASE S8.9 - Observații inspecție calitate
  temperatureAtReceipt?: number | null; // PHASE S8.9 - Temperatură la primire (°C)
  
  // Signatures & Approval - PHASE S8.9: Legal compliance
  receivedByUserId?: number | null; // PHASE S8.9 - FK users (operator primire)
  receivedByName?: string | null; // PHASE S8.9 - Nume operator primire
  receivedBySignature?: string | null; // PHASE S8.9 - Semnătură digitală operator
  receivedSignatureDate?: string | null; // PHASE S8.9 - Data semnătură primire
  deliveredByName?: string | null; // PHASE S8.9 - Nume reprezentant furnizor
  deliveredBySignature?: string | null; // PHASE S8.9 - Semnătură digitală furnizor
  deliveredSignatureDate?: string | null; // PHASE S8.9 - Data semnătură livrare
  approvedByUserId?: number | null; // PHASE S8.9 - FK users (manager/autorizator)
  approvedByName?: string | null; // PHASE S8.9 - Nume autorizator
  approvedBySignature?: string | null; // PHASE S8.9 - Semnătură digitală autorizator
  approvedSignatureDate?: string | null; // PHASE S8.9 - Data semnătură autorizare
  
  // Altele
  fiscalHeader?: FiscalHeader | null;
  
  lines: NirLine[];
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

