-- SQL Script to fix product name encoding issues
-- This script fixes corrupted Romanian diacritics in product names

-- Răcoritoare
UPDATE menu SET name = 'Apă Carbogazoasă' WHERE id = 127;
UPDATE menu SET name = 'Apă Carbogazoasă Mare' WHERE id = 128;
UPDATE menu SET name = 'Apă Plată' WHERE id = 129;
UPDATE menu SET name = 'Apă Plată Mare' WHERE id = 130;
UPDATE menu SET name = 'Limonadă Clasică' WHERE id = 136;
UPDATE menu SET name = 'Limonadă cu Căpșuni' WHERE id = 137;
UPDATE menu SET name = 'Limonadă cu Fructul Pasiunii' WHERE id = 138;
UPDATE menu SET name = 'Limonadă cu Mango' WHERE id = 139;
UPDATE menu SET name = 'Limonadă cu Mentă' WHERE id = 140;
UPDATE menu SET name = 'Limonadă cu Zmeură' WHERE id = 141;
UPDATE menu SET name = 'Lipton Ice Tea Lămâie' WHERE id = 142;
UPDATE menu SET name = 'Lipton Ice Tea Piersică' WHERE id = 143;
UPDATE menu SET name = 'Prigat Căpșuni' WHERE id = 149;
UPDATE menu SET name = 'Prigat Piersică' WHERE id = 150;
UPDATE menu SET name = 'Prigat Portocală' WHERE id = 151;
UPDATE menu SET name = 'San Benedetto Ice Tea Lămâie' WHERE id = 154;
UPDATE menu SET name = 'San Benedetto Ice Tea Piersică' WHERE id = 155;
UPDATE menu SET name = 'Fresh de Portocală' WHERE id = 135;

-- Vinuri
UPDATE menu SET name = 'Caii de la Letea Vol 1 Cabernet & Fetească Neagră' WHERE id = 19;
UPDATE menu SET name = 'Negrini Negru de Drăgășani' WHERE id = 68;
UPDATE menu SET name = 'Negrini Sauvignon Blanc & Fetească Regală' WHERE id = 70;
UPDATE menu SET name = 'Purcari Nocturne Rară Neagră' WHERE id = 78;
UPDATE menu SET name = 'Sarica Aniversarium Roșu' WHERE id = 86;

-- Fel Principal
UPDATE menu SET name = 'Ceafă de Porc la Grătar' WHERE id = 203;
UPDATE menu SET name = 'Friptură de Miel' WHERE id = 212;
UPDATE menu SET name = 'Friptură de Porc' WHERE id = 213;
UPDATE menu SET name = 'Friptură de Vită' WHERE id = 214;
UPDATE menu SET name = 'Grătar Mixt' WHERE id = 215;
UPDATE menu SET name = 'Mici cu Muștar' WHERE id = 216;
UPDATE menu SET name = 'Mușchi de Porc' WHERE id = 217;
UPDATE menu SET name = 'Mușchi de Vită' WHERE id = 218;
UPDATE menu SET name = 'Piept de Pui la Grătar' WHERE id = 219;
UPDATE menu SET name = 'Piept de Pui Umplut cu Brânză' WHERE id = 220;
UPDATE menu SET name = 'Piept de Rață' WHERE id = 221;
UPDATE menu SET name = 'Pulpă de Pui' WHERE id = 222;
UPDATE menu SET name = 'Pulpă de Rață Confită' WHERE id = 223;
UPDATE menu SET name = 'Rasol de Vită' WHERE id = 224;
UPDATE menu SET name = 'Sarmale cu Mămăligă' WHERE id = 225;
UPDATE menu SET name = 'Tochitură Moldovenească' WHERE id = 232;
UPDATE menu SET name = 'Tochitura Ardeleneasca' WHERE id = 233;
UPDATE menu SET name = 'Tochitura Moldoveneasca' WHERE id = 234;
UPDATE menu SET name = 'Varza Calita cu Ciolan' WHERE id = 239;
UPDATE menu SET name = 'Coaste de Porc la Grătar' WHERE id = 243;
UPDATE menu SET name = 'Coaste de Vită la Grătar' WHERE id = 245;
UPDATE menu SET name = 'Frigărui de Pui' WHERE id = 246;
UPDATE menu SET name = 'Frigărui de Porc' WHERE id = 247;
UPDATE menu SET name = 'Frigărui de Vită' WHERE id = 248;
UPDATE menu SET name = 'Frigărui Mixte' WHERE id = 249;
UPDATE menu SET name = 'Mușchiuleț de Porc' WHERE id = 250;
UPDATE menu SET name = 'Mușchiuleț de Vită' WHERE id = 251;
UPDATE menu SET name = 'Șnițel de Pui Palermo' WHERE id = 255;

