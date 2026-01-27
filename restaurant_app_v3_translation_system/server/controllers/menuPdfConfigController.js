/**
 * MENU PDF CONFIGURATION CONTROLLER
 * 
 * Gestionează configurarea avansată pentru generare PDF meniuri
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { generateAllPDFs, generatePDF } = require('../services/pdf/menuPdfGeneratorPlaywright');

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');
const CATEGORY_IMAGES_PATH = path.join(__dirname, '..', 'public', 'images', 'menu', 'categories');

// Asigură-te că directorul pentru imagini categorii există
if (!fs.existsSync(CATEGORY_IMAGES_PATH)) {
    fs.mkdirSync(CATEGORY_IMAGES_PATH, { recursive: true });
}

// Configurare Multer pentru upload imagini
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CATEGORY_IMAGES_PATH);
    },
    filename: (req, file, cb) => {
        // Generează nume unique: category-{timestamp}.jpg
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        cb(null, `category-${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Doar imagini (JPEG, PNG, WebP) sunt permise!'));
        }
    }
}).single('image');

/**
 * GET /api/menu/pdf/builder/config
 * 
 * Returnează configurația completă pentru PDF builder
 */
exports.getConfig = (req, res) => {
    const type = req.query.type || 'food'; // 'food' sau 'drinks'
    
    // Validare tip
    if (!['food', 'drinks'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Type must be "food" or "drinks"'
        });
    }
    
    console.log(`📊 [PDF Config] Loading config for type: ${type}`);
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ [PDF Config] DB connection error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Eroare la conectarea la baza de date'
            });
        }
    });
    
    // Obține categorii
    db.all(`
        SELECT * FROM menu_pdf_categories
        WHERE category_type = ?
        ORDER BY order_index ASC
    `, [type], (err, categories) => {
        if (err) {
            console.error('❌ [PDF Config] Query error:', err.message);
            db.close();
            return res.status(500).json({ 
                success: false, 
                error: 'Eroare la încărcarea categoriilor: ' + err.message 
            });
        }
        
        console.log(`📋 [PDF Config] Found ${categories.length} categories for ${type}`);
        
        // Obține produse pentru fiecare categorie
        const categoriesWithProducts = [];
        let processed = 0;
        
        if (categories.length === 0) {
            db.close();
            return res.json({
                success: true,
                type: type,
                categories: []
            });
        }
        
        categories.forEach(category => {
            db.all(`
                SELECT 
                    m.id,
                    m.name,
                    m.category,
                    m.price,
                    m.image_url,
                    pdfp.display_in_pdf,
                    pdfp.custom_image,
                    pdfp.custom_order
                FROM menu m
                LEFT JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id
                WHERE m.category = ? AND m.is_active = 1
                ORDER BY COALESCE(pdfp.custom_order, m.display_order, 0) ASC
            `, [category.category_name], (err, products) => {
                if (err) {
                    console.error('Eroare produse:', err);
                    products = [];
                }
                
                categoriesWithProducts.push({
                    ...category,
                    products: products.map(p => ({
                        ...p,
                        display_in_pdf: p.display_in_pdf !== null ? p.display_in_pdf : 1
                    }))
                });
                
                processed++;
                
                if (processed === categories.length) {
                    db.close();
                    res.json({
                        success: true,
                        type: type,
                        categories: categoriesWithProducts.sort((a, b) => a.order_index - b.order_index)
                    });
                }
            });
        });
    });
};

/**
 * POST /api/menu/pdf/builder/config/categories
 * 
 * Salvează configurația categoriilor (ordine, vizibilitate, page breaks)
 * Body: { categories: [{id, display_in_pdf, order_index, page_break_after}, ...] }
 */
