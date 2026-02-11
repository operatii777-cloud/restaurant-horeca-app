const fs = require('fs');
const path = require('path');

// Path to en.json
const enJsonPath = path.join(__dirname, 'public', 'translation', 'en.json');

// Load current en.json
const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

// Critical modal translations that need to be fixed
const modalTranslations = {
  "ui": {
    // Reservation Modal
    "rezerva_masa": "Reserve Table",
    "nume_complet_*": "Full Name *",
    "telefon_*": "Phone *",
    "data_*": "Date *",
    "ora_*": "Time *",
    "selecteaza_ora": "Select time",
    "numarul_de_persoane_*": "Number of people *",
    "selecteaza": "Select",
    "1_persoana": "1 person",
    "cerinte_speciale": "Special requests",
    "ex_masa_linga_fereastra_zi_de_nastere_alergii_alim": "e.g.: table by the window, birthday, food allergies...",
    "confirma_rezervarea": "Confirm Reservation",
    "cancel": "Cancel",
    
    // Cancel Order Modal
    "anuleaza_comanda": "Cancel Order",
    "timp_ramas": "Time remaining",
    "motivul_anularii_optional": "Cancellation reason (optional):",
    "ex_produsul_nu_mai_este_disponibil_am_schimbat_par": "e.g.: Product no longer available, changed my mind...",
    "confirma_anularea": "Confirm Cancellation",
    "nu_anula": "Don't Cancel",
    
    // Order Confirmation Modal
    "comanda_trimisa_cu_succes": "Order sent successfully!",
    "comanda_#": "Order #",
    "masa": "Table",
    "comandata": "Ordered",
    "produsele_comandate": "Ordered Products",
    "totalul_acestei_comenzi": "Total for this order",
    "salveaza_dovada_pdf": "Save PDF Proof",
    "comanda_din_nou": "Order Again",
    
    // Allergen Modal
    "informatii_alergeni": "Allergen & Additive Information",
    
    // Order type labels
    "aici": "Here",
    "acasa": "Takeout",
    "impreuna": "Together",
    "separat": "Separate"
  },
  
  "labels": {
    "email": "Email",
    "restaurant": "Restaurant",
    "masa": "Table",
    "comandata": "Ordered at"
  }
};

// Merge with existing en.json
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const updatedEnJson = deepMerge(enJson, modalTranslations);

// Write back to file
fs.writeFileSync(enJsonPath, JSON.stringify(updatedEnJson, null, 2), 'utf8');

console.log('✅ Modal translations updated in en.json');
console.log(`📝 Added/updated ${Object.keys(modalTranslations.ui).length} UI translations`);
console.log(`📝 Added/updated ${Object.keys(modalTranslations.labels).length} label translations`);
