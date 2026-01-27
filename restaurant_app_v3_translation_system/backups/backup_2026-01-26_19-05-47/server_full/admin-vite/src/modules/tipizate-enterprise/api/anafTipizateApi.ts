/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANAF TIPIZATE API CLIENT
 * Enterprise-Grade API Client pentru Tipizate ANAF Compliant
 * Conform OMFP 2634/2015
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { httpClient } from '@/shared/api/httpClient';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AvizInsotire {
  id?: number;
  company_id?: number;
  serie: string;
  numar: string;
  data_emitere: string;
  expeditor_denumire: string;
  expeditor_cif?: string;
  expeditor_adresa?: string;
  destinatar_denumire: string;
  destinatar_cif?: string;
  destinatar_adresa?: string;
  delegat_nume?: string;
  delegat_ci?: string;
  mijloc_transport?: string;
  ora_plecare?: string;
  tip_operatiune?: 'fara_factura' | 'transfer' | 'retur' | 'prelucrare';
  observatii?: string;
  status?: 'draft' | 'emis' | "Anulat";
  items?: AvizInsotireItem[];
}

export interface AvizInsotireItem {
  id?: number;
  aviz_id?: number;
  product_id?: number;
  denumire: string;
  um: string;
  cantitate: number;
}

export interface BonConsumAnaf {
  id?: number;
  company_id?: number;
  series: string;
  number: string;
  issue_date: string;
  company_name: string;
  company_cui: string;
  source_warehouse: string;
  source_warehouse_id?: number;
  destination: string;
  destination_id?: number;
  total_value: number;
  requested_by?: string;
  approved_by?: string;
  issued_by?: string;
  scop_consum?: "PRODUCȚIE" | 'bar' | "Bucătărie" | 'protocol' | 'pierderi';
  departament?: string;
  status?: 'draft' | 'emis' | "Anulat";
  items?: BonConsumItem[];
}

export interface BonConsumItem {
  id?: number;
  voucher_id?: number;
  line_number?: number;
  product_code?: string;
  product_name: string;
  unit_of_measure: string;
  quantity: number;
  unit_price: number;
  line_value: number;
  ingredient_id?: number;
}

export interface ProcesVerbal {
  id?: number;
  company_id?: number;
  numar: string;
  data: string;
  membru1_nume?: string;
  membru1_functie?: string;
  membru2_nume?: string;
  membru2_functie?: string;
  membru3_nume?: string;
  membru3_functie?: string;
  tip: 'pierdere' | 'deteriorare' | 'expirare' | 'furt' | 'inventar';
  descriere?: string;
  masura: 'casare' | 'distrugere' | 'donatie' | 'ajustare_stoc';
  afecta_tva?: boolean;
  ajustare_tva?: number;
  items?: ProcesVerbalItem[];
}

export interface ProcesVerbalItem {
  id?: number;
  proces_verbal_id?: number;
  product_id?: number;
  denumire: string;
  um: string;
  cantitate: number;
  valoare: number;
}

export interface BonPierderi {
  id?: number;
  company_id?: number;
  serie: string;
  numar: string;
  data: string;
  gestiune_id?: number;
  proces_verbal_id?: number;
  emis_de?: number;
  items?: BonPierderiItem[];
}

