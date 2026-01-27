// Test simplu pentru generator
console.log("▶ Test generator...");

try {
  const base = require("./products_base_list");
  console.log(`✅ products_base_list.js loaded: ${base.length} produse`);
  
  const { generateProducts } = require("./products_generator");
  console.log("✅ products_generator.js loaded");
  
  console.log("▶ Generare test (10 produse)...");
  const testProducts = generateProducts().slice(0, 10);
  console.log(`✅ Generat ${testProducts.length} produse test`);
  console.log("\nPrimele 3 produse:");
  testProducts.slice(0, 3).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - ${p.price} RON`);
  });
  
  console.log("\n✅ TOATE TESTELE PASSED!");
} catch (error) {
  console.error("❌ EROARE:", error.message);
  console.error(error.stack);
  process.exit(1);
}

