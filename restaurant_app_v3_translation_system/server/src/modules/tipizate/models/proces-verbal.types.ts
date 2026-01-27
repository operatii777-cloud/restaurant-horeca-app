/**
 * PHASE S4.3 - Proces Verbal Document Types
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import { TipizatBase, TipizatLine } from './tipizate.types';

export type ProcesVerbalType = 'damage_report' | 'quality_control' | 'audit' | 'non_conformity' | 'investigation';

export interface ProcesVerbalLine extends TipizatLine {
  ingredientId: number;
  reason: string;
  responsiblePersonId?: number | null;
  responsiblePersonName?: string | null;
  damagedItemDescription?: string | null; // PHASE S6.3 - Descriere item deteriorat
  itemQuantity?: number | null; // PHASE S6.3 - Cantitate
  damagePercentage?: number | null; // PHASE S6.3 - % deteriorare (0-100)
  damageValue?: number | null; // PHASE S6.3 - Valoare pagubă
  damageType?: 'broken' | 'expired' | 'leaked' | 'missing' | 'contaminated' | null; // PHASE S6.3 - Tip deteriorare
  repairOrReplacement?: 'repair' | 'replacement' | 'credit' | null; // PHASE S6.3 - Reparație/Înlocuire/Credit
}

export interface ProcesVerbalDocument extends TipizatBase {
  type: 'PROCES_VERBAL';
  
  // PHASE S6.3 - Timp emisiei
  procesTime?: string | null; // PHASE S6.3 - Ora emisiei (HH:mm:ss)
  
  // PHASE S6.3 - Tipologie
  procesVerbalType: ProcesVerbalType;
  
  // PHASE S6.3 - Referință document
  relatedDocumentId?: number | null; // PHASE S6.3 - FK aviz/factura/nir
  relatedDocumentType?: 'aviz' | 'factura' | 'nir' | 'bon_consum' | null; // PHASE S6.3 - Tip document
  
  // PHASE S6.3 - Participanți
  drawnUpBy?: number | null; // PHASE S6.3 - User care a redactat
  drawnUpByName?: string | null; // PHASE S6.3 - Nume redactor
  party1Name?: string | null; // PHASE S6.3 - Parte 1 (ex: Restaurant)
  party1Representative?: string | null; // PHASE S6.3 - Reprezentant parte 1
  party2Name?: string | null; // PHASE S6.3 - Parte 2
  party2Representative?: string | null; // PHASE S6.3 - Reprezentant parte 2
  
  // PHASE S6.3 - Constatări
  locationId: number;
  locationName: string;
  reason: string;
  findings?: string | null; // PHASE S6.3 - Ce s-a găsit
  damagesDescription?: string | null; // PHASE S6.3 - Descriere pagube
  damagesValue?: number | null; // PHASE S6.3 - Valoare estimată pagubă
  
  // PHASE S6.3 - Responsabilitate
  responsiblePersonId?: number | null;
  responsiblePersonName?: string | null;
  responsibleParty?: 'party1' | 'party2' | 'both' | 'unknown' | null; // PHASE S6.3 - Partea responsabilă
  responsibilityPercentageParty1?: number | null; // PHASE S6.3 - % responsabilitate parte 1
  responsibilityPercentageParty2?: number | null; // PHASE S6.3 - % responsabilitate parte 2
  
  // PHASE S6.3 - Acord
  agreementReached?: boolean | null; // PHASE S6.3 - S-a ajuns la acord
  agreementTerms?: string | null; // PHASE S6.3 - Termeni acord
  compensationAmount?: number | null; // PHASE S6.3 - Sumă compensație
  compensationDueDate?: string | null; // PHASE S6.3 - Scadență compensație
  
  // PHASE S6.3 - Semnături
  witness1Id?: number | null;
  witness1Name?: string | null;
  witness2Id?: number | null;
  witness2Name?: string | null;
  signedParty1?: boolean | null; // PHASE S6.3 - Semnat parte 1
  signedParty2?: boolean | null; // PHASE S6.3 - Semnat parte 2
  signedByReferee?: boolean | null; // PHASE S6.3 - Semnat de terță persoană
  refereeName?: string | null; // PHASE S6.3 - Nume martor/arbitru
  signedAt?: string | null; // PHASE S6.3 - Data semnătură
  
  lines: ProcesVerbalLine[];
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

