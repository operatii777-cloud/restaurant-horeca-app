/**
 * HORECA AI Engine - API Client
 */

const BASE = '/api/ai';

export interface ExtractedProduct {
  name: string;
  price: number | null;
  currency: string;
}

export interface AllergenResult {
  allergens: string[];
  eu14: string[];
}

export interface PriceResult {
  suggestedPrice: number;
  markup: number | null;
  basis: string;
}

export interface AuditIssue {
  productId: number;
  type: string;
  severity: 'error' | 'warning';
}

export interface AuditResult {
  healthScore: number;
  issues: AuditIssue[];
  totalProducts: number;
}

export interface RepairResult {
  product: Record<string, unknown>;
  repairs: string[];
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'AI request failed');
  return json.data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'AI request failed');
  return json.data as T;
}

export const aiApi = {
  extractProducts: (text: string) => post<ExtractedProduct[]>('/extract-products', { text }),
  detectAllergens: (ingredients: string, product_id?: number) =>
    post<AllergenResult>('/detect-allergens', { ingredients, product_id }),
  suggestPrice: (product: Record<string, unknown>) => post<PriceResult>('/suggest-price', product),
  audit: (products: unknown[]) => post<AuditResult>('/audit', { products }),
  repair: (product: Record<string, unknown>) => post<RepairResult>('/repair', { product }),
  marketPrices: () => get<Record<string, number>>('/market-prices'),
};
