/**
 * Migration: Create Accounting Tables
 * 
 * Creează tabelele necesare pentru modulul de contabilitate:
 * - accounting_accounts (conturi contabile)
 * - product_accounting_mapping (mapare produse → conturi)
 * - product_accounting_mapping_history (istoric modificări)
 * - bank_accounts (conturi bancare)
 */

const { dbPromise } = require('../database');

async function migrateAccountingTables() {
  const db = await dbPromise;
  
  console.log('🔧 Migrare tabele contabilitate...');
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Tabel accounting_accounts
      db.run(`
        CREATE TABLE IF NOT EXISTS accounting_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_code TEXT NOT NULL UNIQUE,
          account_name TEXT NOT NULL,
          account_type TEXT NOT NULL CHECK(account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
          parent_account_id INTEGER,
          is_active INTEGER DEFAULT 1,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_account_id) REFERENCES accounting_accounts(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei accounting_accounts:', err.message);
          return reject(err);
        }
        console.log('✅ Tabel accounting_accounts creat/verificat');
        
        // Populează cu conturi standard dacă tabela este goală
        db.get('SELECT COUNT(*) as count FROM accounting_accounts', [], async (err, row) => {
          if (err) {
            console.warn('⚠️ Eroare la verificarea conturilor:', err.message);
            return resolve();
          }
          
          if (row.count === 0) {
            console.log('📝 Populez conturi standard...');
            const standardAccounts = [
              { code: '301', name: 'Materii Prime', type: 'asset' },
              { code: '371', name: 'Mărfuri', type: 'asset' },
              { code: '401', name: 'Furnizori', type: 'liability' },
              { code: '411', name: 'Clienți', type: 'asset' },
              { code: '5121', name: 'Conturi la Bănci în Lei', type: 'asset' },
              { code: '5311', name: 'Casa în Lei', type: 'asset' },
              { code: '601', name: 'Cheltuieli cu Materii Prime', type: 'expense' },
              { code: '602', name: 'Consumuri Materii Prime', type: 'expense' },
              { code: '607', name: 'Cheltuieli cu Mărfurile', type: 'expense' },
              { code: '701', name: 'Vânzări Produse', type: 'revenue' },
              { code: '704', name: 'Venituri din Prestări Servicii', type: 'revenue' }
            ];
            
            for (const acc of standardAccounts) {
              await new Promise((res, rej) => {
                db.run(
                  `INSERT INTO accounting_accounts (account_code, account_name, account_type, is_active)
                   VALUES (?, ?, ?, 1)`,
                  [acc.code, acc.name, acc.type],
                  (err) => {
                    if (err && !err.message.includes('UNIQUE constraint')) {
                      console.warn(`⚠️ Eroare la inserarea contului ${acc.code}:`, err.message);
                    }
                    res();
                  }
                );
              });
            }
            console.log('✅ Conturi standard populate');
          }
        });
      });
      
      // 2. Tabel product_accounting_mapping
      db.run(`
        CREATE TABLE IF NOT EXISTS product_accounting_mapping (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ingredient_id INTEGER NOT NULL,
          stock_account_id INTEGER NOT NULL,
          consumption_account_id INTEGER NOT NULL,
          entry_account_id INTEGER,
          cogs_account_id INTEGER,
          sub_account_code TEXT,
          valuation_method TEXT DEFAULT 'weighted_average' CHECK(valuation_method IN ('fifo', 'lifo', 'weighted_average')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
          FOREIGN KEY (stock_account_id) REFERENCES accounting_accounts(id),
          FOREIGN KEY (consumption_account_id) REFERENCES accounting_accounts(id),
          FOREIGN KEY (entry_account_id) REFERENCES accounting_accounts(id),
          FOREIGN KEY (cogs_account_id) REFERENCES accounting_accounts(id),
          UNIQUE(ingredient_id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei product_accounting_mapping:', err.message);
          return reject(err);
        }
        console.log('✅ Tabel product_accounting_mapping creat/verificat');
      });
      
      // 3. Tabel product_accounting_mapping_history
      db.run(`
        CREATE TABLE IF NOT EXISTS product_accounting_mapping_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mapping_id INTEGER NOT NULL,
          ingredient_id INTEGER NOT NULL,
          old_account_code TEXT,
          new_account_code TEXT NOT NULL,
          change_reason TEXT NOT NULL,
          changed_by INTEGER,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (mapping_id) REFERENCES product_accounting_mapping(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei product_accounting_mapping_history:', err.message);
          return reject(err);
        }
        console.log('✅ Tabel product_accounting_mapping_history creat/verificat');
      });
      
      // 4. Tabel bank_accounts
      db.run(`
        CREATE TABLE IF NOT EXISTS bank_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bank_name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          account_holder TEXT,
          iban TEXT,
          swift_code TEXT,
          currency TEXT DEFAULT 'RON',
          account_type TEXT DEFAULT 'current' CHECK(account_type IN ('current', 'savings', 'deposit')),
          is_active INTEGER DEFAULT 1,
          opening_balance REAL DEFAULT 0,
          current_balance REAL DEFAULT 0,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei bank_accounts:', err.message);
          return reject(err);
        }
        console.log('✅ Tabel bank_accounts creat/verificat');
        resolve();
      });
    });
  });
}

if (require.main === module) {
  migrateAccountingTables()
    .then(() => {
      console.log('✅ Migrare completă!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Eroare la migrare:', err);
      process.exit(1);
    });
}

module.exports = migrateAccountingTables;

