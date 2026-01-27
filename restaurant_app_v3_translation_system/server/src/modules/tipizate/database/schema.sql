-- PHASE S4.2 - Tipizate Enterprise Database Schema

-- Table: tipizate_documents
CREATE TABLE IF NOT EXISTS tipizate_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,                    -- DocumentType enum (NIR, BON_CONSUM, etc.)
  status TEXT NOT NULL DEFAULT 'DRAFT',  -- DocumentStatus enum (DRAFT, VALIDATED, SIGNED, LOCKED, ARCHIVED)
  series TEXT NOT NULL,                  -- Serie document (ex: "NIR")
  number TEXT NOT NULL,                  -- Număr document (ex: "001")
  location_id INTEGER NOT NULL,          -- ID locație
  location_name TEXT NOT NULL,           -- Nume locație
  warehouse_id INTEGER,                  -- ID depozit (opțional)
  date TEXT NOT NULL,                    -- Data document (ISO 8601)
  
  -- Header fiscal (JSON)
  fiscal_header TEXT NOT NULL,           -- JSON: companyName, CUI, address, fiscalCode, etc.
  
  -- Linii document (JSON)
  lines TEXT NOT NULL,                   -- JSON: DocumentLine[]
  
  -- Totaluri (JSON)
  totals TEXT NOT NULL,                  -- JSON: totals object (subtotal, vatAmount, total, vatBreakdown)
  
  -- Document-specific data (JSON)
  document_data TEXT,                    -- JSON: specific fiecare tip (supplierId pentru NIR, etc.)
  
  -- Semnături (JSON)
  signatures TEXT,                       -- JSON: createdBy, validatedBy, signedBy, etc.
  
  -- Metadata
  created_by_user_id INTEGER NOT NULL,
  created_by_name TEXT,
  validated_by_user_id INTEGER,
  validated_by_name TEXT,
  signed_by_user_id INTEGER,
  signed_by_name TEXT,
  signed_at TEXT,
  locked_by_user_id INTEGER,
  locked_by_name TEXT,
  locked_at TEXT,
  archived_at TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  
  -- PHASE S8.3 - UBL XML storage
  ubl_xml TEXT,                        -- UBL XML content for e-Factura export
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Indexes
  UNIQUE(type, series, number, location_id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tipizate_type ON tipizate_documents(type);
CREATE INDEX IF NOT EXISTS idx_tipizate_status ON tipizate_documents(status);
CREATE INDEX IF NOT EXISTS idx_tipizate_date ON tipizate_documents(date);
CREATE INDEX IF NOT EXISTS idx_tipizate_location ON tipizate_documents(location_id);
CREATE INDEX IF NOT EXISTS idx_tipizate_warehouse ON tipizate_documents(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_tipizate_number ON tipizate_documents(number);

-- Table: tipizate_archive
CREATE TABLE IF NOT EXISTS tipizate_archive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,         -- FK către tipizate_documents
  archived_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_by INTEGER NOT NULL,         -- User ID
  archived_by_name TEXT,
  archive_reason TEXT,                   -- Motiv arhivare
  pdf_path TEXT,                         -- Path către PDF arhivat (opțional)
  metadata TEXT,                         -- JSON: metadata arhivare
  
  FOREIGN KEY (document_id) REFERENCES tipizate_documents(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tipizate_archive_document ON tipizate_archive(document_id);
CREATE INDEX IF NOT EXISTS idx_tipizate_archive_date ON tipizate_archive(archived_at);

