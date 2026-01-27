/**
 * MARKETING MODULE - Controller
 * Segmentare automată clienți și gestiune campanii de marketing
 */

const { dbPromise } = require('../../../database');

/**
 * POST /api/marketing/auto-segment
 * Segmentare automată clienți în VIP, Regular, New
 */
async function autoSegment(req, res, next) {
  try {
    const db = await dbPromise;

    // Obține toți clienții cu statistici comenzi
    // Folosim client_identifier sau customer_phone ca identificator client
    const customers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(o.client_identifier, o.customer_phone, 'anonymous_' || o.id) as customer_token,
          COUNT(DISTINCT o.id) as order_count,
          COALESCE(SUM(o.total), 0) as total_spent,
          MIN(o.timestamp) as first_order_date,
          MAX(o.timestamp) as last_order_date,
          DATE(MAX(o.timestamp)) as last_order_date_only
        FROM orders o
        WHERE (o.client_identifier IS NOT NULL AND o.client_identifier != '') 
           OR (o.customer_phone IS NOT NULL AND o.customer_phone != '')
        GROUP BY customer_token
        HAVING customer_token NOT LIKE 'anonymous_%'
        ORDER BY total_spent DESC, order_count DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const totalCustomers = customers.length;
    if (totalCustomers === 0) {
      return res.json({
        success: true,
        message: 'Nu există clienți pentru segmentare',
        total_customers: 0,
        segments: {
          vip_count: 0,
          regular_count: 0,
          new_count: 0,
        },
        avg_orders: '0.00',
      });
    }

    // Calculează statistici
    const totalOrders = customers.reduce((sum, c) => sum + c.order_count, 0);
    const avgOrders = (totalOrders / totalCustomers).toFixed(2);
    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgSpent = totalSpent / totalCustomers;

    // Definește praguri pentru segmentare
    const vipThreshold = avgSpent * 2; // Clienți care cheltuiesc de 2x mai mult decât media
    const regularThreshold = avgSpent * 0.5; // Clienți care cheltuiesc cel puțin jumătate din medie

    // Segmentare
    let vipCount = 0;
    let regularCount = 0;
    let newCount = 0;

    // Șterge segmentele existente
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM marketing_segments WHERE 1=1', [], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    // Creează segmentele standard
    const segments = [
      { name: 'VIP Customers', description: 'Clienți cu cheltuieli mari și frecvență ridicată', criteria: { min_spent: vipThreshold, min_orders: 5 } },
      { name: 'Regular Customers', description: 'Clienți fideli cu cheltuieli medii', criteria: { min_spent: regularThreshold, min_orders: 2 } },
      { name: 'New Customers', description: 'Clienți noi cu prima comandă recentă', criteria: { max_days_since_first: 30 } },
    ];

    const segmentIds = {};
    for (const segment of segments) {
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO marketing_segments (name, description, criteria, last_calculated) 
           VALUES (?, ?, ?, datetime('now'))`,
          [segment.name, segment.description, JSON.stringify(segment.criteria)],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          }
        );
      });
      segmentIds[segment.name] = result.lastID;
    }

    // Asignează clienții la segmente
    const now = new Date();
    for (const customer of customers) {
      const firstOrderDate = new Date(customer.first_order_date);
      const daysSinceFirst = Math.floor((now - firstOrderDate) / (1000 * 60 * 60 * 24));
      const spent = customer.total_spent || 0;

      let segmentId = null;

      // VIP - cheltuieli mari și multe comenzi
      if (spent >= vipThreshold && customer.order_count >= 5) {
        segmentId = segmentIds['VIP Customers'];
        vipCount++;
      }
      // Regular - cheltuieli medii și cel puțin 2 comenzi
      else if (spent >= regularThreshold && customer.order_count >= 2 && daysSinceFirst > 30) {
        segmentId = segmentIds['Regular Customers'];
        regularCount++;
      }
      // New - prima comandă în ultimele 30 de zile
      else if (daysSinceFirst <= 30) {
        segmentId = segmentIds['New Customers'];
        newCount++;
      }
      // Default - Regular dacă nu se potrivește altundeva
      else {
        segmentId = segmentIds['Regular Customers'];
        regularCount++;
      }

      if (segmentId && customer.customer_token && !customer.customer_token.startsWith('anonymous_')) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO marketing_segment_customers (segment_id, customer_token, order_count, last_order_date, first_order_date)
             VALUES (?, ?, ?, ?, ?)`,
            [segmentId, customer.customer_token, customer.order_count, customer.last_order_date, customer.first_order_date],
            function(err) {
              if (err) reject(err);
              else resolve({ lastID: this.lastID, changes: this.changes });
            }
          );
        });
      }
    }

    // Actualizează numărul de clienți pentru fiecare segment
    for (const [name, id] of Object.entries(segmentIds)) {
      const count = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM marketing_segment_customers WHERE segment_id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE marketing_segments SET customer_count = ? WHERE id = ?`,
          [count.count, id],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          }
        );
      });
    }

    res.json({
      success: true,
      message: `Segmentare completată: ${totalCustomers} clienți segmentați`,
      total_customers: totalCustomers,
      segments: {
        vip_count: vipCount,
        regular_count: regularCount,
        new_count: newCount,
      },
      avg_orders: avgOrders,
    });
  } catch (error) {
    console.error('❌ Eroare la segmentare automată:', error);
    next(error);
  }
}

/**
 * GET /api/marketing/segments
 * Listă toate segmentele
 */
async function getSegments(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='marketing_segments'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row !== null && row !== undefined);
        }
      );
    });

    if (!tableExists) {
      // Tabela nu există - returnează array gol
      return res.json([]);
    }

    const segments = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          name,
          description,
          criteria,
          customer_count,
          last_calculated
        FROM marketing_segments
        ORDER BY customer_count DESC, name ASC
      `, [], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching segments:', err);
          resolve([]); // Returnează array gol în loc de reject
        } else {
          resolve(rows || []);
        }
      });
    });

    // Parse criteria JSON
    const parsedSegments = segments.map(segment => {
      try {
        return {
          ...segment,
          criteria: segment.criteria ? (typeof segment.criteria === 'string' ? JSON.parse(segment.criteria) : segment.criteria) : null,
        };
      } catch (parseError) {
        return {
          ...segment,
          criteria: null,
        };
      }
    });

    res.json(parsedSegments);
  } catch (error) {
    console.error('❌ Eroare la obținerea segmentelor:', error);
    // Returnează array gol în loc de eroare
    res.json([]);
  }
}

