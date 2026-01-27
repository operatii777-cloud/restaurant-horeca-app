/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/suppliers.js
 * 
 * FIXED: Use dbPromise instead of creating new connections
 * This prevents database connection exhaustion and server crashes
 * REMOVED: All db.close() calls - using shared dbPromise connection
 */

const { dbPromise } = require('../../../../database');

// Helper to get DB with timeout
async function getDb() {
    try {
        return await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
        ]);
    } catch (dbError) {
        console.warn('⚠️ Database not ready:', dbError.message);
        throw dbError;
    }
}

// GET /api/suppliers
async function getSuppliers(req, res, next) {
    try {
        const db = await getDb();
        const activeOnly = req.query.activeOnly === 'true' || req.query.active_only === 'true';

        const query = `
            SELECT 
                id,
                company_name AS name,
                cui,
                reg_com,
                phone,
                email,
                address_street,
                address_number,
                address_city,
                address_county,
                address_postal_code,
                address_country,
                website,
                contact_person_name,
                contact_person_phone,
                contact_person_email,
                iban,
                bank_name,
                payment_terms,
                categories,
                is_active,
                is_preferred,
                rating_quality,
                rating_delivery,
                rating_price,
                rating_service,
                rating_avg,
                total_reviews,
                total_orders,
                total_spent,
                last_order_date,
                notes,
                created_at,
                updated_at
            FROM suppliers
            ${activeOnly ? 'WHERE is_active = 1' : ''}
            ORDER BY company_name COLLATE NOCASE
        `;
        
        const rows = await new Promise((resolve) => {
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching suppliers:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Error in getSuppliers:', error.message);
        return res.json({ success: true, data: [] });
    }
}

// GET /api/suppliers/:id
async function getSupplierById(req, res, next) {
    try {
        const db = await getDb();
        const { id } = req.params;
        
        const query = `
            SELECT 
                id,
                company_name AS name,
                cui,
                reg_com,
                phone,
                email,
                address_street,
                address_number,
                address_city,
                address_county,
                address_postal_code,
                address_country,
                website,
                contact_person_name,
                contact_person_phone,
                contact_person_email,
                iban,
                bank_name,
                payment_terms,
                categories,
                is_active,
                is_preferred,
                rating_quality,
                rating_delivery,
                rating_price,
                rating_service,
                rating_avg,
                total_reviews,
                total_orders,
                total_spent,
                last_order_date,
                notes,
                created_at,
                updated_at
            FROM suppliers
            WHERE id = ?
        `;
        
        const row = await new Promise((resolve) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching supplier:', err);
                    resolve(null);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!row) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('❌ Error in getSupplierById:', error.message);
        return res.status(404).json({ success: false, error: 'Supplier not found' });
    }
}

// POST /api/suppliers
async function createSupplier(req, res, next) {
    try {
        const db = await getDb();
        const {
            company_name,
            cui,
            reg_com,
            phone,
            email,
            address_street,
            address_number,
            address_city,
            address_county,
            address_postal_code,
            address_country,
            website,
            contact_person_name,
            contact_person_phone,
            contact_person_email,
            iban,
            bank_name,
            payment_terms,
            categories,
            notes,
        } = req.body;
        
        const nameValue = company_name || req.body.name;
        if (!nameValue) {
            return res.status(400).json({ success: false, error: 'Câmpul company_name este obligatoriu' });
        }
        
        const query = `
            INSERT INTO suppliers (
                company_name, cui, reg_com,
                address_street, address_number, address_city, address_county, address_postal_code, address_country,
                phone, email, website,
                contact_person_name, contact_person_phone, contact_person_email,
                iban, bank_name,
                payment_terms, categories,
                is_active, is_preferred,
                rating_quality, rating_delivery, rating_price, rating_service, rating_avg,
                total_reviews, total_orders, total_spent, last_order_date, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, ?)
        `;
        
        const params = [
            nameValue,
            cui || null,
            reg_com || null,
            address_street || null,
            address_number || null,
            address_city || null,
            address_county || null,
            address_postal_code || null,
            address_country || 'România',
            phone || null,
            email || null,
            website || null,
            contact_person_name || null,
            contact_person_phone || null,
            contact_person_email || null,
            iban || null,
            bank_name || null,
            payment_terms ?? 30,
            JSON.stringify(categories || []),
            notes || null,
        ];
        
        const result = await new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) {
                    console.error('Error creating supplier:', err);
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
        
        return res.status(201).json({ 
            success: true,
            supplier_id: result.lastID,
        });
    } catch (error) {
        console.error('❌ Error in createSupplier:', error.message);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ success: false, error: 'CUI already exists' });
        }
        return res.status(500).json({ success: false, error: 'Error creating supplier' });
    }
}

