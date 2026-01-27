// 🇷🇴 Date nutriționale pentru ingrediente ROMÂNEȘTI și specifice
// Aceste date vor fi folosite pentru ingredientele care nu se găsesc în baze internaționale
// Surse: Tabelul de compoziție INCDBA (România), date USDA echivalente, producători locali

module.exports = {
    // ========== PANIFICAȚIE ==========
    "chifla integrala cu susan": {
        description: "Chifla integrală cu susan (panificație românească)",
        energy_kcal: 265,
        fat: 5.2,
        saturated_fat: 0.8,
        carbs: 45.0,
        sugars: 3.5,
        protein: 10.5,
        salt: 1.1,
        fiber: 6.5,
        allergens: ["gluten", "susan"],
        additives: [],
        source: "Date românești - panificație integrală"
    },
    
    "chifla alba": {
        description: "Chifla albă tradițională",
        energy_kcal: 280,
        fat: 3.5,
        saturated_fat: 0.6,
        carbs: 52.0,
        sugars: 4.0,
        protein: 9.0,
        salt: 1.2,
        fiber: 2.5,
        allergens: ["gluten"],
        additives: [],
        source: "Date românești - panificație"
    },
    
    "chifla neagra": {
        description: "Chifla neagră (pâine neagră)",
        energy_kcal: 250,
        fat: 2.5,
        saturated_fat: 0.4,
        carbs: 48.0,
        sugars: 3.2,
        protein: 8.5,
        salt: 1.3,
        fiber: 7.0,
        allergens: ["gluten"],
        additives: [],
        source: "Date românești - panificație integrală"
    },

    // ========== CARNE ==========
    "pui (coapsa)": {
        description: "Pulpă de pui (coapsă cu piele)",
        energy_kcal: 209,
        fat: 15.5,
        saturated_fat: 4.3,
        carbs: 0.0,
        sugars: 0.0,
        protein: 18.0,
        salt: 0.1,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - pui coapsă"
    },
    
    "vita (muschi)": {
        description: "Mușchi de vită (fără os)",
        energy_kcal: 250,
        fat: 19.0,
        saturated_fat: 7.5,
        carbs: 0.0,
        sugars: 0.0,
        protein: 20.0,
        salt: 0.06,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - vită mușchi"
    },
    
    "carne tocata porc": {
        description: "Carne tocată de porc (80% carne, 20% grăsime)",
        energy_kcal: 263,
        fat: 21.2,
        saturated_fat: 7.8,
        carbs: 0.0,
        sugars: 0.0,
        protein: 17.0,
        salt: 0.07,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - porc tocat"
    },
    
    "pulpa de rata": {
        description: "Pulpă de rață (carne + piele)",
        energy_kcal: 337,
        fat: 28.4,
        saturated_fat: 9.7,
        carbs: 0.0,
        sugars: 0.0,
        protein: 19.0,
        salt: 0.08,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - rață pulpă"
    },
    
    "pastrav proaspat": {
        description: "Păstrăv proaspăt de crescătorie",
        energy_kcal: 148,
        fat: 6.6,
        saturated_fat: 1.5,
        carbs: 0.0,
        sugars: 0.0,
        protein: 20.5,
        salt: 0.06,
        fiber: 0.0,
        allergens: ["peste"],
        additives: [],
        source: "USDA echivalent - păstrăv crescătorie"
    },

    // ========== LACTATE ROMÂNEȘTI ==========
    "branza dura": {
        description: "Brânză dură tip Cașcaval de Săveni",
        energy_kcal: 365,
        fat: 28.0,
        saturated_fat: 17.5,
        carbs: 2.5,
        sugars: 0.5,
        protein: 26.0,
        salt: 1.8,
        fiber: 0.0,
        allergens: ["lapte"],
        additives: [],
        source: "Date românești - brânzeturi dure"
    },
    
    "branza feta": {
        description: "Brânză tip feta (din lapte de vacă)",
        energy_kcal: 264,
        fat: 21.3,
        saturated_fat: 14.9,
        carbs: 4.1,
        sugars: 4.1,
        protein: 14.2,
        salt: 2.3,
        fiber: 0.0,
        allergens: ["lapte"],
        additives: [],
        source: "USDA echivalent - feta"
    },
    
    "branza brie": {
        description: "Brânză Brie (franțuzească, moale)",
        energy_kcal: 334,
        fat: 27.7,
        saturated_fat: 17.4,
        carbs: 0.5,
        sugars: 0.5,
        protein: 20.8,
        salt: 1.5,
        fiber: 0.0,
        allergens: ["lapte"],
        additives: [],
        source: "USDA echivalent - brie"
    },
    
    "branza telemea": {
        description: "Telemea de vacă (brânză tradițională românească)",
        energy_kcal: 245,
        fat: 18.0,
        saturated_fat: 11.5,
        carbs: 3.5,
        sugars: 0.8,
        protein: 17.5,
        salt: 2.8,
        fiber: 0.0,
        allergens: ["lapte"],
        additives: [],
        source: "Date românești - telemea de vacă"
    },
    
    "telemea": {
        description: "Telemea de vacă (brânză tradițională românească)",
        energy_kcal: 245,
        fat: 18.0,
        saturated_fat: 11.5,
        carbs: 3.5,
        sugars: 0.8,
        protein: 17.5,
        salt: 2.8,
        fiber: 0.0,
        allergens: ["lapte"],
        additives: [],
        source: "Date românești - telemea de vacă"
    },

    // ========== LEGUME ȘI IERBURI PROASPETE ==========
    "salata iceberg": {
        description: "Salată iceberg proaspătă",
        energy_kcal: 14,
        fat: 0.1,
        saturated_fat: 0.02,
        carbs: 3.0,
        sugars: 1.9,
        protein: 0.9,
        salt: 0.01,
        fiber: 1.2,
        allergens: [],
        additives: [],
        source: "USDA echivalent - iceberg lettuce"
    },
    
    "patrunjel": {
        description: "Pătrunjel verde proaspăt (frunze)",
        energy_kcal: 36,
        fat: 0.8,
        saturated_fat: 0.1,
        carbs: 6.3,
        sugars: 0.9,
        protein: 3.0,
        salt: 0.06,
        fiber: 3.3,
        allergens: [],
        additives: [],
        source: "USDA echivalent - pătrunjel proaspăt"
    },
    
    "marar proaspat": {
        description: "Mărar verde proaspăt (frunze)",
        energy_kcal: 43,
        fat: 1.1,
        saturated_fat: 0.1,
        carbs: 7.0,
        sugars: 0.0,
        protein: 3.5,
        salt: 0.06,
        fiber: 2.1,
        allergens: [],
        additives: [],
        source: "USDA echivalent - mărar proaspăt"
    },
    
    "busuioc proaspat": {
        description: "Busuioc verde proaspăt (frunze)",
        energy_kcal: 23,
        fat: 0.6,
        saturated_fat: 0.04,
        carbs: 2.7,
        sugars: 0.3,
        protein: 3.2,
        salt: 0.004,
        fiber: 1.6,
        allergens: [],
        additives: [],
        source: "USDA echivalent - busuioc proaspăt"
    },
    
    "pastarnac": {
        description: "Păstârnac alb proaspăt",
        energy_kcal: 75,
        fat: 0.3,
        saturated_fat: 0.05,
        carbs: 18.0,
        sugars: 4.8,
        protein: 1.2,
        salt: 0.01,
        fiber: 4.9,
        allergens: [],
        additives: [],
        source: "USDA echivalent - păstârnac"
    },
    
    "ardei iuti": {
        description: "Ardei iuți roșii sau verzi",
        energy_kcal: 40,
        fat: 0.4,
        saturated_fat: 0.04,
        carbs: 8.8,
        sugars: 5.3,
        protein: 1.9,
        salt: 0.009,
        fiber: 1.5,
        allergens: [],
        additives: [],
        source: "USDA echivalent - hot peppers"
    },
    
    "morcovi murati": {
        description: "Morcovi murați în oțet (conserve tradiționale)",
        energy_kcal: 35,
        fat: 0.2,
        saturated_fat: 0.03,
        carbs: 7.5,
        sugars: 4.0,
        protein: 0.8,
        salt: 1.2,
        fiber: 2.5,
        allergens: [],
        additives: [],
        source: "Date românești - murături"
    },
    
    "varza alba": {
        description: "Varză albă proaspătă (crudă)",
        energy_kcal: 25,
        fat: 0.1,
        saturated_fat: 0.03,
        carbs: 5.8,
        sugars: 3.2,
        protein: 1.3,
        salt: 0.02,
        fiber: 2.5,
        allergens: [],
        additives: [],
        source: "USDA echivalent - varză albă"
    },
    
    "menta proaspata": {
        description: "Mentă proaspătă (frunze)",
        energy_kcal: 70,
        fat: 0.9,
        saturated_fat: 0.2,
        carbs: 14.9,
        sugars: 0.0,
        protein: 3.8,
        salt: 0.03,
        fiber: 8.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - mentă proaspătă"
    },
    
    "afine proaspete": {
        description: "Afine proaspete (blueberries)",
        energy_kcal: 57,
        fat: 0.3,
        saturated_fat: 0.03,
        carbs: 14.5,
        sugars: 10.0,
        protein: 0.7,
        salt: 0.001,
        fiber: 2.4,
        allergens: [],
        additives: [],
        source: "USDA echivalent - afine"
    },

    // ========== SOSURI ȘI CONDIMENTE ==========
    "sos vegan special": {
        description: "Sos vegan (pe bază de maioneză vegetală)",
        energy_kcal: 320,
        fat: 30.0,
        saturated_fat: 3.5,
        carbs: 12.0,
        sugars: 5.0,
        protein: 1.5,
        salt: 1.8,
        fiber: 0.5,
        allergens: ["soia", "muștar"],
        additives: [],
        source: "Estimat - sosuri vegane"
    },
    
    "sos tabasco": {
        description: "Sos Tabasco (ardei fermentați)",
        energy_kcal: 12,
        fat: 0.6,
        saturated_fat: 0.1,
        carbs: 0.8,
        sugars: 0.5,
        protein: 1.3,
        salt: 2.6,
        fiber: 0.3,
        allergens: [],
        additives: [],
        source: "Date producător - Tabasco"
    },
    
    "sos dulce-amar": {
        description: "Sos dulce-amar chinezesc (sweet & sour)",
        energy_kcal: 145,
        fat: 0.2,
        saturated_fat: 0.03,
        carbs: 35.0,
        sugars: 30.0,
        protein: 0.5,
        salt: 1.5,
        fiber: 0.5,
        allergens: [],
        additives: [],
        source: "USDA echivalent - sweet & sour sauce"
    },
    
    "chimion": {
        description: "Chimion (semințe măcinate)",
        energy_kcal: 375,
        fat: 22.3,
        saturated_fat: 1.5,
        carbs: 44.2,
        sugars: 2.2,
        protein: 17.8,
        salt: 0.17,
        fiber: 10.5,
        allergens: [],
        additives: [],
        source: "USDA echivalent - cumin"
    },

    // ========== BĂUTURI ==========
    "gheata": {
        description: "Gheață (apă solidificată)",
        energy_kcal: 0,
        fat: 0,
        saturated_fat: 0,
        carbs: 0,
        sugars: 0,
        protein: 0,
        salt: 0,
        fiber: 0,
        allergens: [],
        additives: [],
        source: "Date standard - apă"
    },
    
    "suc de cranberry": {
        description: "Suc de cranberry (100% fructe)",
        energy_kcal: 46,
        fat: 0.1,
        saturated_fat: 0.01,
        carbs: 12.2,
        sugars: 12.2,
        protein: 0.4,
        salt: 0.002,
        fiber: 0.1,
        allergens: [],
        additives: [],
        source: "USDA echivalent - cranberry juice"
    },
    
    "rom alb": {
        description: "Rom alb 40% alcool",
        energy_kcal: 231,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 0.0,
        sugars: 0.0,
        protein: 0.0,
        salt: 0.001,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - rum white"
    },
    
    "rom negru": {
        description: "Rom negru 40% alcool",
        energy_kcal: 231,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 0.0,
        sugars: 0.0,
        protein: 0.0,
        salt: 0.001,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - rum dark"
    },
    
    "vermut rosu": {
        description: "Vermut roșu dulce (16-18% alcool)",
        energy_kcal: 139,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 13.9,
        sugars: 13.9,
        protein: 0.1,
        salt: 0.01,
        fiber: 0.0,
        allergens: ["sulfiti"],
        additives: [],
        source: "USDA echivalent - vermouth sweet"
    },
    
    "sirop simplu": {
        description: "Sirop simplu (zahăr + apă 1:1)",
        energy_kcal: 260,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 67.0,
        sugars: 67.0,
        protein: 0.0,
        salt: 0.001,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "Calculat - sirop simplu standard"
    },
    
    "sirop de vanilie": {
        description: "Sirop de vanilie (pentru cafea/cocktailuri)",
        energy_kcal: 265,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 68.0,
        sugars: 68.0,
        protein: 0.0,
        salt: 0.02,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "Date producător - siropuri aromatizate"
    },
    
    "sirop de violete": {
        description: "Sirop de violete (pentru cocktailuri)",
        energy_kcal: 270,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 69.0,
        sugars: 69.0,
        protein: 0.0,
        salt: 0.01,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "Date producător - siropuri aromatizate"
    },
    
    "sirop aromat": {
        description: "Sirop aromat generic (diverse arome)",
        energy_kcal: 265,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 68.0,
        sugars: 68.0,
        protein: 0.0,
        salt: 0.02,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "Date producător - siropuri aromatizate"
    },
    
    "cafea boabe decofeinizata": {
        description: "Cafea boabe decofeinizată",
        energy_kcal: 1,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 0.0,
        sugars: 0.0,
        protein: 0.1,
        salt: 0.002,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - decaf coffee"
    },
    
    "ceai tea tales": {
        description: "Ceai aromat Tea Tales (diverse arome)",
        energy_kcal: 1,
        fat: 0.0,
        saturated_fat: 0.0,
        carbs: 0.3,
        sugars: 0.0,
        protein: 0.0,
        salt: 0.001,
        fiber: 0.0,
        allergens: [],
        additives: [],
        source: "Date producător - ceaiuri aromatizate"
    },

    // ========== DIVERSE ==========
    "burgher vegan (legume)": {
        description: "Burger vegan (pe bază de legume și cereale)",
        energy_kcal: 180,
        fat: 8.5,
        saturated_fat: 1.2,
        carbs: 18.0,
        sugars: 2.5,
        protein: 12.0,
        salt: 1.1,
        fiber: 5.5,
        allergens: ["gluten", "soia"],
        additives: [],
        source: "USDA echivalent - veggie burger"
    },
    
    "ciocolata topita": {
        description: "Ciocolată topită (pentru desert)",
        energy_kcal: 535,
        fat: 31.3,
        saturated_fat: 18.5,
        carbs: 59.4,
        sugars: 51.5,
        protein: 4.9,
        salt: 0.02,
        fiber: 7.0,
        allergens: ["lapte", "soia"],
        additives: [],
        source: "USDA echivalent - ciocolată neagră topită"
    },
    
    "dulceata fructe de padure": {
        description: "Dulceață de fructe de pădure (gem)",
        energy_kcal: 250,
        fat: 0.1,
        saturated_fat: 0.01,
        carbs: 65.0,
        sugars: 60.0,
        protein: 0.4,
        salt: 0.03,
        fiber: 1.2,
        allergens: [],
        additives: [],
        source: "USDA echivalent - berry jam"
    },
    
    "cacao pudra": {
        description: "Cacao pudră (nesweetened)",
        energy_kcal: 228,
        fat: 13.7,
        saturated_fat: 8.1,
        carbs: 57.9,
        sugars: 1.8,
        protein: 19.6,
        salt: 0.02,
        fiber: 33.2,
        allergens: [],
        additives: [],
        source: "USDA echivalent - cocoa powder"
    },
    
    "piure de cocos": {
        description: "Piure de cocos (cream of coconut)",
        energy_kcal: 330,
        fat: 27.0,
        saturated_fat: 24.0,
        carbs: 25.0,
        sugars: 21.0,
        protein: 3.3,
        salt: 0.15,
        fiber: 2.2,
        allergens: [],
        additives: [],
        source: "USDA echivalent - coconut cream"
    },
    
    "piure de capsuni": {
        description: "Piure de căpșuni (100% fructe)",
        energy_kcal: 53,
        fat: 0.4,
        saturated_fat: 0.02,
        carbs: 12.8,
        sugars: 8.0,
        protein: 0.7,
        salt: 0.001,
        fiber: 2.0,
        allergens: [],
        additives: [],
        source: "USDA echivalent - strawberry puree"
    }
};

