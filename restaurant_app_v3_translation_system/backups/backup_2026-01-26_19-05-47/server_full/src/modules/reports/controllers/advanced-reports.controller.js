/**
 * ENTERPRISE CONTROLLER
 * Phase: E2 - Advanced Reports Controller
 * 
 * Handles advanced reporting: Sales, Profitability, Customer Behavior, Time Trends
 */

const { dbPromise } = require('../../../../database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Helper to get DB with timeout
async function getDb() {
    try {
        return await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
        ]);
    } catch (dbError) {
        console.warn('⚠️ Database not ready for advanced reports:', dbError.message);
        throw dbError;
    }
}

// Helper functions
async function dbAll(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function dbGet(query, params = []) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

/**
 * Generate Sales Report
 * Detailed sales analysis by product, category, date range
 */
async function generateSalesReport(req, res) {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Data de început și sfârșit sunt obligatorii' });
        }

        // Get all paid orders in date range (only paid/completed/delivered, exclude cancelled and test orders)
        const orders = await dbAll(`
            SELECT 
                o.id,
                o.timestamp as created_at,
                o.total,
                o.items,
                o.table_number,
                o.type as order_type
            FROM orders o
            WHERE o.status IN ('paid', 'completed', 'delivered')
                AND (o.table_number IS NULL OR o.table_number >= 0)
                AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
                AND DATE(o.timestamp) BETWEEN ? AND ?
            ORDER BY o.timestamp ASC
        `, [startDate, endDate]);

        // Process items
        const salesData = [];
        const categoryTotals = {};
        const productTotals = {};
        let totalRevenue = 0;
        let totalOrders = orders.length;

        for (const order of orders) {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            
            for (const item of items) {
                const productName = item.name || item.product_name || 'Unknown';
                const category = item.category || 'Uncategorized';
                const quantity = parseFloat(item.quantity || 1);
                const price = parseFloat(item.price || 0);
                const subtotal = quantity * price;

                totalRevenue += subtotal;

                // Category totals
                if (!categoryTotals[category]) {
                    categoryTotals[category] = { revenue: 0, quantity: 0, orders: 0 };
                }
                categoryTotals[category].revenue += subtotal;
                categoryTotals[category].quantity += quantity;
                categoryTotals[category].orders += 1;

                // Product totals
                const productKey = `${productName}::${category}`;
                if (!productTotals[productKey]) {
                    productTotals[productKey] = {
                        name: productName,
                        category: category,
                        revenue: 0,
                        quantity: 0,
                        orders: 0,
                        avgPrice: price
                    };
                }
                productTotals[productKey].revenue += subtotal;
                productTotals[productKey].quantity += quantity;
                productTotals[productKey].orders += 1;
            }
        }

        // Convert productTotals to array and sort
        const productArray = Object.values(productTotals).map(p => ({
            ...p,
            avgPrice: p.revenue / p.quantity
        })).sort((a, b) => b.revenue - a.revenue);

        // Convert categoryTotals to array
        const categoryArray = Object.entries(categoryTotals).map(([name, data]) => ({
            name,
            ...data,
            avgOrderValue: data.revenue / data.orders
        })).sort((a, b) => b.revenue - a.revenue);

        const report = {
            period: { startDate, endDate },
            summary: {
                totalRevenue,
                totalOrders,
                avgOrderValue: totalRevenue / totalOrders,
                totalItems: productArray.reduce((sum, p) => sum + p.quantity, 0)
            },
            byCategory: categoryArray,
            byProduct: productArray.slice(0, 50), // Top 50 products
            format
        };

        if (format === 'excel') {
            return exportSalesReportExcel(report, res);
        }
        if (format === 'pdf') {
            return exportSalesReportPdf(report, res);
        }

        res.json(report);
    } catch (error) {
        console.error('❌ Eroare la generarea raportului de vânzări:', error);
        res.status(500).json({ error: error.message || 'Eroare la generarea raportului' });
    }
}

/**
 * Generate Profitability Report
 * Product profitability analysis with margins and costs
 */
