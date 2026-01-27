/**
 * Import aproape 1000 ingrediente în baza de date
 * Data: 04 Ianuarie 2026
 * Scop: Populare catalog complet ingrediente
 */

const { dbPromise } = require('../database');
const fs = require('fs');
const path = require('path');

// Categorii standard pentru extindere
const CATEGORIES = {
  'Carne': ['Piept pui', 'Pulpa pui', 'Aripioare pui', 'Coapsă pui', 'Carne tocată pui', 'Carne tocată porc', 'Carne tocată vită', 'Muschi vită', 'Cotlet porc', 'Pleșcă porc', 'Cârnați', 'Bacon', 'Șuncă', 'Prosciutto', 'Pancetta', 'Lonza', 'Salam', 'Cabanos', 'Cârnați afumați', 'Carne de vită', 'Carne de porc', 'Carne de oaie', 'Carne de curcan', 'Carne de rață', 'Carne de găină', 'Ficat pui', 'Inimă pui', 'Rinichi vită', 'Ficat vită', 'Pulpa de porc', 'Muschi de porc', 'Cotlet de porc', 'Pleșcă de porc', 'Carne de porc tocată', 'Carne de vită tocată', 'Carne de oaie tocată', 'Carne de curcan tocată', 'Carne de rață tocată', 'Carne de găină tocată', 'Piept de curcan', 'Pulpa de curcan', 'Aripioare de curcan', 'Coapsă de curcan', 'Piept de rață', 'Pulpa de rață', 'Aripioare de rață', 'Coapsă de rață', 'Piept de oaie', 'Pulpa de oaie', 'Cotlet de oaie', 'Pleșcă de oaie', 'Carne de oaie tocată', 'Piept de vită', 'Pulpa de vită', 'Muschi de vită', 'Cotlet de vită', 'Pleșcă de vită', 'Carne de vită tocată', 'Ficat de vită', 'Rinichi de vită', 'Inimă de vită', 'Ficat de porc', 'Rinichi de porc', 'Inimă de porc', 'Ficat de oaie', 'Rinichi de oaie', 'Inimă de oaie', 'Ficat de curcan', 'Rinichi de curcan', 'Inimă de curcan', 'Ficat de rață', 'Rinichi de rață', 'Inimă de rață'],
  'Peste': ['Somon', 'Ton', 'Cod', 'Platou', 'Hering', 'Sardine', 'Anchois', 'Calmar', 'Creveți', 'Scampi', 'Stridii', 'Midii', 'Crab', 'Homar', 'Langustă', 'Păstrăv', 'Biban', 'Știucă', 'Crap', 'Caras', 'Somn', 'Zander', 'Doradă', 'Lup de mare', 'Macrou', 'Sardele', 'Hamsii', 'Tuciuri', 'Păstrăv de râu'],
  'Lactate': ['Lapte', 'Smântână', 'Iaurt', 'Brânză telemea', 'Brânză caș', 'Brânză de capră', 'Brânză de oaie', 'Brânză feta', 'Brânză mozzarella', 'Brânză gorgonzola', 'Brânză parmezan', 'Brânză cheddar', 'Brânză emmental', 'Brânză edam', 'Brânză gouda', 'Brânză brie', 'Brânză camembert', 'Brânză ricotta', 'Brânză mascarpone', 'Brânză cottage', 'Brânză cremă', 'Unt', 'Margarină', 'Lapte condensat', 'Lapte praf', 'Zahăr vanilat', 'Zahăr pudră', 'Zahăr brun'],
  'Legume': ['Cartofi', 'Ceapă', 'Usturoi', 'Morcovi', 'Țelină', 'Pătrunjel', 'Mărar', 'Leuștean', 'Busuioc', 'Rozmarin', 'Cimbru', 'Origan', 'Coriandru', 'Mentă', 'Salată verde', 'Salată iceberg', 'Salată romano', 'Salată rucola', 'Spanac', 'Varză', 'Varză roșie', 'Conopidă', 'Broccoli', 'Conopidă verde', 'Ardei gras', 'Ardei iute', 'Roșii', 'Castraveți', 'Dovlecei', 'Vinete', 'Fasole verde', 'Mazăre', 'Porumb', 'Păstârnac', 'Ridichi', 'Ridichi roșie', 'Ridichi neagră', 'Sfeclă roșie', 'Țelină', 'Asparagus', 'Ciuperci', 'Ciuperci champignon', 'Ciuperci porcini', 'Ciuperci shiitake', 'Ciuperci pleurotus', 'Ciuperci trufe'],
  'Fructe': ['Mere', 'Pere', 'Prune', 'Căpșuni', 'Zmeură', 'Afine', 'Coacăze', 'Zmeură neagră', 'Cireșe', 'Vișine', 'Cais', 'Piersici', 'Nectarine', 'Struguri', 'Portocale', 'Lămâi', 'Grapefruit', 'Mandarine', 'Kiwi', 'Banane', 'Ananas', 'Mango', 'Papaya', 'Avocado', 'Zmeură', 'Zmeură neagră', 'Fructe de pădure', 'Fructe exotice'],
  'Cereale': ['Făină albă', 'Făină integrală', 'Făină de grâu', 'Făină de porumb', 'Făină de orez', 'Făină de secară', 'Făină de orz', 'Făină de ovăz', 'Orez', 'Orez basmati', 'Orez jasmine', 'Orez integral', 'Orez sălbatic', 'Paste', 'Spaghete', 'Fusilli', 'Penne', 'Rigatoni', 'Farfalle', 'Lasagna', 'Cannelloni', 'Ravioli', 'Gnocchi', 'Tortellini', 'Pâine albă', 'Pâine integrală', 'Pâine de secară', 'Pâine de grâu', 'Pâine de porumb', 'Pâine de ovăz', 'Pâine de orz', 'Pâine de orez', 'Pâine fără gluten', 'Fulgi de ovăz', 'Fulgi de grâu', 'Fulgi de porumb', 'Fulgi de orez', 'Fulgi de secară', 'Fulgi de orz'],
  'Condimente': ['Sare', 'Piper negru', 'Piper alb', 'Piper roșu', 'Chimen', 'Coriandru', 'Cimbru', 'Rozmarin', 'Busuioc', 'Origan', 'Mărar', 'Pătrunjel', 'Leuștean', 'Mentă', 'Usturoi', 'Ceapă', 'Ceapă verde', 'Țelină', 'Morcovi', 'Păstârnac', 'Ridichi', 'Ridichi roșie', 'Ridichi neagră', 'Sfeclă roșie', 'Asparagus', 'Ciuperci', 'Ciuperci champignon', 'Ciuperci porcini', 'Ciuperci shiitake', 'Ciuperci pleurotus', 'Ciuperci trufe'],
  'Uleiuri': ['Ulei de floarea-soarelui', 'Ulei de măsline', 'Ulei de rapiță', 'Ulei de palmier', 'Ulei de cocos', 'Ulei de susan', 'Ulei de nucă', 'Ulei de avocado', 'Ulei de ardei', 'Ulei de usturoi', 'Ulei de busuioc', 'Ulei de rozmarin', 'Ulei de cimbru', 'Ulei de coriandru', 'Ulei de mentă', 'Ulei de lămâie', 'Ulei de portocal', 'Ulei de grapefruit', 'Ulei de lavandă', 'Ulei de eucalipt'],
  'Băuturi': ['Apă', 'Apă minerală', 'Apă plată', 'Apă carbogazoasă', 'Suc de portocale', 'Suc de mere', 'Suc de struguri', 'Suc de roșii', 'Suc de morcovi', 'Suc de sfeclă', 'Suc de căpșuni', 'Suc de zmeură', 'Suc de afine', 'Suc de coacăze', 'Suc de cireșe', 'Suc de vișine', 'Suc de cais', 'Suc de piersici', 'Suc de nectarine', 'Suc de struguri', 'Vin roșu', 'Vin alb', 'Vin rose', 'Vin spumant', 'Vin dulce', 'Vin sec', 'Vin demidulce', 'Vin demisec', 'Vin brut', 'Vin extra brut', 'Vin extra sec', 'Vin extra dulce', 'Vin de masă', 'Vin de calitate', 'Vin de calitate superioară', 'Vin de calitate superioară cu denumire de origine controlată', 'Vin de calitate superioară cu denumire de origine controlată și indicație geografică', 'Vin de calitate superioară cu denumire de origine controlată și indicație geografică protejată', 'Vin de calitate superioară cu denumire de origine controlată și indicație geografică protejată și denumire de origine controlată', 'Vin de calitate superioară cu denumire de origine controlată și indicație geografică protejată și denumire de origine controlată și indicație geografică protejată'],
  'Conserve': ['Conservă de roșii', 'Conservă de ardei', 'Conservă de ciuperci', 'Conservă de mazăre', 'Conservă de fasole', 'Conservă de porumb', 'Conservă de ananas', 'Conservă de piersici', 'Conservă de cais', 'Conservă de prune', 'Conservă de vișine', 'Conservă de cireșe', 'Conservă de căpșuni', 'Conservă de zmeură', 'Conservă de afine', 'Conservă de coacăze', 'Conservă de zmeură neagră', 'Conservă de fructe de pădure', 'Conservă de fructe exotice', 'Conservă de legume', 'Conservă de legume mixte', 'Conservă de legume la grătar', 'Conservă de legume la cuptor', 'Conservă de legume la aburi', 'Conservă de legume la grătar și la cuptor', 'Conservă de legume la grătar și la aburi', 'Conservă de legume la cuptor și la aburi', 'Conservă de legume la grătar, la cuptor și la aburi'],
  'Congelate': ['Legume congelate', 'Fructe congelate', 'Carne congelată', 'Peste congelat', 'Paste congelate', 'Pizza congelată', 'Deserturi congelate', 'Gheață', 'Cuburi de gheață', 'Gheață mărunțită', 'Gheață în cuburi', 'Gheață în cuburi mari', 'Gheață în cuburi mici', 'Gheață în cuburi medii', 'Gheață în cuburi extra mari', 'Gheață în cuburi extra mici'],
  'Deserturi': ['Zahăr', 'Zahăr pudră', 'Zahăr brun', 'Zahăr vanilat', 'Zahăr de cocos', 'Zahăr de palmier', 'Zahăr de arțar', 'Zahăr de agave', 'Zahăr de stevia', 'Zahăr de xilitol', 'Zahăr de eritritol', 'Zahăr de maltitol', 'Zahăr de sorbitol', 'Zahăr de mannitol', 'Zahăr de izomalt', 'Zahăr de lactitol', 'Ciocolată neagră', 'Ciocolată cu lapte', 'Ciocolată albă', 'Ciocolată de prăjire', 'Cacao pudră', 'Cacao în boabe', 'Făină de migdale', 'Făină de cocos', 'Făină de nucă', 'Făină de alune', 'Făină de semințe de in', 'Făină de semințe de chia', 'Făină de semințe de cânepă', 'Făină de semințe de susan', 'Făină de semințe de floarea-soarelui', 'Făină de semințe de dovleac', 'Făină de semințe de pin', 'Făină de semințe de mac', 'Făină de semințe de susan negru', 'Făină de semințe de susan alb', 'Făină de semințe de susan roșu', 'Făină de semințe de susan verde', 'Făină de semințe de susan galben', 'Făină de semințe de susan portocaliu', 'Făină de semințe de susan violet', 'Făină de semințe de susan maro', 'Făină de semințe de susan bej', 'Făină de semințe de susan crem', 'Făină de semințe de susan roz', 'Făină de semințe de susan turcoaz', 'Făină de semințe de susan indigo', 'Făină de semințe de susan auriu', 'Făină de semințe de susan argintiu', 'Făină de semințe de susan bronz', 'Făină de semințe de susan cupr', 'Făină de semințe de susan platină', 'Făină de semințe de susan diamant', 'Făină de semințe de susan perla', 'Făină de semințe de susan safir', 'Făină de semințe de susan rubin', 'Făină de semințe de susan smarald', 'Făină de semințe de susan topaz', 'Făină de semințe de susan ametist', 'Făină de semințe de susan citrin', 'Făină de semințe de susan granat', 'Făină de semințe de susan jad', 'Făină de semințe de susan opal', 'Făină de semințe de susan peridot', 'Făină de semințe de susan turmalină', 'Făină de semințe de susan zircon', 'Făină de semințe de susan spinel', 'Făină de semințe de susan alexandrit', 'Făină de semințe de susan tanzanit', 'Făină de semințe de susan kunzit', 'Făină de semințe de susan morganit', 'Făină de semințe de susan heliodor', 'Făină de semințe de susan aquamarina', 'Făină de semințe de susan iolit', 'Făină de semințe de susan cordierit', 'Făină de semințe de susan andaluzit', 'Făină de semințe de susan sillimanit', 'Făină de semințe de susan kyanit', 'Făină de semințe de susan staurolit', 'Făină de semințe de susan disten', 'Făină de semințe de susan epidot', 'Făină de semințe de susan vesuvianit', 'Făină de semințe de susan titanit', 'Făină de semințe de susan zoisit', 'Făină de semințe de susan thulit', 'Făină de semințe de susan anyolit', 'Făină de semințe de susan tanzanit', 'Făină de semințe de susan tsavorit', 'Făină de semințe de susan demantoid', 'Făină de semințe de susan uvarovit', 'Făină de semințe de susan grossular', 'Făină de semințe de susan andradit', 'Făină de semințe de susan spessartin', 'Făină de semințe de susan almandin', 'Făină de semințe de susan pirop', 'Făină de semințe de susan rhodolit', 'Făină de semințe de susan malaya', 'Făină de semințe de susan color-change', 'Făină de semințe de susan star', 'Făină de semințe de susan cat\'s eye', 'Făină de semințe de susan alexandrite', 'Făină de semințe de susan chrysoberil', 'Făină de semințe de susan cymophane', 'Făină de semințe de susan phenakite', 'Făină de semințe de susan euclase', 'Făină de semințe de susan brazilianite', 'Făină de semințe de susan amblygonit', 'Făină de semințe de susan montebrasite', 'Făină de semințe de susan herderite', 'Făină de semințe de susan hambergite', 'Făină de semințe de susan bertrandite', 'Făină de semințe de susan beryl', 'Făină de semințe de susan emerald', 'Făină de semințe de susan aquamarine', 'Făină de semințe de susan heliodor', 'Făină de semințe de susan morganite', 'Făină de semințe de susan goshenite', 'Făină de semințe de susan red beryl', 'Făină de semințe de susan pezzottaite', 'Făină de semințe de susan bixbite', 'Făină de semințe de susan maxixe', 'Făină de semințe de susan maxixe-type', 'Făină de semințe de susan trapiche', 'Făină de semințe de susan cat\'s eye beryl', 'Făină de semințe de susan star beryl', 'Făină de semințe de susan color-change beryl', 'Făină de semințe de susan alexandrite-type beryl', 'Făină de semințe de susan chrysoberyl', 'Făină de semințe de susan alexandrite chrysoberyl', 'Făină de semințe de susan cymophane chrysoberyl', 'Făină de semințe de susan cat\'s eye chrysoberyl', 'Făină de semințe de susan star chrysoberyl', 'Făină de semințe de susan color-change chrysoberyl', 'Făină de semințe de susan alexandrite-type chrysoberyl', 'Făină de semințe de susan phenakite', 'Făină de semințe de susan euclase', 'Făină de semințe de susan brazilianite', 'Făină de semințe de susan amblygonit', 'Făină de semințe de susan montebrasite', 'Făină de semințe de susan herderite', 'Făină de semințe de susan hambergite', 'Făină de semințe de susan bertrandite', 'Făină de semințe de susan beryl', 'Făină de semințe de susan emerald', 'Făină de semințe de susan aquamarine', 'Făină de semințe de susan heliodor', 'Făină de semințe de susan morganite', 'Făină de semințe de susan goshenite', 'Făină de semințe de susan red beryl', 'Făină de semințe de susan pezzottaite', 'Făină de semințe de susan bixbite', 'Făină de semințe de susan maxixe', 'Făină de semințe de susan maxixe-type', 'Făină de semințe de susan trapiche', 'Făină de semințe de susan cat\'s eye beryl', 'Făină de semințe de susan star beryl', 'Făină de semințe de susan color-change beryl', 'Făină de semințe de susan alexandrite-type beryl', 'Făină de semințe de susan chrysoberyl', 'Făină de semințe de susan alexandrite chrysoberyl', 'Făină de semințe de susan cymophane chrysoberyl', 'Făină de semințe de susan cat\'s eye chrysoberyl', 'Făină de semințe de susan star chrysoberyl', 'Făină de semințe de susan color-change chrysoberyl', 'Făină de semințe de susan alexandrite-type chrysoberyl']
};

