/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/admin/index.js
 * 
 * NOTE: Admin uses aggregator pattern - most routes are in sub-routes.
 * This controller handles only direct endpoints (health, API info).
 */

// Helper function for db.all() - wraps sqlite3 callback in Promise
async function dbAll(db, query, params = []) {
    console.log('🔵 [dbAll] BEFORE db.all() call');
    return new Promise((resolve, reject) => {
        const dbAllReturn = db.all(query, params, (err, rows) => {
            console.log('🔵 [dbAll] db.all callback invoked! err:', err ? err.message : 'null', 'rows type:', typeof rows, 'rows isArray:', Array.isArray(rows), 'rows length:', rows?.length);
            if (err) {
                reject(err);
            } else {
                // CRITICAL: Deep clone to remove any EventEmitter properties
                // sqlite3 may attach EventEmitter properties to rows
                const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                console.log('🔵 [dbAll] After JSON.parse - result type:', typeof result, 'isArray:', Array.isArray(result), 'length:', result?.length);
                resolve(result);
            }
        });
        console.log('🔵 [dbAll] db.all() returned:', typeof dbAllReturn, 'is Database?', dbAllReturn?.constructor?.name);
    });
}

// Helper function for db.run() - wraps sqlite3 callback in Promise
async function dbRun(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

// GET /api/admin/health
async function getHealth(req, res, next) {
    try {
        res.json({
            success: true,
            message: 'Admin API is healthy',
            timestamp: new Date().toISOString(),
            modules: {
                gestiuni: 'active',
                suppliers: 'active',
                categories: 'active',
                cashAccounts: 'active',
                ingredients: 'active',
                products: 'active',
                recipes: 'active',
                nir: 'active',
                stockMovements: 'active',
                stockTransfers: 'active',
                reservations: 'active'
            }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/
async function getApiInfo(req, res, next) {
    try {
        res.json({
            success: true,
            message: 'Restaurant App Admin API v3.0',
            endpoints: {
                gestiuni: {
                    base: '/api/admin/gestiuni',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 13
                },
                suppliers: {
                    base: '/api/admin/suppliers',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 13
                },
                categories: {
                    base: '/api/admin/categories',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 14
                },
                cashAccounts: {
                    base: '/api/admin/cash-accounts',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 12
                },
                ingredients: {
                    base: '/api/admin/ingredients',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 18
                },
                products: {
                    base: '/api/admin/products',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 16
                },
                recipes: {
                    base: '/api/admin/recipes',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 13
                },
                nir: {
                    base: '/api/admin/nir',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 11
                },
                stockMovements: {
                    base: '/api/admin/stock-movements',
                    methods: ['GET', 'POST'],
                    count: 5
                },
                stockTransfers: {
                    base: '/api/admin/stock-transfers',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 9
                },
                reservations: {
                    base: '/api/admin/reservations',
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    count: 12
                }
            },
            total_endpoints: 136,
            documentation: 'See README.md for detailed API documentation'
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/check-auth
async function checkAuth(req, res, next) {
    try {
        // Simple auth check - return success if request reaches here
        // In production, this should check session/token
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.user?.id || null,
                role: req.user?.role || 'guest'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/menu
async function getMenu(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Get all products with categories (with error handling)
        let products = [];
        try {
            products = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT p.*, c.name as category_name, c.id as category_id, c.name as category
                    FROM catalog_products p
                    LEFT JOIN catalog_categories c ON p.category_id = c.id
                    WHERE p.is_active = 1
                    ORDER BY c.display_order, p.display_order, p.name
                `, [], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ Error fetching products:', err.message);
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ Error fetching products:', error.message);
            products = [];
        }

        // Get all categories (with error handling)
        let categories = [];
        try {
            categories = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT * FROM catalog_categories
                    WHERE is_active = 1
                    ORDER BY display_order, name
                `, [], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ Error fetching categories:', err.message);
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ Error fetching categories:', error.message);
            categories = [];
        }

        res.json({
            success: true,
            products: products || [],
            categories: categories || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/dashboard/kpi
async function getDashboardKPI(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        console.log('[getDashboardKPI] Starting KPI calculation...');

        // Debug: verifică data curentă în SQLite
        const currentDate = await new Promise((resolve, reject) => {
            db.get(`SELECT strftime('%Y-%m-%d', 'now') as today, strftime('%Y-%m-%d', datetime('now')) as today_dt`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
        console.log('[getDashboardKPI] SQLite current date:', currentDate);

        // Debug: verifică câte comenzi există în total
        const totalOrders = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM orders WHERE status != 'cancelled'`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { count: 0 });
            });
        });
        console.log('[getDashboardKPI] Total orders (not cancelled):', totalOrders.count);

        // Get today's revenue - folosim strftime pentru SQLite
        const todayRevenue = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COALESCE(SUM(total), 0) as revenue
                FROM orders
                WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
                AND status != 'cancelled'
            `, [], (err, row) => {
                if (err) {
                    console.error('[getDashboardKPI] Error fetching today revenue:', err);
                    resolve({ revenue: 0 });
                } else {
                    console.log('[getDashboardKPI] Today revenue query result:', row);
                    resolve(row || { revenue: 0 });
                }
            });
        });

        // Get today's orders count
        const todayOrders = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count
                FROM orders
                WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
                AND status != 'cancelled'
            `, [], (err, row) => {
                if (err) {
                    console.error('[getDashboardKPI] Error fetching today orders:', err);
                    resolve({ count: 0 });
                } else {
                    console.log('[getDashboardKPI] Today orders query result:', row);
                    resolve(row || { count: 0 });
                }
            });
        });

        // Get yesterday's revenue for comparison
        const yesterdayRevenue = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COALESCE(SUM(total), 0) as revenue
                FROM orders
                WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now', '-1 day')
                AND status != 'cancelled'
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { revenue: 0 });
            });
        });

        // Get yesterday's orders count for comparison
        const yesterdayOrders = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count
                FROM orders
                WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now', '-1 day')
                AND status != 'cancelled'
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { count: 0 });
            });
        });

        const revenueChange = yesterdayRevenue.revenue > 0
            ? `${((todayRevenue.revenue - yesterdayRevenue.revenue) / yesterdayRevenue.revenue * 100).toFixed(1)}%`
            : '0%';

        const ordersChange = yesterdayOrders.count > 0
            ? `${todayOrders.count - yesterdayOrders.count > 0 ? '+' : ''}${todayOrders.count - yesterdayOrders.count}`
            : '0';

        // Calculate COGS (Cost of Goods Sold) for today
        // Folosim items JSON din orders (nu order_items care poate fi gol)
        let cogsToday = 0;
        try {
            const ordersWithItems = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT items, total
                    FROM orders
                    WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
                    AND status != 'cancelled'
                    AND items IS NOT NULL
                    AND items != ''
                `, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            // Calculează COGS din items JSON
            for (const order of ordersWithItems) {
                try {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    if (Array.isArray(items)) {
                        // COGS simplificat: 30% din total (poate fi îmbunătățit cu costuri reale din rețete)
                        // Pentru moment folosim un procent estimat
                        cogsToday += order.total * 0.30;
                    }
                } catch (e) {
                    // Ignoră erorile de parsing
                }
            }
        } catch (error) {
            console.warn('⚠️ Error calculating COGS:', error.message);
            cogsToday = 0;
        }

        // Get inventory alerts (ingredients below min_stock)
        let inventoryAlerts = 0;
        try {
            const alertsResult = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(*) as count
                    FROM ingredients
                    WHERE current_stock < min_stock
                    AND is_hidden = 0
                    AND is_available = 1
                `, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row || { count: 0 });
                });
            });
            inventoryAlerts = alertsResult.count || 0;
        } catch (error) {
            console.warn('⚠️ Error fetching inventory alerts:', error.message);
            inventoryAlerts = 0;
        }

        // Get top products (last 7 days) - folosim items din orders (JSON)
        let topProducts = [];
        try {
            const ordersWithItems = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT items, total
                    FROM orders
                    WHERE strftime('%Y-%m-%d', timestamp) >= strftime('%Y-%m-%d', 'now', '-7 days')
                    AND status != 'cancelled'
                    AND items IS NOT NULL
                    AND items != ''
                `, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            // Agregăm produsele din items JSON
            const productCounts = {};
            ordersWithItems.forEach(order => {
                try {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            const productName = item.name || item.product_name || 'Unknown';
                            if (!productCounts[productName]) {
                                productCounts[productName] = { name: productName, quantity: 0, revenue: 0 };
                            }
                            const quantity = item.quantity || item.qty || 1;
                            const price = item.price || 0;
                            productCounts[productName].quantity += quantity;
                            productCounts[productName].revenue += price * quantity;
                        });
                    }
                } catch (e) {
                    // Ignoră erorile de parsing
                }
            });

            // Calculează total revenue pentru procente
            const totalRevenue = Object.values(productCounts).reduce((sum, p) => sum + p.revenue, 0);

            topProducts = Object.values(productCounts)
                .sort((a, b) => b.revenue - a.revenue) // Sortare după revenue, nu quantity
                .slice(0, 5)
                .map(p => ({
                    product_name: p.name,
                    quantity_sold: p.quantity,
                    revenue: p.revenue,
                    percentage: totalRevenue > 0 ? parseFloat(((p.revenue / totalRevenue) * 100).toFixed(1)) : 0,
                    category: 'General' // Default category, poate fi îmbunătățit cu date din menu
                }));
        } catch (error) {
            console.warn('⚠️ Error fetching top products:', error.message);
            topProducts = [];
        }

        // Get revenue margin data (last 7 days)
        const revenueMarginData = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    strftime('%Y-%m-%d', timestamp) as date,
                    COALESCE(SUM(total), 0) as revenue,
                    65.0 as margin
                FROM orders
                WHERE strftime('%Y-%m-%d', timestamp) >= strftime('%Y-%m-%d', 'now', '-7 days')
                AND status != 'cancelled'
                GROUP BY strftime('%Y-%m-%d', timestamp)
                ORDER BY date ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        const todayProfit = todayRevenue.revenue - cogsToday;
        const profitMargin = todayRevenue.revenue > 0 ? parseFloat(((todayProfit / todayRevenue.revenue) * 100).toFixed(1)) : 0;

        res.json({
            success: true,
            todayRevenue: todayRevenue.revenue || 0,
            revenueChange: revenueChange.startsWith('-') ? revenueChange : `+${revenueChange}`,
            inventoryAlerts: inventoryAlerts,
            customerRetention: 0,
            cogsToday: cogsToday,
            tableTurnover: '0x',
            tableUtilization: '0/0',
            avgRating: 0,
            totalFeedback: 0,
            excellentCount: 0,
            lowRatingCount: 0,
            todayOrders: todayOrders.count || 0,
            todayOrdersChange: ordersChange,
            todayProfit: todayProfit,
            profitMargin: profitMargin,
            topProducts: topProducts,
            revenueMarginData: revenueMarginData || [],
            deliveryActive: 0,
            deliveryAvgTime: 'N/A',
            drivethruActive: 0,
            drivethruAvgTime: 'N/A',
            takeawayActive: 0,
            takeawayAvgTime: 'N/A',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getDashboardKPI:', error);
        // Return safe defaults on error
        res.json({
            success: true,
            todayRevenue: 0,
            revenueChange: '0%',
            inventoryAlerts: 0,
            customerRetention: 0,
            cogsToday: 0,
            tableTurnover: '0x',
            tableUtilization: '0/0',
            avgRating: 0,
            totalFeedback: 0,
            excellentCount: 0,
            lowRatingCount: 0,
            todayOrders: 0,
            todayOrdersChange: '0%',
            todayProfit: 0,
            profitMargin: 0,
            topProducts: [],
            revenueMarginData: [],
            deliveryActive: 0,
            deliveryAvgTime: 'N/A',
            drivethruActive: 0,
            drivethruAvgTime: 'N/A',
            takeawayActive: 0,
            takeawayAvgTime: 'N/A',
            timestamp: new Date().toISOString()
        });
    }
}

// GET /api/admin/dashboard/metrics
async function getDashboardMetrics(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Helper functions pentru Promise
        function dbGet(query, params = []) {
            return new Promise((resolve, reject) => {
                db.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {});
                });
            });
        }

        function dbAll(query, params = []) {
            return new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
        }

        // Today revenue
        const todayData = await dbGet(`
            SELECT 
                COALESCE(SUM(total), 0) as revenue, 
                COUNT(*) as orders
            FROM orders
            WHERE DATE(timestamp) = DATE('now')
            AND status IN ('paid', 'completed', 'delivered')
        `);

        // Yesterday revenue (pentru calculare schimbare)
        const yesterdayData = await dbGet(`
            SELECT 
                COALESCE(SUM(total), 0) as revenue, 
                COUNT(*) as orders
            FROM orders
            WHERE DATE(timestamp) = DATE('now', '-1 day')
            AND status IN ('paid', 'completed', 'delivered')
        `);

        const todayRevenue = parseFloat(todayData.revenue || 0);
        const yesterdayRevenue = parseFloat(yesterdayData.revenue || 0);

        // Calculează procent schimbare
        let revenueChange = 0;
        if (yesterdayRevenue > 0) {
            revenueChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
        } else if (todayRevenue > 0) {
            revenueChange = 100; // 100% creștere dacă ieri era 0
        }

        // COGS pentru astăzi (simplificat - folosește costul estimat din rețete)
        // TODO: Implementare completă COGS bazată pe ingrediente consumate
        const cogsToday = await dbGet(`
            SELECT COALESCE(SUM(total * 0.35), 0) as cogs
            FROM orders
            WHERE DATE(timestamp) = DATE('now')
            AND status IN ('paid', 'completed', 'delivered')
        `).catch(() => ({ cogs: todayRevenue * 0.35 })); // 35% food cost estimat

        // Alerte stoc (număr ingrediente sub minim)
        const inventoryAlerts = await dbGet(`
            SELECT COUNT(*) as count
            FROM ingredients
            WHERE current_stock IS NOT NULL
            AND min_stock IS NOT NULL
            AND current_stock < min_stock
        `).catch(() => ({ count: 0 }));

        // Customer retention (simplificat - clienți cu mai mult de 1 comandă în ultimele 30 zile)
        const customerRetentionData = await dbGet(`
            SELECT 
                COUNT(DISTINCT client_identifier) as returning_customers,
                COUNT(DISTINCT CASE WHEN order_count > 1 THEN client_identifier END) as repeat_customers
            FROM (
                SELECT 
                    client_identifier,
                    COUNT(*) as order_count
                FROM orders
                WHERE DATE(timestamp) >= DATE('now', '-30 days')
                AND status IN ('paid', 'completed', 'delivered')
                AND client_identifier IS NOT NULL
                GROUP BY client_identifier
            )
        `).catch(() => ({ returning_customers: 0, repeat_customers: 0 }));

        const totalCustomers = parseInt(customerRetentionData.returning_customers || 0);
        const repeatCustomers = parseInt(customerRetentionData.repeat_customers || 0);
        const customerRetention = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

        // Table turnover (rotație mese) - comenzi unice per masă ocupată astăzi
        const tableTurnoverData = await dbGet(`
            SELECT 
                COUNT(DISTINCT table_number) as occupied_tables,
                COUNT(*) as total_orders
            FROM orders
            WHERE DATE(timestamp) = DATE('now')
            AND status IN ('paid', 'completed', 'delivered')
            AND table_number IS NOT NULL
        `).catch(() => ({ occupied_tables: 0, total_orders: 0 }));

        const occupiedTables = parseInt(tableTurnoverData.occupied_tables || 0);
        const totalOrders = parseInt(tableTurnoverData.total_orders || 0);
        const tableTurnover = occupiedTables > 0 ? (totalOrders / occupiedTables) : 0;

        // Table utilization (mese folosite din 200)
        const tableUtilization = await dbGet(`
            SELECT COUNT(DISTINCT table_number) as used_tables
            FROM orders
            WHERE DATE(timestamp) = DATE('now')
            AND status IN ('paid', 'completed', 'delivered')
            AND table_number IS NOT NULL
            AND table_number BETWEEN 1 AND 200
        `).catch(() => ({ used_tables: 0 }));

        const usedTables = parseInt(tableUtilization.used_tables || 0);
        const totalTables = 200; // Configurabil
        const utilizationPercent = (usedTables / totalTables) * 100;

        // Returnează date în formatul așteptat de frontend
        res.json({
            success: true,
            todayRevenue: parseFloat(todayRevenue.toFixed(2)),
            yesterdayRevenue: parseFloat(yesterdayRevenue.toFixed(2)),
            revenueChange: parseFloat(revenueChange.toFixed(1)),
            cogsToday: parseFloat((cogsToday.cogs || 0).toFixed(2)),
            inventoryAlerts: parseInt(inventoryAlerts.count || 0),
            customerRetention: parseFloat(customerRetention.toFixed(1)),
            tableTurnover: parseFloat(tableTurnover.toFixed(1)),
            tableUtilization: usedTables,
            tableUtilizationPercent: parseFloat(utilizationPercent.toFixed(1)),
            totalTables: totalTables,
            // Păstrează structura veche pentru compatibilitate
            metrics: {
                today: { revenue: todayRevenue, orders: parseInt(todayData.orders || 0) },
                week: { revenue: 0, orders: 0 },
                month: { revenue: 0, orders: 0 }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getDashboardMetrics:', error);
        res.json({
            success: true,
            todayRevenue: 0,
            yesterdayRevenue: 0,
            revenueChange: 0,
            cogsToday: 0,
            inventoryAlerts: 0,
            customerRetention: 0,
            tableTurnover: 0,
            tableUtilization: 0,
            tableUtilizationPercent: 0,
            totalTables: 200,
            metrics: {
                today: { revenue: 0, orders: 0 },
                week: { revenue: 0, orders: 0 },
                month: { revenue: 0, orders: 0 }
            },
            timestamp: new Date().toISOString()
        });
    }
}

// GET /api/admin/dashboard/revenue-chart
async function getRevenueChart(req, res, next) {
    try {
        const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Validate period against whitelist for security
        const periodMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const daysBack = periodMap[period] || 7;

        // Use parameterized query with date calculation
        const chartData = await db.all(`
            SELECT 
                DATE(timestamp) as date,
                COALESCE(SUM(total), 0) as revenue,
                COUNT(*) as orders
            FROM orders
            WHERE DATE(timestamp) >= DATE('now', ? || ' days')
            AND status != 'cancelled'
            GROUP BY DATE(timestamp)
            ORDER BY date ASC
        `, [`-${daysBack}`]) || [];

        res.json({
            success: true,
            period,
            data: chartData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getRevenueChart:', error);
        res.json({
            success: true,
            period: req.query.period || '7d',
            data: [],
            timestamp: new Date().toISOString()
        });
    }
}

// GET /api/admin/dashboard/inventory-alerts
async function getInventoryAlerts(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { location_id } = req.query;

        // Helper function
        function dbGet(query, params = []) {
            return new Promise((resolve, reject) => {
                db.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {});
                });
            });
        }

        function dbAll(query, params = []) {
            return new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
        }

        // Query pentru alerte (ingrediente sub minim)
        let alertsQuery = `
            SELECT 
                i.id as ingredient_id,
                i.name as ingredient_name,
                i.current_stock,
                i.min_stock,
                i.unit,
                i.location_id,
                COALESCE(loc.name, 'Fără gestiune') as location_name,
                COALESCE(loc.type, 'operational') as location_type,
                CASE 
                    WHEN i.current_stock = 0 THEN 'CRITIC'
                    WHEN i.current_stock < i.min_stock * 0.5 THEN 'CRITIC'
                    ELSE 'WARNING'
                END as status,
                (i.min_stock - i.current_stock) as deficit
            FROM ingredients i
            LEFT JOIN locations loc ON i.location_id = loc.id
            WHERE i.current_stock IS NOT NULL
            AND i.min_stock IS NOT NULL
            AND i.current_stock < i.min_stock
            AND (i.is_hidden = 0 OR i.is_hidden IS NULL)
        `;

        const params = [];
        if (location_id) {
            alertsQuery += ' AND i.location_id = ?';
            params.push(location_id);
        }

        alertsQuery += ' ORDER BY i.current_stock ASC LIMIT 100';

        const alerts = await dbAll(alertsQuery, params).catch(() => []);

        // Grupează alertele pe gestiuni
        const byLocation = {};
        let totalCritical = 0;
        let totalWarning = 0;

        alerts.forEach(alert => {
            const locationId = alert.location_id || 'none';
            const locationName = alert.location_name || 'Fără gestiune';
            const locationType = alert.location_type || 'operational';

            if (!byLocation[locationId]) {
                byLocation[locationId] = {
                    location_id: locationId === 'none' ? null : locationId,
                    location_name: locationName,
                    location_type: locationType,
                    stats: { total: 0, critical: 0, warning: 0 },
                    alerts: []
                };
            }

            const isCritical = alert.status === 'CRITIC';
            if (isCritical) {
                totalCritical++;
                byLocation[locationId].stats.critical++;
            } else {
                totalWarning++;
                byLocation[locationId].stats.warning++;
            }
            byLocation[locationId].stats.total++;
            byLocation[locationId].alerts.push({
                ingredient_id: alert.ingredient_id,
                name: alert.ingredient_name,
                current_stock: parseFloat(alert.current_stock || 0),
                min_stock: parseFloat(alert.min_stock || 0),
                unit: alert.unit || 'buc',
                deficit: parseFloat(alert.deficit || 0),
                status: alert.status
            });
        });

        const totalStats = {
            total: alerts.length,
            critical: totalCritical,
            warning: totalWarning
        };

        res.json({
            success: true,
            totalStats: totalStats,
            byLocation: byLocation,
            alerts: alerts,
            count: alerts.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getInventoryAlerts:', error);
        res.json({
            success: true,
            totalStats: { total: 0, critical: 0, warning: 0 },
            byLocation: {},
            alerts: [],
            count: 0,
            timestamp: new Date().toISOString()
        });
    }
}

// GET /api/admin/pins - Returnează PIN-uri pentru interfețe (admin, livrare1-10, kds, bar)
async function getPins(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Lista interfețelor hardcodate (compatibil cu legacy admin.html)
        const allInterfaces = [
            { id: 'admin', name: 'Admin Panel', description: 'Panoul de administrare' },
            { id: 'livrare1', name: 'Ospătar 1 (Mesele 1-20)', description: 'Interfața pentru ospătarul 1' },
            { id: 'livrare2', name: 'Ospătar 2 (Mesele 21-40)', description: 'Interfața pentru ospătarul 2' },
            { id: 'livrare3', name: 'Ospătar 3 (Mesele 41-60)', description: 'Interfața pentru ospătarul 3' },
            { id: 'livrare4', name: 'Ospătar 4 (Mesele 61-80)', description: 'Interfața pentru ospătarul 4' },
            { id: 'livrare5', name: 'Ospătar 5 (Mesele 81-100)', description: 'Interfața pentru ospătarul 5' },
            { id: 'livrare6', name: 'Ospătar 6 (Mesele 101-120)', description: 'Interfața pentru ospătarul 6' },
            { id: 'livrare7', name: 'Ospătar 7 (Mesele 121-140)', description: 'Interfața pentru ospătarul 7' },
            { id: 'livrare8', name: 'Ospătar 8 (Mesele 141-160)', description: 'Interfața pentru ospătarul 8' },
            { id: 'livrare9', name: 'Ospătar 9 (Mesele 161-180)', description: 'Interfața pentru ospătarul 9' },
            { id: 'livrare10', name: 'Ospătar 10 (Mesele 181-200)', description: 'Interfața pentru ospătarul 10' },
            { id: 'comanda-supervisor1', name: 'Comandă Supervisor 1', description: 'Interfața pentru supervisorul de comandă 1' },
            { id: 'comanda-supervisor2', name: 'Comandă Supervisor 2', description: 'Interfața pentru supervisorul de comandă 2' },
            { id: 'comanda-supervisor3', name: 'Comandă Supervisor 3', description: 'Interfața pentru supervisorul de comandă 3' },
            { id: 'comanda-supervisor4', name: 'Comandă Supervisor 4', description: 'Interfața pentru supervisorul de comandă 4' },
            { id: 'comanda-supervisor5', name: 'Comandă Supervisor 5', description: 'Interfața pentru supervisorul de comandă 5' },
            { id: 'comanda-supervisor6', name: 'Comandă Supervisor 6', description: 'Interfața pentru supervisorul de comandă 6' },
            { id: 'comanda-supervisor7', name: 'Comandă Supervisor 7', description: 'Interfața pentru supervisorul de comandă 7' },
            { id: 'comanda-supervisor8', name: 'Comandă Supervisor 8', description: 'Interfața pentru supervisorul de comandă 8' },
            { id: 'comanda-supervisor9', name: 'Comandă Supervisor 9', description: 'Interfața pentru supervisorul de comandă 9' },
            { id: 'comanda-supervisor10', name: 'Comandă Supervisor 10', description: 'Interfața pentru supervisorul de comandă 10' },
            { id: 'kds', name: 'Bucătărie (KDS)', description: 'Interfața bucătăriei' },
            { id: 'bar', name: 'Bar', description: 'Interfața barului' }
        ];

        // Verifică dacă există tabela interface_pins
        let interfacePinsFromDb = [];
        try {
            const tableExists = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='interface_pins'
                `, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(!!row);
                });
            });

            if (tableExists) {
                interfacePinsFromDb = await dbAll(db, `
                    SELECT interface, pin_hash, pin_salt, pin_policy_version, 
                           pin_last_rotated_at, pin_rotated_by, algorithm
                    FROM interface_pins
                `);
            }
        } catch (error) {
            console.warn('⚠️ Error fetching interface pins from DB:', error.message);
        }

        // Creează map pentru PIN-uri din DB
        const pinMap = new Map(interfacePinsFromDb.map(p => [p.interface, p]));

        // Construiește lista de PIN-uri pentru interfețe
        const pins = allInterfaces.map(iface => {
            const dbPin = pinMap.get(iface.id);
            return {
                interface: iface.id,
                name: iface.name,
                description: iface.description,
                pin: dbPin ? '●●●●' : null, // Nu returnăm PIN-ul real, doar masca
                hasPin: !!dbPin,
                pin_hash: dbPin?.pin_hash || null,
                pin_salt: dbPin?.pin_salt || null,
                policyVersion: dbPin?.pin_policy_version || 1,
                lastRotatedAt: dbPin?.pin_last_rotated_at || null,
                rotatedBy: dbPin?.pin_rotated_by || null,
                algorithm: dbPin?.algorithm || 'pbkdf2',
                legacy: false // PIN-urile din DB sunt hash-uite
            };
        });

        res.json({
            success: true,
            pins: pins
        });
    } catch (error) {
        console.error('❌ Error in getPins:', error);
        next(error);
    }
}

// POST /api/admin/update-pin - Actualizează sau creează un PIN pentru o interfață
async function updatePin(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const crypto = require('crypto');

        const { interface, pin } = req.body;

        // Validare
        if (!interface) {
            return res.status(400).json({
                success: false,
                error: 'Interfața este obligatorie'
            });
        }

        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                error: 'PIN-ul trebuie să conțină exact 4 cifre'
            });
        }

        // Creează tabela interface_pins dacă nu există
        await dbRun(db, `
            CREATE TABLE IF NOT EXISTS interface_pins (
                interface TEXT PRIMARY KEY,
                pin_hash TEXT NOT NULL,
                pin_salt TEXT NOT NULL,
                pin_policy_version INTEGER DEFAULT 1,
                pin_last_rotated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                pin_rotated_by TEXT,
                algorithm TEXT DEFAULT 'pbkdf2',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Generează salt și hash pentru PIN
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');

        // Inserează sau actualizează PIN-ul
        await dbRun(db, `
            INSERT INTO interface_pins (
                interface, pin_hash, pin_salt, pin_policy_version,
                pin_last_rotated_at, algorithm, updated_at
            )
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(interface) DO UPDATE SET
                pin_hash = EXCLUDED.pin_hash,
                pin_salt = EXCLUDED.pin_salt,
                pin_policy_version = pin_policy_version + 1,
                pin_last_rotated_at = CURRENT_TIMESTAMP,
                algorithm = EXCLUDED.algorithm,
                updated_at = CURRENT_TIMESTAMP
        `, [interface, hash, salt, 1, 'pbkdf2']);

        res.json({
            success: true,
            message: `PIN-ul pentru ${interface} a fost actualizat cu succes`,
            pin: '●●●●' // Nu returnăm PIN-ul real
        });
    } catch (error) {
        console.error('❌ Error in updatePin:', error);
        next(error);
    }
}

// POST /api/admin/delete-pin - Șterge un PIN pentru o interfață
async function deletePin(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        const { interface } = req.body;

        // Validare
        if (!interface) {
            return res.status(400).json({
                success: false,
                error: 'Interfața este obligatorie'
            });
        }

        // Verifică dacă tabela există
        const tableExists = await new Promise((resolve) => {
            db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='interface_pins'
            `, [], (err, row) => {
                resolve(!!row);
            });
        });

        if (!tableExists) {
            return res.json({
                success: true,
                message: `PIN-ul pentru ${interface} nu există`
            });
        }

        // Șterge PIN-ul
        const result = await dbRun(db, `
            DELETE FROM interface_pins WHERE interface = ?
        `, [interface]);

        if (result.changes === 0) {
            return res.json({
                success: true,
                message: `PIN-ul pentru ${interface} nu există`
            });
        }

        res.json({
            success: true,
            message: `PIN-ul pentru ${interface} a fost șters cu succes`
        });
    } catch (error) {
        console.error('❌ Error in deletePin:', error);
        next(error);
    }
}

// GET /api/admin/user-pins - Returnează PIN-uri pentru utilizatori
async function getUserPins(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Obține PIN-urile utilizatorilor din users
        let userPins = [];
        try {
            const usersWithPins = await dbAll(db, `
                SELECT id, username, pin, role, email, is_active
                FROM users
                WHERE pin IS NOT NULL AND pin != ''
                ORDER BY username
            `);

            userPins = usersWithPins.map(u => ({
                id: `user_${u.id}`,
                user_id: u.id,
                username: u.username,
                pin: u.pin,
                role: u.role || 'user',
                type: 'user',
                email: u.email,
                is_active: u.is_active === 1 || u.is_active === true,
            }));
        } catch (error) {
            console.warn('⚠️ Error fetching user pins:', error.message);
        }

        // Obține PIN-urile din waiters
        let waiterPins = [];
        try {
            const waitersWithPins = await dbAll(db, `
                SELECT id, name, pin, active
                FROM waiters
                WHERE pin IS NOT NULL AND pin != ''
                ORDER BY name
            `);

            waiterPins = waitersWithPins.map(w => ({
                id: `waiter_${w.id}`,
                user_id: w.id,
                username: w.name,
                pin: w.pin,
                role: 'waiter',
                type: 'waiter',
                is_active: w.active === 1 || w.active === true,
            }));
        } catch (error) {
            console.warn('⚠️ Error fetching waiter pins:', error.message);
        }

        // Adaugă PIN-ul default pentru admin (5555) dacă nu există deja
        const hasAdminPin = userPins.some(p => p.username === 'admin' && p.pin === '5555');
        if (!hasAdminPin) {
            userPins.unshift({
                id: 'admin_default',
                user_id: 1,
                username: 'admin',
                pin: '5555',
                role: 'admin',
                type: 'user',
                is_active: true,
                is_default: true,
            });
        }

        // Obține PIN-urile din user_pins (legacy)
        let legacyPins = [];
        try {
            const tableExists = await new Promise((resolve) => {
                db.get(`
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='user_pins'
                `, [], (err, row) => {
                    resolve(!!row);
                });
            });

            if (tableExists) {
                const legacyRows = await dbAll(db, `
                    SELECT up.id, up.user_id, up.pin, up.role, up.created_at, up.last_used,
                           u.username, u.email
                    FROM user_pins up
                    LEFT JOIN users u ON up.user_id = u.id
                    ORDER BY up.created_at DESC
                `);

                legacyPins = (legacyRows || []).map(up => ({
                    id: `legacy_${up.id}`,
                    user_id: up.user_id,
                    username: up.username || 'Unknown',
                    pin: up.pin,
                    role: up.role,
                    type: 'legacy',
                    email: up.email,
                    created_at: up.created_at,
                    last_used: up.last_used,
                }));
            }
        } catch (error) {
            console.warn('⚠️ Error fetching legacy pins:', error.message);
        }

        // Combină toate PIN-urile
        const allPins = [...userPins, ...waiterPins, ...legacyPins];

        res.json({
            success: true,
            pins: allPins
        });
    } catch (error) {
        console.error('❌ Error in getUserPins:', error);
        next(error);
    }
}

// GET /api/admin/invoices
async function getInvoices(req, res, next) {
    try {
        res.json({
            success: true,
            invoices: [],
            total: 0
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/backups
async function getBackups(req, res, next) {
    try {
        const fs = require('fs');
        const path = require('path');
        const backupsDir = path.join(__dirname, '../../../backups');

        let backups = [];
        if (fs.existsSync(backupsDir)) {
            const files = fs.readdirSync(backupsDir);
            backups = files
                .filter(f => f.endsWith('.db') || f.endsWith('.sql'))
                .map(f => ({
                    name: f,
                    size: fs.statSync(path.join(backupsDir, f)).size,
                    created: fs.statSync(path.join(backupsDir, f)).birthtime
                }));
        }

        res.json({
            success: true,
            backups: backups
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/archive-stats
async function getArchiveStats(req, res, next) {
    try {
        res.json({
            success: true,
            stats: {
                total: 0,
                size: 0,
                oldest: null,
                newest: null
            }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/reports/profitability
async function getProfitabilityReport(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        res.json({
            success: true,
            report: {
                revenue: 0,
                costs: 0,
                profit: 0,
                margin: 0
            },
            period: { startDate, endDate }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/settings/locations
async function getLocations(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Try locations table first, fallback to management_locations
        let locations = null;
        try {
            locations = await db.all(`
                SELECT * FROM locations
                WHERE is_active = 1
                ORDER BY name
            `);
        } catch (error) {
            locations = null;
        }

        if (!locations) {
            try {
                locations = await db.all(`
                    SELECT * FROM management_locations
                    WHERE is_active = 1
                    ORDER BY name
                `);
            } catch (error) {
                console.warn('⚠️ Error fetching management_locations:', error.message);
                locations = [];
            }
        }

        res.json({
            success: true,
            locations: locations || []
        });
    } catch (error) {
        console.error('[getLocations] Error:', error);
        // Return empty array instead of 500 error
        res.json({ success: true, locations: [] });
    }
}

// GET /api/catalog/categories/tree
async function getCategoriesTree(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let categories = [];
        try {
            categories = await db.all(`
                SELECT * FROM catalog_categories
                WHERE is_active = 1
                ORDER BY parent_id, display_order, name
            `);
        } catch (error) {
            console.warn('⚠️ Error fetching categories:', error.message);
            categories = [];
        }

        // Build tree structure
        const tree = buildCategoryTree(categories || []);

        res.json({
            success: true,
            categories: tree
        });
    } catch (error) {
        next(error);
    }
}

function buildCategoryTree(categories, parentId = null) {
    return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
            ...cat,
            children: buildCategoryTree(categories, cat.id)
        }));
}

// GET /api/catalog/products
async function getCatalogProducts(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');

        // Verifică dacă DB este gata cu timeout
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getCatalogProducts] Database not ready:', dbError.message);
            return res.status(503).json({
                success: false,
                error: 'Database not ready',
                message: 'Server is initializing, please try again in a moment',
                products: []
            });
        }

        const { is_active = 1 } = req.query;

        let products = [];
        try {
            products = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT p.*, c.name as category_name
                    FROM catalog_products p
                    LEFT JOIN catalog_categories c ON p.category_id = c.id
                    WHERE p.is_active = ?
                    ORDER BY c.display_order, p.display_order, p.name
                `, [is_active], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ [getCatalogProducts] Error fetching products:', err.message);
                        resolve([]);
                    } else {
                        // Deep clone to remove EventEmitter properties
                        const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ [getCatalogProducts] Error fetching products:', error.message);
            products = [];
        }

        res.json({
            success: true,
            products: products || []
        });
    } catch (error) {
        console.error('❌ [getCatalogProducts] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            products: []
        });
    }
}

// GET /api/recipes/all
async function getAllRecipes(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');

        // Verifică dacă DB este gata cu timeout
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getAllRecipes] Database not ready:', dbError.message);
            return res.status(503).json({
                success: false,
                error: 'Database not ready',
                message: 'Server is initializing, please try again in a moment',
                products: []
            });
        }

        // Returnează produsele din meniu cu informații despre rețete
        let products = [];
        try {
            products = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        m.id as product_id,
                        m.name as product_name,
                        m.name_en as product_name_en,
                        m.category as product_category,
                        m.price,
                        m.is_sellable as is_active,
                        m.has_recipe,
                        COUNT(DISTINCT r.id) as recipe_count
                    FROM menu m
                    LEFT JOIN recipes r ON m.id = r.product_id
                    WHERE m.is_sellable = 1
                    GROUP BY m.id, m.name, m.name_en, m.category, m.price, m.is_sellable, m.has_recipe
                    ORDER BY m.name
                `, [], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ [getAllRecipes] Error fetching recipes summary:', err.message);
                        resolve([]);
                    } else {
                        // Deep clone to remove EventEmitter properties
                        const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ [getAllRecipes] Error fetching recipes summary:', error.message);
            products = [];
        }

        res.json({
            success: true,
            products: products || []
        });
    } catch (error) {
        console.error('❌ [getAllRecipes] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            products: []
        });
    }
}

// GET /api/recipes/product/:id - Obține rețeta pentru un produs specific
async function getRecipeByProductId(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const { id } = req.params;

        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getRecipeByProductId] Database not ready:', dbError.message);
            return res.status(503).json({
                success: false,
                error: 'Database not ready',
                message: 'Server is initializing, please try again in a moment',
                recipes: []
            });
        }

        let recipes = [];
        try {
            recipes = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        r.id,
                        r.product_id,
                        r.ingredient_id,
                        i.name as ingredient_name,
                        r.quantity_needed,
                        r.ingredient_unit,
                        r.created_at,
                        r.updated_at
                    FROM recipes r
                    LEFT JOIN ingredients i ON r.ingredient_id = i.id
                    WHERE r.product_id = ?
                    ORDER BY r.id
                `, [id], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ [getRecipeByProductId] Error fetching recipe:', err.message);
                        resolve([]);
                    } else {
                        const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ [getRecipeByProductId] Error fetching recipe:', error.message);
            recipes = [];
        }

        res.json({
            success: true,
            recipes: recipes || []
        });
    } catch (error) {
        console.error('❌ [getRecipeByProductId] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            recipes: []
        });
    }
}

// GET /api/recipes/preparations - Obține toate preparatele (produse cu rețete)
async function getRecipePreparations(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');

        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getRecipePreparations] Database not ready:', dbError.message);
            return res.status(503).json({
                success: false,
                error: 'Database not ready',
                message: 'Server is initializing, please try again in a moment',
                preparations: []
            });
        }

        let preparations = [];
        try {
            preparations = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT DISTINCT
                        m.id as product_id,
                        m.name as product_name,
                        m.name_en as product_name_en,
                        m.category as product_category,
                        m.price,
                        COUNT(DISTINCT r.id) as recipe_count
                    FROM menu m
                    INNER JOIN recipes r ON m.id = r.product_id
                    WHERE m.is_sellable = 1
                    GROUP BY m.id, m.name, m.name_en, m.category, m.price
                    ORDER BY m.name
                `, [], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ [getRecipePreparations] Error fetching preparations:', err.message);
                        resolve([]);
                    } else {
                        const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ [getRecipePreparations] Error fetching preparations:', error.message);
            preparations = [];
        }

        res.json({
            success: true,
            preparations: preparations || []
        });
    } catch (error) {
        console.error('❌ [getRecipePreparations] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            preparations: []
        });
    }
}

// GET /api/orders - With pagination support
async function getOrders(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');

        // Verifică dacă DB este gata cu timeout
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getOrders] Database not ready:', dbError.message);
            return res.status(503).json({
                success: false,
                error: 'Database not ready',
                message: 'Server is initializing, please try again in a moment'
            });
        }

        const {
            status,
            limit = 50,
            offset = 0,
            page,
            startDate,
            endDate,
            includePagination = 'false' // For backwards compatibility
        } = req.query;

        const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 50), 500);
        const parsedPage = parseInt(page) || 1;
        const parsedOffset = parseInt(offset) || (parsedPage - 1) * parsedLimit;

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }
        // Filtru după dată - dacă nu sunt specificate, folosește ziua curentă automat (închidere zilnică fiscală)
        if (startDate) {
            whereClause += ' AND strftime(\'%Y-%m-%d\', timestamp) >= strftime(\'%Y-%m-%d\', ?)';
            params.push(startDate);
        } else {
            // Filtrare automată pentru ziua curentă
            whereClause += " AND DATE(timestamp) = DATE('now')";
        }
        if (endDate) {
            whereClause += ' AND strftime(\'%Y-%m-%d\', timestamp) <= strftime(\'%Y-%m-%d\', ?)';
            params.push(endDate);
        }

        // Get total count for pagination (only if requested)
        let totalCount = 0;
        if (includePagination === 'true') {
            totalCount = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM orders ${whereClause}`, params, (err, row) => {
                    if (err) resolve(0);
                    else resolve(row?.count || 0);
                });
            });
        }

        // Get orders with pagination
        const query = `SELECT * FROM orders ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        const queryParams = [...params, parsedLimit, parsedOffset];

        const orders = await new Promise((resolve, reject) => {
            db.all(query, queryParams, (err, rows) => {
                if (err) {
                    console.error('❌ [getOrders] Database error:', err.message);
                    resolve([]);
                } else {
                    const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
                    resolve(result);
                }
            });
        });

        // Return with pagination if requested, otherwise maintain backwards compatibility
        if (includePagination === 'true') {
            const totalPages = Math.ceil(totalCount / parsedLimit);
            res.json({
                success: true,
                data: orders,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    offset: parsedOffset,
                    total: totalCount,
                    totalPages,
                    hasNext: parsedPage < totalPages,
                    hasPrev: parsedPage > 1
                }
            });
        } else {
            // Return array directly for API compatibility
            res.json(orders || []);
        }
    } catch (error) {
        console.error('❌ [getOrders] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// GET /api/orders-delivery
async function getOrdersDelivery(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { status = 'all', startDate, endDate, limit = '1000' } = req.query;

        // Bar categories constant (same as in order.events.js)
        const BAR_CATEGORIES = [
            'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
            'Răcoritoare', 'Racoritoare',
            'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
            'Băuturi Spirtoase', 'Bauturi Spirtoase',
            'Coctailuri Non-Alcoolice',
            'Vinuri'
        ];

        // Query pentru TOATE comenzile (nu doar delivery) pentru istoric vânzări
        let query = "SELECT * FROM orders WHERE 1=1";
        const params = [];

        // Filtru după status
        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        // Filtru după dată - dacă nu sunt specificate, folosește ziua curentă automat
        if (startDate) {
            query += ' AND DATE(timestamp) >= ?';
            params.push(startDate);
        } else {
            // Filtrare automată pentru ziua curentă
            query += " AND DATE(timestamp) = DATE('now')";
        }
        if (endDate) {
            query += ' AND DATE(timestamp) <= ?';
            params.push(endDate);
        } else if (!startDate) {
            // Dacă nu e specificat startDate, endDate default este ziua curentă (deja filtrat mai sus)
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(parseInt(limit, 10) || 1000);

        const rows = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('❌ Error fetching orders:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });

        // Check if order_items table exists
        const orderItemsTableExists = await new Promise((resolve) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'", (err, row) => {
                resolve(!!row);
            });
        });

        // Parse items JSON dacă există și populează name-urile
        const orders = await Promise.all(rows.map(async (order) => {
            try {
                let items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
                if (!Array.isArray(items)) items = [];

                // 🔴 FIX: Populează name pentru items-urile care nu îl au
                const enrichedItems = await Promise.all(items.map(async (item) => {
                    if (!item) return item;

                    let productName = item.name || item.product_name || '';
                    const productId = item.product_id || item.id || item.productId;

                    // Dacă name lipsește dar avem product_id, obține-l din baza de date
                    if ((!productName || productName.trim() === '') && productId) {
                        try {
                            const product = await new Promise((resolve, reject) => {
                                db.get('SELECT name FROM menu WHERE id = ?', [productId], (err, row) => {
                                    if (err) reject(err);
                                    else resolve(row);
                                });
                            });

                            if (product && product.name) {
                                productName = product.name;
                            }
                        } catch (productErr) {
                            // Ignoră eroarea și continuă
                        }
                    }

                    // Dacă tot nu avem name, folosește un fallback
                    if (!productName || productName.trim() === '') {
                        productName = `Produs ${productId || 'N/A'}`;
                    }

                    return {
                        ...item,
                        name: productName,
                        product_id: productId || item.product_id || item.id || item.productId
                    };
                }));

                return {
                    ...order,
                    items: enrichedItems,
                };
            } catch (parseError) {
                return {
                    ...order,
                    items: [],
                };
            }
        }));

        // 🔴 FIX ORDER #2963: Filter orders to only include those where all bar/kitchen items are ready
        // This ensures orders don't appear in livrare1.html until they've been processed by bar/kitchen
        const filteredOrders = await Promise.all(orders.map(async (order) => {
            try {
                // Check if order has items from bar or kitchen
                let hasBarKitchenItems = false;
                let allBarKitchenItemsReady = true;

                if (orderItemsTableExists) {
                    // Use order_items table if available (more accurate)
                    const orderItems = await new Promise((resolve) => {
                        db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, rows) => {
                            if (err) {
                                console.warn(`⚠️ Error fetching order_items for order ${order.id}:`, err.message);
                                resolve([]);
                            } else {
                                resolve(rows || []);
                            }
                        });
                    });

                    // Check each item's category and status
                    for (const item of orderItems) {
                        const productId = item.product_id;
                        if (!productId) continue;

                        // Get product category from menu
                        const product = await new Promise((resolve) => {
                            db.get('SELECT category FROM menu WHERE id = ?', [productId], (err, row) => {
                                if (err) resolve(null);
                                else resolve(row);
                            });
                        });

                        if (product && product.category) {
                            // This item belongs to bar or kitchen
                            hasBarKitchenItems = true;

                            // Check if item is ready (status should be 'ready', 'completed', or 'delivered')
                            const itemStatus = item.status || 'pending';
                            if (itemStatus !== 'ready' && itemStatus !== 'completed' && itemStatus !== 'delivered') {
                                allBarKitchenItemsReady = false;
                                console.log(`🔍 Order #${order.id} - Item #${item.id} (${item.name}) status: ${itemStatus} - NOT READY`);
                            }
                        }
                    }
                } else {
                    // Fallback: Use items from JSON if order_items table doesn't exist
                    const items = order.items || [];

                    for (const item of items) {
                        const productId = item.product_id || item.id || item.productId;
                        if (!productId) continue;

                        // Get product category from menu
                        const product = await new Promise((resolve) => {
                            db.get('SELECT category FROM menu WHERE id = ?', [productId], (err, row) => {
                                if (err) resolve(null);
                                else resolve(row);
                            });
                        });

                        if (product && product.category) {
                            // This item belongs to bar or kitchen
                            hasBarKitchenItems = true;

                            // Check item status from JSON
                            const itemStatus = item.status || 'pending';
                            if (itemStatus !== 'ready' && itemStatus !== 'completed' && itemStatus !== 'delivered') {
                                allBarKitchenItemsReady = false;
                                console.log(`🔍 Order #${order.id} - Item "${item.name}" status: ${itemStatus} - NOT READY`);
                            }
                        }
                    }
                }

                // Decision logic:
                // 0. If order is already delivered/completed → include it (for history display)
                // 1. If order has no bar/kitchen items → include it (e.g., drive-thru, simple orders)
                // 2. If order has bar/kitchen items AND all are ready → include it
                // 3. If order has bar/kitchen items BUT not all are ready → exclude it

                // ✅ FIX: Always include orders that are already delivered/completed
                const orderStatus = order.status?.toLowerCase();
                if (orderStatus === 'delivered' || orderStatus === 'completed') {
                    return order;
                }

                if (!hasBarKitchenItems) {
                    // No bar/kitchen items - include immediately
                    return order;
                }

                if (allBarKitchenItemsReady) {
                    // All items are ready - include order
                    console.log(`✅ Order #${order.id} - All bar/kitchen items ready - INCLUDING in delivery list`);
                    return order;
                }

                // Items not ready - exclude from delivery list
                console.log(`⏳ Order #${order.id} - Bar/kitchen items NOT ready - EXCLUDING from delivery list`);
                return null;
            } catch (filterError) {
                console.error(`❌ Error filtering order ${order.id}:`, filterError.message);
                // On error, include the order to avoid losing it
                return order;
            }
        }));

        // Remove null entries (orders that were excluded)
        const readyOrders = filteredOrders.filter(order => order !== null);

        console.log(`📊 Orders delivery: ${orders.length} total orders → ${readyOrders.length} ready orders (filtered ${orders.length - readyOrders.length})`);

        // Returnează în formatul așteptat de componentă
        res.json({
            success: true,
            data: readyOrders || [],
            orders: readyOrders || [] // Compatibilitate backward
        });
    } catch (error) {
        console.error('❌ Error in getOrdersDelivery:', error);
        res.json({
            success: true,
            data: [],
            orders: []
        });
    }
}

