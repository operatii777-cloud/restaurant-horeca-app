/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/suppliers.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../../..', 'restaurant.db');

function getDb() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err);
        }
    });
}

// GET /api/suppliers
async function getSuppliers(req, res, next) {
    const db = getDb();
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
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            db.close();
            return next(err);
        }
        res.json({ success: true, data: rows });
        db.close();
    });
}

// GET /api/suppliers/:id
async function getSupplierById(req, res, next) {
    const db = getDb();
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
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching supplier:', err);
            db.close();
            return next(err);
        }
        if (!row) {
            db.close();
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        res.json({ success: true, data: row });
        db.close();
    });
}

// POST /api/suppliers
async function createSupplier(req, res, next) {
    const db = getDb();
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
        db.close();
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
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error creating supplier:', err);
            db.close();
            return next(err);
        }
        res.status(201).json({ 
            success: true,
            supplier_id: this.lastID,
        });
        db.close();
    });
}

// PUT /api/suppliers/:id
async function updateSupplier(req, res, next) {
    const db = getDb();
    const { id } = req.params;
    const { name, cui, phone, email, address, category, payment_terms, rating, status, notes } = req.body;
    
    if (!name || !cui || !phone || !category) {
        db.close();
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
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error updating supplier:', err);
            db.close();
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'CUI already exists' });
            }
            return next(err);
        }
        if (this.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json({ message: 'Supplier updated successfully' });
        db.close();
    });
}

// DELETE /api/suppliers/:id
async function deleteSupplier(req, res, next) {
    const db = getDb();
    const { id } = req.params;
    
    const query = 'DELETE FROM suppliers WHERE id = ?';
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error deleting supplier:', err);
            db.close();
            return next(err);
        }
        if (this.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json({ message: 'Supplier deleted successfully' });
        db.close();
    });
}

// GET /api/suppliers/stats/summary
async function getSupplierStats(req, res, next) {
    const db = getDb();
    
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            COUNT(DISTINCT category) as categories,
            AVG(rating) as avg_rating
        FROM suppliers
    `;
    
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error fetching stats:', err);
            db.close();
            return next(err);
        }
        res.json({
            total: row.total || 0,
            active: row.active || 0,
            categories: row.categories || 0,
            avg_rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : '0.0'
        });
        db.close();
    });
}

// GET /api/suppliers/category/:category
async function getSuppliersByCategory(req, res, next) {
    const db = getDb();
    const { category } = req.params;
    
    const query = 'SELECT * FROM suppliers WHERE category = ? ORDER BY name ASC';
    
    db.all(query, [category], (err, rows) => {
        if (err) {
            console.error('Error fetching suppliers by category:', err);
            db.close();
            return next(err);
        }
        res.json(rows);
        db.close();
    });
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