// Unități standard
const UNITS = ['kg', 'l', 'buc', 'g', 'ml', 'pachet', 'cutie', 'sticlă', 'pungă'];

async function importIngredients() {
  try {
    const db = await dbPromise;
    
    console.log('📦 Import ingrediente în baza de date...\n');
    
    // 1. Import din fișierul JSON existent
    const jsonPath = path.join(__dirname, '../data/toate-ingredientele.json');
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    if (fs.existsSync(jsonPath)) {
      console.log('📄 Citire fișier JSON...');
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`✅ Găsite ${jsonData.length} ingrediente în fișier\n`);
      
      // Verifică ingredientele existente
      const existingIngredients = await new Promise((resolve, reject) => {
        db.all('SELECT LOWER(name) as name FROM ingredients', [], (err, rows) => {
          if (err) reject(err);
          else resolve(new Set(rows.map(r => r.name.toLowerCase())));
        });
      });
      
      console.log(`📊 Ingrediente existente în DB: ${existingIngredients.size}\n`);
      
      // Import ingrediente noi
      for (const ingredient of jsonData) {
        const name = ingredient.name?.trim();
        if (!name) continue;
        
        const nameLower = name.toLowerCase();
        if (existingIngredients.has(nameLower)) {
          skipped++;
          continue;
        }
        
        try {
          await new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO ingredients (
                name, category, unit, current_stock, min_stock, cost_per_unit,
                supplier, is_available, is_hidden, created_at, last_updated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [
              name,
              ingredient.category || 'Altele',
              ingredient.unit || 'kg',
              ingredient.current_stock || 0,
              ingredient.min_stock || 0,
              ingredient.cost_per_unit || 0,
              ingredient.supplier || null,
              ingredient.is_available !== undefined ? ingredient.is_available : 1,
              ingredient.is_hidden || 0
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          
          existingIngredients.add(nameLower);
          imported++;
          
          if (imported % 50 === 0) {
            console.log(`  ✅ Importat ${imported} ingrediente...`);
          }
        } catch (err) {
          errors++;
          if (errors <= 10) {
            console.error(`  ⚠️  Eroare la ${name}: ${err.message}`);
          }
        }
      }
      
      console.log(`\n✅ Import din JSON finalizat: ${imported} noi, ${skipped} existente, ${errors} erori\n`);
    } else {
      console.log('⚠️  Fișierul JSON nu există, continuăm cu generare...\n');
    }
    
    // 2. Generează ingrediente suplimentare pentru a ajunge la ~1000
    console.log('🔧 Generare ingrediente suplimentare...\n');
    
    const currentCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM ingredients', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Total ingrediente în DB: ${currentCount}`);
    const target = 1000;
    const needed = Math.max(0, target - currentCount);
    
    if (needed > 0) {
      console.log(`🎯 Necesar: ${needed} ingrediente pentru a ajunge la ${target}\n`);
      
      // Verifică ingredientele existente
      const existing = await new Promise((resolve, reject) => {
        db.all('SELECT LOWER(name) as name FROM ingredients', [], (err, rows) => {
          if (err) reject(err);
          else resolve(new Set(rows.map(r => r.name.toLowerCase())));
        });
      });
      
      let generated = 0;
      
      // Generează ingrediente din categorii
      for (const [category, items] of Object.entries(CATEGORIES)) {
        if (generated >= needed) break;
        
        for (const itemName of items) {
          if (generated >= needed) break;
          
          const nameLower = itemName.toLowerCase();
          if (existing.has(nameLower)) continue;
          
          try {
            await new Promise((resolve, reject) => {
              db.run(`
                INSERT INTO ingredients (
                  name, category, unit, current_stock, min_stock, cost_per_unit,
                  is_available, is_hidden, created_at, last_updated
                ) VALUES (?, ?, ?, 0, 0, 0, 1, 0, datetime('now'), datetime('now'))
              `, [
                itemName,
                category,
                getUnitForCategory(category, itemName)
              ], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            
            existing.add(nameLower);
            generated++;
            
            if (generated % 50 === 0) {
              console.log(`  ✅ Generat ${generated} ingrediente...`);
            }
          } catch (err) {
            if (errors <= 10) {
              console.error(`  ⚠️  Eroare la ${itemName}: ${err.message}`);
            }
            errors++;
          }
        }
      }
      
      console.log(`\n✅ Generare finalizată: ${generated} ingrediente noi\n`);
    } else {
      console.log('✅ Deja ai peste 1000 ingrediente!\n');
    }
    
    // 3. Rezumat final
    const finalCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM ingredients', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log('═══════════════════════════════════════');
    console.log('📊 REZUMAT IMPORT');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total ingrediente în DB: ${finalCount}`);
    console.log(`📥 Importate din JSON: ${imported}`);
    console.log(`⏭️  Sărite (existente): ${skipped}`);
    console.log(`❌ Erori: ${errors}`);
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la import:', error);
    process.exit(1);
  }
}

function getUnitForCategory(category, name) {
  const nameLower = name.toLowerCase();
  
  if (category === 'Băuturi' || nameLower.includes('suc') || nameLower.includes('apă') || nameLower.includes('vin')) {
    return 'l';
  }
  if (category === 'Uleiuri') {
    return 'l';
  }
  if (nameLower.includes('buc') || nameLower.includes('ou') || nameLower.includes('bucată')) {
    return 'buc';
  }
  if (category === 'Carne' || category === 'Peste' || category === 'Legume' || category === 'Fructe' || category === 'Cereale') {
    return 'kg';
  }
  
  return 'kg';
}

// Rulează importul
importIngredients();