// GET /api/admin/tables/status
async function getTablesStatus(req, res, next) {
    console.log('🔵 [HIT] /api/admin/tables/status - Handler invoked');

    try {
        const { dbPromise } = require('../../../../database');

        // Verifică dacă DB este gata cu timeout
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ [getTablesStatus] Database not ready:', dbError.message);
            return res.json({
                success: true,
                tables: []
            });
        }

        // Test DB connection first
        console.log('🔵 [DB TEST] Testing DB connection with db.get...');
        db.get('SELECT 1 as test', [], (err, row) => {
            console.log('🔵 [DB TEST] db.get callback:', err ? err.message : 'OK', row);
        });

        // Check if tables table exists
        console.log('🔵 [DB] Checking if tables table exists...');
        let tableExists = null;
        try {
            tableExists = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='tables'
                `, [], (err, row) => {
                    if (err) {
                        console.log('🔵 [DB] db.get error:', err.message);
                        resolve(null);
                    } else {
                        console.log('🔵 [DB] db.get result:', row ? 'table exists' : 'table not found');
                        resolve(row);
                    }
                });
            });
        } catch (error) {
            console.log('🔵 [DB] Promise error:', error.message);
            tableExists = null;
        }

        if (!tableExists) {
            console.log('🔵 [RESPONSE] Returning empty array (table does not exist)');
            return res.json({
                success: true,
                tables: []
            });
        }

        // Use helper function dbAll() to avoid EventEmitter issues
        console.log('🔵 [DB] BEFORE db.all - calling dbAll helper...');
        let tables = [];
        try {
            const result = await dbAll(db, `
                SELECT t.*, 
                       COUNT(DISTINCT o.id) as active_orders,
                       COUNT(DISTINCT CASE WHEN r.status = 'confirmed' AND r.reservation_date = date('now') THEN r.id END) as confirmed_reservations_today,
                       COUNT(DISTINCT rt.reservation_id) as reservation_tables_count
                FROM tables t
                LEFT JOIN orders o ON CAST(o.table_number AS TEXT) = CAST(t.table_number AS TEXT) 
                    AND o.status IN ('pending', 'confirmed', 'preparing')
                LEFT JOIN reservations r ON r.table_id = t.id 
                    AND r.status = 'confirmed'
                    AND r.reservation_date = date('now')
                LEFT JOIN reservation_tables rt ON rt.table_id = t.id
                    AND EXISTS (
                        SELECT 1 FROM reservations r2 
                        WHERE r2.id = rt.reservation_id 
                        AND r2.status = 'confirmed' 
                        AND r2.reservation_date = date('now')
                    )
                GROUP BY t.id
                ORDER BY t.table_number
            `, []);

            console.log('🔵 [DB] AFTER db.all - result type:', typeof result, 'isArray:', Array.isArray(result), 'length:', result?.length);

            // CRITICAL: Double-check result is an array
            if (Array.isArray(result)) {
                // Procesează rezultatele pentru a determina statusul mesei
                tables = result.map(table => {
                    const hasActiveOrder = (table.active_orders || 0) > 0;
                    const hasReservation = (table.confirmed_reservations_today || 0) > 0 || (table.reservation_tables_count || 0) > 0;

                    // Determină statusul mesei
                    let status = 'free';
                    if (hasActiveOrder) {
                        status = 'occupied';
                    } else if (hasReservation) {
                        status = 'reserved';
                    }

                    return {
                        ...table,
                        status: status,
                        number: table.table_number || table.number
                    };
                });
            } else {
                console.error('❌ dbAll returned non-array:', typeof result);
                tables = [];
            }
        } catch (error) {
            console.error('❌ Error fetching tables:', error.message);
            tables = [];
        }

        // CRITICAL: Final check before sending
        if (!Array.isArray(tables)) {
            console.error('❌ CRITICAL: tables is NOT an array before res.json!');
            tables = [];
        }

        console.log('🔵 [RESPONSE] Sending response with', tables.length, 'tables');

        // Build response - ensure clean object
        const response = {
            success: true,
            tables: tables
        };

        return res.json(response);
    } catch (error) {
        console.error('❌ Error in getTablesStatus:', error);
        // Return safe response on error
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            tables: []
        });
    }
}

// GET /api/kiosk/tables/positions
async function getKioskTablesPositions(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');

        // Așteaptă DB să fie gata (cu timeout)
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ Database not ready for table positions:', dbError.message);
            return res.json({
                success: true,
                positions: []
            });
        }

        // Check if table_positions table exists
        let tableExists = null;
        try {
            tableExists = await new Promise((resolve) => {
                db.get(`
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='table_positions'
                `, (err, row) => {
                    if (err || !row) resolve(null);
                    else resolve(row);
                });
            });
        } catch (error) {
            tableExists = null;
        }

        if (!tableExists) {
            return res.json({
                success: true,
                positions: []
            });
        }

        let positions = [];
        try {
            positions = await new Promise((resolve) => {
                db.all(`
                    SELECT * FROM table_positions
                    WHERE is_active = 1
                    ORDER BY name
                `, [], (err, rows) => {
                    if (err) {
                        console.warn('⚠️ Error fetching table positions:', err.message);
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                });
            });
        } catch (error) {
            console.warn('⚠️ Error fetching table positions:', error.message);
            positions = [];
        }

        return res.json({
            success: true,
            positions: positions || []
        });
    } catch (error) {
        console.error('❌ Error in getKioskTablesPositions:', error.message);
        // Returnăm răspuns sigur
        return res.json({
            success: true,
            positions: []
        });
    }
}

// GET /api/kiosk/orders/:id
async function getKioskOrder(req, res, next) {
    try {
        const { id } = req.params;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        const order = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!order) {
            return res.status(404).json({ error: 'Comandă negăsită' });
        }

        // Get order items if table exists
        let items = [];
        try {
            const orderItemsExists = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='order_items'
            `);

            if (orderItemsExists) {
                items = await new Promise((resolve, reject) => {
                    db.all('SELECT * FROM order_items WHERE order_id = ?', [id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
            } else if (order.items) {
                // Fallback to JSON items if order_items table doesn't exist
                try {
                    items = JSON.parse(order.items);
                } catch (e) {
                    items = [];
                }
            }
        } catch (error) {
            console.warn('⚠️ Error fetching order items:', error.message);
            if (order.items) {
                try {
                    items = JSON.parse(order.items);
                } catch (e) {
                    items = [];
                }
            }
        }

        res.json({
            success: true,
            order: {
                ...order,
                items: items
            },
            items: items
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/users
async function getUsers(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { role } = req.query;

        // Verifică dacă tabela roles există
        const rolesTableExists = await new Promise((resolve) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='roles'", (err, row) => {
                resolve(!!row);
            });
        });

        let query = `
            SELECT 
                u.id, 
                u.username, 
                u.role, 
                u.email, 
                u.is_active,
                u.last_login,
                u.created_at
        `;

        if (rolesTableExists) {
            query += `, r.role_name, r.role_description`;
        } else {
            query += `, u.role as role_name, NULL as role_description`;
        }

        query += `
            FROM users u
        `;

        if (rolesTableExists) {
            query += `LEFT JOIN roles r ON u.role = r.role_name`;
        }

        query += ` WHERE 1=1`;

        const params = [];

        if (role) {
            const roles = role.split(',');
            query += ` AND u.role IN (${roles.map(() => '?').join(',')})`;
            params.push(...roles);
        }

        let users = [];
        try {
            users = await new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
        } catch (error) {
            console.warn('⚠️ Error fetching users:', error.message);
            users = [];
        }

        // Formatează pentru frontend
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role_name: user.role_name || user.role,
            role_description: user.role_description || null,
            is_active: user.is_active === 1 || user.is_active === true,
            last_login: user.last_login,
            created_at: user.created_at,
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('❌ Error in getUsers:', error);
        next(error);
    }
}

// POST /api/admin/users
async function createUser(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { username, email, password, roleId } = req.body;

        if (!username || !password || !roleId) {
            return res.status(400).json({ error: 'Username, password și roleId sunt obligatorii' });
        }

        // Obține numele rolului din ID
        const role = await new Promise((resolve, reject) => {
            db.get('SELECT role_name FROM roles WHERE id = ?', [roleId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.role_name : null);
            });
        });

        if (!role) {
            return res.status(400).json({ error: 'Rolul nu există' });
        }

        // Hash password (simplificat - ar trebui folosit bcrypt în producție)
        const crypto = require('crypto');
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)',
                [username, email || null, passwordHash, role],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        // Obține utilizatorul creat
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at, r.role_name, r.role_description
                 FROM users u
                 LEFT JOIN roles r ON u.role = r.role_name
                 WHERE u.id = ?`,
                [result.id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role_name: user.role_name || user.role,
            role_description: user.role_description,
            is_active: user.is_active === 1,
            created_at: user.created_at,
        });
    } catch (error) {
        console.error('❌ Error in createUser:', error);
        if (error.message && error.message.includes('UNIQUE constraint')) {
            res.status(400).json({ error: 'Username-ul există deja' });
        } else {
            res.status(500).json({ error: error.message || 'Eroare la crearea utilizatorului' });
        }
    }
}

// PUT /api/admin/users/:id
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { username, email, password, roleId } = req.body;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă utilizatorul există
        const existing = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existing) {
            return res.status(404).json({ error: 'Utilizatorul nu există' });
        }

        // Obține numele rolului dacă roleId este furnizat
        let role = existing.role;
        if (roleId) {
            const roleRow = await new Promise((resolve, reject) => {
                db.get('SELECT role_name FROM roles WHERE id = ?', [roleId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!roleRow) {
                return res.status(400).json({ error: 'Rolul nu există' });
            }
            role = roleRow.role_name;
        }

        // Hash password dacă este furnizat
        let passwordHash = existing.password;
        if (password) {
            const crypto = require('crypto');
            passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        }

        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET username = COALESCE(?, username), email = ?, password = ?, role = ? WHERE id = ?',
                [username || existing.username, email !== undefined ? email : existing.email, passwordHash, role, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Obține utilizatorul actualizat
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.role, u.is_active, u.last_login, u.created_at, r.role_name, r.role_description
                 FROM users u
                 LEFT JOIN roles r ON u.role = r.role_name
                 WHERE u.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role_name: user.role_name || user.role,
            role_description: user.role_description,
            is_active: user.is_active === 1,
            last_login: user.last_login,
            created_at: user.created_at,
        });
    } catch (error) {
        console.error('❌ Error in updateUser:', error);
        res.status(500).json({ error: error.message || 'Eroare la actualizarea utilizatorului' });
    }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă utilizatorul există
        const existing = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existing) {
            return res.status(404).json({ error: 'Utilizatorul nu există' });
        }

        // Șterge utilizatorul
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ success: true, message: 'Utilizatorul a fost șters' });
    } catch (error) {
        console.error('❌ Error in deleteUser:', error);
        res.status(500).json({ error: error.message || 'Eroare la ștergerea utilizatorului' });
    }
}

// GET /api/admin/roles
async function getRoles(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă tabela roles există
        const tableExists = await new Promise((resolve) => {
            db.get(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='roles'",
                (err, row) => {
                    resolve(!!row);
                }
            );
        });

        if (!tableExists) {
            // Returnează roluri default dacă tabela nu există
            return res.json([
                { id: 1, role_name: 'admin', role_description: 'Administrator', user_count: 0 },
                { id: 2, role_name: 'manager', role_description: 'Manager', user_count: 0 },
                { id: 3, role_name: 'waiter', role_description: 'Chelner', user_count: 0 },
                { id: 4, role_name: 'chef', role_description: 'Bucătar', user_count: 0 },
            ]);
        }

        const roles = await new Promise((resolve, reject) => {
            db.all(
                `SELECT 
                    r.id,
                    r.role_name,
                    r.role_description,
                    COUNT(u.id) as user_count
                 FROM roles r
                 LEFT JOIN users u ON r.role_name = u.role
                 GROUP BY r.id, r.role_name, r.role_description
                 ORDER BY r.id`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        res.json(roles);
    } catch (error) {
        console.error('❌ Error in getRoles:', error);
        res.status(500).json({ error: error.message || 'Eroare la încărcarea rolurilor' });
    }
}

// GET /api/scheduling/live-stats
async function getSchedulingLiveStats(req, res, next) {
    try {
        res.json({
            success: true,
            stats: {
                onDuty: 0,
                scheduled: 0,
                absent: 0
            }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/scheduling/time-entries
async function getTimeEntries(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        res.json({
            success: true,
            entries: [],
            period: { startDate, endDate }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/events
async function getEvents(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let events = [];
        try {
            events = await db.all(`
                SELECT * FROM events
                WHERE date >= date('now')
                ORDER BY date, time
                LIMIT 50
            `);
        } catch (error) {
            console.warn('⚠️ Error fetching events:', error.message);
            events = [];
        }

        res.json({
            success: true,
            events: events || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/menu/all
async function getMenuAll(req, res, next) {
    try {
        const { lang = 'ro' } = req.query;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let products = [];
        try {
            // Verifică dacă catalog_products există ȘI are produse
            const catalogExists = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='catalog_products'
            `);

            console.log(`[getMenuAll] catalog_products exists: ${!!catalogExists}`);

            if (catalogExists) {
                // Try catalog_products first (new schema)
                products = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT p.*, c.name as category_name
                        FROM catalog_products p
                        LEFT JOIN catalog_categories c ON p.category_id = c.id
                        WHERE p.is_active = 1
                        ORDER BY COALESCE(c.display_order, 0), COALESCE(p.display_order, 0), p.name
                    `, (err, rows) => {
                        if (err) {
                            console.error('❌ Error fetching from catalog_products:', err);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });

                console.log(`[getMenuAll] catalog_products count: ${products.length}`);

                // Dacă catalog_products este gol, face fallback la menu
                if (!products || products.length === 0) {
                    console.log('⚠️ catalog_products este gol, folosim menu table');
                    products = await new Promise((resolve, reject) => {
                        db.all(`
                            SELECT m.*, m.category as category_name
                            FROM menu m
                            WHERE (m.is_active = 1 OR m.is_active IS NULL) 
                              AND (m.is_sellable = 1 OR m.is_sellable IS NULL)
                            ORDER BY m.category, m.name
                        `, (err, rows) => {
                            if (err) {
                                console.error('❌ Error fetching from menu table:', err);
                                reject(err);
                            } else {
                                resolve(rows || []);
                            }
                        });
                    });
                    console.log(`[getMenuAll] menu table count: ${products.length}`);
                }
            } else {
                console.log('[getMenuAll] catalog_products does not exist, using menu table');
                // Fallback to menu table (legacy schema)
                products = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT m.*, m.category as category_name
                        FROM menu m
                        WHERE (m.is_active = 1 OR m.is_active IS NULL) 
                          AND (m.is_sellable = 1 OR m.is_sellable IS NULL)
                        ORDER BY m.category, m.name
                    `, (err, rows) => {
                        if (err) {
                            console.error('❌ Error fetching from menu table:', err);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });
                console.log(`[getMenuAll] menu table count: ${products.length}`);
            }
        } catch (error) {
            console.warn('⚠️ Error fetching products:', error.message);
            // Fallback to menu table (legacy schema)
            try {
                products = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT m.*, m.category as category_name
                        FROM menu m
                        WHERE (m.is_active = 1 OR m.is_active IS NULL) 
                          AND (m.is_sellable = 1 OR m.is_sellable IS NULL)
                        ORDER BY m.category, m.name
                    `, (err, rows) => {
                        if (err) {
                            console.error('❌ Error fetching from menu table (fallback):', err);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });
            } catch (fallbackError) {
                console.warn('⚠️ Error fetching products from menu table:', fallbackError.message);
                products = [];
            }
        }

        // Asigură-te că products este un array
        if (!Array.isArray(products)) {
            console.warn('⚠️ getMenuAll: products is not an array, converting...');
            products = [];
        }

        // Încarcă customizations pentru fiecare produs
        if (products.length > 0) {
            console.log(`[getMenuAll] Loading customizations for ${products.length} products...`);
            const productIds = products.map(p => p.id || p.product_id).filter(id => id != null);

            if (productIds.length > 0) {
                try {
                    // Verifică dacă tabela customization_options există
                    const tableExists = await new Promise((resolve, reject) => {
                        db.get(`
                            SELECT name FROM sqlite_master 
                            WHERE type='table' AND name='customization_options'
                        `, (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });

                    if (tableExists) {
                        // Strategie 1: Încearcă să găsească customizations folosind ID-ul direct (pentru menu)
                        const allCustomizationsById = await new Promise((resolve, reject) => {
                            const placeholders = productIds.map(() => '?').join(',');
                            db.all(`
                                SELECT 
                                    id,
                                    menu_item_id,
                                    option_name,
                                    option_type,
                                    extra_price,
                                    option_name_en
                                FROM customization_options
                                WHERE menu_item_id IN (${placeholders})
                                ORDER BY menu_item_id, id
                            `, productIds, (err, rows) => {
                                if (err) {
                                    console.warn('⚠️ Error fetching customizations by ID:', err.message);
                                    resolve([]);
                                } else {
                                    resolve(rows || []);
                                }
                            });
                        });

                        // Strategie 2: Dacă catalog_products există, caută customizations prin mapare nume
                        let allCustomizationsByName = [];
                        try {
                            const catalogExists = await new Promise((resolve, reject) => {
                                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='catalog_products'", (err, row) => {
                                    if (err) reject(err);
                                    else resolve(row);
                                });
                            });

                            if (catalogExists && products.length > 0) {
                                // Creează mapare nume -> menu.id pentru customizations
                                const productNames = products.map(p => p.name).filter(Boolean);
                                if (productNames.length > 0) {
                                    const namePlaceholders = productNames.map(() => '?').join(',');
                                    const menuProducts = await new Promise((resolve, reject) => {
                                        db.all(`
                                            SELECT id, name FROM menu 
                                            WHERE name IN (${namePlaceholders})
                                        `, productNames, (err, rows) => {
                                            if (err) reject(err);
                                            else resolve(rows || []);
                                        });
                                    });

                                    if (menuProducts.length > 0) {
                                        const menuIds = menuProducts.map(m => m.id);
                                        const menuPlaceholders = menuIds.map(() => '?').join(',');
                                        allCustomizationsByName = await new Promise((resolve, reject) => {
                                            db.all(`
                                                SELECT 
                                                    id,
                                                    menu_item_id,
                                                    option_name,
                                                    option_type,
                                                    extra_price,
                                                    option_name_en
                                                FROM customization_options
                                                WHERE menu_item_id IN (${menuPlaceholders})
                                                ORDER BY menu_item_id, id
                                            `, menuIds, (err, rows) => {
                                                if (err) {
                                                    console.warn('⚠️ Error fetching customizations by name:', err.message);
                                                    resolve([]);
                                                } else {
                                                    resolve(rows || []);
                                                }
                                            });
                                        });

                                        // Creează mapare nume -> menu.id
                                        const nameToMenuId = {};
                                        menuProducts.forEach(m => {
                                            nameToMenuId[m.name] = m.id;
                                        });

                                        // Creează mapare catalog_products.id -> menu.id (prin nume)
                                        const catalogToMenuId = {};
                                        products.forEach(p => {
                                            if (p.name && nameToMenuId[p.name]) {
                                                catalogToMenuId[p.id || p.product_id] = nameToMenuId[p.name];
                                            }
                                        });

                                        // Grupează customizations pe produs (folosind mapare)
                                        const customizationsByProduct = {};
                                        [...allCustomizationsById, ...allCustomizationsByName].forEach(custom => {
                                            const menuItemId = custom.menu_item_id;
                                            if (!customizationsByProduct[menuItemId]) {
                                                customizationsByProduct[menuItemId] = [];
                                            }
                                            customizationsByProduct[menuItemId].push({
                                                id: custom.id,
                                                option_name: custom.option_name,
                                                option_name_en: custom.option_name_en || custom.option_name,
                                                option_type: custom.option_type || 'topping',
                                                extra_price: custom.extra_price || 0
                                            });
                                        });

                                        // Adaugă customizations la fiecare produs (folosind mapare catalog -> menu)
                                        products = products.map(product => {
                                            const productId = product.id || product.product_id;
                                            // Încearcă direct ID
                                            let customizations = customizationsByProduct[productId] || [];

                                            // Dacă nu găsește, încearcă prin mapare nume
                                            if (customizations.length === 0 && catalogToMenuId[productId]) {
                                                customizations = customizationsByProduct[catalogToMenuId[productId]] || [];
                                            }

                                            return {
                                                ...product,
                                                customizations: customizations
                                            };
                                        });
                                    }
                                }
                            }
                        } catch (nameError) {
                            console.warn('⚠️ Error in name-based customization mapping:', nameError.message);
                        }

                        // Dacă nu s-a făcut mapare prin nume, folosește doar maparea directă
                        if (!products[0] || !products[0].customizations) {
                            // Grupează customizations pe produs (doar pentru menu)
                            const customizationsByProduct = {};
                            allCustomizationsById.forEach(custom => {
                                const productId = custom.menu_item_id;
                                if (!customizationsByProduct[productId]) {
                                    customizationsByProduct[productId] = [];
                                }
                                customizationsByProduct[productId].push({
                                    id: custom.id,
                                    option_name: custom.option_name,
                                    option_name_en: custom.option_name_en || custom.option_name,
                                    option_type: custom.option_type || 'topping',
                                    extra_price: custom.extra_price || 0
                                });
                            });

                            // Adaugă customizations la fiecare produs
                            products = products.map(product => {
                                const productId = product.id || product.product_id;
                                const customizations = customizationsByProduct[productId] || [];
                                return {
                                    ...product,
                                    customizations: customizations
                                };
                            });
                        }

                        const productsWithCustoms = products.filter(p => p.customizations && p.customizations.length > 0).length;
                        console.log(`[getMenuAll] ${productsWithCustoms} products have customizations`);
                    } else {
                        console.log('[getMenuAll] customization_options table does not exist, skipping customizations');
                    }
                } catch (customError) {
                    console.warn('⚠️ Error loading customizations:', customError.message);
                    // Continuă fără customizations
                }
            }
        }

        // Extrage categorii unice din produse pentru frontend
        const categories_ordered = [...new Set(products.map(p => p.category || p.category_name).filter(Boolean))];

        // Return format compatible with frontend expectations
        res.json({
            success: true,
            data: products || [],
            products: products || [],
            menu: products || [],
            categories_ordered: categories_ordered,
            lang
        });
    } catch (error) {
        console.error('❌ Error in getMenuAll:', error.message);
        // Returnează răspuns sigur în loc să oprească serverul
        res.json({
            success: true,
            data: [],
            products: [],
            menu: [],
            error: error.message
        });
    }
}

// GET /api/admin/reservations
async function getReservations(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { limit = 120, offset = 0, startDate, endDate, status } = req.query;

        // Verifică dacă tabela reservations există
        let tableExists = null;
        try {
            tableExists = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='reservations'
                `, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        } catch (error) {
            tableExists = null;
        }

        let reservations = [];
        if (tableExists) {
            let query = 'SELECT * FROM reservations WHERE 1=1';
            const params = [];

            if (startDate) {
                query += ' AND reservation_date >= ?';
                params.push(startDate);
            }
            if (endDate) {
                query += ' AND reservation_date <= ?';
                params.push(endDate);
            }
            if (status) {
                const statuses = status.split(',').filter(s => s.trim());
                if (statuses.length > 0) {
                    query += ` AND status IN (${statuses.map(() => '?').join(',')})`;
                    params.push(...statuses);
                }
            }

            // Folosește numele corecte ale coloanelor: reservation_date și reservation_time
            query += ' ORDER BY reservation_date DESC, reservation_time DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            try {
                reservations = await new Promise((resolve, reject) => {
                    db.all(query, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
            } catch (error) {
                console.warn('⚠️ Error fetching reservations:', error.message);
                reservations = [];
            }
        }

        // Asigură-te că reservations este un array
        if (!Array.isArray(reservations)) {
            reservations = [];
        }

        res.json({
            success: true,
            reservations: reservations
        });
    } catch (error) {
        console.error('❌ Error in getReservations:', error.message);
        // Returnează răspuns sigur în loc de 500 pentru a preveni crash-ul paginii
        res.json({
            success: true,
            reservations: []
        });
    }
}

// GET /api/admin/reservations/metrics
async function getReservationsMetrics(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        res.json({
            success: true,
            metrics: {
                total: 0,
                confirmed: 0,
                pending: 0,
                cancelled: 0
            },
            period: { startDate, endDate }
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/audit-log
async function getAuditLog(req, res, next) {
    try {
        const { limit = 500 } = req.query;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let logs = [];
        try {
            // Verifică dacă tabela există
            const tableExists = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='audit_log' OR name='kiosk_actions_log'
            `);

            if (tableExists) {
                const tableName = tableExists.name;
                logs = await db.all(`
                    SELECT * FROM ${tableName}
                    ORDER BY timestamp DESC
                    LIMIT ?
                `, [parseInt(limit)]) || [];
            }
        } catch (error) {
            console.warn('⚠️ Error fetching audit log:', error.message);
            logs = [];
        }

        res.json({
            success: true,
            logs: Array.isArray(logs) ? logs : []
        });
    } catch (error) {
        console.error('❌ Error in getAuditLog:', error.message);
        res.json({
            success: true,
            logs: []
        });
    }
}

// GET /api/compliance/temperature-log
async function getTemperatureLog(req, res, next) {
    try {
        const { limit = 24 } = req.query;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let logs = [];
        try {
            // Verifică dacă tabela există
            const tableExists = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='compliance_temperature_log'
            `);

            if (tableExists) {
                logs = await db.all(`
                    SELECT * FROM compliance_temperature_log
                    ORDER BY timestamp DESC
                    LIMIT ?
                `, [parseInt(limit)]) || [];
            }
        } catch (error) {
            console.warn('⚠️ Error fetching temperature log:', error.message);
            logs = [];
        }

        res.json({
            success: true,
            logs: Array.isArray(logs) ? logs : []
        });
    } catch (error) {
        console.error('❌ Error in getTemperatureLog:', error.message);
        res.json({
            success: true,
            logs: []
        });
    }
}

// GET /api/compliance/cleaning-schedule
async function getCleaningSchedule(req, res, next) {
    try {
        const { overdue = false } = req.query;
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let schedules = [];
        try {
            // Verifică dacă tabela există
            const tableExists = await db.get(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='compliance_cleaning_schedule'
            `);

            if (tableExists) {
                let query = 'SELECT * FROM compliance_cleaning_schedule';
                if (overdue === 'true') {
                    query += ' WHERE due_date < date("now") AND status != "completed"';
                }
                query += ' ORDER BY due_date ASC';

                schedules = await db.all(query) || [];
            }
        } catch (error) {
            console.warn('⚠️ Error fetching cleaning schedule:', error.message);
            schedules = [];
        }

        res.json({
            success: true,
            schedules: Array.isArray(schedules) ? schedules : []
        });
    } catch (error) {
        console.error('❌ Error in getCleaningSchedule:', error.message);
        res.json({
            success: true,
            schedules: []
        });
    }
}

// GET /api/settings/restaurant
async function getRestaurantSettings(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        let settings = null;
        try {
            settings = await db.get(`
                SELECT * FROM restaurant_settings
                LIMIT 1
            `);
        } catch (error) {
            console.warn('⚠️ Error fetching restaurant settings:', error.message);
            settings = null;
        }

        res.json({
            success: true,
            settings: settings || {}
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/couriers
async function getCouriers(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă tabela couriers există
        const tableExists = await new Promise((resolve) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='couriers'`, (err, row) => {
                resolve(!!row);
            });
        });

        if (!tableExists) {
            return res.json({
                success: true,
                couriers: []
            });
        }

        const couriers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, code, name, phone, email, vehicle_type, status,
                    current_lat, current_lng, is_active, created_at, updated_at
                FROM couriers
                WHERE is_active = 1
                ORDER BY name ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            couriers: couriers || []
        });
    } catch (error) {
        console.error('Error fetching couriers:', error);
        res.json({
            success: true,
            couriers: []
        });
    }
}

