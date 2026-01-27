-- ================================================
-- MIGRATION: Employee Scheduling Extended
-- Data: 3 Decembrie 2025
-- Descriere: Sistem complet programare personal cu rotații
-- ================================================

-- ==================== EMPLOYEES (Angajați Detaliat) ====================

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('chef', 'sous_chef', 'cook', 'waiter', 'bartender', 'manager', 'supervisor', 'cleaner', 'driver', 'host', 'dishwasher')),
  phone TEXT,
  email TEXT,
  hourly_rate REAL DEFAULT 0,
  hire_date DATE,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'on_leave', 'terminated')),
  notes TEXT,
  location_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(code);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- ==================== EMPLOYEE SHIFTS (Ture) ====================

CREATE TABLE IF NOT EXISTS employee_shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30, -- minute
  position TEXT, -- Ex: 'Waiter Floor 1', 'Chef Station 2'
  location_id INTEGER DEFAULT 1,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON employee_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON employee_shifts(status);

-- ==================== SHIFT TEMPLATES (Template-uri Ture) ====================

CREATE TABLE IF NOT EXISTS shift_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30,
  position TEXT NOT NULL,
  required_count INTEGER DEFAULT 1, -- Câți angajați sunt necesari
  location_id INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shift_templates_day ON shift_templates(day_of_week);
CREATE INDEX IF NOT EXISTS idx_shift_templates_active ON shift_templates(is_active);

-- ==================== TIME CLOCK (Pontaj) ====================

CREATE TABLE IF NOT EXISTS time_clock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  shift_id INTEGER,
  clock_in DATETIME NOT NULL,
  clock_out DATETIME,
  break_start DATETIME,
  break_end DATETIME,
  total_hours REAL, -- Calculat automat
  overtime_hours REAL DEFAULT 0,
  location_id INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (shift_id) REFERENCES employee_shifts(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_time_clock_employee ON time_clock(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_date ON time_clock(clock_in);

-- ==================== ROTATION RULES (Reguli Rotație) ====================

CREATE TABLE IF NOT EXISTS rotation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  rotation_type TEXT CHECK(rotation_type IN ('weekly', 'biweekly', 'monthly', 'custom')),
  pattern TEXT, -- JSON: {'week1': ['Mon', 'Wed', 'Fri'], 'week2': ['Tue', 'Thu', 'Sat']}
  min_rest_hours INTEGER DEFAULT 12, -- Ore minime între ture
  max_consecutive_days INTEGER DEFAULT 6, -- Zile maxime consecutive
  max_hours_per_week REAL DEFAULT 40,
  location_id INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

-- ==================== EMPLOYEE AVAILABILITY (Disponibilitate) ====================

CREATE TABLE IF NOT EXISTS employee_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
  is_available INTEGER DEFAULT 1,
  preferred_start TIME,
  preferred_end TIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employee_id, day_of_week)
);

-- ==================== LEAVE REQUESTS (Cereri Concediu) ====================

CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  leave_type TEXT CHECK(leave_type IN ('vacation', 'sick', 'personal', 'emergency', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- ==================== POPULARE DATE DEMO ====================

-- Adaugă câțiva angajați demo
INSERT OR IGNORE INTO employees (code, name, role, phone, hourly_rate, hire_date, status) VALUES
  ('EMP-001', 'Ion Popescu', 'chef', '0721234567', 25, DATE('now', '-2 years'), 'active'),
  ('EMP-002', 'Maria Ionescu', 'waiter', '0721234568', 18, DATE('now', '-1 year'), 'active'),
  ('EMP-003', 'Andrei Georgescu', 'bartender', '0721234569', 20, DATE('now', '-6 months'), 'active'),
  ('EMP-004', 'Elena Dumitrescu', 'waiter', '0721234570', 18, DATE('now', '-3 months'), 'active'),
  ('EMP-005', 'Mihai Stanescu', 'cook', '0721234571', 22, DATE('now', '-1 year'), 'active');

-- Template-uri ture standard
INSERT OR IGNORE INTO shift_templates (name, day_of_week, start_time, end_time, position, required_count) VALUES
  ('Dimineață Chef', 1, '08:00', '16:00', 'chef', 1),
  ('Dimineață Chef', 2, '08:00', '16:00', 'chef', 1),
  ('Dimineață Chef', 3, '08:00', '16:00', 'chef', 1),
  ('Dimineață Chef', 4, '08:00', '16:00', 'chef', 1),
  ('Dimineață Chef', 5, '08:00', '16:00', 'chef', 1),
  ('Seară Ospătari', 1, '16:00', '00:00', 'waiter', 2),
  ('Seară Ospătari', 2, '16:00', '00:00', 'waiter', 2),
  ('Seară Ospătari', 3, '16:00', '00:00', 'waiter', 2),
  ('Seară Ospătari', 4, '16:00', '00:00', 'waiter', 2),
  ('Seară Ospătari', 5, '16:00', '00:00', 'waiter', 3),
  ('Seară Ospătari', 6, '16:00', '00:00', 'waiter', 3),
  ('Bar', 5, '18:00', '02:00', 'bartender', 1),
  ('Bar', 6, '18:00', '02:00', 'bartender', 1);

-- Reguli rotație
INSERT OR IGNORE INTO rotation_rules (name, rotation_type, pattern, min_rest_hours, max_consecutive_days) VALUES
  ('Rotație Săptămânală Standard', 'weekly', '{"week1": ["Mon", "Wed", "Fri"], "week2": ["Tue", "Thu", "Sat"]}', 12, 6),
  ('Rotație Weekend', 'weekly', '{"pattern": "alternating_weekends"}', 12, 5);

-- ==================== DONE ====================
-- Employee Scheduling Extended migration completed! 📅

