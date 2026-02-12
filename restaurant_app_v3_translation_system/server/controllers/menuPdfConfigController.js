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
    // DEBUG: Log received query parameters
    console.log('🔍 [PDF Config] GET /config query:', req.query);

    // Asigură-te că type este string curat (fără spații, fără quote-uri)
    let type = req.query.type || 'food';

    // Curățare agresivă pentru a preveni probleme de encoding/quotes
    if (typeof type === 'string') {
        type = type.replace(/['"]/g, '').trim();
    }

    console.log(`🔍 [PDF Config] Processed type: '${type}'`);

    // Validare tip
    if (!['food', 'drinks'].includes(type)) {
        console.warn(`⚠️ [PDF Config] Invalid type rejected: '${type}'`);
        return res.status(400).json({
            success: false,
            error: `Type must be "food" or "drinks". Received: '${type}'`
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

/**
 * GET /api/menu/pdf/builder/settings
 * 
 * Returnează setările globale pentru PDF
 */
exports.getSettings = (req, res) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Eroare la conectarea la baza de date'
            });
        }
    });

    db.get('SELECT * FROM menu_pdf_settings WHERE id = 1', [], (err, row) => {
        db.close();

        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Eroare la încărcarea setărilor'
            });
        }

        if (!row) {
            // Return default settings if none exist
            return res.json({
                success: true,
                settings: null
            });
        }

        // Parse JSON fields
        const settings = {
            fontFamily: row.font_family,
            fontSize: row.font_size,
            fontWeight: row.font_weight,
            headerColor: row.header_color,
            backgroundColor: row.background_color,
            textColor: row.text_color,
            priceColor: row.price_color,
            layout: row.layout,
            orientation: row.orientation,
            marginTop: row.margin_top,
            marginBottom: row.margin_bottom,
            marginLeft: row.margin_left,
            marginRight: row.margin_right,
            categorySpacing: row.category_spacing,
            productSpacing: row.product_spacing,
            showPrices: row.show_prices === 1,
            showDescriptions: row.show_descriptions === 1,
            showImages: row.show_images === 1,
            pageSize: row.page_size,
            template: row.template,
        };

        res.json({
            success: true,
            settings
        });
    });
};

/**
 * POST /api/menu/pdf/builder/settings
 * 
 * Salvează setările globale pentru PDF
 */
exports.updateSettings = (req, res) => {
    const { settings } = req.body;

    if (!settings) {
        return res.status(400).json({
            success: false,
            error: 'Setările sunt obligatorii'
        });
    }

    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Eroare la conectarea la baza de date'
            });
        }
    });

    // Check if table exists, if not create it
    db.run(`
        CREATE TABLE IF NOT EXISTS menu_pdf_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            font_family TEXT DEFAULT 'Arial, sans-serif',
            font_size INTEGER DEFAULT 12,
            font_weight TEXT DEFAULT 'normal',
            header_color TEXT DEFAULT '#2c3e50',
            background_color TEXT DEFAULT '#ffffff',
            text_color TEXT DEFAULT '#333333',
            price_color TEXT DEFAULT '#27ae60',
            layout TEXT DEFAULT 'single-column',
            orientation TEXT DEFAULT 'portrait',
            margin_top INTEGER DEFAULT 20,
            margin_bottom INTEGER DEFAULT 20,
            margin_left INTEGER DEFAULT 20,
            margin_right INTEGER DEFAULT 20,
            category_spacing INTEGER DEFAULT 15,
            product_spacing INTEGER DEFAULT 8,
            show_prices INTEGER DEFAULT 1,
            show_descriptions INTEGER DEFAULT 0,
            show_images INTEGER DEFAULT 1,
            page_size TEXT DEFAULT 'A4',
            template TEXT DEFAULT 'modern',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            db.close();
            return res.status(500).json({
                success: false,
                error: 'Eroare la crearea tabelei de setări'
            });
        }

        // Insert or replace settings
        db.run(`
            INSERT OR REPLACE INTO menu_pdf_settings (
                id, font_family, font_size, font_weight,
                header_color, background_color, text_color, price_color,
                layout, orientation,
                margin_top, margin_bottom, margin_left, margin_right,
                category_spacing, product_spacing,
                show_prices, show_descriptions, show_images,
                page_size, template, updated_at
            ) VALUES (
                1, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, CURRENT_TIMESTAMP
            )
        `, [
            settings.fontFamily || 'Arial, sans-serif',
            settings.fontSize || 12,
            settings.fontWeight || 'normal',
            settings.headerColor || '#2c3e50',
            settings.backgroundColor || '#ffffff',
            settings.textColor || '#333333',
            settings.priceColor || '#27ae60',
            settings.layout || 'single-column',
            settings.orientation || 'portrait',
            settings.marginTop || 20,
            settings.marginBottom || 20,
            settings.marginLeft || 20,
            settings.marginRight || 20,
            settings.categorySpacing || 15,
            settings.productSpacing || 8,
            settings.showPrices ? 1 : 0,
            settings.showDescriptions ? 1 : 0,
            settings.showImages ? 1 : 0,
            settings.pageSize || 'A4',
            settings.template || 'modern',
        ], (err) => {
            db.close();

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: 'Eroare la salvarea setărilor'
                });
            }

            res.json({
                success: true,
                message: 'Setările au fost salvate cu succes'
            });
        });
    });
};


