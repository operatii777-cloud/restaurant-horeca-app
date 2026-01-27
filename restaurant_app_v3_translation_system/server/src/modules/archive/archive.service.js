/**
 * Archive Service
 * 
 * Serviciu pentru arhivarea automată a datelor vechi (comenzi, order_items, stock_moves)
 * Implementează strategia Hot/Cold Data Separation pentru scalabilitate
 * 
 * Best Practices din industrie (Toast, Lightspeed, OpenTable):
 * - Separare date operaționale (hot) de date istorice (cold)
 * - Arhivare automată după 90 zile (configurabilă)
 * - Backup extern lunar pentru audit și conformitate
 */

const { dbPromise } = require('../../../database');
const path = require('path');
const fs = require('fs').promises;

// Configurare
const ARCHIVE_RETENTION_DAYS = 90; // Comenzi mai vechi de 90 zile se arhivează
const ARCHIVE_BATCH_SIZE = 1000; // Număr de comenzi procesate per batch

/**
 * Arhivează comenzile vechi în tabela orders_archive
 * @param {number} daysOld - Număr de zile în urmă (default: ARCHIVE_RETENTION_DAYS)
 * @returns {Promise<{archived: number, errors: number}>}
 */
async function archiveOldOrders(daysOld = ARCHIVE_RETENTION_DAYS) {
  const db = await dbPromise;
  let archived = 0;
  let errors = 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    console.log(`📦 Încep arhivarea comenzilor mai vechi de ${daysOld} zile (înainte de ${cutoffDateStr})...`);

    // 1. Identifică comenzile de arhivat (doar cele completate și plătite)
    const ordersToArchive = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM orders 
         WHERE timestamp < ? 
         AND status IN ('completed', 'delivered', 'cancelled')
         AND is_paid = 1
         ORDER BY timestamp ASC
         LIMIT ?`,
        [cutoffDateStr, ARCHIVE_BATCH_SIZE],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (ordersToArchive.length === 0) {
      console.log('✅ Nu există comenzi de arhivat');
      return { archived: 0, errors: 0 };
    }

    console.log(`📋 Găsite ${ordersToArchive.length} comenzi de arhivat`);

    // 2. Procesează fiecare comandă
    for (const order of ordersToArchive) {
      try {
        await new Promise((resolve, reject) => {
          // 2.1. Mută comanda în orders_archive
          db.run(
            `INSERT INTO orders_archive (
              id, type, isTogether, items, status, timestamp, completed_timestamp,
              delivered_timestamp, cancelled_timestamp, cancelled_reason,
              table_number, client_identifier, is_paid, paid_timestamp,
              food_notes, drink_notes, general_notes, total, location_id,
              friendsride_order_id, friendsride_restaurant_id, delivery_pickup_code,
              delivery_pickup_code_verified, delivery_pickup_code_verified_at,
              friendsride_webhook_url, delivery_address, payment_method,
              customer_phone, customer_name, split_bill, archived_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              order.id, order.type, order.isTogether, order.items, order.status,
              order.timestamp, order.completed_timestamp, order.delivered_timestamp,
              order.cancelled_timestamp, order.cancelled_reason, order.table_number,
              order.client_identifier, order.is_paid, order.paid_timestamp,
              order.food_notes, order.drink_notes, order.general_notes, order.total,
              order.location_id, order.friendsride_order_id, order.friendsride_restaurant_id,
              order.delivery_pickup_code, order.delivery_pickup_code_verified,
              order.delivery_pickup_code_verified_at, order.friendsride_webhook_url,
              order.delivery_address, order.payment_method, order.customer_phone,
              order.customer_name, order.split_bill
            ],
            (err) => {
              if (err) {
                // Dacă comanda există deja în arhivă, ignoră eroarea
                if (err.message.includes('UNIQUE constraint')) {
                  console.log(`⚠️ Comanda ${order.id} există deja în arhivă`);
                  resolve();
                } else {
                  reject(err);
                }
              } else {
                // 2.2. Mută order_items asociate (dacă există tabela)
                db.all(
                  `SELECT * FROM order_items WHERE order_id = ?`,
                  [order.id],
                  async (err, items) => {
                    if (err) {
                      console.warn(`⚠️ Eroare la citirea order_items pentru comanda ${order.id}:`, err.message);
                      resolve();
                    } else if (items && items.length > 0) {
                      // Mută order_items în arhivă (dacă tabela există)
                      // Notă: Trebuie să existe tabela order_items_archive
                      for (const item of items) {
                        await new Promise((resolveItem, rejectItem) => {
                          db.run(
                            `INSERT OR IGNORE INTO order_items_archive (
                              id, order_id, product_id, product_name, quantity, price, notes, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                              item.id, item.order_id, item.product_id, item.product_name,
                              item.quantity, item.price, item.notes, item.created_at
                            ],
                            (err) => {
                              if (err && !err.message.includes('UNIQUE constraint')) {
                                rejectItem(err);
                              } else {
                                resolveItem();
                              }
                            }
                          );
                        });
                      }
                      resolve();
                    } else {
                      resolve();
                    }
                  }
                );
              }
            }
          );
        });

        // 2.3. Șterge comanda din tabela operațională (doar dacă a fost arhivată cu succes)
        await new Promise((resolve, reject) => {
          db.run(
            `DELETE FROM orders WHERE id = ?`,
            [order.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        // 2.4. Șterge order_items din tabela operațională
        await new Promise((resolve, reject) => {
          db.run(
            `DELETE FROM order_items WHERE order_id = ?`,
            [order.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        archived++;
        if (archived % 100 === 0) {
          console.log(`📦 Arhivate ${archived} comenzi...`);
        }
      } catch (error) {
        console.error(`❌ Eroare la arhivarea comenzii ${order.id}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Arhivare finalizată: ${archived} comenzi arhivate, ${errors} erori`);
    return { archived, errors };
  } catch (error) {
    console.error('❌ Eroare la arhivarea comenzilor:', error);
    throw error;
  }
}

/**
 * Obține statistici despre arhivă
 * @returns {Promise<{total: number, size: number, oldest: string, newest: string}>}
 */
async function getArchiveStats() {
  const db = await dbPromise;

  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total,
          MIN(timestamp) as oldest,
          MAX(timestamp) as newest
         FROM orders_archive`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || { total: 0, oldest: null, newest: null });
        }
      );
    });

    // Calculează dimensiunea aproximativă (în MB)
    const dbPath = path.join(__dirname, '../../../database.sqlite');
    let size = 0;
    try {
      const stats = await fs.stat(dbPath);
      size = stats.size / (1024 * 1024); // Convert to MB
    } catch (error) {
      // Ignoră eroarea dacă fișierul nu există
    }

    return {
      total: stats.total || 0,
      size: Math.round(size * 100) / 100, // 2 decimal places
      oldest: stats.oldest || null,
      newest: stats.newest || null
    };
  } catch (error) {
    console.error('❌ Eroare la obținerea statisticilor arhivei:', error);
    return {
      total: 0,
      size: 0,
      oldest: null,
      newest: null
    };
  }
}

/**
 * Creează backup extern al arhivei (lunar)
 * @param {string} outputPath - Calea pentru fișierul de backup
 * @returns {Promise<string>} - Calea fișierului de backup creat
 */
async function createArchiveBackup(outputPath) {
  const db = await dbPromise;
  
  // Pentru SQLite, backup-ul se face prin copierea fișierului
  // sau prin export SQL
  // Implementare simplă: copiere fișier
  
  const dbPath = path.join(__dirname, '../../../database.sqlite');
  const backupPath = outputPath || path.join(
    __dirname,
    '../../../backups',
    `archive-${new Date().toISOString().split('T')[0]}.sqlite`
  );

  try {
    // Creează directorul backups dacă nu există
    const backupDir = path.dirname(backupPath);
    await fs.mkdir(backupDir, { recursive: true });

    // Copiază fișierul bazei de date
    await fs.copyFile(dbPath, backupPath);
    
    console.log(`✅ Backup creat: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Eroare la crearea backup-ului:', error);
    throw error;
  }
}

module.exports = {
  archiveOldOrders,
  getArchiveStats,
  createArchiveBackup,
  ARCHIVE_RETENTION_DAYS
};

