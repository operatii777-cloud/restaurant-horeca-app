-- ============================================================================
-- POPULARE EU 14 ALERGENI STANDARD
-- Data: 2025-01-24
-- Scop: Populare tabel allergens cu cei 14 alergeni standard EU conform Reg. (UE) 1169/2011
-- ============================================================================

-- Populare completă EU 14 Alergeni
INSERT OR REPLACE INTO allergens (id, code, name_ro, name_en, icon, sort_order, description_ro, description_en, regulation_reference, severity, is_active) VALUES
(1, 'GLUTEN', 'Gluten (cereale)', 'Gluten (cereals)', '🌾', 1, 
 'Grâu, secară, orz, ovăz, grâu spelt, kamut', 
 'Wheat, rye, barley, oats, spelt, kamut',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(2, 'CRUSTACEANS', 'Crustacee', 'Crustaceans', '🦐', 2,
 'Creveți, crabi, homari, raci',
 'Shrimp, crab, lobster, crayfish',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(3, 'EGGS', 'Ouă', 'Eggs', '🥚', 3,
 'Ouă de găină și produse pe bază de ouă',
 'Chicken eggs and egg-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(4, 'FISH', 'Pește', 'Fish', '🐟', 4,
 'Toate speciile de pește',
 'All fish species',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(5, 'PEANUTS', 'Arahide', 'Peanuts', '🥜', 5,
 'Arahide și produse pe bază de arahide',
 'Peanuts and peanut-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(6, 'SOY', 'Soia', 'Soy', '🫘', 6,
 'Boabe de soia și produse pe bază de soia',
 'Soybeans and soy-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(7, 'MILK', 'Lapte', 'Milk', '🥛', 7,
 'Lapte și produse lactate (inclusiv lactoză)',
 'Milk and dairy products (including lactose)',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(8, 'NUTS', 'Fructe cu coajă lemnoasă', 'Tree nuts', '🌰', 8,
 'Migdale, alune, nuci, caju, pecan, Brazilia, pistachii, macadamia',
 'Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(9, 'CELERY', 'Țelină', 'Celery', '🥬', 9,
 'Țelină și produse pe bază de țelină',
 'Celery and celery-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(10, 'MUSTARD', 'Muștar', 'Mustard', '🌭', 10,
 'Semințe de muștar și produse pe bază de muștar',
 'Mustard seeds and mustard-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(11, 'SESAME', 'Susan', 'Sesame', '🌾', 11,
 'Semințe de susan și produse pe bază de susan',
 'Sesame seeds and sesame-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(12, 'SULPHITES', 'Dioxid de sulf și sulfiți', 'Sulphites', '💨', 12,
 'Sulfiți în concentrații peste 10 mg/kg',
 'Sulphites in concentrations above 10 mg/kg',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(13, 'LUPIN', 'Lupin', 'Lupin', '🫘', 13,
 'Lupin și produse pe bază de lupin',
 'Lupin and lupin-based products',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1),

(14, 'MOLLUSCS', 'Moluște', 'Molluscs', '🦪', 14,
 'Scoici, melci, calmar, sepie',
 'Mussels, snails, squid, cuttlefish',
 'Reg. (UE) 1169/2011, Anexa II', 'high', 1);

-- Verificare
-- SELECT COUNT(*) as total FROM allergens WHERE is_active = 1; -- Ar trebui să fie 14

