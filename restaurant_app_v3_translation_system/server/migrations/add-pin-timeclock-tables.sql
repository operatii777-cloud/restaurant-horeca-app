-- =====================================================
-- PIN AUTHENTICATION & TIME CLOCK TABLES
-- Migration for Lightspeed/Toast-style employee login
-- =====================================================

-- Add PIN columns to users table
ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN pin_salt VARCHAR(64);
ALTER TABLE users ADD COLUMN pin_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN pin_locked_until DATETIME;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- Time Clock Table (Employee Shifts)
CREATE TABLE IF NOT EXISTS time_clock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    clock_in DATETIME NOT NULL,
    clock_out DATETIME,
    break_start DATETIME,
    break_end DATETIME,
    total_hours DECIMAL(5,2),
    break_minutes INTEGER DEFAULT 0,
    notes TEXT,
    location_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Shifts Schedule Table
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    role VARCHAR(50),
    position VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
    location_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Login History Table (if not exists)
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_method VARCHAR(20) DEFAULT 'password', -- password, PIN, RFID, biometric
    ip_address VARCHAR(45),
    user_agent TEXT,
    success INTEGER DEFAULT 1,
    failure_reason VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Log Table (if not exists)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Printers Configuration Table
CREATE TABLE IF NOT EXISTS printers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- thermal, kitchen, label, fiscal
    connection_type VARCHAR(50) NOT NULL, -- usb, network, bluetooth, serial
    address VARCHAR(255), -- IP:port, COM port, or USB path
    model VARCHAR(100),
    driver VARCHAR(50) DEFAULT 'escpos', -- escpos, star, epson, fiscal
    paper_width INTEGER DEFAULT 80, -- 58, 80mm
    is_default INTEGER DEFAULT 0,
    is_kitchen INTEGER DEFAULT 0,
    categories TEXT, -- JSON array of menu categories to route
    options TEXT, -- JSON with printer-specific options
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Print Queue Table
CREATE TABLE IF NOT EXISTS print_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    printer_id INTEGER,
    document_type VARCHAR(50), -- receipt, kitchen, label, report
    content TEXT NOT NULL, -- ESC/POS commands or HTML content
    order_id INTEGER,
    priority INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=urgent
    status VARCHAR(20) DEFAULT 'pending', -- pending, printing, printed, failed
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    printed_at DATETIME,
    FOREIGN KEY (printer_id) REFERENCES printers(id)
);

-- System Settings Table (for standby/lock configuration)
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(50),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings for standby/lock
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, category, description)
VALUES 
    ('pos_auto_lock_enabled', 'true', 'boolean', 'security', 'Enable auto-lock on POS terminals'),
    ('pos_auto_lock_timeout', '300', 'number', 'security', 'Auto-lock timeout in seconds (default 5 min)'),
    ('pos_require_pin', 'true', 'boolean', 'security', 'Require PIN for POS login'),
    ('kiosk_idle_timeout', '60', 'number', 'kiosk', 'Kiosk idle timeout in seconds'),
    ('kiosk_attract_mode', 'true', 'boolean', 'kiosk', 'Enable attract mode slideshow'),
    ('manager_override_required', 'true', 'boolean', 'security', 'Require manager override for voids/discounts'),
    ('shift_clock_in_required', 'false', 'boolean', 'employee', 'Require clock-in before taking orders'),
    ('restaurant_logo_url', '/assets/logo.png', 'string', 'branding', 'Restaurant logo URL for lock screen'),
    ('restaurant_name', 'Restaurant App', 'string', 'branding', 'Restaurant name for display');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_clock_employee ON time_clock(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_date ON time_clock(clock_in);
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_date ON login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_print_queue_status ON print_queue(status);
CREATE INDEX IF NOT EXISTS idx_print_queue_printer ON print_queue(printer_id);

