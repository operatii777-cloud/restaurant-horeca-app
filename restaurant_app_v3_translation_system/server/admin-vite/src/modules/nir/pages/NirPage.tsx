/**
 * NIR Page - Notă de Intrare Recepție
 * Full implementation matching admin-advanced.html NIR functionality.
 * Uses /api/inventory/nir endpoints for real stock integration.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NirItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  qtyReceived: number;
  priceExVat: number;
  vatRate: number;
  valueExVat: number;
  vatAmount: number;
  valueIncVat: number;
  salePrice: number;
}

interface NirHistoryEntry {
  id?: number;
  nir_number: string;
  number?: string;
  supplier_name: string;
  supplier?: string;
  document_date: string;
  date?: string;
  total_value: number;
  value?: number;
  nir_status: string;
  status?: string;
  created_at?: string;
}

interface NirDetailItem {
  product_name?: string;
  official_name?: string;
  product_code?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  value: number;
  vat_amount: number;
  value_with_vat: number;
  markup_percent: number;
  markup_value: number;
  sale_price: number;
  sale_value: number;
}

interface StockItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  category?: string;
  price: number;
  current_stock?: number;
}

interface VatSummary {
  [rate: string]: { base: number; vat: number; total: number };
}

const UNITS = ['kg', 'l', 'buc', 'cutie', 'pachet', 'pliculet', 'portie', 'g', 'ml'];
const VAT_RATES = [
  { value: 11, label: '11%' },
  { value: 21, label: '21%' },
  { value: 9, label: '9% (Vechi)' },
  { value: 19, label: '19% (Vechi)' },
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const NirPage: React.FC = () => {
  const navigate = useNavigate();
  // Form state
  const [unitName, setUnitName] = useState('');
  const [cui, setCui] = useState('');
  const [address, setAddress] = useState('');
  const [gestion, setGestion] = useState('');
  const [nirNumber, setNirNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Items state
  const [items, setItems] = useState<NirItem[]>([]);
  const nextId = useRef(0);

  // Totals
  const [totalBase, setTotalBase] = useState(0);
  const [totalVat, setTotalVat] = useState(0);
  const [totalIncVat, setTotalIncVat] = useState(0);
  const [vatSummary, setVatSummary] = useState<VatSummary>({});

  // Payment fields
  const [paidBase, setPaidBase] = useState('');
  const [paidVat, setPaidVat] = useState('');

  // History state
  const [history, setHistory] = useState<NirHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Stock modal state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockSearch, setStockSearch] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsNir, setDetailsNir] = useState<NirHistoryEntry | null>(null);
  const [detailsItems, setDetailsItems] = useState<NirDetailItem[]>([]);
  const [detailsTotals, setDetailsTotals] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // PDF import
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'reports' | 'lots' | 'inventory'>('form');

  // ─── Reports & Filters state ───────────────────────────────────────────
  const [statsData, setStatsData] = useState({ total_ingredients: 0, out_of_stock: 0, low_stock: 0, ok_stock: 0 });
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterSuppliers, setFilterSuppliers] = useState<string[]>([]);
  const [reportFilters, setReportFilters] = useState({ category: '', supplier: '', stockStatus: '', sortBy: 'name', minStock: '', maxStock: '' });
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [filteredSummary, setFilteredSummary] = useState<any>(null);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // ─── Lots & Invoice Import state ───────────────────────────────────────
  const [lotForm, setLotForm] = useState({ ingredient: '', batchNumber: '', barcode: '', quantity: '', unitCost: '', purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '', supplier: '', invoiceNumber: '' });
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [lotSaving, setLotSaving] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ fileType: '', invoiceNumber: '', supplier: '', date: new Date().toISOString().split('T')[0], total: '' });
  const invoiceFileRef = useRef<HTMLInputElement>(null);
  const [invoiceImporting, setInvoiceImporting] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [importedInvoices, setImportedInvoices] = useState<any[]>([]);
  const [invoiceFilters, setInvoiceFilters] = useState({ status: '', supplier: '', startDate: '', endDate: '' });

  // ─── Received Items Queue state ─────────────────────────────────────────
  const [queueItems, setQueueItems] = useState<any[]>([]);

  // ─── Inventory Sessions state ──────────────────────────────────────────
  const [inventorySessions, setInventorySessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionFilters, setSessionFilters] = useState({ type: '', status: '', limit: '10' });
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({ sessionType: 'daily', scope: 'global', locationIds: [] as number[], startedBy: '' });
  const [locations, setLocations] = useState<any[]>([]);

  // ─── Calculations ────────────────────────────────────────────────────────

  const recalculateTotals = useCallback((currentItems: NirItem[]) => {
    let base = 0;
    let vat = 0;
    let inc = 0;
    const summary: VatSummary = {};

    const updated = currentItems.map((item) => {
      const valueExVat =
        Math.round(item.qtyReceived * item.priceExVat * 100) / 100;
      const vatAmount =
        Math.round(((valueExVat * item.vatRate) / 100) * 100) / 100;
      const valueIncVat = Math.round((valueExVat + vatAmount) * 100) / 100;

      base += valueExVat;
      vat += vatAmount;
      inc += valueIncVat;

      const rateKey = String(item.vatRate);
      if (!summary[rateKey]) summary[rateKey] = { base: 0, vat: 0, total: 0 };
      summary[rateKey].base += valueExVat;
      summary[rateKey].vat += vatAmount;
      summary[rateKey].total += valueIncVat;

      return { ...item, valueExVat, vatAmount, valueIncVat };
    });

    // Round summary
    Object.keys(summary).forEach((r) => {
      summary[r].base = Math.round(summary[r].base * 100) / 100;
      summary[r].vat = Math.round(summary[r].vat * 100) / 100;
      summary[r].total = Math.round(summary[r].total * 100) / 100;
    });

    setTotalBase(Math.round(base * 100) / 100);
    setTotalVat(Math.round(vat * 100) / 100);
    setTotalIncVat(Math.round(inc * 100) / 100);
    setVatSummary(summary);
    return updated;
  }, []);

  // ─── Item management ─────────────────────────────────────────────────────

  const addItem = useCallback(
    (preset: Partial<NirItem> = {}) => {
      nextId.current += 1;
      const newItem: NirItem = {
        id: nextId.current,
        code: preset.code || '',
        name: preset.name || '',
        unit: preset.unit || 'buc',
        qtyReceived: preset.qtyReceived || 0,
        priceExVat: preset.priceExVat || 0,
        vatRate: preset.vatRate ?? 11,
        valueExVat: 0,
        vatAmount: 0,
        valueIncVat: 0,
        salePrice: preset.salePrice || 0,
      };
      setItems((prev) => recalculateTotals([...prev, newItem]));
    },
    [recalculateTotals]
  );

  const removeItem = useCallback(
    (itemId: number) => {
      setItems((prev) => recalculateTotals(prev.filter((i) => i.id !== itemId)));
    },
    [recalculateTotals]
  );

  const updateItem = useCallback(
    (itemId: number, field: keyof NirItem, value: any) => {
      setItems((prev) =>
        recalculateTotals(
          prev.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        )
      );
    },
    [recalculateTotals]
  );

  // ─── Stock modal ─────────────────────────────────────────────────────────

  const openStockModal = async () => {
    setStockModalOpen(true);
    setStockSearch('');
    if (stockItems.length === 0) {
      setStockLoading(true);
      try {
        const res = await httpClient.get('/api/inventory/products/search?q=*');
        setStockItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Error loading stock:', e);
        setStockItems([]);
      } finally {
        setStockLoading(false);
      }
    }
  };

  const filteredStock = stockItems.filter((item) => {
    if (!stockSearch) return true;
    const q = stockSearch.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q))
    );
  });

  const selectStockItem = (item: StockItem) => {
    addItem({
      code: item.code,
      name: item.name,
      unit: item.unit || 'buc',
      priceExVat: item.price || 0,
    });
    setStockModalOpen(false);
  };

  // ─── History ─────────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await httpClient.get('/api/inventory/nirs');
      const data = res.data;
      const nirs = Array.isArray(data)
        ? data
        : data?.data || data?.nirs || [];
      setHistory(nirs);
    } catch (e) {
      console.error('Error loading NIR history:', e);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ─── Details modal ───────────────────────────────────────────────────────

  const viewDetails = async (nir: NirHistoryEntry) => {
    setDetailsNir(nir);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    setDetailsItems([]);
    setDetailsTotals(null);

    try {
      const nirId = nir.id;
      if (!nirId) {
        setDetailsLoading(false);
        return;
      }
      const res = await httpClient.get(`/api/inventory/nir/${nirId}`);
      const details = res.data;
      if (details?.items && Array.isArray(details.items)) {
        setDetailsItems(details.items);
        setDetailsTotals(details.totals || null);
      }
    } catch (e) {
      console.error('Error loading NIR details:', e);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ─── Save NIR ────────────────────────────────────────────────────────────

  const saveNir = async () => {
    if (!nirNumber) {
      alert('Vă rugăm introduceți numărul NIR!');
      return;
    }
    if (!supplierName) {
      alert('Vă rugăm introduceți furnizorul!');
      return;
    }
    if (items.length === 0) {
      alert('Vă rugăm adăugați cel puțin un articol!');
      return;
    }

    setSaving(true);
    try {
      const nirItems = items.map((item) => ({
        code: item.code,
        name: item.name,
        unit: item.unit,
        qtyInvoice: item.qtyReceived.toFixed(2),
        qtyReceived: item.qtyReceived.toFixed(2),
        quantity: item.qtyReceived,
        priceExVat: item.priceExVat.toFixed(2),
        unit_price: item.priceExVat,
        vatRate: item.vatRate,
        valueExVat: item.valueExVat.toFixed(2),
        total_price: item.valueExVat,
        vatAmount: item.vatAmount.toFixed(2),
        valueIncVat: item.valueIncVat.toFixed(2),
        salePrice: item.salePrice,
      }));

      const payload = {
        unitName,
        cui,
        address,
        gestion,
        nirNumber,
        date: documentDate,
        supplierName,
        invoiceNumber,
        plata_baza: parseFloat(paidBase || '0').toFixed(2),
        plata_tva: parseFloat(paidVat || '0').toFixed(2),
        items: nirItems,
        totalBase: totalBase.toFixed(2),
        totalVat: totalVat.toFixed(2),
        totalIncVat: totalIncVat.toFixed(2),
        vatSummary,
        created_by: 'admin',
      };

      await httpClient.post('/api/inventory/nir', payload);

      alert(
        `✅ NIR ${nirNumber} salvat cu succes!\n\nTotal: ${totalIncVat.toFixed(2)} RON\nStocurile au fost actualizate.`
      );

      // Reset form
      resetForm();
      await loadHistory();
    } catch (error: any) {
      console.error('Error saving NIR:', error);
      alert('Eroare la crearea NIR: ' + (error?.message || 'Eroare necunoscută'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNirNumber('');
    setSupplierName('');
    setInvoiceNumber('');
    setDocumentDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setTotalBase(0);
    setTotalVat(0);
    setTotalIncVat(0);
    setVatSummary({});
    setPaidBase('');
    setPaidVat('');
    nextId.current = 0;
  };

  // ─── Export ──────────────────────────────────────────────────────────────

  const exportJson = () => {
    const data = collectNirData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NIR_${nirNumber || 'draft'}_${documentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      'Nr.Crt',
      'Denumire',
      'Cod',
      'U.M.',
      'Cantitate',
      'Pret fara TVA',
      'TVA%',
      'Valoare fara TVA',
      'Pret Vanzare',
      'Total cu TVA',
    ];
    const rows = items.map((item, idx) => [
      idx + 1,
      item.name,
      item.code,
      item.unit,
      item.qtyReceived,
      item.priceExVat,
      item.vatRate,
      item.valueExVat,
      item.salePrice,
      item.valueIncVat,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NIR_${nirNumber || 'draft'}_${documentDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const collectNirData = () => ({
    unitName,
    cui,
    address,
    gestion,
    nirNumber,
    date: documentDate,
    supplierName,
    invoiceNumber,
    plata_baza: parseFloat(paidBase || '0').toFixed(2),
    plata_tva: parseFloat(paidVat || '0').toFixed(2),
    items: items.map((item) => ({
      code: item.code,
      name: item.name,
      unit: item.unit,
      qtyReceived: item.qtyReceived,
      priceExVat: item.priceExVat,
      vatRate: item.vatRate,
      valueExVat: item.valueExVat,
      vatAmount: item.vatAmount,
      valueIncVat: item.valueIncVat,
      salePrice: item.salePrice,
    })),
    totalBase,
    totalVat,
    totalIncVat,
    vatSummary,
  });

  // ─── PDF Import ──────────────────────────────────────────────────────────

  const handlePdfImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Vă rugăm selectați un fișier PDF!');
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const res = await httpClient.post('/api/inventory/nir/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = res.data;
      if (result.success) {
        const data = result.data;
        if (data.supplierName) setSupplierName(data.supplierName);
        if (data.cui) setCui(data.cui);
        if (data.invoiceNumber) setInvoiceNumber(data.invoiceNumber);
        if (data.date) setDocumentDate(data.date);

        // Clear and add items
        nextId.current = 0;
        const newItems: NirItem[] = [];
        (data.items || []).forEach((item: any) => {
          nextId.current += 1;
          newItems.push({
            id: nextId.current,
            code: item.code || '',
            name: item.name || '',
            unit: item.unit || 'buc',
            qtyReceived: parseFloat(item.qtyReceived) || 0,
            priceExVat: parseFloat(item.priceExVat) || 0,
            vatRate: parseInt(item.vatRate) || 11,
            valueExVat: 0,
            vatAmount: 0,
            valueIncVat: 0,
            salePrice: parseFloat(item.salePrice) || 0,
          });
        });
        const recalced = recalculateTotals(newItems);
        setItems(recalced);

        alert('✅ Date extrase cu succes din PDF!');
      } else {
        alert('Eroare la prelucrare: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error importing invoice:', error);
      alert('Eroare la import: ' + (error?.message || 'Eroare necunoscută'));
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Barcode scanner ─────────────────────────────────────────────────────

  useEffect(() => {
    let buffer = '';
    let lastTime = 0;

    const handleKey = async (e: KeyboardEvent) => {
      if (activeTab !== 'form') return;
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      )
        return;

      const now = Date.now();
      if (now - lastTime > 100) buffer = '';

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          try {
            const res = await httpClient.get(
              `/api/inventory/products/search?q=${encodeURIComponent(buffer)}`
            );
            const results = Array.isArray(res.data) ? res.data : [];
            const match = results.find((r: any) => r.code === buffer);
            if (match) {
              addItem({
                code: match.code,
                name: match.name,
                unit: match.unit || 'buc',
                qtyReceived: 1,
                priceExVat: match.price || 0,
                vatRate: 11,
              });
            }
          } catch (err) {
            console.error('Barcode search error:', err);
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
      lastTime = now;
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeTab, addItem]);

  // ─── Reports & Filters Functions ─────────────────────────────────────────

  const loadQuickFilters = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/admin/inventory/filters');
      const result = res.data;
      if (result.success && result.data) {
        setFilterCategories(result.data.categories || []);
        setFilterSuppliers(result.data.suppliers || []);
        if (result.data.stats) setStatsData(result.data.stats);
      }
    } catch (e) {
      console.error('Error loading filters:', e);
      // Try loading ingredients for stats as fallback
      try {
        const res2 = await httpClient.get('/api/ingredients');
        const ings = Array.isArray(res2.data) ? res2.data : res2.data?.ingredients || [];
        const total = ings.length;
        const outOfStock = ings.filter((i: any) => (i.current_stock || 0) <= 0).length;
        const lowStock = ings.filter((i: any) => (i.current_stock || 0) > 0 && (i.current_stock || 0) <= (i.min_stock || 5)).length;
        setStatsData({ total_ingredients: total, out_of_stock: outOfStock, low_stock: lowStock, ok_stock: total - outOfStock - lowStock });
        const cats = [...new Set(ings.map((i: any) => i.category).filter(Boolean))] as string[];
        setFilterCategories(cats);
        const sups = [...new Set(ings.map((i: any) => i.supplier).filter(Boolean))] as string[];
        setFilterSuppliers(sups);
      } catch (e2) { /* fallback failed */ }
    }
  }, []);

  const applyQuickFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportFilters.category) params.append('category', reportFilters.category);
      if (reportFilters.supplier) params.append('supplier', reportFilters.supplier);
      if (reportFilters.stockStatus) params.append('stock_status', reportFilters.stockStatus);
      if (reportFilters.sortBy) params.append('sort_by', reportFilters.sortBy);
      if (reportFilters.minStock) params.append('min_stock', reportFilters.minStock);
      if (reportFilters.maxStock) params.append('max_stock', reportFilters.maxStock);

      const res = await httpClient.get(`/api/admin/inventory/filtered?${params.toString()}`);
      const result = res.data;
      if (result.success) {
        setFilteredResults(result.data || []);
        setFilteredSummary(result.summary || null);
      }
    } catch (e) {
      console.error('Error applying filters:', e);
      // Fallback: filter locally from ingredients
      try {
        const res2 = await httpClient.get('/api/ingredients');
        const ings = Array.isArray(res2.data) ? res2.data : res2.data?.ingredients || [];
        let filtered = [...ings];
        if (reportFilters.category) filtered = filtered.filter((i: any) => i.category === reportFilters.category);
        if (reportFilters.supplier) filtered = filtered.filter((i: any) => i.supplier === reportFilters.supplier);
        if (reportFilters.stockStatus === 'out_of_stock') filtered = filtered.filter((i: any) => (i.current_stock || 0) <= 0);
        if (reportFilters.stockStatus === 'low_stock') filtered = filtered.filter((i: any) => (i.current_stock || 0) > 0 && (i.current_stock || 0) <= (i.min_stock || 5));
        if (reportFilters.stockStatus === 'ok_stock') filtered = filtered.filter((i: any) => (i.current_stock || 0) > (i.min_stock || 5));
        if (reportFilters.minStock) filtered = filtered.filter((i: any) => (i.current_stock || 0) >= parseFloat(reportFilters.minStock));
        if (reportFilters.maxStock) filtered = filtered.filter((i: any) => (i.current_stock || 0) <= parseFloat(reportFilters.maxStock));
        setFilteredResults(filtered);
        setFilteredSummary({ total: filtered.length, out_of_stock: filtered.filter((i: any) => (i.current_stock || 0) <= 0).length, low_stock: filtered.filter((i: any) => (i.current_stock || 0) > 0 && (i.current_stock || 0) <= (i.min_stock || 5)).length, ok_stock: filtered.filter((i: any) => (i.current_stock || 0) > (i.min_stock || 5)).length, total_value: filtered.reduce((s: number, i: any) => s + ((i.current_stock || 0) * (i.cost_per_unit || 0)), 0) });
      } catch (e2) { /* fallback failed */ }
    } finally {
      setFiltersLoading(false);
    }
  }, [reportFilters]);

  const exportReport = (format: string, type: string) => {
    const url = `/api/admin/inventory/export/${format}?type=${type}`;
    if (format === 'excel') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `raport_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
  };

  // ─── Lots & Invoice Functions ────────────────────────────────────────────

  const loadIngredients = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/ingredients');
      const data = Array.isArray(res.data) ? res.data : res.data?.ingredients || [];
      setIngredients(data);
    } catch (e) { console.error('Error loading ingredients:', e); }
  }, []);

  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLotSaving(true);
    try {
      await httpClient.post('/api/inventory/lots', {
        ingredient_id: lotForm.ingredient,
        batch_number: lotForm.batchNumber,
        barcode: lotForm.barcode,
        quantity: parseFloat(lotForm.quantity) || 0,
        unit_cost: parseFloat(lotForm.unitCost) || 0,
        purchase_date: lotForm.purchaseDate,
        expiry_date: lotForm.expiryDate,
        supplier: lotForm.supplier,
        invoice_number: lotForm.invoiceNumber,
      });
      alert('✅ Lot adăugat cu succes!');
      setLotForm({ ingredient: '', batchNumber: '', barcode: '', quantity: '', unitCost: '', purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '', supplier: '', invoiceNumber: '' });
      loadLowStock();
      loadExpiringItems();
    } catch (e: any) {
      alert('Eroare la adăugarea lotului: ' + (e?.message || 'Eroare necunoscută'));
    } finally {
      setLotSaving(false);
    }
  };

  const handleImportInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = invoiceFileRef.current?.files?.[0];
    if (!file) { alert('Selectați un fișier!'); return; }
    setInvoiceImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', invoiceForm.fileType);
      formData.append('invoice_number', invoiceForm.invoiceNumber);
      formData.append('supplier', invoiceForm.supplier);
      formData.append('date', invoiceForm.date);
      formData.append('total', invoiceForm.total);
      await httpClient.post('/api/inventory/import-invoice', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('✅ Factură importată cu succes!');
      setInvoiceForm({ fileType: '', invoiceNumber: '', supplier: '', date: new Date().toISOString().split('T')[0], total: '' });
      if (invoiceFileRef.current) invoiceFileRef.current.value = '';
      loadImportedInvoices();
    } catch (e: any) {
      alert('Eroare la import: ' + (e?.message || 'Eroare necunoscută'));
    } finally {
      setInvoiceImporting(false);
    }
  };

  const loadLowStock = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/admin/inventory/filtered?stock_status=low_stock');
      if (res.data?.success) setLowStockItems(res.data.data || []);
      else {
        const res2 = await httpClient.get('/api/ingredients');
        const ings = Array.isArray(res2.data) ? res2.data : res2.data?.ingredients || [];
        setLowStockItems(ings.filter((i: any) => (i.current_stock || 0) > 0 && (i.current_stock || 0) <= (i.min_stock || 5)));
      }
    } catch (e) { console.error('Error loading low stock:', e); }
  }, []);

  const loadExpiringItems = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/inventory/expiring?days=30');
      setExpiringItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (e) {
      console.error('Error loading expiring items:', e);
      setExpiringItems([]);
    }
  }, []);

  const loadImportedInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (invoiceFilters.status) params.append('status', invoiceFilters.status);
      if (invoiceFilters.supplier) params.append('supplier', invoiceFilters.supplier);
      if (invoiceFilters.startDate) params.append('start_date', invoiceFilters.startDate);
      if (invoiceFilters.endDate) params.append('end_date', invoiceFilters.endDate);
      const res = await httpClient.get(`/api/inventory/invoices?${params.toString()}`);
      setImportedInvoices(Array.isArray(res.data) ? res.data : res.data?.invoices || []);
    } catch (e) {
      console.error('Error loading invoices:', e);
      setImportedInvoices([]);
    }
  }, [invoiceFilters]);

  // ─── Inventory Sessions Functions ────────────────────────────────────────

  const loadInventorySessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (sessionFilters.type) params.append('type', sessionFilters.type);
      if (sessionFilters.status) params.append('status', sessionFilters.status);
      if (sessionFilters.limit) params.append('limit', sessionFilters.limit);
      const res = await httpClient.get(`/api/inventory/sessions?${params.toString()}`);
      const data = res.data;
      setInventorySessions(data.sessions || (Array.isArray(data) ? data : []));
    } catch (e) {
      console.error('Error loading inventory sessions:', e);
      setInventorySessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionFilters]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/locations');
      setLocations(res.data?.locations || (Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error('Error loading locations:', e); }
  }, []);

  const handleStartSession = async () => {
    try {
      const payload = {
        session_type: newSessionForm.sessionType,
        started_by: newSessionForm.startedBy,
        location_ids: newSessionForm.scope === 'global' ? null : newSessionForm.locationIds,
      };
      const res = await httpClient.post('/api/inventory/start', payload);
      const data = res.data;
      setShowNewSessionModal(false);
      setNewSessionForm({ sessionType: 'daily', scope: 'global', locationIds: [], startedBy: '' });
      if (data.sessionId) {
        navigate(`/stocks/inventory/${data.sessionId}`);
      } else {
        loadInventorySessions();
      }
    } catch (e) {
      console.error('Error starting session:', e);
      alert('Eroare la crearea sesiunii de inventar');
    }
  };

  // ─── Queue Items Functions ─────────────────────────────────────────────

  const loadQueueItems = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/queue-monitor');
      const data = res.data;
      setQueueItems(data.queueItems || []);
    } catch (e) {
      console.error('Error loading queue items:', e);
      setQueueItems([]);
    }
  }, []);

  // ─── Print NIR Function ──────────────────────────────────────────────────

  const printNir = (nirNumber: string) => {
    // Open the NIR PDF in a new window for printing
    const url = `/api/inventory/nir/${nirNumber}/pdf`;
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      // Fallback: print current modal content
      window.print();
    }
  };

  // ─── Load data on tab change ─────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'form') { loadQueueItems(); }
    if (activeTab === 'reports') { loadQuickFilters(); }
    if (activeTab === 'lots') { loadIngredients(); loadLowStock(); loadExpiringItems(); loadImportedInvoices(); }
    if (activeTab === 'inventory') { loadInventorySessions(); loadLocations(); }
  }, [activeTab, loadQueueItems, loadQuickFilters, loadIngredients, loadLowStock, loadExpiringItems, loadImportedInvoices, loadInventorySessions, loadLocations]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          <i className="fas fa-file-invoice mr-2" />
          Gestiune Stocuri — NIR
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 font-medium rounded-t-lg text-sm ${
            activeTab === 'form'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-plus-circle mr-1" /> NIR Nou
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            loadHistory();
          }}
          className={`px-4 py-2 font-medium rounded-t-lg text-sm ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-history mr-1" /> Istoric NIR-uri
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium rounded-t-lg text-sm ${
            activeTab === 'reports'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-chart-bar mr-1" /> Export &amp; Filtre
        </button>
        <button
          onClick={() => setActiveTab('lots')}
          className={`px-4 py-2 font-medium rounded-t-lg text-sm ${
            activeTab === 'lots'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-boxes mr-1" /> Loturi &amp; Facturi
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium rounded-t-lg text-sm ${
            activeTab === 'inventory'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-clipboard-list mr-1" /> Inventar Avansat
        </button>
      </div>

      {/* ─── NIR Form Tab ──────────────────────────────────────────────── */}
      {activeTab === 'form' && (
        <div className="flex flex-col gap-4">
          {/* PDF Import */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              <i className="fas fa-file-pdf mr-1" /> Import Factură PDF
            </h3>
            <form onSubmit={handlePdfImport} className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 dark:file:bg-blue-800 dark:file:text-blue-200"
              />
              <button
                type="submit"
                disabled={importLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {importLoading ? (
                  <><i className="fas fa-spinner fa-spin mr-1" /> Prelucrare...</>
                ) : (
                  <><i className="fas fa-upload mr-1" /> Importă</>
                )}
              </button>
            </form>
          </div>

          {/* Company / Document Header */}
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Date Societate / Document
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <InputField label="Denumire Unitate" value={unitName} onChange={setUnitName} placeholder="SC RESTAURANT SRL" />
              <InputField label="CUI" value={cui} onChange={setCui} placeholder="RO12345678" />
              <InputField label="Adresă" value={address} onChange={setAddress} placeholder="Str. Exemplu nr. 1" />
              <InputField label="Gestiune" value={gestion} onChange={setGestion} placeholder="Gestiune principală" />
              <InputField label="Număr NIR *" value={nirNumber} onChange={setNirNumber} placeholder="NIR-001" required />
              <InputField label="Furnizor *" value={supplierName} onChange={setSupplierName} placeholder="Furnizor SRL" required />
              <InputField label="Nr. Factură" value={invoiceNumber} onChange={setInvoiceNumber} placeholder="4587/29.09.2025" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data Document</label>
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openStockModal()}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              <i className="fas fa-search mr-1" /> Selectează din Stoc
            </button>
            <button
              onClick={() => addItem()}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700"
            >
              <i className="fas fa-plus mr-1" /> Adaugă Manual
            </button>
            <button
              onClick={exportJson}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
            >
              <i className="fas fa-download mr-1" /> Export JSON
            </button>
            <button
              onClick={exportCsv}
              className="px-3 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-700"
            >
              <i className="fas fa-file-csv mr-1" /> Export CSV
            </button>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-2 py-2 text-center w-12">Nr.</th>
                  <th className="px-2 py-2 text-left min-w-[180px]">Denumire Produs</th>
                  <th className="px-2 py-2 text-left w-24">Cod</th>
                  <th className="px-2 py-2 text-left w-24">U.M.</th>
                  <th className="px-2 py-2 text-right w-24">Cantitate</th>
                  <th className="px-2 py-2 text-right w-28">Preț Unit (fără TVA)</th>
                  <th className="px-2 py-2 text-center w-28">TVA %</th>
                  <th className="px-2 py-2 text-right w-28">Valoare</th>
                  <th className="px-2 py-2 text-right w-28">Preț Vânzare</th>
                  <th className="px-2 py-2 text-right w-28">Total</th>
                  <th className="px-2 py-2 text-center w-12">Act.</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-400">
                      <i className="fas fa-inbox mr-2" />
                      Nu sunt articole. Folosiți butoanele de mai sus pentru a adăuga.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-2 py-1 text-center text-gray-500">{idx + 1}</td>
                      <td className="px-1 py-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                          placeholder="Denumire..."
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="text"
                          value={item.code}
                          readOnly
                          className="w-full h-8 px-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-sm text-gray-500"
                          tabIndex={-1}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full h-8 px-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.qtyReceived || ''}
                          onChange={(e) =>
                            updateItem(item.id, 'qtyReceived', parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.priceExVat || ''}
                          onChange={(e) =>
                            updateItem(item.id, 'priceExVat', parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <select
                          value={item.vatRate}
                          onChange={(e) =>
                            updateItem(item.id, 'vatRate', parseInt(e.target.value))
                          }
                          className="w-full h-8 px-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                        >
                          {VAT_RATES.map((vr) => (
                            <option key={vr.value} value={vr.value}>{vr.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 text-right text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                        {item.valueExVat.toFixed(2)}
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.salePrice || ''}
                          onChange={(e) =>
                            updateItem(item.id, 'salePrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-1 text-right font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800">
                        {item.valueIncVat.toFixed(2)}
                      </td>
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Șterge"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Bază (fără TVA)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {totalBase.toFixed(2)} RON
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Total TVA</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {totalVat.toFixed(2)} RON
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400">Total General (cu TVA)</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {totalIncVat.toFixed(2)} RON
                </div>
              </div>
            </div>

            {/* VAT Summary */}
            {Object.keys(vatSummary).length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Desfășurare TVA
                </h4>
                {Object.keys(vatSummary)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((rate) => (
                    <div key={rate} className="flex gap-4 text-sm py-1">
                      <span className="w-20 font-medium text-gray-700 dark:text-gray-300">
                        TVA {rate}%:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Bază: {vatSummary[rate].base.toFixed(2)} RON
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        TVA: {vatSummary[rate].vat.toFixed(2)} RON
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Total: {vatSummary[rate].total.toFixed(2)} RON
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Payment Fields */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InputField label="Plată Bază" value={paidBase} onChange={setPaidBase} placeholder="0.00" type="number" />
                <InputField label="Plată TVA" value={paidVat} onChange={setPaidVat} placeholder="0.00" type="number" />
              </div>
            </div>
          </div>

          {/* Articole Recepționate (Queue Items) */}
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                <i className="fas fa-boxes mr-1" /> Articole Recepționate
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">{queueItems.length}</span>
                <button onClick={loadQueueItems} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <i className="fas fa-sync-alt mr-1" /> Reîmprospătează
                </button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {queueItems.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <i className="fas fa-inbox text-3xl mb-2 block" />
                  <p className="text-sm">Coada este goală</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {queueItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name || item.product || `Item #${idx + 1}`}</span>
                        <span className="text-gray-500">{item.quantity || '-'} {item.unit || ''}</span>
                      </div>
                      {item.status && <span className="text-xs text-gray-400">{item.status}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveNir}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 disabled:opacity-50 shadow-lg"
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin mr-2" /> Se salvează...</>
              ) : (
                <><i className="fas fa-save mr-2" /> Salvează NIR &amp; Actualizează Stoc</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── History Tab ──────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          {historyLoading ? (
            <div className="p-8 text-center text-gray-400">
              <i className="fas fa-spinner fa-spin mr-2" /> Se încarcă...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <i className="fas fa-info-circle mr-1" /> Nu există NIR-uri înregistrate.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">Număr NIR</th>
                  <th className="px-4 py-3 text-left">Furnizor</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-right">Valoare</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {history.map((nir, idx) => {
                  const nirNum = nir.nir_number || nir.number || 'N/A';
                  const supplier = nir.supplier_name || nir.supplier || '-';
                  const date = nir.document_date || nir.date || '-';
                  const total =
                    nir.total_value != null
                      ? nir.total_value
                      : nir.value != null
                        ? nir.value
                        : 0;
                  const status = nir.nir_status || nir.status || 'draft';

                  return (
                    <tr key={idx} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 font-medium">{nirNum}</td>
                      <td className="px-4 py-2">{supplier}</td>
                      <td className="px-4 py-2">{date}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {Number(total).toFixed(2)} RON
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            status === 'finalized' || status === 'emis'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => viewDetails(nir)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          <i className="fas fa-eye mr-1" /> Vezi Detalii
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {/* CAMP Info Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 mt-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <i className="fas fa-info-circle mr-1" />
              NIR-urile actualizează automat <strong>Costul Mediu Ponderat (CAMP)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ─── Reports & Filters Tab ────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-4">
          {/* Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Export */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
                <i className="fas fa-file-excel mr-1" /> Export Excel
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => exportReport('excel', 'stock_overview')} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  <i className="fas fa-file-excel mr-1" /> Stoc General
                </button>
                <button onClick={() => exportReport('excel', 'low_stock')} className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                  <i className="fas fa-file-excel mr-1" /> Stoc Scăzut
                </button>
                <button onClick={() => exportReport('excel', 'expiring')} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  <i className="fas fa-file-excel mr-1" /> Expirări (30 zile)
                </button>
                <button onClick={() => exportReport('excel', 'batches')} className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <i className="fas fa-file-excel mr-1" /> Toate Loturile
                </button>
                <button onClick={() => exportReport('excel', 'invoices')} className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                  <i className="fas fa-file-excel mr-1" /> Facturi Importate
                </button>
              </div>
            </div>
            {/* PDF Export */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3">
                <i className="fas fa-file-pdf mr-1" /> Export PDF
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => exportReport('pdf', 'stock_overview')} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  <i className="fas fa-file-pdf mr-1" /> Stoc General
                </button>
                <button onClick={() => exportReport('pdf', 'low_stock')} className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                  <i className="fas fa-file-pdf mr-1" /> Stoc Scăzut
                </button>
                <button onClick={() => exportReport('pdf', 'expiring')} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  <i className="fas fa-file-pdf mr-1" /> Expirări (30 zile)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
              <i className="fas fa-filter mr-1" /> Filtre Rapide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Categorie</label>
                <select value={reportFilters.category} onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="">Toate Categoriile</option>
                  {filterCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Furnizor</label>
                <select value={reportFilters.supplier} onChange={(e) => setReportFilters({ ...reportFilters, supplier: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="">Toți Furnizorii</option>
                  {filterSuppliers.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status Stoc</label>
                <select value={reportFilters.stockStatus} onChange={(e) => setReportFilters({ ...reportFilters, stockStatus: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="">Toate Statusurile</option>
                  <option value="out_of_stock">Fără Stoc</option>
                  <option value="low_stock">Stoc Scăzut</option>
                  <option value="ok_stock">Stoc OK</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sortare</label>
                <select value={reportFilters.sortBy} onChange={(e) => setReportFilters({ ...reportFilters, sortBy: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="name">Nume</option>
                  <option value="category">Categorie</option>
                  <option value="current_stock">Stoc Curent</option>
                  <option value="min_stock">Stoc Minim</option>
                  <option value="cost_per_unit">Cost/Unit</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Stoc Min:</span>
                <input type="number" value={reportFilters.minStock} onChange={(e) => setReportFilters({ ...reportFilters, minStock: e.target.value })} placeholder="0" className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Stoc Max:</span>
                <input type="number" value={reportFilters.maxStock} onChange={(e) => setReportFilters({ ...reportFilters, maxStock: e.target.value })} placeholder="1000" className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm flex-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={applyQuickFilters} disabled={filtersLoading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                {filtersLoading ? <><i className="fas fa-spinner fa-spin mr-1" /> Se aplică...</> : <><i className="fas fa-filter mr-1" /> Aplică Filtre</>}
              </button>
              <button onClick={() => { setReportFilters({ category: '', supplier: '', stockStatus: '', sortBy: 'name', minStock: '', maxStock: '' }); setFilteredResults([]); setFilteredSummary(null); }} className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                <i className="fas fa-times mr-1" /> Șterge Filtre
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-xl text-center">
              <div className="text-2xl font-bold">{statsData.total_ingredients}</div>
              <div className="text-xs opacity-80">Total Ingrediente</div>
            </div>
            <div className="p-4 bg-red-600 text-white rounded-xl text-center">
              <div className="text-2xl font-bold">{statsData.out_of_stock}</div>
              <div className="text-xs opacity-80">Fără Stoc</div>
            </div>
            <div className="p-4 bg-yellow-600 text-white rounded-xl text-center">
              <div className="text-2xl font-bold">{statsData.low_stock}</div>
              <div className="text-xs opacity-80">Stoc Scăzut</div>
            </div>
            <div className="p-4 bg-green-600 text-white rounded-xl text-center">
              <div className="text-2xl font-bold">{statsData.ok_stock}</div>
              <div className="text-xs opacity-80">Stoc OK</div>
            </div>
          </div>

          {/* Filtered Results */}
          {filteredResults.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h4 className="text-sm font-semibold">Rezultate Filtre</h4>
                {filteredSummary && (
                  <span className="text-xs text-gray-500">
                    Total: {filteredSummary.total} | Fără stoc: {filteredSummary.out_of_stock} | Stoc scăzut: {filteredSummary.low_stock} | Stoc OK: {filteredSummary.ok_stock} | Valoare: {(filteredSummary.total_value || 0).toFixed(2)} RON
                  </span>
                )}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left">Denumire</th>
                    <th className="px-3 py-2 text-left">Categorie</th>
                    <th className="px-3 py-2">U.M.</th>
                    <th className="px-3 py-2 text-right">Stoc</th>
                    <th className="px-3 py-2 text-right">Minim</th>
                    <th className="px-3 py-2 text-right">Cost/Unit</th>
                    <th className="px-3 py-2 text-left">Furnizor</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Valoare</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.slice(0, 200).map((item, idx) => {
                    const stock = item.current_stock || 0;
                    const min = item.min_stock || 5;
                    const status = stock <= 0 ? 'out_of_stock' : stock <= min ? 'low_stock' : 'ok_stock';
                    return (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1.5 font-medium">{item.name}</td>
                        <td className="px-3 py-1.5 text-gray-500">{item.category || 'N/A'}</td>
                        <td className="px-3 py-1.5 text-center">{item.unit}</td>
                        <td className="px-3 py-1.5 text-right">{stock}</td>
                        <td className="px-3 py-1.5 text-right">{min}</td>
                        <td className="px-3 py-1.5 text-right">{(item.cost_per_unit || 0).toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-gray-500">{item.supplier || 'N/A'}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === 'out_of_stock' ? 'bg-red-100 text-red-700' : status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {status === 'out_of_stock' ? 'Fără Stoc' : status === 'low_stock' ? 'Stoc Scăzut' : 'Stoc OK'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right">{((stock) * (item.cost_per_unit || 0)).toFixed(2)} RON</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Lots & Invoice Import Tab ────────────────────────────────── */}
      {activeTab === 'lots' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Add New Lot */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                <i className="fas fa-boxes mr-1" /> Adaugă Lot Nou
              </h3>
              <form onSubmit={handleAddLot} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Ingredient</label>
                  <select value={lotForm.ingredient} onChange={(e) => setLotForm({ ...lotForm, ingredient: e.target.value })} required className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <option value="">Selectează ingredient...</option>
                    {ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Număr Lot" value={lotForm.batchNumber} onChange={(v) => setLotForm({ ...lotForm, batchNumber: v })} required />
                  <InputField label="Cod Bare" value={lotForm.barcode} onChange={(v) => setLotForm({ ...lotForm, barcode: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Cantitate" value={lotForm.quantity} onChange={(v) => setLotForm({ ...lotForm, quantity: v })} type="number" required />
                  <InputField label="Cost Unitar" value={lotForm.unitCost} onChange={(v) => setLotForm({ ...lotForm, unitCost: v })} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data Achiziție</label>
                    <input type="date" value={lotForm.purchaseDate} onChange={(e) => setLotForm({ ...lotForm, purchaseDate: e.target.value })} required className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data Expirării</label>
                    <input type="date" value={lotForm.expiryDate} onChange={(e) => setLotForm({ ...lotForm, expiryDate: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Furnizor" value={lotForm.supplier} onChange={(v) => setLotForm({ ...lotForm, supplier: v })} />
                  <InputField label="Număr Factură" value={lotForm.invoiceNumber} onChange={(v) => setLotForm({ ...lotForm, invoiceNumber: v })} />
                </div>
                <button type="submit" disabled={lotSaving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {lotSaving ? <><i className="fas fa-spinner fa-spin mr-1" /> Se salvează...</> : <><i className="fas fa-plus mr-1" /> Adaugă Lot</>}
                </button>
              </form>
            </div>

            {/* Invoice Import */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
                <i className="fas fa-file-upload mr-1" /> Import Factură
              </h3>
              <form onSubmit={handleImportInvoice} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tip Fișier</label>
                  <select value={invoiceForm.fileType} onChange={(e) => setInvoiceForm({ ...invoiceForm, fileType: e.target.value })} required className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <option value="">Selectează tipul...</option>
                    <option value="pdf">PDF</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fișier Factură</label>
                  <input type="file" ref={invoiceFileRef} accept=".pdf,.xml" required className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-100 file:text-green-700" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Număr Factură" value={invoiceForm.invoiceNumber} onChange={(v) => setInvoiceForm({ ...invoiceForm, invoiceNumber: v })} required />
                  <InputField label="Furnizor" value={invoiceForm.supplier} onChange={(v) => setInvoiceForm({ ...invoiceForm, supplier: v })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data Factură</label>
                    <input type="date" value={invoiceForm.date} onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })} required className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  </div>
                  <InputField label="Valoare Totală" value={invoiceForm.total} onChange={(v) => setInvoiceForm({ ...invoiceForm, total: v })} type="number" required />
                </div>
                <button type="submit" disabled={invoiceImporting} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {invoiceImporting ? <><i className="fas fa-spinner fa-spin mr-1" /> Se importă...</> : <><i className="fas fa-upload mr-1" /> Importă Factură</>}
                </button>
              </form>
            </div>
          </div>

          {/* Low Stock & Expiring Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Low Stock */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  <i className="fas fa-exclamation-triangle mr-1" /> Stoc Scăzut
                </h4>
                <button onClick={loadLowStock} className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                  <i className="fas fa-sync mr-1" /> Actualizează
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left">Ingredient</th>
                      <th className="px-3 py-2 text-right">Stoc</th>
                      <th className="px-3 py-2 text-right">Minim</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-gray-400">Nu sunt produse cu stoc scăzut</td></tr>
                    ) : lowStockItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1.5 font-medium">{item.name}</td>
                        <td className="px-3 py-1.5 text-right">{item.current_stock || 0}</td>
                        <td className="px-3 py-1.5 text-right">{item.min_stock || 5}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Scăzut</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300">
                  <i className="fas fa-clock mr-1" /> Expiră în Curând
                </h4>
                <button onClick={loadExpiringItems} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  <i className="fas fa-sync mr-1" /> Actualizează
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left">Ingredient</th>
                      <th className="px-3 py-2 text-left">Lot</th>
                      <th className="px-3 py-2 text-left">Expiră</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringItems.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-gray-400">Nu sunt produse care expiră în curând</td></tr>
                    ) : expiringItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1.5 font-medium">{item.ingredient_name || item.name}</td>
                        <td className="px-3 py-1.5">{item.batch_number || item.lot || '-'}</td>
                        <td className="px-3 py-1.5">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('ro-RO') : '-'}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expiră</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Imported Invoices */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                <i className="fas fa-list mr-1" /> Facturi Importate
              </h4>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <select value={invoiceFilters.status} onChange={(e) => setInvoiceFilters({ ...invoiceFilters, status: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="">Toate statusurile</option>
                  <option value="pending">În așteptare</option>
                  <option value="processed">Procesate</option>
                </select>
                <input type="text" placeholder="Furnizor..." value={invoiceFilters.supplier} onChange={(e) => setInvoiceFilters({ ...invoiceFilters, supplier: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                <input type="date" value={invoiceFilters.startDate} onChange={(e) => setInvoiceFilters({ ...invoiceFilters, startDate: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                <input type="date" value={invoiceFilters.endDate} onChange={(e) => setInvoiceFilters({ ...invoiceFilters, endDate: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
              <button onClick={loadImportedInvoices} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mb-3">
                <i className="fas fa-sync mr-1" /> Actualizează
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left">Număr Factură</th>
                    <th className="px-3 py-2 text-left">Furnizor</th>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-right">Valoare</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importedInvoices.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">Nu sunt facturi importate</td></tr>
                  ) : importedInvoices.map((inv, idx) => (
                    <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-1.5 font-medium">{inv.invoice_number || inv.number}</td>
                      <td className="px-3 py-1.5">{inv.supplier}</td>
                      <td className="px-3 py-1.5">{inv.date ? new Date(inv.date).toLocaleDateString('ro-RO') : '-'}</td>
                      <td className="px-3 py-1.5 text-right">{(inv.total || 0).toFixed(2)} RON</td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inv.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inv.status === 'processed' ? 'Procesat' : 'În așteptare'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Inventory Sessions Tab ───────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div className="flex flex-col gap-4">
          {/* Description */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Realizează inventarul fizic (zilnic sau lunar), comparând stocul teoretic cu stocul numărat. Stocurile sunt actualizate automat după finalizare.
            </p>
            <button onClick={() => { setShowNewSessionModal(true); loadLocations(); }} className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">
              <i className="fas fa-clipboard-list mr-1" /> Inițiază Sesiune Nouă de Inventar
            </button>
          </div>

          {/* Session Filters */}
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3">📋 Istoric Sesiuni Inventar</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <select value={sessionFilters.type} onChange={(e) => setSessionFilters({ ...sessionFilters, type: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                <option value="">Toate tipurile</option>
                <option value="daily">Zilnic</option>
                <option value="monthly">Lunar</option>
              </select>
              <select value={sessionFilters.status} onChange={(e) => setSessionFilters({ ...sessionFilters, status: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                <option value="">Toate statusurile</option>
                <option value="in_progress">În Progres</option>
                <option value="completed">Completate</option>
                <option value="archived">Arhivate</option>
              </select>
              <select value={sessionFilters.limit} onChange={(e) => setSessionFilters({ ...sessionFilters, limit: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                <option value="10">Ultimele 10</option>
                <option value="25">Ultimele 25</option>
                <option value="50">Ultimele 50</option>
                <option value="">Toate</option>
              </select>
              <button onClick={loadInventorySessions} className="h-9 px-4 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <i className="fas fa-sync mr-1" /> Reîncarcă
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {sessionsLoading ? (
              <div className="p-8 text-center text-gray-400"><i className="fas fa-spinner fa-spin mr-2" /> Se încarcă sesiunile...</div>
            ) : inventorySessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Nu există sesiuni de inventar</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left">ID Sesiune</th>
                    <th className="px-3 py-2 text-center">Tip</th>
                    <th className="px-3 py-2 text-left">Data Început</th>
                    <th className="px-3 py-2 text-left">Data Finalizare</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Progres</th>
                    <th className="px-3 py-2 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {inventorySessions.map((session, idx) => (
                    <tr key={idx} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-1.5"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">{session.id}</code></td>
                      <td className="px-3 py-1.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{session.session_type === 'daily' ? 'Zilnic' : 'Lunar'}</span>
                      </td>
                      <td className="px-3 py-1.5">{session.started_at ? new Date(session.started_at).toLocaleString('ro-RO') : '-'}</td>
                      <td className="px-3 py-1.5">{session.completed_at ? new Date(session.completed_at).toLocaleString('ro-RO') : '-'}</td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${session.status === 'completed' ? 'bg-green-100 text-green-700' : session.status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {session.status === 'completed' ? 'Finalizat' : session.status === 'archived' ? 'Arhivat' : 'În Progres'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right">{session.item_count || session.difference_count || 0} / {session.total_items || 'N/A'}</td>
                      <td className="px-3 py-1.5 text-center flex gap-1 justify-center">
                        {session.status === 'in_progress' && (
                          <button onClick={() => navigate(`/stocks/inventory/${session.id}`)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            <i className="fas fa-clipboard-list mr-1" /> Numără
                          </button>
                        )}
                        <button onClick={() => navigate(`/stocks/inventory/${session.id}`)} className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                          <i className="fas fa-eye mr-1" /> Detalii
                        </button>
                        {session.status === 'completed' && (
                          <a href={`/api/inventory/${session.id}/pdf`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                            <i className="fas fa-file-pdf mr-1" /> PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── New Session Modal ─────────────────────────────────────────── */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-xl">
              <h3 className="text-lg font-bold"><i className="fas fa-warehouse mr-2" /> Sesiune Inventar Nouă</h3>
              <button onClick={() => setShowNewSessionModal(false)} className="text-white/80 hover:text-white"><i className="fas fa-times text-xl" /></button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tip Inventar</label>
                <select value={newSessionForm.sessionType} onChange={(e) => setNewSessionForm({ ...newSessionForm, sessionType: e.target.value })} className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <option value="daily">Inventar Zilnic</option>
                  <option value="monthly">Inventar Lunar</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Scope</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" name="scope" value="global" checked={newSessionForm.scope === 'global'} onChange={() => setNewSessionForm({ ...newSessionForm, scope: 'global', locationIds: [] })} /> Toate Gestiunile
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" name="scope" value="specific" checked={newSessionForm.scope === 'specific'} onChange={() => setNewSessionForm({ ...newSessionForm, scope: 'specific' })} /> Gestiuni Specifice
                  </label>
                </div>
              </div>
              {newSessionForm.scope === 'specific' && (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
                  {locations.map((loc: any) => (
                    <label key={loc.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={newSessionForm.locationIds.includes(loc.id)} onChange={(e) => {
                        if (e.target.checked) setNewSessionForm({ ...newSessionForm, locationIds: [...newSessionForm.locationIds, loc.id] });
                        else setNewSessionForm({ ...newSessionForm, locationIds: newSessionForm.locationIds.filter((id) => id !== loc.id) });
                      }} />
                      {loc.name}
                    </label>
                  ))}
                </div>
              )}
              <InputField label="Responsabil" value={newSessionForm.startedBy} onChange={(v) => setNewSessionForm({ ...newSessionForm, startedBy: v })} placeholder="ex: Maria Ionescu" required />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setShowNewSessionModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300">Anulează</button>
              <button onClick={handleStartSession} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pornire Sesiune</button>
            </div>
          </div>
        </div>
      )
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                <i className="fas fa-boxes mr-2" /> Selectează Produs din Stoc
              </h3>
              <button
                onClick={() => setStockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Caută după nume sau cod..."
                className="w-full h-10 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {stockLoading ? (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-spinner fa-spin mr-2" /> Se încarcă produsele...
                </div>
              ) : filteredStock.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nu s-au găsit rezultate.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Cod</th>
                      <th className="px-3 py-2 text-left">Denumire</th>
                      <th className="px-3 py-2 text-left">U.M.</th>
                      <th className="px-3 py-2 text-left">Categorie</th>
                      <th className="px-3 py-2 text-right">Preț</th>
                      <th className="px-3 py-2 text-center w-28">Acțiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.slice(0, 200).map((item) => (
                      <tr
                        key={`${item.id}-${item.code}`}
                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-1.5 text-gray-500">{item.code || '-'}</td>
                        <td className="px-3 py-1.5 font-medium">{item.name}</td>
                        <td className="px-3 py-1.5">{item.unit || 'buc'}</td>
                        <td className="px-3 py-1.5 text-gray-500">{item.category || '-'}</td>
                        <td className="px-3 py-1.5 text-right">{(item.price || 0).toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-center">
                          <button
                            onClick={() => selectStockItem(item)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Selectează
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStock.length > 200 && (
                  <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                    Se afișează primele 200 din {filteredStock.length} rezultate. Rafinați căutarea pentru mai multă precizie.
                  </div>
                )}
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── NIR Details Modal ────────────────────────────────────────── */}
      {detailsModalOpen && detailsNir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-blue-600 bg-blue-600 text-white rounded-t-xl">
              <h3 className="text-lg font-bold">
                <i className="fas fa-file-invoice mr-2" />
                Detalii NIR: {detailsNir.nir_number || detailsNir.number || 'N/A'}
              </h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* NIR Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm"><strong>Număr NIR:</strong> {detailsNir.nir_number || detailsNir.number}</p>
                  <p className="text-sm"><strong>Furnizor:</strong> {detailsNir.supplier_name || detailsNir.supplier}</p>
                  <p className="text-sm"><strong>Data Document:</strong> {detailsNir.document_date || detailsNir.date}</p>
                </div>
                <div>
                  <p className="text-sm">
                    <strong>Valoare Totală:</strong>{' '}
                    {Number(detailsNir.total_value ?? detailsNir.value ?? 0).toFixed(2)} RON
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong>{' '}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      (detailsNir.nir_status || detailsNir.status) === 'finalized'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {detailsNir.nir_status || detailsNir.status || 'draft'}
                    </span>
                  </p>
                  {detailsNir.created_at && (
                    <p className="text-sm"><strong>Creat la:</strong> {new Date(detailsNir.created_at).toLocaleString('ro-RO')}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <h4 className="text-sm font-semibold mt-4 mb-2">
                <i className="fas fa-boxes mr-1" /> Articole NIR:
              </h4>
              {detailsLoading ? (
                <div className="text-center py-4 text-gray-400">
                  <i className="fas fa-spinner fa-spin mr-1" /> Se încarcă articolele...
                </div>
              ) : detailsItems.length === 0 ? (
                <p className="text-gray-400 text-sm">Nu există articole înregistrate.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-2 py-2">Nr.crt</th>
                        <th className="px-2 py-2 text-left">Denumire</th>
                        <th className="px-2 py-2">U.M.</th>
                        <th className="px-2 py-2 text-right">Cant.</th>
                        <th className="px-2 py-2 text-right">Preț unitar</th>
                        <th className="px-2 py-2 text-right">Valoare</th>
                        <th className="px-2 py-2 text-right">TVA</th>
                        <th className="px-2 py-2 text-right">Val.+TVA</th>
                        <th className="px-2 py-2 text-right">Adaos %</th>
                        <th className="px-2 py-2 text-right">Val. adaos</th>
                        <th className="px-2 py-2 text-right">Preț vânz.</th>
                        <th className="px-2 py-2 text-right">Val. vânz.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsItems.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="px-2 py-1 text-center">{idx + 1}</td>
                          <td className="px-2 py-1">
                            <strong>{item.product_name || item.official_name || 'N/A'}</strong>
                            {item.product_code && (
                              <span className="text-gray-400 ml-1">({item.product_code})</span>
                            )}
                          </td>
                          <td className="px-2 py-1 text-center">{item.unit || 'buc'}</td>
                          <td className="px-2 py-1 text-right">{Number(item.quantity).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.unit_price).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.value).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.vat_amount).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.value_with_vat).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.markup_percent).toFixed(1)}%</td>
                          <td className="px-2 py-1 text-right">{Number(item.markup_value).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">{Number(item.sale_price).toFixed(2)}</td>
                          <td className="px-2 py-1 text-right font-medium">{Number(item.sale_value).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    {detailsTotals && (
                      <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
                        <tr>
                          <td colSpan={5} className="px-2 py-2 text-right">TOTALURI:</td>
                          <td className="px-2 py-2 text-right">{Number(detailsTotals.total_value || 0).toFixed(2)}</td>
                          <td className="px-2 py-2 text-right">{Number(detailsTotals.total_vat || 0).toFixed(2)}</td>
                          <td className="px-2 py-2 text-right">{Number(detailsTotals.total_value_with_vat || 0).toFixed(2)}</td>
                          <td />
                          <td className="px-2 py-2 text-right">
                            {detailsItems.reduce((s, i) => s + Number(i.markup_value || 0), 0).toFixed(2)}
                          </td>
                          <td />
                          <td className="px-2 py-2 text-right font-bold">
                            {detailsItems.reduce((s, i) => s + Number(i.sale_value || 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => printNir(detailsNir.nir_number || detailsNir.number || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <i className="fas fa-print mr-1" /> Printează
              </button>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper Components ─────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="h-9 px-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
    />
  </div>
);

export default NirPage;