async function generateProfitabilityReport(req, res) {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Data de început și sfârșit sunt obligatorii' });
        }

        // Get orders with items (only paid/completed/delivered, exclude cancelled and test orders)
        const orders = await dbAll(`
            SELECT o.id, o.timestamp as created_at, o.items
            FROM orders o
            WHERE o.status IN ('paid', 'completed', 'delivered')
                AND (o.table_number IS NULL OR o.table_number >= 0)
                AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
                AND DATE(o.timestamp) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // Get product costs from recipes
        const recipes = await dbAll(`
            SELECT 
                p.id as product_id,
                p.name as product_name,
                p.price as selling_price,
                p.category,
                COALESCE(SUM(r.quantity_needed * i.cost_per_unit), 0) as estimated_cost
            FROM catalog_products p
            LEFT JOIN recipes r ON r.product_id = p.id
            LEFT JOIN ingredients i ON i.id = r.ingredient_id
            GROUP BY p.id, p.name, p.price, p.category
        `);

        const productCosts = {};
        for (const recipe of recipes) {
            productCosts[recipe.product_id] = {
                name: recipe.product_name,
                category: recipe.category,
                sellingPrice: parseFloat(recipe.selling_price || 0),
                estimatedCost: parseFloat(recipe.estimated_cost || 0),
                margin: parseFloat(recipe.selling_price || 0) - parseFloat(recipe.estimated_cost || 0),
                marginPercent: parseFloat(recipe.selling_price || 0) > 0 
                    ? ((parseFloat(recipe.selling_price || 0) - parseFloat(recipe.estimated_cost || 0)) / parseFloat(recipe.selling_price || 0)) * 100
                    : 0
            };
        }

        // Calculate sales per product
        const productSales = {};
        for (const order of orders) {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            for (const item of items) {
                const productId = item.product_id || item.id;
                const productName = item.name || item.product_name || 'Unknown';
                const quantity = parseFloat(item.quantity || 1);
                const price = parseFloat(item.price || 0);
                const revenue = quantity * price;

                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        name: productName,
                        revenue: 0,
                        quantity: 0,
                        orders: 0
                    };
                }
                productSales[productId].revenue += revenue;
                productSales[productId].quantity += quantity;
                productSales[productId].orders += 1;
            }
        }

        // Combine sales and costs
        const profitability = [];
        for (const [productId, sales] of Object.entries(productSales)) {
            const cost = productCosts[productId] || {
                name: sales.name,
                category: 'Unknown',
                sellingPrice: sales.revenue / sales.quantity,
                estimatedCost: 0,
                margin: sales.revenue / sales.quantity,
                marginPercent: 100
            };

            profitability.push({
                productId: parseInt(productId),
                name: cost.name,
                category: cost.category,
                revenue: sales.revenue,
                quantity: sales.quantity,
                orders: sales.orders,
                sellingPrice: cost.sellingPrice,
                estimatedCost: cost.estimatedCost,
                totalCost: cost.estimatedCost * sales.quantity,
                grossProfit: sales.revenue - (cost.estimatedCost * sales.quantity),
                margin: cost.margin,
                marginPercent: cost.marginPercent,
                profitability: cost.marginPercent > 30 ? 'High' : cost.marginPercent > 15 ? 'Medium' : 'Low'
            });
        }

        profitability.sort((a, b) => b.grossProfit - a.grossProfit);

        const totalRevenue = profitability.reduce((sum, p) => sum + p.revenue, 0);
        const totalCost = profitability.reduce((sum, p) => sum + p.totalCost, 0);
        const totalGrossProfit = totalRevenue - totalCost;
        const overallMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

        const report = {
            period: { startDate, endDate },
            summary: {
                totalRevenue,
                totalCost,
                totalGrossProfit,
                overallMargin,
                totalProducts: profitability.length
            },
            products: profitability,
            format
        };

        if (format === 'excel') {
            return exportProfitabilityReportExcel(report, res);
        }
        if (format === 'pdf') {
            return exportProfitabilityReportPdf(report, res);
        }

        res.json(report);
    } catch (error) {
        console.error('❌ Eroare la generarea raportului de profitabilitate:', error);
        res.status(500).json({ error: error.message || 'Eroare la generarea raportului' });
    }
}

/**
 * Generate Customer Behavior Report
 * Customer visit frequency, average order value, preferences
 */
async function generateCustomerBehaviorReport(req, res) {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Data de început și sfârșit sunt obligatorii' });
        }

        // Get orders with customer info
        const orders = await dbAll(`
            SELECT 
                o.id,
                o.timestamp as created_at,
                o.total,
                o.customer_name,
                o.customer_phone,
                o.items,
                o.table_number,
                o.type as order_type
            FROM orders o
            WHERE o.status IN ('paid', 'completed', 'delivered')
                AND (o.table_number IS NULL OR CAST(o.table_number AS INTEGER) >= 0)
                AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
                AND DATE(o.timestamp) BETWEEN DATE(?) AND DATE(?)
            ORDER BY o.timestamp ASC
        `, [startDate, endDate]);

        // Group by customer
        const customers = {};
        for (const order of orders) {
            const customerKey = order.customer_phone || `guest_${order.id}`;
            const customerName = order.customer_name || 'Guest';

            if (!customers[customerKey]) {
                customers[customerKey] = {
                    name: customerName,
                    phone: order.customer_phone || null,
                    email: null,
                    visits: 0,
                    totalSpent: 0,
                    orders: [],
                    favoriteCategories: {},
                    favoriteProducts: {},
                    avgOrderValue: 0,
                    firstVisit: order.created_at,
                    lastVisit: order.created_at
                };
            }

            customers[customerKey].visits += 1;
            customers[customerKey].totalSpent += parseFloat(order.total || 0);
            customers[customerKey].orders.push({
                id: order.id,
                date: order.created_at,
                total: parseFloat(order.total || 0)
            });

            if (order.created_at < customers[customerKey].firstVisit) {
                customers[customerKey].firstVisit = order.created_at;
            }
            if (order.created_at > customers[customerKey].lastVisit) {
                customers[customerKey].lastVisit = order.created_at;
            }

            // Analyze items
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            for (const item of items) {
                const category = item.category || 'Uncategorized';
                const productName = item.name || item.product_name || 'Unknown';

                if (!customers[customerKey].favoriteCategories[category]) {
                    customers[customerKey].favoriteCategories[category] = 0;
                }
                customers[customerKey].favoriteCategories[category] += parseFloat(item.quantity || 1);

                if (!customers[customerKey].favoriteProducts[productName]) {
                    customers[customerKey].favoriteProducts[productName] = 0;
                }
                customers[customerKey].favoriteProducts[productName] += parseFloat(item.quantity || 1);
            }
        }

        // Process customer data
        const customerArray = Object.values(customers).map(c => {
            c.avgOrderValue = c.totalSpent / c.visits;
            c.favoriteCategory = Object.entries(c.favoriteCategories)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
            c.favoriteProduct = Object.entries(c.favoriteProducts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
            return c;
        });

        // Sort by total spent
        customerArray.sort((a, b) => b.totalSpent - a.totalSpent);

        // Calculate statistics
        const totalCustomers = customerArray.length;
        const totalRevenue = customerArray.reduce((sum, c) => sum + c.totalSpent, 0);
        const avgRevenuePerCustomer = totalRevenue / totalCustomers;
        const avgVisitsPerCustomer = customerArray.reduce((sum, c) => sum + c.visits, 0) / totalCustomers;
        const avgOrderValue = customerArray.reduce((sum, c) => sum + c.avgOrderValue, 0) / totalCustomers;

        // Customer segments
        const vipCustomers = customerArray.filter(c => c.totalSpent > avgRevenuePerCustomer * 2);
        const regularCustomers = customerArray.filter(c => 
            c.totalSpent <= avgRevenuePerCustomer * 2 && c.totalSpent > avgRevenuePerCustomer * 0.5
        );
        const occasionalCustomers = customerArray.filter(c => c.totalSpent <= avgRevenuePerCustomer * 0.5);

        const report = {
            period: { startDate, endDate },
            summary: {
                totalCustomers,
                totalRevenue,
                avgRevenuePerCustomer,
                avgVisitsPerCustomer,
                avgOrderValue,
                vipCustomers: vipCustomers.length,
                regularCustomers: regularCustomers.length,
                occasionalCustomers: occasionalCustomers.length
            },
            customers: customerArray.slice(0, 100), // Top 100 customers
            segments: {
                vip: vipCustomers.slice(0, 20),
                regular: regularCustomers.slice(0, 30),
                occasional: occasionalCustomers.slice(0, 20)
            },
            format
        };

        if (format === 'excel') {
            return exportCustomerBehaviorReportExcel(report, res);
        }
        if (format === 'pdf') {
            return exportCustomerBehaviorReportPdf(report, res);
        }

        res.json(report);
    } catch (error) {
        console.error('❌ Eroare la generarea raportului de comportament clienți:', error);
        res.status(500).json({ error: error.message || 'Eroare la generarea raportului' });
    }
}

/**
 * Generate Time Trends Report
 * Temporal analysis: hourly, daily, weekly, monthly patterns
 */
async function generateTimeTrendsReport(req, res) {
    try {
        const { startDate, endDate, format = 'json', groupBy = 'day' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Data de început și sfârșit sunt obligatorii' });
        }

        // Get orders
        const orders = await dbAll(`
            SELECT 
                o.id,
                o.timestamp as created_at,
                o.total,
                o.items,
                o.type as order_type,
                o.table_number
            FROM orders o
            WHERE o.status IN ('paid', 'completed', 'delivered')
                AND (o.table_number IS NULL OR o.table_number >= 0)
                AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
                AND DATE(o.timestamp) BETWEEN ? AND ?
            ORDER BY o.timestamp ASC
        `, [startDate, endDate]);

        // Group by time period
        const trends = {};
        let totalRevenue = 0;
        let totalOrders = 0;

        for (const order of orders) {
            const date = new Date(order.created_at);
            let key;

            if (groupBy === 'hour') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            } else if (groupBy === 'day') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
            } else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.toISOString().split('T')[0];
            }

            if (!trends[key]) {
                trends[key] = {
                    period: key,
                    revenue: 0,
                    orders: 0,
                    avgOrderValue: 0,
                    byType: {},
                    byCategory: {}
                };
            }

            const orderTotal = parseFloat(order.total || 0);
            trends[key].revenue += orderTotal;
            trends[key].orders += 1;
            totalRevenue += orderTotal;
            totalOrders += 1;

            // By order type
            const orderType = order.order_type || 'dine-in';
            if (!trends[key].byType[orderType]) {
                trends[key].byType[orderType] = { revenue: 0, orders: 0 };
            }
            trends[key].byType[orderType].revenue += orderTotal;
            trends[key].byType[orderType].orders += 1;

            // By category
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            for (const item of items) {
                const category = item.category || 'Uncategorized';
                if (!trends[key].byCategory[category]) {
                    trends[key].byCategory[category] = { revenue: 0, quantity: 0 };
                }
                trends[key].byCategory[category].revenue += parseFloat(item.price || 0) * parseFloat(item.quantity || 1);
                trends[key].byCategory[category].quantity += parseFloat(item.quantity || 1);
            }
        }

        // Calculate averages and convert to array
        const trendsArray = Object.values(trends).map(t => {
            t.avgOrderValue = t.revenue / t.orders;
            return t;
        }).sort((a, b) => a.period.localeCompare(b.period));

        // Calculate growth rates
        const growthRates = [];
        for (let i = 1; i < trendsArray.length; i++) {
            const prev = trendsArray[i - 1];
            const curr = trendsArray[i];
            const revenueGrowth = prev.revenue > 0 ? ((curr.revenue - prev.revenue) / prev.revenue) * 100 : 0;
            const ordersGrowth = prev.orders > 0 ? ((curr.orders - prev.orders) / prev.orders) * 100 : 0;

            growthRates.push({
                period: curr.period,
                revenueGrowth,
                ordersGrowth
            });
        }

        const report = {
            period: { startDate, endDate },
            groupBy,
            summary: {
                totalRevenue,
                totalOrders,
                avgOrderValue: totalRevenue / totalOrders,
                periods: trendsArray.length
            },
            trends: trendsArray,
            growthRates,
            format
        };

        if (format === 'excel') {
            return exportTimeTrendsReportExcel(report, res);
        }
        if (format === 'pdf') {
            return exportTimeTrendsReportPdf(report, res);
        }

        res.json(report);
    } catch (error) {
        console.error('❌ Eroare la generarea raportului de trend-uri temporale:', error);
        res.status(500).json({ error: error.message || 'Eroare la generarea raportului' });
    }
}

/**
 * Export Profitability Report to Excel
 */
async function exportProfitabilityReportExcel(report, res) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Raport Profitabilitate');

        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = `Raport Profitabilitate - ${report.period.startDate} până ${report.period.endDate}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.addRow([]);
        worksheet.addRow(['Rezumat']);
        worksheet.addRow(['Total Venituri:', report.summary.totalRevenue.toFixed(2) + ' RON']);
        worksheet.addRow(['Total Costuri:', report.summary.totalCost.toFixed(2) + ' RON']);
        worksheet.addRow(['Profit Brut:', report.summary.totalGrossProfit.toFixed(2) + ' RON']);
        worksheet.addRow(['Marjă Totală:', report.summary.overallMargin.toFixed(2) + '%']);

        worksheet.addRow([]);
        worksheet.addRow(['Profitabilitate pe Produse']);
        worksheet.addRow(['Produs', 'Categorie', 'Venituri', 'Costuri', 'Profit Brut', 'Marjă %', 'Profitabilitate']);
        report.products.forEach(p => {
            worksheet.addRow([
                p.name,
                p.category,
                p.revenue.toFixed(2),
                p.totalCost.toFixed(2),
                p.grossProfit.toFixed(2),
                p.marginPercent.toFixed(2),
                p.profitability
            ]);
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(8).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Profitabilitate_${report.period.startDate}_${report.period.endDate}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ error: 'Eroare la exportul Excel' });
    }
}

