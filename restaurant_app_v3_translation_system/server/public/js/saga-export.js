(function (window) {
    const STORAGE_KEY = 'sagaExportHistory';
    const CSV_COLUMNS = [
        'TipDocument',
        'NumarDocument',
        'DataDocument',
        'Partener',
        'CUI',
        'Factura',
        'ContDebit',
        'ContCredit',
        'Gestiune',
        'Articol',
        'Cantitate',
        'UM',
        'ValoareFaraTVA',
        'TVA',
        'ValoareCuTVA',
        'CotaTVA',
        'Observatii'
    ];

    function resolveAuthToken(customToken) {
        const token = customToken || localStorage.getItem('adminToken') || sessionStorage.getItem('restaurantAuth');
        if (!token) return null;
        return token.startsWith('Bearer') ? token : `Bearer ${token}`;
    }

    async function fetchJson(url, token) {
        const headers = {};
        if (token) {
            headers['Authorization'] = token;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const message = `Eroare API (${response.status})`;
            throw new Error(message);
        }
        return response.json();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function isWithinRange(dateStr, start, end) {
        if (!dateStr) return false;
        const current = new Date(formatDate(dateStr)).getTime();
        if (Number.isNaN(current)) return false;
        if (start) {
            const startTime = new Date(start).getTime();
            if (current < startTime) return false;
        }
        if (end) {
            const endTime = new Date(end).getTime();
            if (current > endTime) return false;
        }
        return true;
    }

    function toNumber(value, fallback = 0) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function toFixed(value) {
        return toNumber(value).toFixed(2);
    }

    function rowsToCsv(rows) {
        const header = CSV_COLUMNS.join(';');
        const body = rows.map(row =>
            CSV_COLUMNS.map(col => {
                const raw = row[col] ?? '';
                const safe = typeof raw === 'string' ? raw.replace(/"/g, '""') : raw;
                return `"${safe}"`;
            }).join(';')
        );
        return [header, ...body].join('\n');
    }

    function downloadCsv(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function getAuditHistory(context) {
        try {
            const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (context) {
                return history.filter(item => item.context === context);
            }
            return history;
        } catch {
            return [];
        }
    }

    function recordAudit(entry) {
        const history = getAuditHistory();
        history.unshift(entry);
        const trimmed = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }

    async function buildNirRows(options, token) {
        const { startDate, endDate, debitAccount, creditAccount, brand, defaultVatRate = 9 } = options;
        const rows = [];
        const nirs = await fetchJson('/api/inventory/nirs', token);
        const filtered = Array.isArray(nirs)
            ? nirs.filter(nir => isWithinRange(nir.document_date || nir.created_at, startDate, endDate))
            : [];

        for (const nir of filtered) {
            let items = nir.items;
            if ((!items || !items.length) && nir.id) {
                try {
                    const details = await fetchJson(`/api/inventory/nir/${nir.id}`, token);
                    items = details.items || [];
                } catch (error) {
                    console.warn('Nu s-au putut încărca articolele pentru NIR', nir.nir_number, error);
                }
            }

            if (items && items.length) {
                items.forEach(item => {
                    const quantity = toNumber(item.quantity ?? item.qtyReceived, 0);
                    const unit = item.unit_of_measure || item.unit || 'buc';
                    const unitPrice = toNumber(item.purchase_price_unit ?? item.priceExVat, 0);
                    let valueExVat = toNumber(item.purchase_price_total ?? item.valueExVat, quantity * unitPrice);
                    let vatRate = toNumber(item.vat_rate ?? item.vatRate ?? defaultVatRate, defaultVatRate);
                    let vatValue = toNumber(item.vat_value ?? item.vatAmount, valueExVat * vatRate / 100);
                    let valueIncVat = toNumber(item.valueIncVat ?? (valueExVat + vatValue), valueExVat + vatValue);

                    rows.push({
                        TipDocument: 'NIR',
                        NumarDocument: nir.nir_number || '',
                        DataDocument: formatDate(nir.document_date),
                        Partener: nir.supplier_name || '',
                        CUI: nir.supplier_cui || '',
                        Factura: nir.invoice_number || '',
                        ContDebit: debitAccount,
                        ContCredit: creditAccount,
                        Gestiune: brand?.gestion || '',
                        Articol: item.product_name || item.name || 'Articol',
                        Cantitate: quantity.toFixed(2),
                        UM: unit,
                        ValoareFaraTVA: valueExVat.toFixed(2),
                        TVA: vatValue.toFixed(2),
                        ValoareCuTVA: valueIncVat.toFixed(2),
                        CotaTVA: vatRate.toFixed(2),
                        Observatii: `NIR ${nir.nir_number || ''}`.trim()
                    });
                });
            } else {
                const totalIncVat = toNumber(nir.total_value ?? nir.totalIncVat ?? 0);
                const vatRate = toNumber(defaultVatRate, defaultVatRate);
                const valueExVat = totalIncVat / (1 + vatRate / 100);
                const vatValue = totalIncVat - valueExVat;

                rows.push({
                    TipDocument: 'NIR',
                    NumarDocument: nir.nir_number || '',
                    DataDocument: formatDate(nir.document_date),
                    Partener: nir.supplier_name || '',
                    CUI: nir.supplier_cui || '',
                    Factura: nir.invoice_number || '',
                    ContDebit: debitAccount,
                    ContCredit: creditAccount,
                    Gestiune: brand?.gestion || '',
                    Articol: 'Total document',
                    Cantitate: '1.00',
                    UM: 'lot',
                    ValoareFaraTVA: valueExVat.toFixed(2),
                    TVA: vatValue.toFixed(2),
                    ValoareCuTVA: totalIncVat.toFixed(2),
                    CotaTVA: vatRate.toFixed(2),
                    Observatii: `NIR ${nir.nir_number || ''}`.trim()
                });
            }
        }

        return rows;
    }

    async function buildSalesRows(options, token) {
        const { startDate, endDate, debitAccount, creditAccount, brand, defaultVatRate = 9 } = options;
        const query = new URLSearchParams({
            format: 'json',
            startDate: startDate || '',
            endDate: endDate || ''
        });
        const response = await fetchJson(`/api/admin/reports/sales-detailed?${query.toString()}`, token);
        const dataRows = Array.isArray(response.data) ? response.data : [];
        const rows = [];

        dataRows.forEach(row => {
            const qty = toNumber(row.quantity, 0);
            const unitPrice = toNumber(row.final_price ?? row.price, 0);
            const totalIncVat = toNumber(qty * unitPrice, 0);
            const vatRate = toNumber(defaultVatRate, defaultVatRate);
            const valueExVat = totalIncVat / (1 + vatRate / 100);
            const vatValue = totalIncVat - valueExVat;

            rows.push({
                TipDocument: 'VANZARE',
                NumarDocument: row.order_id || '',
                DataDocument: formatDate(row.timestamp),
                Partener: row.client_identifier || 'Client final',
                CUI: '',
                Factura: `CMD-${row.order_id || ''}`,
                ContDebit: debitAccount,
                ContCredit: creditAccount,
                Gestiune: brand?.gestion || '',
                Articol: row.product_name || 'Produs',
                Cantitate: qty.toFixed(2),
                UM: 'buc',
                ValoareFaraTVA: valueExVat.toFixed(2),
                TVA: vatValue.toFixed(2),
                ValoareCuTVA: totalIncVat.toFixed(2),
                CotaTVA: vatRate.toFixed(2),
                Observatii: row.table_number ? `Masa ${row.table_number}` : 'POS'
            });
        });

        return rows;
    }

    function validateBrand(brand) {
        if (!brand) {
            throw new Error('Completează datele legale înainte de export.');
        }
        const required = ['unitName', 'cui', 'address', 'gestion'];
        const missing = required.filter(key => !brand[key] || !brand[key].trim());
        if (missing.length) {
            throw new Error(`Lipsesc date obligatorii: ${missing.join(', ')}`);
        }
    }

    async function exportSaga(options = {}) {
        const {
            type,
            startDate,
            endDate,
            debitAccount = '371',
            creditAccount = '401',
            defaultVatRate = 9,
            brand,
            exportedBy = 'admin',
            context = 'admin-advanced',
            authToken
        } = options;

        if (!type) {
            throw new Error('Selectează tipul de export (NIR sau Vânzări).');
        }

        validateBrand(brand);

        const token = resolveAuthToken(authToken);
        let rows = [];

        if (type === 'nir') {
            rows = await buildNirRows({ startDate, endDate, debitAccount, creditAccount, brand, defaultVatRate }, token);
        } else if (type === 'sales') {
            rows = await buildSalesRows({ startDate, endDate, debitAccount, creditAccount, brand, defaultVatRate }, token);
        } else {
            throw new Error('Tip export necunoscut.');
        }

        if (!rows.length) {
            throw new Error('Nu există date pentru perioada selectată.');
        }

        const filename = `saga-${type}-${startDate || 'start'}-${endDate || 'end'}.csv`;
        const csv = rowsToCsv(rows);
        downloadCsv(csv, filename);

        recordAudit({
            timestamp: new Date().toISOString(),
            type,
            startDate: startDate || '',
            endDate: endDate || '',
            rows: rows.length,
            debitAccount,
            creditAccount,
            exportedBy,
            context,
            filename
        });

        return { rowsCount: rows.length, filename };
    }

    window.SagaExporter = {
        exportSaga,
        getAuditHistory
    };
})(window);

