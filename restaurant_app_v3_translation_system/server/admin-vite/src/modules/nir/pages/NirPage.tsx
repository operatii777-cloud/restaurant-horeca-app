/**
 * NIR Page - Notă de Intrare Recepție
 * Full implementation matching admin-advanced.html NIR functionality.
 * Uses /api/inventory/nir endpoints for real stock integration.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

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
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 font-medium rounded-t-lg ${
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
          className={`px-4 py-2 font-medium rounded-t-lg ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-history mr-1" /> Istoric NIR-uri
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
        </div>
      )}

      {/* ─── Stock Selection Modal ────────────────────────────────────── */}
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