/**
 * Export Profitability Report to PDF
 */
async function exportProfitabilityReportPdf(report, res) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Profitabilitate_${report.period.startDate}_${report.period.endDate}.pdf"`);
        doc.pipe(res);

        doc.fontSize(20).text('Raport Profitabilitate', { align: 'center' });
        doc.fontSize(12).text(`${report.period.startDate} până ${report.period.endDate}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Rezumat', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Venituri: ${report.summary.totalRevenue.toFixed(2)} RON`);
        doc.text(`Total Costuri: ${report.summary.totalCost.toFixed(2)} RON`);
        doc.text(`Profit Brut: ${report.summary.totalGrossProfit.toFixed(2)} RON`);
        doc.text(`Marjă Totală: ${report.summary.overallMargin.toFixed(2)}%`);
        doc.moveDown();

        doc.fontSize(14).text('Top Produse Profitabile', { underline: true });
        doc.fontSize(10);
        report.products.slice(0, 30).forEach(p => {
            doc.text(`${p.name}: ${p.grossProfit.toFixed(2)} RON (${p.marginPercent.toFixed(2)}% marjă)`);
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Eroare la exportul PDF' });
    }
}

/**
 * Export Customer Behavior Report to Excel
 */
async function exportCustomerBehaviorReportExcel(report, res) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Raport Comportament Clienți');

        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = `Raport Comportament Clienți - ${report.period.startDate} până ${report.period.endDate}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.addRow([]);
        worksheet.addRow(['Rezumat']);
        worksheet.addRow(['Total Clienți:', report.summary.totalCustomers]);
        worksheet.addRow(['Total Venituri:', report.summary.totalRevenue.toFixed(2) + ' RON']);
        worksheet.addRow(['Venit Mediu per Client:', report.summary.avgRevenuePerCustomer.toFixed(2) + ' RON']);
        worksheet.addRow(['Vizite Medii per Client:', report.summary.avgVisitsPerCustomer.toFixed(2)]);

        worksheet.addRow([]);
        worksheet.addRow(['Top Clienți']);
        worksheet.addRow(['Nume', 'Telefon', 'Email', 'Vizite', 'Total Cheltuit', 'Valoare Medie Comandă', 'Categorie Preferată']);
        report.customers.slice(0, 50).forEach(c => {
            worksheet.addRow([
                c.name,
                c.phone || '',
                c.email || '',
                c.visits,
                c.totalSpent.toFixed(2),
                c.avgOrderValue.toFixed(2),
                c.favoriteCategory
            ]);
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(8).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Comportament_Clienti_${report.period.startDate}_${report.period.endDate}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ error: 'Eroare la exportul Excel' });
    }
}

/**
 * Export Customer Behavior Report to PDF
 */
async function exportCustomerBehaviorReportPdf(report, res) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Comportament_Clienti_${report.period.startDate}_${report.period.endDate}.pdf"`);
        doc.pipe(res);

        doc.fontSize(20).text('Raport Comportament Clienți', { align: 'center' });
        doc.fontSize(12).text(`${report.period.startDate} până ${report.period.endDate}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Rezumat', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Clienți: ${report.summary.totalCustomers}`);
        doc.text(`Total Venituri: ${report.summary.totalRevenue.toFixed(2)} RON`);
        doc.text(`Venit Mediu per Client: ${report.summary.avgRevenuePerCustomer.toFixed(2)} RON`);
        doc.moveDown();

        doc.fontSize(14).text('Top Clienți', { underline: true });
        doc.fontSize(10);
        report.customers.slice(0, 30).forEach(c => {
            doc.text(`${c.name}: ${c.totalSpent.toFixed(2)} RON (${c.visits} vizite)`);
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Eroare la exportul PDF' });
    }
}

