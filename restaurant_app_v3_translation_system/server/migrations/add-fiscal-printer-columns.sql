-- Adăugare coloane pentru casă fiscală în anaf_config

ALTER TABLE anaf_config ADD COLUMN fiscal_printer_enabled INTEGER DEFAULT 0;
ALTER TABLE anaf_config ADD COLUMN fiscal_printer_type TEXT DEFAULT 'serial';
ALTER TABLE anaf_config ADD COLUMN fiscal_printer_model TEXT DEFAULT 'datecs';
ALTER TABLE anaf_config ADD COLUMN fiscal_printer_port TEXT DEFAULT 'COM1';
ALTER TABLE anaf_config ADD COLUMN fiscal_printer_host TEXT;
ALTER TABLE anaf_config ADD COLUMN fiscal_printer_tcp_port INTEGER DEFAULT 8000;
ALTER TABLE anaf_config ADD COLUMN fiscal_operator_code TEXT DEFAULT '1';
ALTER TABLE anaf_config ADD COLUMN fiscal_operator_password TEXT DEFAULT '0000';

