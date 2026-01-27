// server/seeds/menu_categories_seed.js
// ✅ Categorii standardizate pentru Restaurant App V3 powered by QrOMS
// Compatibil cu tabela `categories` și cu Admin-Vite

module.exports = [
  // Root categories
  {
    id: 1,
    name: "Pizza",
    name_en: "Pizza",
    parent_id: null,
    icon: "🍕",
    display_order: 1,
    is_expanded: true
  },
  {
    id: 2,
    name: "Burgeri",
    name_en: "Burgers",
    parent_id: null,
    icon: "🍔",
    display_order: 2,
    is_expanded: true
  },
  {
    id: 3,
    name: "Paste",
    name_en: "Pasta",
    parent_id: null,
    icon: "🍝",
    display_order: 3,
    is_expanded: true
  },
  {
    id: 4,
    name: "Salate",
    name_en: "Salads",
    parent_id: null,
    icon: "🥗",
    display_order: 4,
    is_expanded: true
  },
  {
    id: 5,
    name: "Ciorbe",
    name_en: "Soups",
    parent_id: null,
    icon: "🍲",
    display_order: 5,
    is_expanded: true
  },
  {
    id: 6,
    name: "Fel Principal",
    name_en: "Main Course",
    parent_id: null,
    icon: "🥩",
    display_order: 6,
    is_expanded: true
  },
  {
    id: 7,
    name: "Deserturi",
    name_en: "Desserts",
    parent_id: null,
    icon: "🍰",
    display_order: 7,
    is_expanded: true
  },
  {
    id: 8,
    name: "Garnituri",
    name_en: "Side Dishes",
    parent_id: null,
    icon: "🍟",
    display_order: 8,
    is_expanded: true
  },
  {
    id: 9,
    name: "Aperitive",
    name_en: "Appetizers",
    parent_id: null,
    icon: "🥙",
    display_order: 9,
    is_expanded: true
  },
  {
    id: 10,
    name: "Peste Fructe de Mare",
    name_en: "Seafood",
    parent_id: null,
    icon: "🦐",
    display_order: 10,
    is_expanded: true
  },
  {
    id: 11,
    name: "Băuturi",
    name_en: "Beverages",
    parent_id: null,
    icon: "🍹",
    display_order: 11,
    is_expanded: true
  },
  {
    id: 12,
    name: "Mic Dejun",
    name_en: "Breakfast",
    parent_id: null,
    icon: "🍳",
    display_order: 12,
    is_expanded: true
  },
  
  // Sub-categories pentru Paste
  {
    id: 13,
    name: "Paste Fresca",
    name_en: "Fresh Pasta",
    parent_id: 3,
    icon: "🍝",
    display_order: 1,
    is_expanded: true
  },
  {
    id: 14,
    name: "Penne Al Forno",
    name_en: "Baked Penne",
    parent_id: 3,
    icon: "🍝",
    display_order: 2,
    is_expanded: true
  },
  
  // Sub-categories pentru Băuturi
  {
    id: 15,
    name: "Cafea",
    name_en: "Coffee",
    parent_id: 11,
    icon: "☕",
    display_order: 1,
    is_expanded: true
  },
  {
    id: 16,
    name: "Băuturi răcoritoare",
    name_en: "Soft Drinks",
    parent_id: 11,
    icon: "🧃",
    display_order: 2,
    is_expanded: true
  },
  {
    id: 17,
    name: "Băuturi alcoolice",
    name_en: "Alcoholic Beverages",
    parent_id: 11,
    icon: "🍺",
    display_order: 3,
    is_expanded: true
  },
  
  // Sub-categories pentru Aperitive
  {
    id: 18,
    name: "Aperitive Calde",
    name_en: "Hot Appetizers",
    parent_id: 9,
    icon: "🔥",
    display_order: 1,
    is_expanded: true
  },
  {
    id: 19,
    name: "Aperitive Reci",
    name_en: "Cold Appetizers",
    parent_id: 9,
    icon: "🥗",
    display_order: 2,
    is_expanded: true
  },
  
  // Sub-categories pentru Salate
  {
    id: 20,
    name: "Salate Însoțitoare",
    name_en: "Side Salads",
    parent_id: 4,
    icon: "🥗",
    display_order: 1,
    is_expanded: true
  }
];

