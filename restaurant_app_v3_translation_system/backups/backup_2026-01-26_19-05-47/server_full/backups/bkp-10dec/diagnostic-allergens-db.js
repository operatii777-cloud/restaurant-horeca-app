/**
 * 🔬 DIAGNOSTIC COMPLET: VERIFICARE ALERGENI ÎN DB
 * 
 * Verifică:
 * 1. Schema tabelului allergens
 * 2. Date existente în allergens
 * 3. Câmpuri lipsă (code, sort_order, severity, etc.)
 * 4. Date în allergens_computed pentru produse
 * 5. Asocieri în ingredient_allergens
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'restaurant.db');

console.log('🔬 DIAGNOSTIC COMPLET: VERIFICARE ALERGENI ÎN DB\n');
console.log(`📁 DB Path: ${DB_PATH}\n`);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Eroare la conectarea la DB:', err);
        process.exit(1);
    }
    console.log('✅ Conectat la DB\n');
});

async function runDiagnostic() {
    try {
        // 1. VERIFICARE SCHEMA TABELULUI allergens
        console.log('='.repeat(80));
        console.log('1️⃣ VERIFICARE SCHEMA TABELULUI allergens');
        console.log('='.repeat(80));
        
        const schema = await new Promise((resolve, reject) => {
            db.all('PRAGMA table_info(allergens)', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`\n📋 Coloane existente (${schema.length}):`);
        schema.forEach(col => {
            console.log(`   - ${col.name.padEnd(25)} ${col.type.padEnd(15)} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
        });
        
        const requiredFields = ['code', 'sort_order', 'severity', 'description_ro', 'description_en', 'regulation_reference'];
        const missingFields = requiredFields.filter(field => !schema.some(col => col.name === field));
        
        if (missingFields.length > 0) {
            console.log(`\n❌ CÂMPURI LIPSĂ (${missingFields.length}):`);
            missingFields.forEach(field => {
                console.log(`   - ${field}`);
            });
        } else {
            console.log(`\n✅ TOATE CÂMPURILE NECESARE EXISTĂ`);
        }
        
        // 2. VERIFICARE DATE EXISTENTE ÎN allergens
        console.log('\n' + '='.repeat(80));
        console.log('2️⃣ VERIFICARE DATE EXISTENTE ÎN allergens');
        console.log('='.repeat(80));
        
        const allergens = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM allergens ORDER BY id ASC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`\n📊 Total alergeni în DB: ${allergens.length}`);
        
        if (allergens.length > 0) {
            console.log('\n📋 Primele 5 alergeni:');
            allergens.slice(0, 5).forEach((a, idx) => {
                console.log(`\n   ${idx + 1}. ID: ${a.id}`);
                console.log(`      - name_ro: ${a.name_ro || 'NULL'}`);
                console.log(`      - name_en: ${a.name_en || 'NULL'}`);
                console.log(`      - code: ${a.code || '❌ NULL'}`);
                console.log(`      - sort_order: ${a.sort_order !== null && a.sort_order !== undefined ? a.sort_order : '❌ NULL'}`);
                console.log(`      - severity: ${a.severity || '❌ NULL'}`);
                console.log(`      - description_ro: ${a.description_ro ? '✅ Există' : '❌ NULL'}`);
                console.log(`      - description_en: ${a.description_en ? '✅ Există' : '❌ NULL'}`);
                console.log(`      - regulation_reference: ${a.regulation_reference || '❌ NULL'}`);
                console.log(`      - icon: ${a.icon || 'NULL'}`);
                console.log(`      - is_active: ${a.is_active}`);
            });
            
            // Verificare câmpuri NULL
            const allergensWithCode = allergens.filter(a => a.code);
            const allergensWithSortOrder = allergens.filter(a => a.sort_order !== null && a.sort_order !== undefined);
            const allergensWithSeverity = allergens.filter(a => a.severity);
            const allergensWithDescriptionRo = allergens.filter(a => a.description_ro);
            const allergensWithDescriptionEn = allergens.filter(a => a.description_en);
            
            console.log('\n📊 Statistici câmpuri:');
            console.log(`   - Cu code: ${allergensWithCode.length}/${allergens.length} (${Math.round(allergensWithCode.length/allergens.length*100)}%)`);
            console.log(`   - Cu sort_order: ${allergensWithSortOrder.length}/${allergens.length} (${Math.round(allergensWithSortOrder.length/allergens.length*100)}%)`);
            console.log(`   - Cu severity: ${allergensWithSeverity.length}/${allergens.length} (${Math.round(allergensWithSeverity.length/allergens.length*100)}%)`);
            console.log(`   - Cu description_ro: ${allergensWithDescriptionRo.length}/${allergens.length} (${Math.round(allergensWithDescriptionRo.length/allergens.length*100)}%)`);
            console.log(`   - Cu description_en: ${allergensWithDescriptionEn.length}/${allergens.length} (${Math.round(allergensWithDescriptionEn.length/allergens.length*100)}%)`);
        } else {
            console.log('\n⚠️ NU EXISTĂ ALERGENI ÎN DB!');
        }
        
        // 3. VERIFICARE allergens_computed ÎN menu
        console.log('\n' + '='.repeat(80));
        console.log('3️⃣ VERIFICARE allergens_computed ÎN menu');
        console.log('='.repeat(80));
        
        const productsWithAllergens = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, allergens_computed 
                FROM menu 
                WHERE allergens_computed IS NOT NULL 
                  AND allergens_computed != '' 
                  AND allergens_computed != '[]'
                LIMIT 10
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`\n📊 Produse cu allergens_computed: ${productsWithAllergens.length}`);
        
        if (productsWithAllergens.length > 0) {
            console.log('\n📋 Primele 5 produse:');
            productsWithAllergens.slice(0, 5).forEach((p, idx) => {
                console.log(`\n   ${idx + 1}. ${p.name} (ID: ${p.id})`);
                console.log(`      - allergens_computed: ${p.allergens_computed}`);
                
                try {
                    const codes = JSON.parse(p.allergens_computed || '[]');
                    console.log(`      - Parsat: ${JSON.stringify(codes)}`);
                    
                    // Verifică dacă codurile există în DB
                    if (codes.length > 0) {
                        const validCodes = await new Promise((resolve, reject) => {
                            const placeholders = codes.map(() => '?').join(',');
                            db.all(`SELECT code FROM allergens WHERE code IN (${placeholders})`, codes, (err, rows) => {
                                if (err) reject(err);
                                else resolve(rows || []);
                            });
                        });
                        
                        const validCodeValues = validCodes.map(r => r.code);
                        const invalidCodes = codes.filter(c => !validCodeValues.includes(c));
                        
                        if (invalidCodes.length > 0) {
                            console.log(`      - ❌ Coduri invalide (nu există în DB): ${JSON.stringify(invalidCodes)}`);
                        } else {
                            console.log(`      - ✅ Toate codurile sunt valide`);
                        }
                    }
                } catch (e) {
                    console.log(`      - ❌ Eroare parsare JSON: ${e.message}`);
                }
            });
        } else {
            console.log('\n⚠️ NU EXISTĂ PRODUSE CU allergens_computed!');
        }
        
        // 4. VERIFICARE ingredient_allergens
        console.log('\n' + '='.repeat(80));
        console.log('4️⃣ VERIFICARE ingredient_allergens');
        console.log('='.repeat(80));
        
        const ingredientAllergens = await new Promise((resolve, reject) => {
            db.all(`
                SELECT ia.*, i.name as ingredient_name, a.name_ro as allergen_name, a.code as allergen_code
                FROM ingredient_allergens ia
                LEFT JOIN ingredients i ON ia.ingredient_id = i.id
                LEFT JOIN allergens a ON ia.allergen_id = a.id
                LIMIT 10
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`\n📊 Asocieri ingredient-allergen: ${ingredientAllergens.length}`);
        
        if (ingredientAllergens.length > 0) {
            console.log('\n📋 Primele 5 asocieri:');
            ingredientAllergens.slice(0, 5).forEach((ia, idx) => {
                console.log(`\n   ${idx + 1}. ${ia.ingredient_name || 'NULL'} → ${ia.allergen_name || 'NULL'}`);
                console.log(`      - allergen_code: ${ia.allergen_code || '❌ NULL'}`);
                console.log(`      - ingredient_id: ${ia.ingredient_id}`);
                console.log(`      - allergen_id: ${ia.allergen_id}`);
            });
            
            // Verificare alergeni fără code
            const allergensWithoutCode = ingredientAllergens.filter(ia => !ia.allergen_code);
            if (allergensWithoutCode.length > 0) {
                console.log(`\n⚠️ Asocieri cu alergeni fără code: ${allergensWithoutCode.length}`);
            }
        } else {
            console.log('\n⚠️ NU EXISTĂ ASOCIERI ingredient-allergen!');
        }
        
        // 5. TEST PROPAGARE (simulare query)
        console.log('\n' + '='.repeat(80));
        console.log('5️⃣ TEST PROPAGARE (simulare query)');
        console.log('='.repeat(80));
        
        const testProductId = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM menu LIMIT 1', [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.id : null);
            });
        });
        
        if (testProductId) {
            console.log(`\n🧪 Test propagare pentru produs ID: ${testProductId}`);
            
            try {
                const propagatedAllergens = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT DISTINCT a.code
                        FROM allergens a
                        INNER JOIN ingredient_allergens ia ON a.id = ia.allergen_id
                        INNER JOIN recipes r ON ia.ingredient_id = r.ingredient_id
                        WHERE r.menu_item_id = ? AND a.is_active = 1
                        ORDER BY a.sort_order ASC
                    `, [testProductId], (err, rows) => {
                        if (err) {
                            console.error(`      - ❌ Eroare SQL: ${err.message}`);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });
                
                console.log(`      - ✅ Query executat cu succes`);
                console.log(`      - Rezultate: ${propagatedAllergens.length} alergeni`);
                
                if (propagatedAllergens.length > 0) {
                    const codes = propagatedAllergens.map(a => a.code).filter(c => c);
                    console.log(`      - Coduri: ${JSON.stringify(codes)}`);
                    
                    if (codes.length === 0) {
                        console.log(`      - ⚠️ TOATE CODURILE SUNT NULL!`);
                    }
                } else {
                    console.log(`      - ℹ️ Produsul nu are alergeni propagați`);
                }
            } catch (err) {
                if (err.message.includes('no such column: code')) {
                    console.log(`      - ❌ EROARE: Câmpul 'code' nu există în tabelul allergens!`);
                } else if (err.message.includes('no such column: sort_order')) {
                    console.log(`      - ❌ EROARE: Câmpul 'sort_order' nu există în tabelul allergens!`);
                } else {
                    console.log(`      - ❌ EROARE: ${err.message}`);
                }
            }
        } else {
            console.log('\n⚠️ NU EXISTĂ PRODUSE ÎN menu pentru test!');
        }
        
        // 6. REZUMAT FINAL
        console.log('\n' + '='.repeat(80));
        console.log('📊 REZUMAT FINAL');
        console.log('='.repeat(80));
        
        const hasCodeField = schema.some(col => col.name === 'code');
        const hasSortOrderField = schema.some(col => col.name === 'sort_order');
        const hasSeverityField = schema.some(col => col.name === 'severity');
        
        console.log('\n✅/❌ Status câmpuri:');
        console.log(`   - code: ${hasCodeField ? '✅ EXISTĂ' : '❌ LIPSEȘTE'}`);
        console.log(`   - sort_order: ${hasSortOrderField ? '✅ EXISTĂ' : '❌ LIPSEȘTE'}`);
        console.log(`   - severity: ${hasSeverityField ? '✅ EXISTĂ' : '❌ LIPSEȘTE'}`);
        
        if (!hasCodeField || !hasSortOrderField || !hasSeverityField) {
            console.log('\n🚨 PROBLEMĂ CONFIRMATĂ:');
            console.log('   - Codul existent folosește câmpuri care NU EXISTĂ în schema!');
            console.log('   - Propagarea alergenilor EȘUEAZĂ!');
            console.log('   - UI client NU poate afișa iconurile!');
            console.log('\n✅ SOLUȚIE:');
            console.log('   - Extindere schema cu câmpurile lipsă');
            console.log('   - Populare 14 alergeni EU standard');
            console.log('   - Migrare date existente (dacă există)');
        } else {
            console.log('\n✅ Schema este completă!');
            console.log('   - Verifică dacă datele sunt populate corect');
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ DIAGNOSTIC COMPLETAT');
        console.log('='.repeat(80) + '\n');
        
    } catch (error) {
        console.error('❌ Eroare în diagnostic:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Eroare la închiderea DB:', err);
            } else {
                console.log('✅ DB închis');
            }
            process.exit(0);
        });
    }
}

runDiagnostic();

