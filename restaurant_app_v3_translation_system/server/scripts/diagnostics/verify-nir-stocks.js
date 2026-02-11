/**
 * VERIFICARE STOCURI DUPĂ NIR
 * Verifică dacă stocurile au fost create și actualizate corect
 * după introducerea NIR-ului în sistem
 */

const { dbPromise } = require('./database');

async function verifyNIRStocks() {
  try {
    const db = await dbPromise;
    
    console.log('🔍 VERIFICARE STOCURI DUPĂ NIR\n');
    console.log('='.repeat(60));
    
    // 1. Verifică dacă există avize_insotire (NIR) recente
    console.log('\n1️⃣ Verifică NIR-uri recente...');
    const recentNIRs = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, serie, numar, data_emitere, status,
          expeditor_denumire, destinatar_denumire,
          observatii, created_at
        FROM avize_insotire
        WHERE serie = 'NIR'
          AND created_at >= datetime('now', '-1 day')
        ORDER BY created_at DESC
        LIMIT 10
      `, [], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows || []);
        }
      });
    });
    
    if (recentNIRs.length === 0) {
      console.log('   ⚠️  Nu există NIR-uri create în ultimele 24 de ore');
      console.log('   ℹ️  Verifică toate NIR-urile...');
      
      const allNIRs = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id, serie, numar, data_emitere, status,
            expeditor_denumire, destinatar_denumire,
            observatii, created_at
          FROM avize_insotire
          WHERE serie = 'NIR'
          ORDER BY created_at DESC
          LIMIT 5
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows || []);
          }
        });
      });
      
      if (allNIRs.length === 0) {
        console.log('   ❌ Nu există NIR-uri în sistem!');
        console.log('   ⚠️  Tabelul avize_insotire nu există sau este gol');
      } else {
        console.log(`   ✅ Găsite ${allNIRs.length} NIR-uri în sistem:`);
        allNIRs.forEach((nir, idx) => {
          console.log(`\n   ${idx + 1}. NIR ${nir.serie} ${nir.numar}`);
          console.log(`      Data: ${nir.data_emitere}`);
          console.log(`      Status: ${nir.status}`);
          console.log(`      Furnizor: ${nir.expeditor_denumire}`);
          console.log(`      Observații: ${nir.observatii || 'N/A'}`);
          console.log(`      Creat la: ${nir.created_at}`);
        });
      }
    } else {
      console.log(`   ✅ Găsite ${recentNIRs.length} NIR-uri recente:`);
      recentNIRs.forEach((nir, idx) => {
        console.log(`\n   ${idx + 1}. NIR ${nir.serie} ${nir.numar}`);
        console.log(`      Data: ${nir.data_emitere}`);
        console.log(`      Status: ${nir.status}`);
        console.log(`      Furnizor: ${nir.expeditor_denumire}`);
        console.log(`      Observații: ${nir.observatii || 'N/A'}`);
      });
    }
    
    // 2. Verifică stock_moves pentru NIR
    console.log('\n2️⃣ Verifică stock_moves pentru NIR...');
    const nirStockMoves = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, date, type, reference_type, reference_id,
          ingredient_id, quantity_in, unit_price, value_in,
          tva_percent, move_reason, move_source, created_at
        FROM stock_moves
        WHERE reference_type = 'NIR'
          AND created_at >= datetime('now', '-1 day')
        ORDER BY created_at DESC
        LIMIT 50
      `, [], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows || []);
        }
      });
    });
    
    if (nirStockMoves.length === 0) {
      console.log('   ⚠️  Nu există stock_moves pentru NIR în ultimele 24 de ore');
      console.log('   ℹ️  Verifică toate stock_moves pentru NIR...');
      
      const allNIRMoves = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id, date, type, reference_type, reference_id,
            ingredient_id, quantity_in, unit_price, value_in,
            tva_percent, move_reason, move_source, created_at
          FROM stock_moves
          WHERE reference_type = 'NIR'
          ORDER BY created_at DESC
          LIMIT 20
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows || []);
          }
        });
      });
      
      if (allNIRMoves.length === 0) {
        console.log('   ❌ Nu există stock_moves pentru NIR în sistem!');
      } else {
        console.log(`   ✅ Găsite ${allNIRMoves.length} stock_moves pentru NIR:`);
        const groupedByNIR = {};
        allNIRMoves.forEach(move => {
          const nirId = move.reference_id;
          if (!groupedByNIR[nirId]) {
            groupedByNIR[nirId] = [];
          }
          groupedByNIR[nirId].push(move);
        });
        
        Object.keys(groupedByNIR).forEach(nirId => {
          const moves = groupedByNIR[nirId];
          console.log(`\n   NIR ID: ${nirId} - ${moves.length} linii`);
          const totalValue = moves.reduce((sum, m) => sum + (parseFloat(m.value_in) || 0), 0);
          console.log(`   Valoare totală: ${totalValue.toFixed(2)} RON`);
        });
      }
    } else {
      console.log(`   ✅ Găsite ${nirStockMoves.length} stock_moves recente pentru NIR`);
      
      // Grupează după reference_id (NIR ID)
      const groupedByNIR = {};
      nirStockMoves.forEach(move => {
        const nirId = move.reference_id;
        if (!groupedByNIR[nirId]) {
          groupedByNIR[nirId] = [];
        }
        groupedByNIR[nirId].push(move);
      });
      
      console.log(`   📊 NIR-uri cu stock_moves: ${Object.keys(groupedByNIR).length}`);
      
      Object.keys(groupedByNIR).forEach(nirId => {
        const moves = groupedByNIR[nirId];
        const totalValue = moves.reduce((sum, m) => sum + (parseFloat(m.value_in) || 0), 0);
        const totalQuantity = moves.reduce((sum, m) => sum + (parseFloat(m.quantity_in) || 0), 0);
        console.log(`\n   NIR ID: ${nirId}`);
        console.log(`   Linii: ${moves.length}`);
        console.log(`   Cantitate totală: ${totalQuantity.toFixed(2)}`);
        console.log(`   Valoare totală: ${totalValue.toFixed(2)} RON`);
      });
    }
    
    // 3. Verifică stocurile ingredientelor care ar trebui să fie actualizate
    console.log('\n3️⃣ Verifică stocurile ingredientelor...');
    
    // Obține ingredientele care au stock_moves pentru NIR
    const ingredientsWithNIR = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT
          i.id,
          i.name,
          i.unit,
          i.current_stock,
          i.cost_per_unit,
          COUNT(sm.id) as nir_moves_count,
          SUM(sm.quantity_in) as total_quantity_in,
          SUM(sm.value_in) as total_value_in
        FROM ingredients i
        INNER JOIN stock_moves sm ON sm.ingredient_id = i.id
        WHERE sm.reference_type = 'NIR'
          AND sm.created_at >= datetime('now', '-1 day')
        GROUP BY i.id, i.name, i.unit, i.current_stock, i.cost_per_unit
        ORDER BY total_value_in DESC
        LIMIT 20
      `, [], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows || []);
        }
      });
    });
    
    if (ingredientsWithNIR.length === 0) {
      console.log('   ⚠️  Nu există ingrediente cu stock_moves pentru NIR în ultimele 24 de ore');
      console.log('   ℹ️  Verifică toate ingredientele cu stock_moves pentru NIR...');
      
      const allIngredientsWithNIR = await new Promise((resolve, reject) => {
        db.all(`
          SELECT DISTINCT
            i.id,
            i.name,
            i.unit,
            i.current_stock,
            i.cost_per_unit,
            COUNT(sm.id) as nir_moves_count,
            SUM(sm.quantity_in) as total_quantity_in,
            SUM(sm.value_in) as total_value_in
          FROM ingredients i
          INNER JOIN stock_moves sm ON sm.ingredient_id = i.id
          WHERE sm.reference_type = 'NIR'
          GROUP BY i.id, i.name, i.unit, i.current_stock, i.cost_per_unit
          ORDER BY total_value_in DESC
          LIMIT 20
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows || []);
          }
        });
      });
      
      if (allIngredientsWithNIR.length === 0) {
        console.log('   ❌ Nu există ingrediente cu stock_moves pentru NIR!');
      } else {
        console.log(`   ✅ Găsite ${allIngredientsWithNIR.length} ingrediente cu stock_moves pentru NIR:`);
        allIngredientsWithNIR.slice(0, 10).forEach((ing, idx) => {
          console.log(`\n   ${idx + 1}. ${ing.name}`);
          console.log(`      Stoc actual: ${parseFloat(ing.current_stock || 0).toFixed(2)} ${ing.unit}`);
          console.log(`      Stock moves NIR: ${ing.nir_moves_count}`);
          console.log(`      Cantitate adăugată: ${parseFloat(ing.total_quantity_in || 0).toFixed(2)} ${ing.unit}`);
          console.log(`      Valoare: ${parseFloat(ing.total_value_in || 0).toFixed(2)} RON`);
        });
      }
    } else {
      console.log(`   ✅ Găsite ${ingredientsWithNIR.length} ingrediente cu stock_moves pentru NIR:`);
      ingredientsWithNIR.slice(0, 10).forEach((ing, idx) => {
        console.log(`\n   ${idx + 1}. ${ing.name}`);
        console.log(`      Stoc actual: ${parseFloat(ing.current_stock || 0).toFixed(2)} ${ing.unit}`);
        console.log(`      Stock moves NIR: ${ing.nir_moves_count}`);
        console.log(`      Cantitate adăugată: ${parseFloat(ing.total_quantity_in || 0).toFixed(2)} ${ing.unit}`);
        console.log(`      Valoare: ${parseFloat(ing.total_value_in || 0).toFixed(2)} RON`);
      });
    }
    
    // 4. Verifică note contabile pentru NIR
    console.log('\n4️⃣ Verifică note contabile pentru NIR...');
    const nirNotes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, data, tip, document_type, document_id,
          document_serie, document_numar,
          cont_debitor, cont_creditor, suma, descriere,
          created_at
        FROM note_contabile
        WHERE document_type = 'NIR'
          AND created_at >= datetime('now', '-1 day')
        ORDER BY created_at DESC
        LIMIT 10
      `, [], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows || []);
        }
      });
    });
    
    if (nirNotes.length === 0) {
      console.log('   ⚠️  Nu există note contabile pentru NIR în ultimele 24 de ore');
    } else {
      console.log(`   ✅ Găsite ${nirNotes.length} note contabile pentru NIR:`);
      nirNotes.forEach((note, idx) => {
        console.log(`\n   ${idx + 1}. Notă contabilă ${note.tip}`);
        console.log(`      Document: ${note.document_type} ${note.document_serie} ${note.document_numar}`);
        console.log(`      Cont debitor: ${note.cont_debitor}`);
        console.log(`      Cont creditor: ${note.cont_creditor}`);
        console.log(`      Sumă: ${parseFloat(note.suma || 0).toFixed(2)} RON`);
        console.log(`      Descriere: ${note.descriere || 'N/A'}`);
      });
    }
    
    // 5. Rezumat final
    console.log('\n' + '='.repeat(60));
    console.log('📊 REZUMAT VERIFICARE:\n');
    
    const summary = {
      nirs: recentNIRs.length || 0,
      stockMoves: nirStockMoves.length || 0,
      ingredients: ingredientsWithNIR.length || 0,
      notes: nirNotes.length || 0
    };
    
    console.log(`   NIR-uri recente: ${summary.nirs}`);
    console.log(`   Stock moves: ${summary.stockMoves}`);
    console.log(`   Ingrediente actualizate: ${summary.ingredients}`);
    console.log(`   Note contabile: ${summary.notes}`);
    
    if (summary.nirs > 0 && summary.stockMoves > 0 && summary.ingredients > 0) {
      console.log('\n   ✅ NIR-ul a fost introdus cu succes în sistem!');
      console.log('   ✅ Stocurile au fost actualizate corect!');
    } else {
      console.log('\n   ⚠️  Verifică dacă NIR-ul a fost creat corect!');
      if (summary.nirs === 0) {
        console.log('   ❌ Nu există NIR-uri în sistem');
      }
      if (summary.stockMoves === 0) {
        console.log('   ❌ Nu există stock_moves pentru NIR');
      }
      if (summary.ingredients === 0) {
        console.log('   ❌ Nu există ingrediente actualizate');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ EROARE:', error);
    throw error;
  }
}

// Rulează verificarea
verifyNIRStocks()
  .then(() => {
    console.log('\n✅ Verificare finalizată!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Eroare fatală:', error);
    process.exit(1);
  });
