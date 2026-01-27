-- ═══════════════════════════════════════════════════════════════════════════
-- TIPIZATE LEGALE - Schema conform OMFP 2634/2015 și Cod Fiscal Art. 319
-- ═══════════════════════════════════════════════════════════════════════════

-- ============================================================================
-- 1. NIR - Notă de Intrare-Recepție (conform OMFP 2634/2015, Anexa 2)
-- ============================================================================
-- Câmpuri obligatorii:
-- - Număr și dată document
-- - Date furnizor complete (denumire, CUI, RegCom, adresă)
-- - Număr și dată document însoțitor (factură/aviz)
-- - Gestiunea primitoare
-- - Comisia de recepție (minim 2 membri)
-- - Articole cu: cod, denumire, UM, cantitate facturată, cantitate recepționată
-- - Preț unitar, valoare fără TVA, TVA, valoare cu TVA

ALTER TABLE nir_documents ADD COLUMN supplier_cui TEXT;
ALTER TABLE nir_documents ADD COLUMN supplier_reg_com TEXT;
ALTER TABLE nir_documents ADD COLUMN supplier_address TEXT;
ALTER TABLE nir_documents ADD COLUMN supplier_bank TEXT;
ALTER TABLE nir_documents ADD COLUMN supplier_iban TEXT;
ALTER TABLE nir_documents ADD COLUMN accompanying_doc_type TEXT; -- 'factura', 'aviz'
ALTER TABLE nir_documents ADD COLUMN accompanying_doc_number TEXT;
ALTER TABLE nir_documents ADD COLUMN accompanying_doc_date TEXT;
ALTER TABLE nir_documents ADD COLUMN receiving_warehouse TEXT;
ALTER TABLE nir_documents ADD COLUMN receiving_warehouse_id INTEGER;
ALTER TABLE nir_documents ADD COLUMN commission_president TEXT;
ALTER TABLE nir_documents ADD COLUMN commission_member1 TEXT;
ALTER TABLE nir_documents ADD COLUMN commission_member2 TEXT;
ALTER TABLE nir_documents ADD COLUMN observations TEXT;
ALTER TABLE nir_documents ADD COLUMN company_name TEXT;
ALTER TABLE nir_documents ADD COLUMN company_cui TEXT;
ALTER TABLE nir_documents ADD COLUMN company_reg_com TEXT;
ALTER TABLE nir_documents ADD COLUMN company_address TEXT;

-- Articole NIR - câmpuri suplimentare
ALTER TABLE nir_items ADD COLUMN product_code TEXT;
ALTER TABLE nir_items ADD COLUMN product_name TEXT;
ALTER TABLE nir_items ADD COLUMN quantity_invoiced REAL;
ALTER TABLE nir_items ADD COLUMN quantity_received REAL;
ALTER TABLE nir_items ADD COLUMN difference_quantity REAL DEFAULT 0;
ALTER TABLE nir_items ADD COLUMN difference_value REAL DEFAULT 0;

-- ============================================================================
-- 2. FACTURA - conform Cod Fiscal Art. 319 și e-Factura CIUS-RO
-- ============================================================================
-- Câmpuri obligatorii furnizor:
-- - Denumire, CUI, Nr. Reg. Comerț, Adresă completă
-- - Cont bancar IBAN, Banca
-- - Capital social (pentru SRL)
-- Câmpuri obligatorii client:
-- - Denumire, CUI, Nr. Reg. Comerț, Adresă completă
-- Câmpuri document:
-- - Serie și număr
-- - Data emiterii, data scadenței
-- - Data livrării (dacă diferită)
-- - Mod de plată, monedă

ALTER TABLE invoices ADD COLUMN supplier_name TEXT;
ALTER TABLE invoices ADD COLUMN supplier_cui TEXT;
ALTER TABLE invoices ADD COLUMN supplier_reg_com TEXT;
ALTER TABLE invoices ADD COLUMN supplier_address TEXT;
ALTER TABLE invoices ADD COLUMN supplier_city TEXT;
ALTER TABLE invoices ADD COLUMN supplier_county TEXT;
ALTER TABLE invoices ADD COLUMN supplier_country TEXT DEFAULT 'RO';
ALTER TABLE invoices ADD COLUMN supplier_bank TEXT;
ALTER TABLE invoices ADD COLUMN supplier_iban TEXT;
ALTER TABLE invoices ADD COLUMN supplier_capital TEXT;
ALTER TABLE invoices ADD COLUMN supplier_phone TEXT;
ALTER TABLE invoices ADD COLUMN supplier_email TEXT;

ALTER TABLE invoices ADD COLUMN client_address TEXT;
ALTER TABLE invoices ADD COLUMN client_city TEXT;
ALTER TABLE invoices ADD COLUMN client_county TEXT;
ALTER TABLE invoices ADD COLUMN client_country TEXT DEFAULT 'RO';
ALTER TABLE invoices ADD COLUMN client_bank TEXT;
ALTER TABLE invoices ADD COLUMN client_iban TEXT;
ALTER TABLE invoices ADD COLUMN client_phone TEXT;
ALTER TABLE invoices ADD COLUMN client_email TEXT;