export interface BonPierderiItem {
  id?: number;
  bon_pierderi_id?: number;
  product_id?: number;
  denumire: string;
  um: string;
  cantitate: number;
  motiv?: string;
  cost_unitar?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export const anafTipizateApi = {
  // ═══════════════════════════════════════════════════════════════════════════
  // AVIZ DE ÎNSOȚIRE A MĂRFII (Cod ANAF 14-3-6A)
  // ═══════════════════════════════════════════════════════════════════════════
  
  avizInsotire: {
    list: (filters?: { from?: string; to?: string; status?: string }) => {
      return httpClient.get<{ success: boolean; data: AvizInsotire[] }>(
        '/api/tipizate-anaf/aviz-insotire',
        { params: filters }
      );
    },
    
    get: (id: number) => {
      return httpClient.get<{ success: boolean; data: AvizInsotire }>(
        `/api/tipizate-anaf/aviz-insotire/"Id"`
      );
    },
    
    create: (data: AvizInsotire) => {
      return httpClient.post<{ success: boolean; data: AvizInsotire }>(
        '/api/tipizate-anaf/aviz-insotire',
        data
      );
    },
    
    emit: (id: number, userId?: number) => {
      return httpClient.post<{ success: boolean; data: AvizInsotire }>(
        `/api/tipizate-anaf/aviz-insotire/"Id"/emit`,
        { userId }
      );
    },
    
    storno: (id: number, userId?: number, motiv?: string) => {
      return httpClient.post<{ success: boolean; data: AvizInsotire }>(
        `/api/tipizate-anaf/aviz-insotire/"Id"/storno`,
        { userId, motiv }
      );
    },
    
    pdf: async (id: number): Promise<Blob> => {
      const response = await httpClient.get(
        `/api/tipizate-anaf/aviz-insotire/"Id"/pdf`,
        { responseType: 'blob' }
      );
      return new Blob([response.data], { type: 'application/pdf' });
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BON DE CONSUM (Cod ANAF 14-3-4A)
  // ═══════════════════════════════════════════════════════════════════════════
  
  bonConsum: {
    list: (filters?: { from?: string; to?: string; status?: string }) => {
      return httpClient.get<{ success: boolean; data: BonConsumAnaf[] }>(
        '/api/tipizate-anaf/bon-consum',
        { params: filters }
      );
    },
    
    get: (id: number) => {
      return httpClient.get<{ success: boolean; data: BonConsumAnaf }>(
        `/api/tipizate-anaf/bon-consum/"Id"`
      );
    },
    
    create: (data: BonConsumAnaf) => {
      return httpClient.post<{ success: boolean; data: BonConsumAnaf }>(
        '/api/tipizate-anaf/bon-consum',
        data
      );
    },
    
    pdf: async (id: number): Promise<Blob> => {
      const response = await httpClient.get(
        `/api/tipizate-anaf/bon-consum/"Id"/pdf`,
        { responseType: 'blob' }
      );
      return new Blob([response.data], { type: 'application/pdf' });
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROCES-VERBAL DE SCOATERE DIN GESTIUNE
  // ═══════════════════════════════════════════════════════════════════════════
  
  procesVerbal: {
    get: (id: number) => {
      return httpClient.get<{ success: boolean; data: ProcesVerbal }>(
        `/api/tipizate-anaf/proces-verbal/"Id"`
      );
    },
    
    create: (data: ProcesVerbal) => {
      return httpClient.post<{ success: boolean; data: ProcesVerbal }>(
        '/api/tipizate-anaf/proces-verbal',
        data
      );
    },
    
    pdf: async (id: number): Promise<Blob> => {
      const response = await httpClient.get(
        `/api/tipizate-anaf/proces-verbal/"Id"/pdf`,
        { responseType: 'blob' }
      );
      return new Blob([response.data], { type: 'application/pdf' });
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BON PIERDERI / REBUTURI / CASARE
  // ═══════════════════════════════════════════════════════════════════════════
  
  bonPierderi: {
    get: (id: number) => {
      return httpClient.get<{ success: boolean; data: BonPierderi }>(
        `/api/tipizate-anaf/bon-pierderi/"Id"`
      );
    },
    
    create: (data: BonPierderi) => {
      return httpClient.post<{ success: boolean; data: BonPierderi }>(
        '/api/tipizate-anaf/bon-pierderi',
        data
      );
    },
    
    pdf: async (id: number): Promise<Blob> => {
      const response = await httpClient.get(
        `/api/tipizate-anaf/bon-pierderi/"Id"/pdf`,
        { responseType: 'blob' }
      );
      return new Blob([response.data], { type: 'application/pdf' });
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT DOSAR CONTROL ANAF
  // ═══════════════════════════════════════════════════════════════════════════
  
  exportAnaf: (from?: string, to?: string) => {
    return httpClient.get<{
      success: boolean;
      data: {
        perioada: { from: string; to: string };
        documente: {
          avize: AvizInsotire[];
          bonuri_consum: BonConsumAnaf[];
          procese_verbale: ProcesVerbal[];
          bonuri_pierderi: BonPierderi[];
          note_contabile: any[];
          jurnal: any[];
          miscari_stoc: any[];
        };
        statistici: {
          total_avize: number;
          total_bonuri_consum: number;
          total_procese_verbale: number;
          total_bonuri_pierderi: number;
          total_note_contabile: number;
          total_miscari_stoc: number;
        };
        generat_la: string;
        hash: string;
      };
    }>('/api/tipizate-anaf/export-anaf', {
      params: { from, to }
    });
  }
};
