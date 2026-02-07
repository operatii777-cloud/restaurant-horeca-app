/**
 * Split Bill Service
 * 
 * Serviciu complet pentru gestionarea Split Bill conform standardelor HoReCa
 * - Tracking plăți per grup
 * - Validare completare
 * - Calcul totaluri per grup
 */

const { dbPromise } = require('../../../database');

class SplitBillService {
  /**
   * Validează structura split bill
   * @param {Object} splitBillData - Structura split bill
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateSplitBillStructure(splitBillData) {
    if (!splitBillData || typeof splitBillData !== 'object') {
      return { valid: false, error: 'Split bill data is required' };
    }

    if (!splitBillData.groups || !Array.isArray(splitBillData.groups)) {
      return { valid: false, error: 'Split bill must have groups array' };
    }

    if (splitBillData.groups.length < 2) {
      return { valid: false, error: 'Split bill must have at least 2 groups' };
    }

    // Validează fiecare grup
    for (const group of splitBillData.groups) {
      if (!group.id || !group.name) {
        return { valid: false, error: 'Each group must have id and name' };
      }
      if (!Array.isArray(group.items)) {
        return { valid: false, error: 'Each group must have items array' };
      }
    }

    return { valid: true };
  }

  /**
   * Calculează totalul pentru un grup
   * @param {Array} items - Item-urile grupului
   * @returns {number} Totalul grupului
   */
  calculateGroupTotal(items) {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  }

  /**
   * Obține statusul plăților pentru o comandă cu split bill
   * @param {number} orderId - ID-ul comenzii
   * @returns {Promise<Object>} Status per grup
   */
  async getSplitBillPaymentStatus(orderId) {
    try {
      const db = await dbPromise;

      // Obține comanda
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT split_bill FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) {
            console.error('❌ Error fetching order:', err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (!order || !order.split_bill) {
        return { isSplitBill: false };
      }

      let splitBillData;
      try {
        splitBillData = typeof order.split_bill === 'string' 
          ? JSON.parse(order.split_bill) 
          : order.split_bill;
      } catch (e) {
        console.error('❌ Error parsing split_bill:', e);
        return { isSplitBill: false, error: 'Invalid split_bill data' };
      }

      // Obține toate plățile pentru această comandă
      // Încearcă cu created_at, apoi cu timestamp dacă nu funcționează
      let payments = [];
      try {
        payments = await new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at ASC',
            [orderId],
            (err, rows) => {
              if (err) {
                // Încearcă cu timestamp
                db.all(
                  'SELECT * FROM payments WHERE order_id = ? ORDER BY timestamp ASC',
                  [orderId],
                  (err2, rows2) => {
                    if (err2) {
                      console.error('❌ Error fetching payments (both attempts failed):', err2);
                      reject(err2);
                    } else {
                      resolve(rows2 || []);
                    }
                  }
                );
              } else {
                resolve(rows || []);
              }
            }
          );
        });
      } catch (e) {
        console.error('❌ Error fetching payments:', e);
        payments = [];
      }

      // Calculează plăți per grup
      const groupStatus = {};
      splitBillData.groups.forEach(group => {
        const groupPayments = payments.filter(payment => {
          try {
            const meta = payment.meta ? JSON.parse(payment.meta) : null;
            return meta && (meta.groupId === group.id || meta.splitBill?.groupId === group.id);
          } catch {
            return false;
          }
        });

        const groupPaid = groupPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const groupTotal = this.calculateGroupTotal(group.items);
        const groupRemaining = Math.max(0, groupTotal - groupPaid);

        groupStatus[group.id] = {
          id: group.id,
          name: group.name,
          total: groupTotal,
          paid: groupPaid,
          remaining: groupRemaining,
          isFullyPaid: groupRemaining <= 0.01,
          payments: groupPayments.map(p => ({
            id: p.id,
            amount: parseFloat(p.amount),
            method: p.method,
            timestamp: p.created_at || p.timestamp
          }))
        };
      });

      // Verifică dacă toate grupurile sunt plătite
      const allGroupsPaid = Object.values(groupStatus).every(g => g.isFullyPaid);
      const totalPaid = Object.values(groupStatus).reduce((sum, g) => sum + g.paid, 0);
      const totalRemaining = Object.values(groupStatus).reduce((sum, g) => sum + g.remaining, 0);