ALTER TABLE invoices ADD COLUMN due_date TEXT;
ALTER TABLE invoices ADD COLUMN delivery_date TEXT;
ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT 'Transfer bancar';
ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'RON';
ALTER TABLE invoices ADD COLUMN exchange_rate REAL DEFAULT 1;
ALTER TABLE invoices ADD COLUMN notes TEXT;
ALTER TABLE invoices ADD COLUMN delegate_name TEXT;
ALTER TABLE invoices ADD COLUMN delegate_id_series TEXT;
ALTER TABLE invoices ADD COLUMN delegate_id_number TEXT;
ALTER TABLE invoices ADD COLUMN transport_means TEXT;

-- Tabela pentru linii factură
CREATE TABLE IF NOT EXISTS invoice_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    product_code TEXT,
    product_name TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT DEFAULT 'buc',
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 21,
    vat_amount REAL NOT NULL,
    line_total_without_vat REAL NOT NULL,
    line_total_with_vat REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. CHITANȚĂ - conform OMFP 2634/2015
-- ============================================================================
-- Câmpuri obligatorii:
-- - Număr și dată
-- - "Am primit de la" (nume plătitor)
-- - Suma în cifre și litere
-- - Reprezentând (scopul plății)
-- - Casier (nume, semnătură)

CREATE TABLE IF NOT EXISTS receipts_legal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_series TEXT NOT NULL DEFAULT 'CH',
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    
    -- Beneficiar (firma care primește banii)
    company_name TEXT NOT NULL,
    company_cui TEXT NOT NULL,
    company_reg_com TEXT,
    company_address TEXT,
    
    -- Plătitor
    payer_name TEXT NOT NULL,
    payer_cui TEXT,
    payer_address TEXT,
    
    -- Suma
    amount REAL NOT NULL,
    amount_in_words TEXT NOT NULL,
    currency TEXT DEFAULT 'RON',
    
    -- Detalii
    purpose TEXT NOT NULL, -- "Reprezentând"
    payment_method TEXT DEFAULT 'Numerar', -- Numerar, Card
    
    -- Document referință
    reference_doc_type TEXT, -- 'factura', 'aviz', 'contract'
    reference_doc_number TEXT,
    reference_doc_date TEXT,
    
    -- Casier
    cashier_name TEXT NOT NULL,
    cashier_signature_confirmed INTEGER DEFAULT 0,
    
    -- Metadata
    order_id INTEGER,
    invoice_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- ============================================================================
-- 4. AVIZ DE ÎNSOȚIRE A MĂRFII - conform OMFP 2634/2015
-- ============================================================================
-- Câmpuri obligatorii:
-- - Număr și dată
-- - Furnizor complet
-- - Cumpărător/Destinatar complet
-- - Date transport (mijloc, nr. înmatriculare)
-- - Delegat (nume, act identitate)
-- - Articole cu: denumire, UM, cantitate

CREATE TABLE IF NOT EXISTS delivery_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series TEXT NOT NULL DEFAULT 'AVZ',
    number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    
    -- Furnizor (expeditor)
    sender_name TEXT NOT NULL,
    sender_cui TEXT NOT NULL,
    sender_reg_com TEXT,
    sender_address TEXT NOT NULL,
    sender_city TEXT,
    sender_county TEXT,
    sender_bank TEXT,
    sender_iban TEXT,
    
    -- Cumpărător/Destinatar
    recipient_name TEXT NOT NULL,
    recipient_cui TEXT,
    recipient_reg_com TEXT,
    recipient_address TEXT NOT NULL,
    recipient_city TEXT,
    recipient_county TEXT,
    
    -- Punct de livrare (dacă diferit de adresa destinatar)
    delivery_address TEXT,
    delivery_city TEXT,
    delivery_county TEXT,
    
    -- Transport
    transport_means TEXT, -- 'Auto', 'Feroviar', 'Naval', 'Aerian'
    vehicle_number TEXT,
    driver_name TEXT,
    
    -- Delegat
    delegate_name TEXT,
    delegate_id_type TEXT, -- 'CI', 'Pasaport'
    delegate_id_series TEXT,
    delegate_id_number TEXT,
    delegate_issued_by TEXT,
    
    -- Referință factură (dacă este cazul)
    invoice_series TEXT,
    invoice_number TEXT,
    invoice_date TEXT,
    
    -- Totaluri
    total_quantity REAL DEFAULT 0,
    total_value REAL DEFAULT 0,
    currency TEXT DEFAULT 'RON',
    
    -- Note
    observations TEXT,
    
    -- Semnături
    sender_signature_name TEXT,
    sender_signature_confirmed INTEGER DEFAULT 0,
    recipient_signature_name TEXT,
    recipient_signature_confirmed INTEGER DEFAULT 0,
    
    -- Metadata
    status TEXT DEFAULT 'emis', -- emis, livrat, anulat
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    UNIQUE(series, number)
);