exports.updateCategories = (req, res) => {
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Categoriile trebuie să fie un array' 
        });
    }
    
    const db = new sqlite3.Database(DB_PATH);
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare(`
            UPDATE menu_pdf_categories
            SET display_in_pdf = ?,
                order_index = ?,
                page_break_after = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        categories.forEach(cat => {
            stmt.run(
                cat.display_in_pdf ? 1 : 0,
                cat.order_index,
                cat.page_break_after ? 1 : 0,
                cat.id
            );
        });
        
        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                db.close();
                return res.status(500).json({ 
                    success: false, 
                    error: 'Eroare la salvarea categoriilor' 
                });
            }
            
            db.run('COMMIT', (err) => {
                db.close();
                
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Eroare la commit' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Configurație categorii salvată cu succes!' 
                });
            });
        });
    });
};

/**
 * POST /api/menu/pdf/builder/config/products
 * 
 * Salvează configurația produselor (vizibilitate, ordine custom)
 * Body: { products: [{product_id, display_in_pdf, custom_order}, ...] }
 */
exports.updateProducts = (req, res) => {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Produsele trebuie să fie un array' 
        });
    }
    
    const db = new sqlite3.Database(DB_PATH);
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO menu_pdf_products (product_id, display_in_pdf, custom_order, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        products.forEach(prod => {
            stmt.run(
                prod.product_id,
                prod.display_in_pdf ? 1 : 0,
                prod.custom_order || null
            );
        });
        
        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                db.close();
                return res.status(500).json({ 
                    success: false, 
                    error: 'Eroare la salvarea produselor' 
                });
            }
            
            db.run('COMMIT', (err) => {
                db.close();
                
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Eroare la commit' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Configurație produse salvată cu succes!' 
                });
            });
        });
    });
};

/**
 * POST /api/menu/pdf/builder/upload-category-image/:categoryId
 * 
 * Upload imagine pentru o categorie
 */
exports.uploadCategoryImage = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                error: err.message 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nicio imagine uploadată' 
            });
        }
        
        const categoryId = req.params.categoryId;
        const imagePath = `/images/menu/categories/${req.file.filename}`;
        
        const db = new sqlite3.Database(DB_PATH);
        
        // Obține imaginea veche pentru a o șterge
        db.get('SELECT header_image FROM menu_pdf_categories WHERE id = ?', [categoryId], (err, row) => {
            if (err) {
                db.close();
                return res.status(500).json({ 
                    success: false, 
                    error: 'Eroare la verificarea imaginii vechi' 
                });
            }
            
            // Șterge imaginea veche dacă există
            if (row && row.header_image) {
                const oldImagePath = path.join(__dirname, '..', 'public', row.header_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            // Salvează noua imagine în DB
            db.run(`
                UPDATE menu_pdf_categories
                SET header_image = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [imagePath, categoryId], (err) => {
                db.close();
                
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Eroare la salvarea imaginii în DB' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Imagine uploadată cu succes!',
                    imagePath: imagePath
                });
            });
        });
    });
};

/**
 * DELETE /api/menu/pdf/builder/delete-category-image/:categoryId
 * 
 * Șterge imaginea unei categorii
 */
exports.deleteCategoryImage = (req, res) => {
    const categoryId = req.params.categoryId;
    
    const db = new sqlite3.Database(DB_PATH);
    
    // Obține calea imaginii
    db.get('SELECT header_image FROM menu_pdf_categories WHERE id = ?', [categoryId], (err, row) => {
        if (err) {
            db.close();
            return res.status(500).json({ 
                success: false, 
                error: 'Eroare la verificarea imaginii' 
            });
        }
        
        if (!row || !row.header_image) {
            db.close();
            return res.status(404).json({ 
                success: false, 
                error: 'Imaginea nu există' 
            });
        }
        
        // Șterge fișierul fizic
        const imagePath = path.join(__dirname, '..', 'public', row.header_image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        // Șterge din DB
        db.run(`
            UPDATE menu_pdf_categories
            SET header_image = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [categoryId], (err) => {
            db.close();
            
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Eroare la ștergerea imaginii din DB' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Imagine ștearsă cu succes!' 
            });
        });
    });
};

/**
 * POST /api/menu/pdf/builder/regenerate
 * 
 * Regenerează PDF-urile
 * Body: { type: 'all' | 'food' | 'drinks' }
 */
exports.regeneratePDFs = async (req, res) => {
    const { type } = req.body;
    const startTime = Date.now();
    
    try {
        let result;
        
        if (type === 'all' || !type) {
            result = await generateAllPDFs();
        } else {
            // Generează doar pentru un tip specific
            const results = {};
            if (type === 'food') {
                results.food_ro = await generatePDF('food', 'ro');
                results.food_en = await generatePDF('food', 'en');
            } else if (type === 'drinks') {
                results.drinks_ro = await generatePDF('drinks', 'ro');
                results.drinks_en = await generatePDF('drinks', 'en');
            }
            result = results;
        }
        
        const duration = Date.now() - startTime;
        
        // Log în DB
        const db = new sqlite3.Database(DB_PATH);
        db.run(`
            INSERT INTO menu_pdf_regeneration_log (pdf_type, triggered_by, success, generation_time_ms)
            VALUES (?, ?, ?, ?)
        `, [type || 'all', 'manual', 1, duration], () => {
            db.close();
        });
        
        res.json({ 
            success: true, 
            message: `PDF-uri regenerate cu succes în ${duration}ms!`,
            result: result
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log eroare în DB
        const db = new sqlite3.Database(DB_PATH);
        db.run(`
            INSERT INTO menu_pdf_regeneration_log (pdf_type, triggered_by, success, error_message, generation_time_ms)
            VALUES (?, ?, ?, ?, ?)
        `, [type || 'all', 'manual', 0, error.message, duration], () => {
            db.close();
        });
        
        res.status(500).json({ 
            success: false, 
            error: 'Eroare la regenerarea PDF-urilor',
            details: error.message
        });
    }
};

/**
 * GET /api/menu/pdf/builder/history
 * 
 * Returnează istoricul regenerărilor PDF
 */
exports.getRegenerationHistory = (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(`
        SELECT * FROM menu_pdf_regeneration_log
        ORDER BY created_at DESC
        LIMIT ?
    `, [limit], (err, rows) => {
        db.close();
        
        if (err) {
            return res.status(500).json({ 
                success: false, 
                error: 'Eroare la încărcarea istoricului' 
            });
        }
        
        res.json({ 
            success: true, 
            history: rows 
        });
    });
};

