/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAPHQL RESOLVERS - Restaurant App
 * 
 * Resolvers pentru GraphQL schema
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../database');
const paymentService = require('../modules/payments/payment.service');
const IdempotencyService = require('../modules/payments/idempotency.service');

const resolvers = {
  Query: {
    // Orders
    async order(_, { id }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else {
            if (row && row.items) {
              row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            }
            resolve(row);
          }
        });
      });
    },

    async orders(_, { limit = 50, offset = 0, status }) {
      const db = await dbPromise;
      let query = 'SELECT * FROM orders';
      const params = [];
      
      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else {
            const orders = (rows || []).map(order => {
              if (order.items) {
                order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              }
              return order;
            });
            resolve(orders);
          }
        });
      });
    },

    // Menu
    async menu() {
      const db = await dbPromise;
      const [categories, products] = await Promise.all([
        new Promise((resolve, reject) => {
          db.all('SELECT * FROM menu WHERE parent_id IS NULL ORDER BY display_order', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        }),
        new Promise((resolve, reject) => {
          db.all('SELECT * FROM menu WHERE parent_id IS NOT NULL AND is_product = 1 ORDER BY display_order', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        })
      ]);

      return { categories, products };
    },

    async products(_, { category, available }) {
      const db = await dbPromise;
      let query = 'SELECT * FROM menu WHERE is_product = 1';
      const params = [];
      
      if (category) {
        query += ' AND parent_id = (SELECT id FROM menu WHERE name = ? LIMIT 1)';
        params.push(category);
      }
      
      if (available !== undefined) {
        query += ' AND available = ?';
        params.push(available ? 1 : 0);
      }
      
      query += ' ORDER BY display_order';
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },

    async categories() {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM menu WHERE parent_id IS NULL ORDER BY display_order', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },

    async product(_, { id }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM menu WHERE id = ? AND is_product = 1', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    // Payments
    async payment(_, { id }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    async orderPayments(_, { order_id }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC', [order_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },

    // Customers
    async customer(_, { id }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    async customers(_, { limit = 50, offset = 0 }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM customers ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
  },

  Mutation: {
    // Orders
    async createOrder(_, { input }) {
      const db = await dbPromise;
      const { table_number, items, client_identifier, platform } = input;
      
      // Calculate total
      const total = items.reduce((sum, item) => {
        // Get product price
        return sum + (item.price || 0) * item.quantity;
      }, 0);
      
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO orders (table_number, items, total, status, client_identifier, platform, timestamp)
           VALUES (?, ?, ?, 'pending', ?, ?, datetime('now'))`,
          [table_number, JSON.stringify(items), total, client_identifier, platform],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else {
                  if (row && row.items) {
                    row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
                  }
                  resolve(row);
                }
              });
            }
          }
        );
      });
    },

    async updateOrderStatus(_, { id, status }) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
          if (err) reject(err);
          else {
            db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else {
                if (row && row.items) {
                  row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
                }
                resolve(row);
              }
            });
          }
        });
      });
    },

    async cancelOrder(_, { id }) {
      return this.updateOrderStatus(_, { id, status: 'cancelled' });
    },

    // Payments
    async createPayment(_, { input }) {
      const { order_id, amount, method, idempotency_key } = input;
      
      const payment = await paymentService.createPayment(
        Number(order_id),
        {
          amount: Number(amount),
          method,
          currency: 'RON',
        },
        idempotency_key
      );
      
      return payment;
    },

    async capturePayment(_, { id }) {
      return await paymentService.capturePayment(Number(id));
    },

    async cancelPayment(_, { id }) {
      return await paymentService.cancelPayment(Number(id));
    },
  },

  // Type resolvers
  Order: {
    items(parent) {
      if (typeof parent.items === 'string') {
        return JSON.parse(parent.items);
      }
      return parent.items || [];
    },
    timestamp(parent) {
      return parent.timestamp || parent.created_at;
    },
  },

  Category: {
    async products(parent) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM menu WHERE parent_id = ? AND is_product = 1 ORDER BY display_order', [parent.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
  },
};

module.exports = resolvers;
