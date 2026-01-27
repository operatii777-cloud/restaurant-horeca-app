-- ANAF Integration - Update Schema Existentă

-- 1. CREATE anaf_config (nu există)
CREATE TABLE IF NOT EXISTS anaf_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    cui TEXT NOT NULL,
    reg_com TEXT,
    fiscal_code TEXT,
    address_street TEXT,
    address_city TEXT,
    address_county TEXT,
    address_country TEXT DEFAULT 'România',
    phone TEXT,
    email TEXT,
    iban TEXT,
    bank_name TEXT,
    anaf_enabled INTEGER DEFAULT 0,
    anaf_test_mode INTEGER DEFAULT 1,
    anaf_client_id TEXT,
    anaf_client_secret TEXT,
    anaf_certificate_path TEXT,
    anaf_certificate_password TEXT,
    invoice_series TEXT DEFAULT 'FACT',
    invoice_current_number INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Insert configurare default
INSERT OR IGNORE INTO anaf_config (id, company_name, cui, anaf_enabled, anaf_test_mode) VALUES
(1, 'Restaurant Demo (Sandbox)', 'RO00000000', 0, 1);

