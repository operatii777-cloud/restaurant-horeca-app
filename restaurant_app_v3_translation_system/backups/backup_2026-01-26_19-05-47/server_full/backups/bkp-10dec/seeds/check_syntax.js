// Verificare simplă de sintaxă - fără generare
console.log("▶ Verificare sintaxă...\n");

try {
  // Test 1: Verifică dacă fișierul se poate încărca
  console.log("1. Test încărcare products_base_list.js...");
  const base = require("./products_base_list");
  console.log(`   ✅ OK: ${base.length} produse\n`);
  
  // Test 2: Verifică structura primului produs
  if (base.length > 0) {
    const first = base[0];
    const required = ['name', 'category', 'price', 'weight', 'allergens'];
    const missing = required.filter(f => !first.hasOwnProperty(f));
    if (missing.length > 0) {
      console.error(`   ❌ Lipsește: ${missing.join(', ')}`);
      process.exit(1);
    }
    console.log(`   ✅ Structură OK: ${first.name}\n`);
  }
  
  // Test 3: Verifică dacă generatorul se poate încărca (fără rulare)
  console.log("2. Test încărcare products_generator.js...");
  const genModule = require("./products_generator");
  console.log("   ✅ OK: Module loaded\n");
  
  console.log("✅ TOATE VERIFICĂRILE PASSED!");
  console.log("\n💡 Fișierele sunt OK. Generatorul poate fi rulat.");
  
} catch (error) {
  console.error("\n❌ EROARE:", error.message);
  if (error.stack) {
    const lines = error.stack.split('\n').slice(0, 5);
    console.error("\nStack trace (primele 5 linii):");
    lines.forEach(l => console.error(l));
  }
  process.exit(1);
}

