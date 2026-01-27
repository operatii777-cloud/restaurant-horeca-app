/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER QUEUE SERVICE - Coadă pentru comenzi care nu pot fi procesate instant
 * 
 * Folosește InMemoryQueue pentru a gestiona comenzile care nu pot fi procesate
 * imediat (ex: server overload, validări complexe, integrare externă)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const InMemoryQueue = require('../../../in-memory-queue');
const { dbPromise } = require('../../../database');

class OrderQueueService {
  constructor() {
    // Creează queue-ul pentru comenzi (optimizat pentru 200+ clienți simultan)
    this.orderQueue = new InMemoryQueue({
      maxRetries: 5, // Mărit pentru high concurrency
      processInterval: 100, // 100ms între procesări (mai rapid pentru high load)
      persistPath: require('path').join(__dirname, '../../../data/order-queue-backup.json'),
      maxQueueSize: 5000, // Mărit pentru 200+ clienți
    });

    // Setează processor-ul pentru job-uri
    this.orderQueue.process(async (job) => {
      await this.processOrderJob(job);
    });

    console.log('✅ Order Queue Service inițializat');
  }

  /**
   * Procesează un job de comandă din coadă
   * ✅ FIX: Acum procesează comenzile la fel ca comenzile directe:
   * - Populează categorii pentru items
   * - Emite evenimente către Kitchen/Bar
   * - Consumă stocuri automat
   */
  async processOrderJob(job) {
    const { orderData } = job.data;
    
    try {
      console.log(`🔄 [Order Queue] Procesare comandă: ${orderData.table_number || orderData.client_identifier || 'N/A'}`);
      
      const db = await dbPromise;
      
      // ✅ FIX: Populează categorii pentru items (ca în createOrder)
      const items = orderData.items || [];
      const enrichedItems = await Promise.all(items.map(async (item) => {
        // Dacă item-ul are deja name și category, folosește-le
        if (item.name && item.category) {
          return {
            ...item,
            category: item.category,
            category_name: item.category
          };
        }
        
        // Altfel, caută în baza de date
        const productId = item.product_id || item.productId || item.id;
        if (productId) {
          try {
            const product = await new Promise((resolve, reject) => {
              db.get('SELECT name, category FROM menu WHERE id = ?', [productId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
            
            if (product) {
              return {
                ...item,
                name: item.name || product.name,
                category: item.category || product.category || '',
                category_name: item.category_name || product.category || ''
              };
            }
          } catch (err) {
            console.warn(`⚠️ [Order Queue] Error fetching product ${productId}:`, err.message);
          }
        }
        
        // Fallback: returnează item-ul așa cum este
        return {
          ...item,
          category: item.category || item.category_name || '',
          category_name: item.category_name || item.category || ''
        };
      }));
      
      // Procesează comanda direct în baza de date
      const orderId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO orders (
            type, order_source, platform, table_number, items, total, payment_method,
            status, general_notes, timestamp, is_paid,
            customer_name, customer_phone, delivery_address,
            client_identifier
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
        `, [
          orderData.type || 'dine_in',
          orderData.order_source || 'pos',
          orderData.platform || 'POS',
          orderData.table_number || null,
          JSON.stringify(enrichedItems), // ✅ Folosește enrichedItems cu categorii
          orderData.total || 0,
          orderData.payment_method || null,
          'pending',
          orderData.notes || null,
          orderData.payment_method ? 1 : 0,
          orderData.customer_name || null,
          orderData.customer_phone || null,
          orderData.delivery_address || null,
          orderData.client_identifier || null,
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });

      // ✅ CRITICAL: Emite evenimente complete către Kitchen/Bar (ca în createOrder)
      const { orderEventBus } = require('../order.events');
      const orderForEvents = {
        id: orderId,
        type: orderData.type || 'dine_in',
        platform: orderData.platform || 'POS',
        order_source: orderData.order_source || 'pos',
        items: enrichedItems, // ✅ Folosește enrichedItems cu categorii
        table_number: orderData.table_number,
        total: orderData.total || 0,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        delivery_address: orderData.delivery_address,
        payment_method: orderData.payment_method,
        is_paid: orderData.payment_method ? 1 : 0,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // ✅ Emite evenimente către Kitchen/Bar cu filtrare corectă
      orderEventBus.emitOrderCreated(orderForEvents, global.io);

      // ✅ CRITICAL: Process order through unified pipeline (automatic stock consumption)
      const orderProcessingPipeline = require('../services/order-processing-pipeline.service');
      orderProcessingPipeline.processOrderAfterCreation(orderId, {
        id: orderId,
        platform: orderData.platform || 'POS',
        order_source: orderData.order_source || 'pos',
        items: JSON.stringify(enrichedItems),
        total: orderData.total || 0,
        payment_method: orderData.payment_method,
        is_paid: orderData.payment_method ? 1 : 0,
        status: 'pending'
      }).catch(error => {
        console.warn(`⚠️ [Order Queue] Failed to process order ${orderId} through pipeline:`, error.message);
      });

      console.log(`✅ [Order Queue] Comandă procesată cu succes: ID ${orderId} (evenimente emise către Kitchen/Bar)`);
    } catch (error) {
      console.error(`❌ [Order Queue] Eroare procesare comandă:`, error);
      throw error; // Re-throw pentru retry logic
    }
  }

  /**
   * Adaugă o comandă în coadă
   * @param {Object} orderData - Datele comenzii
   * @param {Object} options - Opțiuni (priority, requestData)
   * @returns {Promise<string>} Job ID
   */
  async queueOrder(orderData, options = {}) {
    const priority = options.priority || this.calculatePriority(orderData);
    
    const jobId = await this.orderQueue.add(
      {
        orderData,
        requestData: options.requestData || {},
      },
      {
        priority,
        jobId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    );

    console.log(`📥 [Order Queue] Comandă adăugată în coadă: ${jobId} | Priority: ${priority}`);
    
    return jobId;
  }

  /**
   * Calculează prioritatea comenzii
   * Priority 1 = highest, 10 = lowest
   */
  calculatePriority(orderData) {
    let priority = 5; // Default

    // Prioritate mai mare pentru comenzi delivery
    if (orderData.order_type === 'delivery') {
      priority = 3;
    }

    // Prioritate mai mare pentru comenzi cu valoare mare
    if (orderData.total && orderData.total > 500) {
      priority = Math.max(1, priority - 1);
    }

    // Prioritate mai mică pentru comenzi de test
    if (orderData.client_identifier && orderData.client_identifier.includes('test')) {
      priority = 8;
    }

    return priority;
  }

  /**
   * Obține statistici despre coadă
   */
  getStats() {
    return this.orderQueue.getStats();
  }

  /**
   * Obține job-urile din coadă
   */
  getQueueItems() {
    return this.orderQueue.queue.map(job => ({
      id: job.id,
      priority: job.priority,
      retries: job.retries,
      addedAt: new Date(job.addedAt).toISOString(),
      status: job.status,
      orderData: {
        table_number: job.data.orderData?.table_number,
        client_identifier: job.data.orderData?.client_identifier,
        total: job.data.orderData?.total,
        items_count: job.data.orderData?.items?.length || 0,
      },
    }));
  }

  /**
   * Verifică dacă o comandă trebuie pusă în coadă
   * @param {Object} orderData - Datele comenzii
   * @returns {boolean} True dacă trebuie pusă în coadă
   */
  shouldQueueOrder(orderData) {
    // Verifică dacă serverul este overloaded (threshold mărit pentru 200+ clienți)
    const stats = this.getStats();
    if (stats.currentQueueSize > 200) {
      return true; // Queue dacă sunt deja multe comenzi în coadă
    }

    // Queue pentru comenzi complexe (ex: multe items, validări speciale)
    if (orderData.items && orderData.items.length > 20) {
      return true;
    }

    // Queue pentru comenzi cu integrare externă (ex: delivery platforms)
    if (orderData.platform && ['GLOVO', 'WOLT', 'UBER_EATS', 'BOLT_FOOD'].includes(orderData.platform)) {
      return true;
    }

    return false;
  }
}

// Singleton instance
const orderQueueService = new OrderQueueService();

module.exports = orderQueueService;