/**
 * Export Time Trends Report to Excel
 */
async function exportTimeTrendsReportExcel(report, res) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Raport Tendințe Timp');

        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `Raport Tendințe Timp - ${report.period.startDate} până ${report.period.endDate}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.addRow([]);
        worksheet.addRow(['Rezumat']);
        worksheet.addRow(['Total Venituri:', report.summary.totalRevenue.toFixed(2) + ' RON']);
        worksheet.addRow(['Total Comenzi:', report.summary.totalOrders]);
        worksheet.addRow(['Valoare Medie Comandă:', report.summary.avgOrderValue.toFixed(2) + ' RON']);

        worksheet.addRow([]);
        worksheet.addRow(['Tendințe pe Perioadă']);
        worksheet.addRow(['Perioadă', 'Venituri', 'Comenzi', 'Valoare Medie Comandă']);
        report.trends.forEach(t => {
            worksheet.addRow([
                t.period,
                t.revenue.toFixed(2),
                t.orders,
                t.avgOrderValue.toFixed(2)
            ]);
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(8).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Tendinte_Timp_${report.period.startDate}_${report.period.endDate}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ error: 'Eroare la exportul Excel' });
    }
}

/**
 * Export Time Trends Report to PDF
 */
async function exportTimeTrendsReportPdf(report, res) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Raport_Tendinte_Timp_${report.period.startDate}_${report.period.endDate}.pdf"`);
        doc.pipe(res);

        doc.fontSize(20).text('Raport Tendințe Timp', { align: 'center' });
        doc.fontSize(12).text(`${report.period.startDate} până ${report.period.endDate}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Rezumat', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Venituri: ${report.summary.totalRevenue.toFixed(2)} RON`);
        doc.text(`Total Comenzi: ${report.summary.totalOrders}`);
        doc.moveDown();

        doc.fontSize(14).text('Tendințe pe Perioadă', { underline: true });
        doc.fontSize(10);
        report.trends.slice(0, 30).forEach(t => {
            doc.text(`${t.period}: ${t.revenue.toFixed(2)} RON (${t.orders} comenzi)`);
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Eroare la exportul PDF' });
    }
}

module.exports = {
    generateSalesReport,
    generateProfitabilityReport,
    generateCustomerBehaviorReport,
    generateTimeTrendsReport
};