      return {
        isSplitBill: true,
        groups: groupStatus,
        allGroupsPaid,
        totalPaid,
        totalRemaining,
        splitBillData
      };
    } catch (error) {
      console.error('❌ Error in getSplitBillPaymentStatus:', error);
      return { 
        isSplitBill: false, 
        error: error.message || 'Error getting split bill status' 
      };
    }
  }

  /**
   * Procesează o plată pentru un grup specific
   * @param {number} orderId - ID-ul comenzii
   * @param {number} groupId - ID-ul grupului
   * @param {number} amount - Suma plătită
   * @param {string} method - Metoda de plată
   * @returns {Promise<Object>} Rezultatul plății
   */
  async processGroupPayment(orderId, groupId, amount, method) {
    try {
      const db = await dbPromise;

      // Obține statusul split bill
      const status = await this.getSplitBillPaymentStatus(orderId);
      
      if (!status.isSplitBill) {
        throw new Error('Order is not a split bill order');
      }

      const group = status.groups[groupId];
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }

      // Validează suma
      let amountNum = parseFloat(amount);
      const isProtocolOrDegustare = (method === 'protocol' || method === 'degustare') && (amountNum <= 0 || isNaN(amountNum));
      if (!isProtocolOrDegustare && (amountNum <= 0 || isNaN(amountNum))) {
        throw new Error('Amount must be positive');
      }
      // Protocol/Degustare cu 0: înregistrăm rămasul grupului ca valoare (grupul se consideră plătit)
      if (isProtocolOrDegustare) {
        amountNum = group.remaining;
      }

      if (amountNum > group.remaining + 0.01) { // Toleranță 0.01 RON
        throw new Error(`Amount (${amountNum}) exceeds remaining balance (${group.remaining.toFixed(2)}) for group ${group.name}`);
      }

      // Inserează plata
      const paymentId = await new Promise((resolve, reject) => {
        const meta = JSON.stringify({
          splitBill: true,
          groupId: groupId,
          groupName: group.name,
          ...(isProtocolOrDegustare && { protocolDegustare: true })
        });

      // Verifică dacă coloana este created_at sau timestamp
      db.run(
        `INSERT INTO payments (order_id, method, amount, status, created_at, meta)
         VALUES (?, ?, ?, 'completed', datetime('now'), ?)`,
        [orderId, method, amountNum, meta],
        function(err) {
          if (err) {
            // Încearcă cu timestamp dacă created_at nu funcționează
            if (err.message && err.message.includes('created_at')) {
              db.run(
                `INSERT INTO payments (order_id, method, amount, status, timestamp, meta)
                 VALUES (?, ?, ?, 'completed', datetime('now'), ?)`,
                [orderId, method, amountNum, meta],
                function(err2) {
                  if (err2) {
                    console.error('❌ Error inserting payment (both attempts failed):', err2);
                    reject(err2);
                  } else {
                    resolve(this.lastID);
                  }
                }
              );
            } else {
              console.error('❌ Error inserting payment:', err);
              reject(err);
            }
          } else {
            resolve(this.lastID);
          }
        }
      );
      });

      // Recalculează statusul
      const newStatus = await this.getSplitBillPaymentStatus(orderId);
      if (!newStatus.isSplitBill) {
        throw new Error('Failed to recalculate split bill status');
      }

      const newGroup = newStatus.groups[groupId];
      if (!newGroup) {
        throw new Error(`Group ${groupId} not found after payment`);
      }

      // Verifică dacă toate grupurile sunt plătite
      if (newStatus.allGroupsPaid) {
        // Marchează comanda ca achitată
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE orders SET is_paid = 1, paid_timestamp = datetime("now") WHERE id = ?',
            [orderId],
            (err) => {
              if (err) {
                console.error('❌ Error updating order:', err);
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      }

      return {
        success: true,
        paymentId,
        group: newGroup,
        allGroupsPaid: newStatus.allGroupsPaid,
        orderFullyPaid: newStatus.allGroupsPaid
      };
    } catch (error) {
      console.error('❌ Error in processGroupPayment:', error);
      throw error;
    }
  }

  /**
   * Creează structura split bill din item-uri și grupuri
   * @param {Array} items - Item-urile comenzii
   * @param {Array} groups - Grupurile cu item-uri alocate
   * @returns {Object} Structura split bill
   */
  createSplitBillStructure(items, groups) {
    const splitBillData = {
      mode: 'split',
      version: '1.0',
      createdAt: new Date().toISOString(),
      groups: groups.map(group => {
        const groupItems = items.filter(item => 
          group.items.includes(item.itemId || item.id)
        );
        return {
          id: group.id,
          name: group.name,
          items: groupItems.map(item => ({
            itemId: item.itemId || item.id,
            name: item.name,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
          })),
          total: this.calculateGroupTotal(groupItems)
        };
      })
    };

    // Validează
    const validation = this.validateSplitBillStructure(splitBillData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return splitBillData;
  }
}

module.exports = new SplitBillService();

