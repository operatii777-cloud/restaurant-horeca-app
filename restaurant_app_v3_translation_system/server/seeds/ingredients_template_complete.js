// Template complet pentru ingredient - toate câmpurile necesare
// Compatibil 100% cu database.js și Admin-Vite

const completeIngredientTemplate = {
  // ======================
  // IDENTIFICARE
  // ======================
  name: "Piept de pui",                    // REQUIRED
  name_en: "Chicken Breast",               // Opțional
  official_name: "Gallus domesticus - Pectoralis major", // Opțional
  code: "ING-001",                         // Opțional - cod intern
  
  // ======================
  // CATEGORIZARE
  // ======================
  category: "Carne",                       // REQUIRED - Legume, Carne, Lactate, Băcănie, Bar, Consumabile
  category_en: "Meat",                     // Opțional
  category_id: null,                       // Opțional - FK la ingredient_categories
  subcategory_id: null,                    // Opțional
  
  // ======================
  // UNITĂȚI DE MĂSURĂ
  // ======================
  unit: "kg",                              // REQUIRED - kg, g, L, ml, buc
  purchase_unit: "kg",                     // Opțional - unitatea de cumpărare
  recipe_unit: "g",                        // Opțional - unitatea pentru retete
  inventory_unit: "kg",                    // Opțional - unitatea pentru inventar
  purchase_to_inventory_factor: 1.0,       // Opțional - factor conversie
  inventory_to_recipe_factor: 1000.0,     // Opțional - factor conversie (kg -> g)
  
  // ======================
  // STOCURI
  // ======================
  current_stock: 0,                        // REQUIRED - stoc curent
  min_stock: 10,                           // REQUIRED - stoc minim
  max_stock: 50,                           // Opțional - stoc maxim
  safety_stock: 5,                         // Opțional - stoc de siguranță
  reorder_quantity: 20,                    // Opțional - cantitate re-comandă
  
  // ======================
  // COSTURI (pentru NIR & COGS)
  // ======================
  cost_per_unit: 25.50,                   // REQUIRED - cost mediu RON/unitate
  avg_price: 25.50,                        // Opțional - preț mediu (alias cost_per_unit)
  last_purchase_price: 25.50,             // Opțional - ultimul preț de cumpărare
  last_purchase_date: null,                // Opțional - data ultimei cumpărări
  
  // ======================
  // ALERGENI (UE 14)
  // ======================
  allergens: "",                           // REQUIRED - lista alergeni (separate prin virgulă)
  // Format: "gluten, milk, eggs" sau "crustaceans, molluscs"
  // Lista completă UE 14:
  // - gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphites, lupin, molluscs
  potential_allergens: "",                 // Opțional - alergeni potențiali
  
  // ======================
  // VALORI NUTRIȚIONALE (per 100g)
  // ======================
  energy_kcal: 165,                        // Opțional - calorii / 100g
  fat: 3.6,                                // Opțional - grăsimi / 100g
  saturated_fat: 1.0,                      // Opțional - grăsimi saturate / 100g
  carbs: 0,                                // Opțional - carbohidrați / 100g
  sugars: 0,                               // Opțional - zaharuri / 100g
  protein: 31.0,                           // Opțional - proteine / 100g
  salt: 0.1,                               // Opțional - sare / 100g (g)
  fiber: 0,                                // Opțional - fibre / 100g
  
  // ======================
  // ADITIVI ȘI ALTE
  // ======================
  additives: "",                           // Opțional - aditivi alimentari
  notes: "",                               // Opțional - note generale
  
  // ======================
  // DESCRIERE
  // ======================
  description: "Piept de pui proaspăt, fără os, pentru grătar", // Opțional
  
  // ======================
  // FLAGS (stocate în notes sau description)
  // ======================
  // Nu există câmpuri separate în schema, dar pot fi stocate în notes:
  // "perisabil, refrigerat, bio" sau folosind JSON în notes
  // Alternativ, pot fi adăugate câmpuri noi în viitor:
  // is_perishable, is_frozen, is_bio, is_organic, is_halal, is_kosher, etc.
  
  // ======================
  // STOCARE ȘI HACCP
  // ======================
  storage_temp_min: 2,                     // Opțional - temperatura minimă de stocare (°C)
  storage_temp_max: 4,                     // Opțional - temperatura maximă de stocare (°C)
  haccp_notes: "Stocare la 2-4°C, consum în 3 zile", // Opțional - note HACCP
  origin_country: "RO",                    // Opțional - țara de origine
  traceability_code: "TR-2025-001",        // Opțional - cod trasabilitate
  
  // ======================
  // FURNIZORI
  // ======================
  supplier: "Furnizor Carne SRL",          // Opțional - nume furnizor (text)
  default_supplier_id: null,               // Opțional - FK la suppliers
  
  // ======================
  // LOCAȚIE
  // ======================
  location_id: 1,                          // Opțional - FK la management_locations
  
  // ======================
  // STATUS
  // ======================
  is_available: true,                      // REQUIRED - disponibil pentru comandă
  is_hidden: false,                        // Opțional - ascuns din UI
  
  // ======================
  // TIMESTAMPS
  // ======================
  created_at: null,                        // Auto-generat
  last_updated: null,                      // Auto-generat
  updated_at: null                         // Auto-generat
};

module.exports = completeIngredientTemplate;

