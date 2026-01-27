-- ============================================================
-- ETAPA 3: ANAF INTEGRATION - Node.js Implementation
-- Data: 03 Noiembrie 2025
-- Versiune: v3.0.4
-- ============================================================

-- ============================================================
-- 1. BONURI FISCALE (Fiscal Receipts)
-- ============================================================

CREATE TABLE IF NOT EXISTS fiscal_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Referință
    receipt_number TEXT UNIQUE NOT NULL,  -- Ex: "BON-2025-001234"
    order_id INTEGER,                     -- Link către comandă (dacă există)
    
    -- Financiar
    total_amount REAL NOT NULL,
    vat_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash',   -- cash, card, voucher, mixed
    
    -- Defalcare TVA
    vat_21 REAL DEFAULT 0,                -- Vânzări cu TVA 21%
    vat_11 REAL DEFAULT 0,                -- Vânzări cu TVA 11%
    vat_0 REAL DEFAULT 0,                 -- Vânzări fără TVA
    
    -- Personal
    waiter_id TEXT,                       -- Ospătar (dacă există)
    cashier_id TEXT,                      -- Casier care a emis bonul
    
    -- Status
    is_fiscal INTEGER DEFAULT 1,          -- 1 = bon fiscal, 0 = non-fiscal
    is_cancelled INTEGER DEFAULT 0,       -- 1 = anulat
    cancel_reason TEXT,
    
    -- ANAF Integration
    transmitted_to_anaf INTEGER DEFAULT 0, -- 1 = transmis la ANAF
    anaf_upload_id TEXT,                   -- ID transmisie ANAF
    anaf_status TEXT,                      -- PENDING, ACCEPTED, REJECTED
    transmitted_at TEXT,
    
    -- Metadata
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_date ON fiscal_receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_order ON fiscal_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_anaf_status ON fiscal_receipts(anaf_status);

-- ============================================================
-- 2. LOG TRANSMISII ANAF
-- ============================================================

CREATE TABLE IF NOT EXISTS anaf_transmission_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Referință document
    document_type TEXT NOT NULL,          -- 'receipt', 'invoice', 'report_z', 'report_monthly'
    document_id INTEGER,                  -- ID fiscal_receipts sau alt document
    document_number TEXT,                 -- Nr. document (pentru identificare)
    
    -- Transmisie
    transmission_type TEXT NOT NULL,      -- 'send', 'check_status', 'retransmit'
    upload_id TEXT,                       -- ID ANAF (pentru tracking)
    
    -- Request/Response
    request_xml TEXT,                     -- XML trimis
    response_xml TEXT,                    -- Răspuns ANAF
    http_status INTEGER,                  -- 200, 400, 500, etc.
    
    -- Status
    status TEXT NOT NULL,                 -- 'PENDING', 'ACCEPTED', 'REJECTED', 'ERROR'
    message TEXT,                         -- Mesaj de la ANAF
    error_details TEXT,                   -- Detalii eroare (dacă există)
    
    -- Metadata
    transmission_date TEXT DEFAULT (datetime('now', 'localtime')),
    processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_anaf_log_document ON anaf_transmission_log(document_id, document_type);
CREATE INDEX IF NOT EXISTS idx_anaf_log_upload ON anaf_transmission_log(upload_id);
CREATE INDEX IF NOT EXISTS idx_anaf_log_date ON anaf_transmission_log(transmission_date);

-- ============================================================
-- 3. CONFIGURARE FISCALĂ ANAF
-- ============================================================

CREATE TABLE IF NOT EXISTS anaf_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Date Firmă (pentru XML)
    company_name TEXT NOT NULL,
    cui TEXT NOT NULL,                    -- Ex: RO12345678
    reg_com TEXT,                         -- J40/1234/2020
    fiscal_code TEXT,                     -- Cod fiscal (poate fi diferit de CUI)
    
    -- Adresă Firmă
    address_street TEXT,
    address_city TEXT,
    address_county TEXT,
    address_country TEXT DEFAULT 'România',
    
    -- Contact
    phone TEXT,
    email TEXT,
    
    -- Cont Bancar
    iban TEXT,
    bank_name TEXT,
    
    -- Configurare ANAF API (pentru producție - DEZACTIVAT în sandbox)
    anaf_enabled INTEGER DEFAULT 0,       -- 0 = dezactivat (sandbox), 1 = activat (producție)
    anaf_test_mode INTEGER DEFAULT 1,     -- 1 = test mode, 0 = producție
    anaf_client_id TEXT,                  -- OAuth2 client ID
    anaf_client_secret TEXT,              -- OAuth2 client secret
    anaf_certificate_path TEXT,           -- Calea către certificat .pfx
    anaf_certificate_password TEXT,       -- Parola certificat (encrypted!)
    
    -- Serie & Număr Facturi
    invoice_series TEXT DEFAULT 'FACT',   -- Serie factură (ex: FACT, FAC, INV)
    invoice_current_number INTEGER DEFAULT 0, -- Număr curent (auto-increment)
    
    -- Metadata
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Insert configurare default (sandbox mode)
INSERT OR IGNORE INTO anaf_config (id, company_name, cui, anaf_enabled, anaf_test_mode) VALUES
(1, 'Restaurant Demo (Sandbox)', 'RO00000000', 0, 1);

-- ============================================================
-- MIGRARE ETAPA 3 COMPLETATĂ ✅
-- ============================================================

