# Database Path Refactoring Guide

## Problem
The codebase has 50+ files with hardcoded database paths like:
```javascript
const dbPath = path.join(__dirname, 'restaurant.db');
const dbPath = path.join(__dirname, '..', 'restaurant.db');
const DB_PATH = path.join(__dirname, '../restaurant.db');
```

This creates several issues:
1. **Inconsistency**: Different files use different relative paths
2. **Maintenance**: Changes to database location require updating many files
3. **Errors**: Wrong relative paths can cause runtime errors
4. **Testing**: Hard to mock or override for testing

## Solution
Use the centralized configuration: `config/db-constants.js`

### Correct Pattern
```javascript
const { DB_PATH } = require('../config/db-constants');
// or for deeper nesting:
const { DB_PATH } = require('../../config/db-constants');
```

## Files That Need Updates

### High Priority (Active Routes & Controllers)
1. `controllers/menuPdfConfigController.js`
2. `utils/performance-optimizer.js`
3. `services/adaptiveWeightCalculator.js`
4. `services/menuDataService.js`
5. `config/database.js` (fallback pattern)

### Medium Priority (Migrations)
6. `migrations/*.js` (8 files)
7. `src/migrations/iso-compliance.migration.js`
8. `src/modules/admin/controllers/admin-backup.controller.js`

### Low Priority (Scripts & Utilities)
9. All files in `scripts/` directories (20+ files)
10. Standalone utility scripts in root (15+ files)
11. `retete/` directory scripts (3 files)
12. `fise-tehnice-produs/` scripts (2 files)

## Migration Steps

### Step 1: Import the constant
```javascript
// Add at top of file
const { DB_PATH } = require('../config/db-constants');
// Adjust '../' based on file location relative to server/
```

### Step 2: Remove old path definition
```javascript
// REMOVE THIS:
const path = require('path');  // If only used for DB path
const dbPath = path.join(__dirname, 'restaurant.db');
const DB_PATH = path.join(__dirname, '..', 'restaurant.db');
```

### Step 3: Use DB_PATH
```javascript
// USE THIS:
const db = new sqlite3.Database(DB_PATH);
```

### Step 4: Update references
Search for variable name and update all usages:
- `dbPath` → `DB_PATH`
- Keep consistent casing

## Examples

### Before:
```javascript
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);
```

### After:
```javascript
const { DB_PATH } = require('../config/db-constants');
const db = new sqlite3.Database(DB_PATH);
```

### Before (Fallback pattern):
```javascript
const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../restaurant.db');
    return new sqlite3.Database(dbPath);
  }
};
```

### After:
```javascript
const { DB_PATH } = require('../config/db-constants');

const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(DB_PATH);
  }
};
```

## Testing After Changes

1. Verify file can find config: `node <file>.js`
2. Check if database connection works
3. Run any existing tests for that module

## Automation Helper

To find all files needing updates:
```bash
cd server
grep -r "path.join(__dirname.*restaurant.db" --include="*.js" . | grep -v node_modules | grep -v config/db-constants
```

## Progress Tracking

- [x] config/db-constants.js created
- [x] routes/smart-restock.js
- [x] routes/competitor-tracking.js  
- [x] routes/catalog-produse.routes.js
- [x] routes/suppliers.js
- [ ] controllers/menuPdfConfigController.js
- [ ] utils/performance-optimizer.js
- [ ] services/* (2 files)
- [ ] migrations/* (8 files)
- [ ] scripts/* (40+ files)
- [ ] Root utilities (15+ files)

## Benefits After Completion

1. ✅ Single source of truth for database path
2. ✅ Easier to change database location
3. ✅ Consistent path resolution
4. ✅ Easier testing (can mock DB_PATH)
5. ✅ Cleaner code (less boilerplate)