// GET /api/couriers/dispatch/available
async function getCouriersAvailable(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă tabela couriers există
        const tableExists = await new Promise((resolve) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='couriers'`, (err, row) => {
                resolve(!!row);
            });
        });

        if (!tableExists) {
            return res.json({
                success: true,
                couriers: []
            });
        }

        // Curieri disponibili (online sau offline, dar activi) cu locații
        const couriers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.id, c.code, c.name, c.phone, c.vehicle_type, c.status,
                    c.current_lat, c.current_lng,
                    c.last_location_update,
                    COUNT(da.id) as active_count,
                    0 as rating
                FROM couriers c
                LEFT JOIN delivery_assignments da ON c.id = da.courier_id 
                    AND da.status IN ('assigned', 'picked_up', 'in_transit')
                WHERE c.is_active = 1
                GROUP BY c.id
                ORDER BY 
                    CASE c.status 
                        WHEN 'online' THEN 1
                        WHEN 'offline' THEN 2
                        ELSE 3
                    END,
                    active_count ASC,
                    c.name ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            couriers: couriers || []
        });
    } catch (error) {
        console.error('Error fetching available couriers:', error);
        res.json({
            success: true,
            couriers: []
        });
    }
}

// GET /api/couriers/dispatch/pending
async function getCouriersPending(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă tabela orders există
        const ordersTableExists = await new Promise((resolve) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='orders'`, (err, row) => {
                resolve(!!row);
            });
        });

        if (!ordersTableExists) {
            return res.json({
                success: true,
                orders: []
            });
        }

        // Comenzi delivery pregătite pentru atribuire (fără curier atribuit)
        const orders = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    o.id, o.id as order_number, o.customer_name, o.customer_phone,
                    o.delivery_address, o.total, o.payment_method, o.platform,
                    o.created_at, o.status,
                    da.courier_id, da.status as assignment_status,
                    c.name as courier_name
                FROM orders o
                LEFT JOIN delivery_assignments da ON o.id = da.order_id 
                    AND da.status != 'cancelled'
                LEFT JOIN couriers c ON da.courier_id = c.id
                WHERE o.type = 'delivery'
                    AND o.status IN ('ready', 'pending', 'completed', 'assigned', 'picked_up', 'in_transit', 'delivered')
                ORDER BY o.created_at DESC
                LIMIT 100
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            orders: orders || []
        });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.json({
            success: true,
            orders: []
        });
    }
}