/**
 * GET /api/marketing/segments/:id/customers
 * Listă clienții dintr-un segment
 */
async function getSegmentCustomers(req, res, next) {
  try {
    const db = await dbPromise;
    const segmentId = parseInt(req.params.id, 10);

    if (isNaN(segmentId)) {
      return res.status(400).json({ error: 'ID segment invalid' });
    }

    const customers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          customer_token,
          order_count,
          last_order_date,
          first_order_date
        FROM marketing_segment_customers
        WHERE segment_id = ?
        ORDER BY order_count DESC, last_order_date DESC`,
        [segmentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json(customers);
  } catch (error) {
    console.error('❌ Eroare la obținerea clienților segmentului:', error);
    next(error);
  }
}

/**
 * GET /api/marketing/campaigns
 * Listă toate campaniile
 */
async function getCampaigns(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='marketing_campaigns'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row !== null && row !== undefined);
        }
      );
    });

    if (!tableExists) {
      // Tabela nu există - returnează array gol
      return res.json([]);
    }

    const campaigns = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          name,
          type,
          start_date,
          end_date,
          status,
          statistics
        FROM marketing_campaigns
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching campaigns:', err);
          resolve([]); // Returnează array gol în loc de reject
        } else {
          resolve(rows || []);
        }
      });
    });

    // Parse statistics JSON
    const parsedCampaigns = campaigns.map(campaign => {
      try {
        return {
          ...campaign,
          statistics: campaign.statistics ? (typeof campaign.statistics === 'string' ? JSON.parse(campaign.statistics) : campaign.statistics) : null,
        };
      } catch (parseError) {
        return {
          ...campaign,
          statistics: null,
        };
      }
    });

    res.json(parsedCampaigns);
  } catch (error) {
    console.error('❌ Eroare la obținerea campaniilor:', error);
    // Returnează array gol în loc de eroare
    res.json([]);
  }
}

/**
 * POST /api/marketing/campaigns
 * Creează o campanie nouă
 */
async function createCampaign(req, res, next) {
  try {
    const db = await dbPromise;
    const { name, type, start_date, end_date, status = 'active' } = req.body;

    if (!name || !type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Lipsește nume, tip, start_date sau end_date' });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO marketing_campaigns (name, type, start_date, end_date, status, statistics, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [name, type, start_date, end_date, status, JSON.stringify({})],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        }
      );
    });

    res.json({
      id: result.lastID,
      message: 'Campanie creată cu succes!',
    });
  } catch (error) {
    console.error('❌ Eroare la crearea campaniei:', error);
    next(error);
  }
}

module.exports = {
  autoSegment,
  getSegments,
  getSegmentCustomers,
  getCampaigns,
  createCampaign,
};