-- Garnituri
UPDATE menu SET name = 'Cartofi Prăjiți' WHERE id = 258;
UPDATE menu SET name = 'Cartofi Zdrobiți' WHERE id = 260;
UPDATE menu SET name = 'Legume la Grătar' WHERE id = 262;
UPDATE menu SET name = 'Mămăligă' WHERE id = 263;
UPDATE menu SET name = 'Orez Sălbatic' WHERE id = 264;

-- Mic Dejun
UPDATE menu SET name = 'Ochiuri cu cârnați oltenești' WHERE id = 351;
UPDATE menu SET name = 'Omletă cu Șuncă și Mozzarella' WHERE id = 269;
UPDATE menu SET name = 'Omletă Țărănească' WHERE id = 270;

-- Paste
UPDATE menu SET name = 'Linguini AOP cu Creveți' WHERE id = 278;

-- Peste și Fructe de Mare
UPDATE menu SET name = 'Crap Prăjit cu Mămăligă' WHERE id = 291;
UPDATE menu SET name = 'File de Dorada la Plită' WHERE id = 292;
UPDATE menu SET name = 'Midii Picante în Sos Roșu' WHERE id = 294;
UPDATE menu SET name = 'Midii în Sos de Vin Alb' WHERE id = 295;
UPDATE menu SET name = 'Saramură de Crap cu Mămăligă' WHERE id = 296;

-- Salate
UPDATE menu SET name = 'Salată Grecească' WHERE id = 321;
UPDATE menu SET name = 'Salată cu Somon și Avocado' WHERE id = 325;
UPDATE menu SET name = 'Salată de Vară cu Pui și Avocado' WHERE id = 327;

-- Salate Însoțitoare
UPDATE menu SET name = 'Salată Asortată de Vară' WHERE id = 328;
UPDATE menu SET name = 'Salată de Murături' WHERE id = 332;
UPDATE menu SET name = 'Salată de Roșii' WHERE id = 333;
UPDATE menu SET name = 'Salată de Rucola și Roșii Cherry' WHERE id = 334;
UPDATE menu SET name = 'Salată de Varză cu Morcov și Mărar' WHERE id = 335;

-- Sosuri și Pâine
UPDATE menu SET name = 'Focaccia Simplă' WHERE id = 341;
UPDATE menu SET name = 'Focaccia cu Usturoi și Parmezan' WHERE id = 342;
UPDATE menu SET name = 'Pâine de Casă' WHERE id = 339;
UPDATE menu SET name = 'Sos de Maionez Picantă' WHERE id = 344;
UPDATE menu SET name = 'Sos de Maionez Simplă' WHERE id = 343;
UPDATE menu SET name = 'Sos de muștar' WHERE id = 354;
UPDATE menu SET name = 'Turtă de Casă' WHERE id = 340;

-- Pizza
UPDATE menu SET name = 'Pizza Vegetariană' WHERE id = 314;

-- Antreuri
UPDATE menu SET name = 'Ardei Kapia Umpluti cu Brânză' WHERE id = 157;
UPDATE menu SET name = 'Calamari Prajiti' WHERE id = 159;
UPDATE menu SET name = 'Platou de Brânzeturi' WHERE id = 162;
UPDATE menu SET name = 'Rondele de Ceapă' WHERE id = 164;
UPDATE menu SET name = 'Rulouri de Vinete cu Brânză' WHERE id = 165;

-- Ciorbe și Supe
UPDATE menu SET name = 'Supă Cremă de Ciuperci' WHERE id = 167;
UPDATE menu SET name = 'Supă Cremă de Roșii' WHERE id = 169;
UPDATE menu SET name = 'Supă de Pui cu Tăiței' WHERE id = 170;
UPDATE menu SET name = 'Ciorbă de Burtă' WHERE id = 172;
UPDATE menu SET name = 'Ciorbă de Fasole cu Ciolan' WHERE id = 173;
UPDATE menu SET name = 'Ciorbă de Perișoare' WHERE id = 175;
UPDATE menu SET name = 'Ciorbă Rădăuțeană' WHERE id = 177;
UPDATE menu SET name = 'Ciorbă Țărănească' WHERE id = 178;

-- Desert
UPDATE menu SET name = 'Cheesecake cu Căpșuni' WHERE id = 180;
UPDATE menu SET name = 'Cheesecake cu Ciocolată' WHERE id = 181;
UPDATE menu SET name = 'Clătite cu Dulceață' WHERE id = 182;
UPDATE menu SET name = 'Gogoși cu Gem' WHERE id = 186;
UPDATE menu SET name = 'Papanași cu Smântână și Dulceață' WHERE id = 189;
UPDATE menu SET name = 'Salată de Fructe' WHERE id = 191;

-- Verify changes
SELECT COUNT(*) as fixed_products FROM menu WHERE name NOT LIKE '%─%' AND name NOT LIKE '%╚%' AND name NOT LIKE '%├%';