// GET /api/couriers/tracking/live
async function getCouriersTracking(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Verifică dacă tabela couriers există
        const tableExists = await new Promise((resolve) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='couriers'`, (err, row) => {
                resolve(!!row);
            });
        });

        if (!tableExists) {
            return res.json({
                success: true,
                couriers: []
            });
        }

        // Curieri live cu poziții și comenzi active
        const couriers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.id, c.code, c.name, c.status,
                    c.current_lat, c.current_lng,
                    da.id as delivery_id,
                    o.delivery_address,
                    da.status as delivery_status,
                    o.id as order_number,
                    o.customer_name
                FROM couriers c
                LEFT JOIN delivery_assignments da ON c.id = da.courier_id 
                    AND da.status IN ('assigned', 'picked_up', 'in_transit')
                LEFT JOIN orders o ON da.order_id = o.id
                WHERE c.is_active = 1 
                    AND c.status = 'online'
                    AND c.current_lat IS NOT NULL 
                    AND c.current_lng IS NOT NULL
                ORDER BY c.name ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            couriers: couriers || []
        });
    } catch (error) {
        console.error('Error fetching live couriers:', error);
        res.json({
            success: true,
            couriers: []
        });
    }
}

// GET /api/messages/admin/:userId
async function getMessages(req, res, next) {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;
        res.json({
            success: true,
            messages: [],
            userId,
            limit
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/orders-display/kitchen - Filtrează comenzile pentru bucătărie (exclude bar)
async function getOrdersDisplayKitchen(req, res, next) {
    // NU folosim next(error) - returnăm întotdeauna răspuns sigur
    try {
        const { dbPromise } = require('../../../../database');

        // Așteaptă DB să fie gata (cu timeout)
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ Database not ready for kitchen display:', dbError.message);
            return res.json({
                success: true,
                orders: []
            });
        }

        // Categorii de bar care trebuie excluse din bucătărie
        const BAR_CATEGORIES = [
            'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
            'Răcoritoare', 'Racoritoare',
            'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
            'Vinuri', 'Bere',
            'Băuturi Spirtoase', 'Bauturi Spirtoase',
            'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice'
        ];

        let orders = [];
        try {
            // Verifică dacă tabela orders există
            const ordersTableExists = await new Promise((resolve) => {
                try {
                    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='orders'`, (err, row) => {
                        if (err || !row) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                } catch (e) {
                    resolve(false);
                }
            });

            if (ordersTableExists) {
                orders = await new Promise((resolve) => {
                    try {
                        db.all(`
                            SELECT * FROM orders 
                            WHERE status IN ('pending', 'preparing', 'confirmed', 'paid', 'Pending:')
                              AND DATE(timestamp, 'localtime') = DATE('now', 'localtime')
                            ORDER BY timestamp ASC
                        `, [], (err, rows) => {
                            if (err) {
                                console.warn('⚠️ Error fetching orders for kitchen:', err.message);
                                resolve([]);
                            } else {
                                resolve(rows || []);
                            }
                        });
                    } catch (e) {
                        console.warn('⚠️ Exception fetching orders for kitchen:', e.message);
                        resolve([]);
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Error in kitchen orders fetch:', error.message);
            orders = [];
        }

        // Filtrează comenzile - exclude cele care au doar produse de bar
        const filteredOrders = [];
        try {
            if (Array.isArray(orders)) {
                for (const order of orders) {
                    try {
                        if (!order) continue;

                        let items = [];
                        if (order.items) {
                            if (typeof order.items === 'string') {
                                try {
                                    items = JSON.parse(order.items);
                                } catch (e) {
                                    items = [];
                                }
                            } else if (Array.isArray(order.items)) {
                                items = order.items;
                            }
                        }

                        // 🔴 FIX: Populează name și category pentru items-urile care nu le au
                        const enrichedItems = await Promise.all((items || []).map(async (item) => {
                            if (!item) return item;

                            let productName = item.name || item.product_name || '';
                            let productCategory = item.category || item.category_name || '';
                            const productId = item.product_id || item.id || item.productId;

                            // Dacă name sau category lipsește dar avem product_id, obține-le din baza de date
                            if (productId && ((!productName || productName.trim() === '') || (!productCategory || productCategory.trim() === ''))) {
                                try {
                                    const product = await new Promise((resolve, reject) => {
                                        db.get('SELECT name, category FROM menu WHERE id = ?', [productId], (err, row) => {
                                            if (err) reject(err);
                                            else resolve(row);
                                        });
                                    });

                                    if (product) {
                                        if (!productName || productName.trim() === '') {
                                            productName = product.name || '';
                                        }
                                        if (!productCategory || productCategory.trim() === '') {
                                            productCategory = product.category || '';
                                        }
                                    }
                                } catch (productErr) {
                                    // Ignoră eroarea și continuă
                                }
                            }

                            // Dacă tot nu avem name, folosește un fallback
                            if (!productName || productName.trim() === '') {
                                productName = `Produs ${productId || 'N/A'}`;
                            }

                            // Setează itemId (pentru bar interface să poată marca items ca gata)
                            const itemId = item.itemId || item.item_id || item.id || item.line_id || null;

                            // Setează status implicit 'pending' dacă nu există (pentru ca bar-ul să poată marca items ca gata)
                            const itemStatus = item.status || item.item_status || 'pending';

                            return {
                                ...item,
                                name: productName,
                                category: productCategory,
                                category_name: productCategory,
                                product_id: productId || item.product_id || item.id || item.productId,
                                itemId: itemId, // Adaugă itemId pentru bar interface
                                status: itemStatus // Setează status implicit 'pending' pentru procesare în bar
                            };
                        }));

                        // Filtrează item-urile - exclude categoriile de bar
                        const kitchenItems = enrichedItems.filter(item => {
                            if (!item) return false;
                            const category = item.category || item.category_name || '';
                            // Exclude comenzile care au doar produse de bar
                            return !BAR_CATEGORIES.some(bc => category.toLowerCase().includes(bc.toLowerCase()));
                        });

                        // Returnează comanda doar dacă are item-uri de bucătărie
                        if (kitchenItems.length > 0) {
                            filteredOrders.push({
                                ...order,
                                items: kitchenItems
                            });
                        }
                    } catch (orderError) {
                        // Continuă cu următoarea comandă
                        continue;
                    }
                }
            }
        } catch (filterError) {
            console.warn('⚠️ Error filtering kitchen orders:', filterError.message);
        }

        return res.json({
            success: true,
            orders: filteredOrders || []
        });
    } catch (error) {
        console.error('❌ Error in getOrdersDisplayKitchen:', error.message);
        // Returnăm răspuns sigur - NU folosim next(error)
        return res.json({
            success: true,
            orders: []
        });
    }
}

// GET /api/orders-display/bar - Filtrează comenzile pentru bar (doar categoriile de bar)
async function getOrdersDisplayBar(req, res, next) {
    // NU folosim next(error) - returnăm întotdeauna răspuns sigur
    try {
        const { dbPromise } = require('../../../../database');

        // Așteaptă DB să fie gata (cu timeout)
        let db;
        try {
            db = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
            ]);
        } catch (dbError) {
            console.warn('⚠️ Database not ready for bar display:', dbError.message);
            return res.json({
                success: true,
                orders: []
            });
        }

        // Categorii de bar
        const BAR_CATEGORIES = [
            'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
            'Răcoritoare', 'Racoritoare',
            'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
            'Vinuri', 'Bere',
            'Băuturi Spirtoase', 'Bauturi Spirtoase',
            'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice'
        ];

        let orders = [];
        try {
            // Verifică dacă tabela orders există
            const ordersTableExists = await new Promise((resolve) => {
                try {
                    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='orders'`, (err, row) => {
                        if (err || !row) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                } catch (e) {
                    resolve(false);
                }
            });

            if (ordersTableExists) {
                orders = await new Promise((resolve) => {
                    try {
                        db.all(`
                            SELECT * FROM orders 
                            WHERE status IN ('pending', 'preparing', 'confirmed', 'paid', 'Pending:')
                              AND DATE(timestamp, 'localtime') = DATE('now', 'localtime')
                            ORDER BY timestamp ASC
                        `, [], (err, rows) => {
                            if (err) {
                                console.warn('⚠️ Error fetching orders for bar:', err.message);
                                resolve([]);
                            } else {
                                resolve(rows || []);
                            }
                        });
                    } catch (e) {
                        console.warn('⚠️ Exception fetching orders for bar:', e.message);
                        resolve([]);
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Error in bar orders fetch:', error.message);
            orders = [];
        }

        // Filtrează comenzile - include doar cele cu produse de bar
        const filteredOrders = [];
        try {
            if (Array.isArray(orders)) {
                for (const order of orders) {
                    try {
                        if (!order) continue;

                        let items = [];
                        if (order.items) {
                            if (typeof order.items === 'string') {
                                try {
                                    items = JSON.parse(order.items);
                                } catch (e) {
                                    items = [];
                                }
                            } else if (Array.isArray(order.items)) {
                                items = order.items;
                            }
                        }

                        // 🔴 FIX: Populează name și category pentru items-urile care nu le au
                        const enrichedItems = await Promise.all((items || []).map(async (item) => {
                            if (!item) return item;

                            let productName = item.name || item.product_name || '';
                            let productCategory = item.category || item.category_name || '';
                            const productId = item.product_id || item.id || item.productId;

                            // Dacă name sau category lipsește dar avem product_id, obține-le din baza de date
                            if (productId && ((!productName || productName.trim() === '') || (!productCategory || productCategory.trim() === ''))) {
                                try {
                                    const product = await new Promise((resolve, reject) => {
                                        db.get('SELECT name, category FROM menu WHERE id = ?', [productId], (err, row) => {
                                            if (err) reject(err);
                                            else resolve(row);
                                        });
                                    });

                                    if (product) {
                                        if (!productName || productName.trim() === '') {
                                            productName = product.name || '';
                                        }
                                        if (!productCategory || productCategory.trim() === '') {
                                            productCategory = product.category || '';
                                        }
                                    }
                                } catch (productErr) {
                                    // Ignoră eroarea și continuă
                                }
                            }

                            // Dacă tot nu avem name, folosește un fallback
                            if (!productName || productName.trim() === '') {
                                productName = `Produs ${productId || 'N/A'}`;
                            }

                            // Setează itemId (pentru bar interface să poată marca items ca gata)
                            const itemId = item.itemId || item.item_id || item.id || item.line_id || null;

                            // Setează status implicit 'pending' dacă nu există (pentru ca bar-ul să poată marca items ca gata)
                            const itemStatus = item.status || item.item_status || 'pending';

                            return {
                                ...item,
                                name: productName,
                                category: productCategory,
                                category_name: productCategory,
                                product_id: productId || item.product_id || item.id || item.productId,
                                itemId: itemId, // Adaugă itemId pentru bar interface
                                status: itemStatus // Setează status implicit 'pending' pentru procesare în bar
                            };
                        }));

                        // Filtrează item-urile - include doar categoriile de bar
                        const barItems = enrichedItems.filter(item => {
                            if (!item) return false;
                            const category = item.category || item.category_name || '';
                            // Verifică dacă este bar category (broad matching uniformizat cu frontend)
                            return BAR_CATEGORIES.some(bc => category.toLowerCase().includes(bc.toLowerCase()));
                        });

                        // ✅ FIX: Exclude comenzile care au toate items-urile de bar completed
                        // Doar comenzile cu cel puțin un item de bar în status 'pending' sau 'preparing' trebuie să apară
                        const pendingBarItems = barItems.filter(item => {
                            const status = item.status || item.item_status || 'pending';
                            return status === 'pending' || status === 'preparing' || status === 'confirmed';
                        });

                        // Returnează comanda doar dacă are item-uri de bar ȘI cel puțin unul este în așteptare
                        if (barItems.length > 0 && pendingBarItems.length > 0) {
                            filteredOrders.push({
                                ...order,
                                items: barItems // Include toate items-urile de bar (completed + pending) pentru afișare
                            });
                        }
                    } catch (orderError) {
                        // Continuă cu următoarea comandă
                        continue;
                    }
                }
            }
        } catch (filterError) {
            console.warn('⚠️ Error filtering bar orders:', filterError.message);
        }

        return res.json({
            success: true,
            orders: filteredOrders || []
        });
    } catch (error) {
        console.error('❌ Error in getOrdersDisplayBar:', error.message);
        // Returnăm răspuns sigur - NU folosim next(error)
        return res.json({
            success: true,
            orders: []
        });
    }
}

// ========================================
// PRODUCT DISPLAY SETTINGS
// ========================================

// GET /api/admin/product-display-setting
async function getProductDisplaySetting(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Creează tabela dacă nu există
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS product_display_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    auto_manage_display INTEGER DEFAULT 0,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Obține setările
        const setting = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM product_display_settings
                ORDER BY id DESC
                LIMIT 1
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Dacă nu există setări, returnează default-uri
        if (!setting) {
            return res.json({
                autoManageDisplay: false,
                description: undefined
            });
        }

        res.json({
            autoManageDisplay: setting.auto_manage_display === 1,
            description: setting.description || undefined
        });
    } catch (error) {
        console.error('❌ Error in getProductDisplaySetting:', error);
        next(error);
    }
}

// PUT /api/admin/product-display-setting
async function updateProductDisplaySetting(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { autoManageDisplay } = req.body;

        // Creează tabela dacă nu există
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS product_display_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    auto_manage_display INTEGER DEFAULT 0,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Verifică dacă există deja setări
        const existing = await new Promise((resolve, reject) => {
            db.get(`
                SELECT id FROM product_display_settings
                ORDER BY id DESC
                LIMIT 1
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const description = autoManageDisplay
            ? 'Produsele fără stoc vor fi ascunse automat din meniul clientului'
            : 'Toate produsele vor fi afișate în meniul clientului, indiferent de stoc';

        if (existing) {
            // Actualizează setările existente
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE product_display_settings
                    SET auto_manage_display = ?,
                        description = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [autoManageDisplay ? 1 : 0, description, existing.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } else {
            // Creează setări noi
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO product_display_settings (auto_manage_display, description)
                    VALUES (?, ?)
                `, [autoManageDisplay ? 1 : 0, description], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        res.json({
            success: true,
            message: 'Setarea a fost actualizată cu succes'
        });
    } catch (error) {
        console.error('❌ Error in updateProductDisplaySetting:', error);
        next(error);
    }
}

// ========================================
// INTEGRATIONS MANAGEMENT
// ========================================

// GET /api/integrations - Listă integrări
async function getIntegrations(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Creează tabela dacă nu există
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS integrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    api_key TEXT,
                    api_secret TEXT,
                    is_active INTEGER DEFAULT 1,
                    last_sync_at DATETIME,
                    sync_status TEXT DEFAULT 'pending',
                    error_message TEXT,
                    config_json TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Obține toate integrările
        const integrations = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id,
                    name,
                    type,
                    provider,
                    api_key,
                    api_secret,
                    is_active,
                    last_sync_at,
                    sync_status,
                    error_message,
                    config_json,
                    created_at,
                    updated_at
                FROM integrations
                ORDER BY name ASC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Transformă is_active din INTEGER în boolean
        const formattedIntegrations = integrations.map(integration => ({
            ...integration,
            is_active: integration.is_active === 1
        }));

        res.json(formattedIntegrations);
    } catch (error) {
        console.error('❌ Error in getIntegrations:', error);
        next(error);
    }
}

// POST /api/integrations - Adaugă integrare
async function createIntegration(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { name, type, provider, api_key, api_secret, is_active, sync_status } = req.body;

        // Validare
        if (!name || !type || !provider) {
            return res.status(400).json({
                success: false,
                error: 'Name, type și provider sunt obligatorii'
            });
        }

        // Creează tabela dacă nu există
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS integrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    api_key TEXT,
                    api_secret TEXT,
                    is_active INTEGER DEFAULT 1,
                    last_sync_at DATETIME,
                    sync_status TEXT DEFAULT 'pending',
                    error_message TEXT,
                    config_json TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Inserează integrarea
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO integrations (name, type, provider, api_key, api_secret, is_active, sync_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                name,
                type,
                provider,
                api_key || null,
                api_secret || null,
                is_active ? 1 : 0,
                sync_status || 'pending'
            ], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        res.json({
            success: true,
            id: result.id
        });
    } catch (error) {
        console.error('❌ Error in createIntegration:', error);
        next(error);
    }
}

// PUT /api/integrations/:id - Actualizare integrare
async function updateIntegration(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { id } = req.params;
        const { name, type, provider, api_key, api_secret, is_active, sync_status, error_message } = req.body;

        // Validare
        if (!name || !type || !provider) {
            return res.status(400).json({
                success: false,
                error: 'Name, type și provider sunt obligatorii'
            });
        }

        // Actualizează integrarea
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE integrations
                SET name = ?,
                    type = ?,
                    provider = ?,
                    api_key = ?,
                    api_secret = ?,
                    is_active = ?,
                    sync_status = ?,
                    error_message = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                name,
                type,
                provider,
                api_key || null,
                api_secret || null,
                is_active ? 1 : 0,
                sync_status || 'pending',
                error_message || null,
                id
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true
        });
    } catch (error) {
        console.error('❌ Error in updateIntegration:', error);
        next(error);
    }
}

// DELETE /api/integrations/:id - Ștergere integrare
async function deleteIntegration(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;
        const { id } = req.params;

        // Șterge integrarea
        await new Promise((resolve, reject) => {
            db.run(`
                DELETE FROM integrations
                WHERE id = ?
            `, [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true
        });
    } catch (error) {
        console.error('❌ Error in deleteIntegration:', error);
        next(error);
    }
}

// GET /api/admin/fiscal/cash-register - Obține date registru de casă
async function getCashRegister(req, res, next) {
    try {
        const { dbPromise } = require('../../../../database');
        const db = await dbPromise;

        // Creează tabelul dacă nu există
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS cash_register_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    document_type TEXT,
                    document_number TEXT,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Obține toate tranzacțiile
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM cash_register_transactions
                ORDER BY created_at DESC
                LIMIT 100
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Calculează totaluri
        let totalIn = 0;
        let totalOut = 0;
        transactions.forEach(t => {
            if (t.type === 'in' || (t.amount && t.amount > 0)) {
                totalIn += Math.abs(t.amount || 0);
            } else {
                totalOut += Math.abs(t.amount || 0);
            }
        });

        res.json({
            success: true,
            total_in: totalIn,
            total_out: totalOut,
            balance: totalIn - totalOut,
            transactions: transactions.map(t => ({
                id: t.id,
                type: t.type || (t.amount >= 0 ? 'in' : 'out'),
                amount: Math.abs(t.amount || 0),
                document_type: t.document_type || 'N/A',
                document_number: t.document_number || '',
                description: t.description || '',
                time: t.created_at || new Date().toISOString()
            }))
        });
    } catch (error) {
        console.error('❌ Error in getCashRegister:', error);
        next(error);
    }
}

module.exports = {
    getHealth,
    getApiInfo,
    checkAuth,
    getMenu,
    getDashboardKPI,
    getDashboardMetrics,
    getPins,
    updatePin,
    deletePin,
    getUserPins,
    getInvoices,
    getBackups,
    getArchiveStats,
    getProfitabilityReport,
    getLocations,
    getCategoriesTree,
    getCatalogProducts,
    getAllRecipes,
    getOrders,
    getOrdersDelivery,
    getTablesStatus,
    getKioskTablesPositions,
    getKioskOrder,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getOrdersDisplayKitchen,
    getOrdersDisplayBar,
    getSchedulingLiveStats,
    getTimeEntries,
    getEvents,
    getMenuAll,
    getReservations,
    getReservationsMetrics,
    getRestaurantSettings,
    getCouriers,
    getCouriersAvailable,
    getCouriersPending,
    getCouriersTracking,
    getMessages,
    getAuditLog,
    getTemperatureLog,
    getCleaningSchedule,
    getRevenueChart,
    getInventoryAlerts,
    getBackups,
    getArchiveStats,
    getRecipeByProductId,
    getRecipePreparations,
    getProductDisplaySetting,
    updateProductDisplaySetting,
    getIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    getCashRegister,
};