-- Linii aviz
CREATE TABLE IF NOT EXISTS delivery_note_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_note_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    product_code TEXT,
    product_name TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT DEFAULT 'buc',
    quantity REAL NOT NULL,
    unit_price REAL, -- opțional pe aviz
    line_value REAL, -- opțional pe aviz
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. BON DE CONSUM - conform OMFP 2634/2015
-- ============================================================================
CREATE TABLE IF NOT EXISTS consumption_vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series TEXT NOT NULL DEFAULT 'BC',
    number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    
    -- Firma
    company_name TEXT NOT NULL,
    company_cui TEXT NOT NULL,
    
    -- Gestiune predătoare
    source_warehouse TEXT NOT NULL,
    source_warehouse_id INTEGER,
    
    -- Destinație (secție, departament)
    destination TEXT NOT NULL,
    destination_id INTEGER,
    
    -- Totaluri
    total_value REAL DEFAULT 0,
    
    -- Aprobări
    requested_by TEXT,
    approved_by TEXT,
    issued_by TEXT,
    received_by TEXT,
    
    -- Metadata
    observations TEXT,
    status TEXT DEFAULT 'emis', -- emis, aprobat, livrat, anulat
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    UNIQUE(series, number)
);

-- Linii bon de consum
CREATE TABLE IF NOT EXISTS consumption_voucher_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    product_code TEXT,
    product_name TEXT NOT NULL,
    unit_of_measure TEXT DEFAULT 'buc',
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    line_value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES consumption_vouchers(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. REGISTRU DE CASĂ - conform OMFP 2634/2015
-- ============================================================================
CREATE TABLE IF NOT EXISTS cash_register_legal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    register_date DATE NOT NULL,
    
    -- Firma
    company_name TEXT NOT NULL,
    company_cui TEXT NOT NULL,
    
    -- Sold inițial
    opening_balance REAL NOT NULL DEFAULT 0,
    
    -- Totaluri zilnice
    total_receipts REAL DEFAULT 0, -- Total încasări
    total_payments REAL DEFAULT 0, -- Total plăți
    
    -- Sold final
    closing_balance REAL NOT NULL,
    
    -- Casier
    cashier_name TEXT NOT NULL,
    cashier_signature_confirmed INTEGER DEFAULT 0,
    
    -- Verificat de
    verified_by TEXT,
    verified_signature_confirmed INTEGER DEFAULT 0,
    
    -- Metadata
    page_number INTEGER,
    status TEXT DEFAULT 'deschis', -- deschis, închis, verificat
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(register_date, company_cui)
);

-- Operațiuni registru de casă
CREATE TABLE IF NOT EXISTS cash_register_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    register_id INTEGER NOT NULL,
    entry_number INTEGER NOT NULL, -- Număr curent pe pagină
    
    -- Document justificativ
    document_type TEXT NOT NULL, -- 'chitanță', 'factură', 'bon fiscal', 'dispoziție plată'
    document_series TEXT,
    document_number TEXT NOT NULL,
    document_date DATE NOT NULL,
    
    -- Descriere
    description TEXT NOT NULL,
    partner_name TEXT, -- De la cine / Către cine
    
    -- Sumă
    amount REAL NOT NULL,
    entry_type TEXT NOT NULL, -- 'receipt' (încasare) sau 'payment' (plată)
    
    -- Referință
    reference_type TEXT, -- 'order', 'invoice', 'supplier_payment'
    reference_id INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_id) REFERENCES cash_register_legal(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. SECVENȚE NUMEROTARE (pentru toate tipizatele)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_type TEXT NOT NULL, -- 'NIR', 'FACTURA', 'CHITANTA', 'AVIZ', 'BON_CONSUM'
    series TEXT NOT NULL,
    current_number INTEGER NOT NULL DEFAULT 0,
    year INTEGER NOT NULL,
    prefix TEXT,
    suffix TEXT,
    format TEXT DEFAULT '{SERIES}-{YEAR}-{NUMBER:6}', -- Format cu padding
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_type, series, year)
);

-- Inserare secvențe inițiale pentru anul curent
INSERT OR IGNORE INTO document_sequences (document_type, series, current_number, year) VALUES
    ('NIR', 'NIR', 0, strftime('%Y', 'now')),
    ('FACTURA', 'F', 0, strftime('%Y', 'now')),
    ('CHITANTA', 'CH', 0, strftime('%Y', 'now')),
    ('AVIZ', 'AVZ', 0, strftime('%Y', 'now')),
    ('BON_CONSUM', 'BC', 0, strftime('%Y', 'now'));

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_delivery_note_lines_note ON delivery_note_lines(delivery_note_id);
CREATE INDEX IF NOT EXISTS idx_consumption_voucher_lines_voucher ON consumption_voucher_lines(voucher_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_entries_register ON cash_register_entries(register_id);
CREATE INDEX IF NOT EXISTS idx_receipts_legal_date ON receipts_legal(receipt_date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_date ON delivery_notes(issue_date);