// PUT /api/suppliers/:id
async function updateSupplier(req, res, next) {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { name, cui, phone, email, address, category, payment_terms, rating, status, notes } = req.body;
        
        if (!name || !cui || !phone || !category) {
            return res.status(400).json({ error: 'Missing required fields: name, cui, phone, category' });
        }
        
        const query = `
            UPDATE suppliers 
            SET name = ?, cui = ?, phone = ?, email = ?, address = ?, 
                category = ?, payment_terms = ?, rating = ?, status = ?, notes = ?
            WHERE id = ?
        `;
        
        const params = [
            name,
            cui,
            phone,
            email || null,
            address || null,
            category,
            payment_terms || 'net30',
            rating || 5.0,
            status || 'active',
            notes || null,
            id
        ];
        
        const result = await new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) {
                    console.error('Error updating supplier:', err);
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        
        return res.json({ message: 'Supplier updated successfully' });
    } catch (error) {
        console.error('❌ Error in updateSupplier:', error.message);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'CUI already exists' });
        }
        return res.status(500).json({ error: 'Error updating supplier' });
    }
}

// DELETE /api/suppliers/:id
async function deleteSupplier(req, res, next) {
    try {
        const db = await getDb();
        const { id } = req.params;
        
        const query = 'DELETE FROM suppliers WHERE id = ?';
        
        const result = await new Promise((resolve, reject) => {
            db.run(query, [id], function(err) {
                if (err) {
                    console.error('Error deleting supplier:', err);
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        
        return res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteSupplier:', error.message);
        return res.status(500).json({ error: 'Error deleting supplier' });
    }
}

// GET /api/suppliers/stats/summary
async function getSupplierStats(req, res, next) {
    try {
        const db = await getDb();
        
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                COUNT(DISTINCT categories) as categories,
                AVG((rating_quality + rating_delivery + rating_price) / 3.0) as avg_rating
            FROM suppliers
        `;
        
        const row = await new Promise((resolve) => {
            db.get(query, [], (err, row) => {
                if (err) {
                    console.error('Error fetching stats:', err);
                    resolve(null);
                } else {
                    resolve(row);
                }
            });
        });
        
        return res.json({
            total: row?.total || 0,
            active: row?.active || 0,
            categories: row?.categories || 0,
            avg_rating: row?.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : '0.0'
        });
    } catch (error) {
        console.error('❌ Error in getSupplierStats:', error.message);
        return res.json({
            total: 0,
            active: 0,
            categories: 0,
            avg_rating: '0.0'
        });
    }
}

// GET /api/suppliers/category/:category
async function getSuppliersByCategory(req, res, next) {
    try {
        const db = await getDb();
        const { category } = req.params;
        
        const query = 'SELECT * FROM suppliers WHERE category = ? ORDER BY name ASC';
        
        const rows = await new Promise((resolve) => {
            db.all(query, [category], (err, rows) => {
                if (err) {
                    console.error('Error fetching suppliers by category:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        return res.json(rows);
    } catch (error) {
        console.error('❌ Error in getSuppliersByCategory:', error.message);
        return res.json([]);
    }
}

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierStats,
    getSuppliersByCategory,
};
