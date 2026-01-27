/**
 * Training & Staff Academy Routes
 * Gestionare cursuri, module, quiz-uri și certificări
 */

const express = require('express');
const router = express.Router();

// In-memory storage (va fi migrat la SQLite)
let courses = [
  {
    id: 1,
    title: 'Onboarding - Bun Venit în Echipă!',
    category: 'Onboarding',
    description: 'Training inițial pentru angajații noi. Învață despre valorile companiei, procedurile de bază și așteptările echipei.',
    duration: 45,
    mandatory: true,
    icon: '👋',
    order: 1,
    modules: [
      {
        id: 101,
        title: 'Bine ai venit!',
        type: 'video',
        content: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // placeholder
        duration: 5,
        order: 1
      },
      {
        id: 102,
        title: 'Valorile Noastre',
        type: 'text',
        content: `
# Valorile Restaurantului Nostru

## 1. 🎯 Excelență în Servire
Fiecare client merită cea mai bună experiență. Tratăm fiecare masă ca pe o oportunitate de a crea o amintire frumoasă.

## 2. 🤝 Lucru în Echipă
Suntem o familie. Ne ajutăm reciproc, comunicăm deschis și celebrăm succesele împreună.

## 3. 🧹 Curățenie și Igienă
Respectăm cele mai înalte standarde de igienă. Locul nostru de muncă reflectă profesionalismul nostru.

## 4. 📚 Învățare Continuă
Nu încetăm niciodată să învățăm. Fiecare zi este o oportunitate de a deveni mai buni.

## 5. 💚 Respect
Respectăm clienții, colegii și produsele cu care lucrăm.
        `,
        duration: 10,
        order: 2
      },
      {
        id: 103,
        title: 'Programul de Lucru',
        type: 'text',
        content: `
# Programul și Regulile de Bază

## Ora de Sosire
- Trebuie să fii prezent cu **15 minute** înainte de începerea turei
- Folosește sistemul de pontaj pentru check-in/check-out
- Anunță managerul cu minim 4 ore înainte dacă nu poți veni

## Ținuta
- **Uniforma** trebuie să fie curată și călcată
- **Încălțăminte** închisă, antiderapantă
- **Fără bijuterii** vizibile (excepție: verighetă)
- **Părul** strâns (pentru bucătărie: bonetă obligatorie)

## Pauze
- Pauza de masă: 30 minute (anunță managerul)
- Pauze scurte: doar cu acordul managerului
- **NU** se mănâncă în sala de servire

## Telefon Mobil
- Telefoanele se lasă în vestiar
- Utilizare DOAR în pauze, în zona desemnată
        `,
        duration: 10,
        order: 3
      },
      {
        id: 104,
        title: 'Sistemul POS - Prezentare',
        type: 'text',
        content: `
# Introducere în Sistemul POS

## Ce este POS-ul?
POS = Point of Sale (Punct de Vânzare)
Este aplicația pe care o folosești pentru a lua comenzi și a procesa plăți.

## Cum funcționează?
1. **Selectezi masa** clientului
2. **Adaugi produsele** din meniu
3. **Trimiți comanda** la bucătărie/bar
4. **Încasezi** când clientul cere nota

## Butoane Importante
- 🟢 **Trimite** - Trimite comanda la bucătărie
- 🔵 **Adaugă** - Adaugă produs în comandă
- 🟡 **Modifică** - Schimbă cantitate sau observații
- 🔴 **Anulează** - Anulează produs (necesită aprobare manager)

## Tips & Tricks
- Verifică ÎNTOTDEAUNA comanda înainte de a o trimite
- Dacă clientul are alergii, folosește butonul "Observații"
- Pentru discount-uri, cere aprobare de la manager
        `,
        duration: 10,
        order: 4
      },
      {
        id: 105,
        title: 'Quiz Onboarding',
        type: 'quiz',
        content: null,
        duration: 10,
        order: 5,
        quiz: {
          passingScore: 80,
          questions: [
            {
              id: 1,
              question: 'Cu câte minute înainte de tură trebuie să fii prezent?',
              options: ['5 minute', '10 minute', '15 minute', '30 minute'],
              correctIndex: 2,
              explanation: 'Trebuie să fii prezent cu 15 minute înainte pentru a te pregăti.'
            },
            {
              id: 2,
              question: 'Ce faci dacă un client are o alergie alimentară?',
              options: ['Ignori', 'Folosești butonul Observații în POS', 'Spui că nu se poate', 'Întrebi managerul'],
              correctIndex: 1,
              explanation: 'Folosești butonul Observații pentru a nota alergia și informezi bucătăria.'
            },
            {
              id: 3,
              question: 'Unde se lasă telefonul mobil în timpul programului?',
              options: ['În buzunar', 'În vestiar', 'La bar', 'Acasă'],
              correctIndex: 1,
              explanation: 'Telefoanele se lasă în vestiar și se folosesc doar în pauze.'
            },
            {
              id: 4,
              question: 'Cine trebuie să aprobe o anulare de produs?',
              options: ['Clientul', 'Colegul', 'Managerul', 'Bucătarul'],
              correctIndex: 2,
              explanation: 'Anulările necesită aprobare de la manager pentru a preveni abuzurile.'
            },
            {
              id: 5,
              question: 'Care este una dintre valorile noastre?',
              options: ['Viteză', 'Excelență în Servire', 'Profit', 'Competiție'],
              correctIndex: 1,
              explanation: 'Excelența în Servire este una dintre cele 5 valori fundamentale.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: 'HACCP & Siguranța Alimentară',
    category: 'Compliance',
    description: 'Normele de igienă și siguranță alimentară obligatorii pentru toți angajații din HoReCa.',
    duration: 60,
    mandatory: true,
    icon: '🧪',
    order: 2,
    modules: [
      {
        id: 201,
        title: 'Ce este HACCP?',
        type: 'text',
        content: `
# HACCP - Hazard Analysis Critical Control Points

## Ce înseamnă?
**HACCP** = Analiza Riscurilor și Punctelor Critice de Control

Este un sistem internațional care asigură siguranța alimentelor de la furnizor până la client.

## De ce este important?
- Previne toxiinfecțiile alimentare
- Este **OBLIGATORIU legal** în România
- Protejează clienții și restaurantul
- Amenzile pentru nerespectare pot ajunge la **50.000 LEI**

## Cele 7 Principii HACCP
1. Analiza pericolelor
2. Identificarea punctelor critice de control (CCP)
3. Stabilirea limitelor critice
4. Monitorizarea CCP-urilor
5. Acțiuni corective
6. Verificare
7. Documentare
        `,
        duration: 10,
        order: 1
      },
      {
        id: 202,
        title: 'Temperaturile Corecte',
        type: 'text',
        content: `
# Zona de Pericol și Temperaturi

## 🌡️ Zona de Pericol: 4°C - 63°C
În acest interval, bacteriile se înmulțesc RAPID!

## Temperaturi de Păstrare

| Produs | Temperatură |
|--------|-------------|
| Frigider (carne, lactate) | 0°C - 4°C |
| Congelator | -18°C sau mai jos |
| Mâncare caldă (servire) | peste 63°C |
| Mâncare rece (salate) | sub 4°C |

## Regula celor 2 ore
- Mâncarea NU poate sta la temperatura camerei mai mult de **2 ore**
- După 2 ore → LA GUNOI!

## Verificări Obligatorii
- Verifică temperatura frigiderelor **de 2 ori pe zi**
- Notează în registrul de temperaturi
- Dacă frigiderul e peste 4°C → anunță IMEDIAT managerul
        `,
        duration: 10,
        order: 2
      },
      {
        id: 203,
        title: 'Spălarea Mâinilor',
        type: 'text',
        content: `
# Spălarea Corectă a Mâinilor

## Când să te speli pe mâini?
- ✅ La începutul programului
- ✅ După toaletă
- ✅ După ce atingi bani
- ✅ După ce atingi gunoi
- ✅ După ce strănuți/tușești
- ✅ După ce atingi carne crudă
- ✅ Între manipularea diferitelor alimente
- ✅ După pauză

## Cum să te speli corect (20 secunde!)
1. Udă mâinile cu apă caldă
2. Aplică săpun
3. Freacă palmele
4. Freacă între degete
5. Freacă unghiile în palme
6. Freacă dosul mâinilor
7. Clătește bine
8. Usucă cu prosop de hârtie
9. Închide robinetul cu prosopul

## 🚫 NU este suficient:
- Doar clătirea cu apă
- Spălarea sub 20 secunde
- Ștergerea pe șorț
        `,
        duration: 10,
        order: 3
      },
      {
        id: 204,
        title: 'Contaminarea Încrucișată',
        type: 'text',
        content: `
# Prevenirea Contaminării Încrucișate

## Ce este contaminarea încrucișată?
Transferul de bacterii sau alergeni de la un aliment la altul.

## Reguli de Prevenire

### 1. Separare în Frigider
- **Sus**: produse gata de consum (brânză, fructe)
- **Mijloc**: carne gătită
- **Jos**: carne crudă (într-un vas acoperit!)

### 2. Tocătoare Separate
- 🔴 **Roșu** = Carne crudă
- 🟢 **Verde** = Legume
- 🔵 **Albastru** = Pește
- 🟡 **Galben** = Pui crud
- ⚪ **Alb** = Produse lactate/pâine

### 3. Ustensile
- NU folosi același cuțit pentru carne crudă și legume
- Spală ustensilele între utilizări

### 4. Mănuși
- Schimbă mănușile când schimbi tipul de produs
- Mănușile NU înlocuiesc spălatul mâinilor!
        `,
        duration: 10,
        order: 4
      },
      {
        id: 205,
        title: 'Alergenii Alimentari',
        type: 'text',
        content: `
# Cei 14 Alergeni Obligatoriu de Declarat

## Lista Oficială UE

1. **Gluten** (grâu, secară, orz, ovăz)
2. **Crustacee** (creveți, raci, homari)
3. **Ouă**
4. **Pește**
5. **Arahide**
6. **Soia**
7. **Lapte** (și lactate)
8. **Fructe cu coajă** (nuci, migdale, alune)
9. **Țelină**
10. **Muștar**
11. **Susan**
12. **Dioxid de sulf** (> 10mg/kg)
13. **Lupin**
14. **Moluște** (scoici, stridii)

## Ce faci când clientul anunță o alergie?

1. ✅ Notezi în POS (butonul Observații)
2. ✅ Informezi bucătăria verbal
3. ✅ Verifici ingredientele produselor comandate
4. ✅ Dacă nu ești sigur → ÎNTREABĂ
5. ❌ NU spui "cred că nu conține"

## ⚠️ Reacțiile alergice pot fi FATALE!
        `,
        duration: 10,
        order: 5
      },
      {
        id: 206,
        title: 'Quiz HACCP',
        type: 'quiz',
        content: null,
        duration: 10,
        order: 6,
        quiz: {
          passingScore: 80,
          questions: [
            {
              id: 1,
              question: 'Care este "zona de pericol" pentru temperatură?',
              options: ['0°C - 10°C', '4°C - 63°C', '20°C - 40°C', '10°C - 50°C'],
              correctIndex: 1,
              explanation: 'Între 4°C și 63°C bacteriile se înmulțesc rapid.'
            },
            {
              id: 2,
              question: 'Cât timp trebuie să dureze spălatul pe mâini?',
              options: ['5 secunde', '10 secunde', '20 secunde', '1 minut'],
              correctIndex: 2,
              explanation: 'Spălatul corect durează minim 20 de secunde.'
            },
            {
              id: 3,
              question: 'Unde se pune carnea crudă în frigider?',
              options: ['Sus', 'La mijloc', 'Jos', 'Oriunde'],
              correctIndex: 2,
              explanation: 'Carnea crudă se pune jos pentru a preveni scurgerea pe alte alimente.'
            },
            {
              id: 4,
              question: 'Tocătorul ROȘU este pentru:',
              options: ['Legume', 'Pește', 'Carne crudă', 'Pâine'],
              correctIndex: 2,
              explanation: 'Tocătorul roșu este destinat cărnii crude.'
            },
            {
              id: 5,
              question: 'Câți alergeni trebuie declarați conform UE?',
              options: ['8', '10', '12', '14'],
              correctIndex: 3,
              explanation: 'Există 14 alergeni cu declarare obligatorie în UE.'
            },
            {
              id: 6,
              question: 'După cât timp la temperatura camerei trebuie aruncată mâncarea?',
              options: ['1 oră', '2 ore', '4 ore', '6 ore'],
              correctIndex: 1,
              explanation: 'Regula celor 2 ore: după 2 ore la temperatura camerei, mâncarea devine nesigură.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 3,
    title: 'Serviciul Excelent - Customer Care',
    category: 'Customer Service',
    description: 'Tehnici de servire, comunicare cu clienții și rezolvarea reclamațiilor.',
    duration: 30,
    mandatory: false,
    icon: '⭐',
    order: 3,
    modules: [
      {
        id: 301,
        title: 'Prima Impresie',
        type: 'text',
        content: `
# Prima Impresie Contează

## Regula celor 10 secunde
Clientul își formează părerea despre restaurant în primele **10 secunde**.

## Cum întâmpini clientul?

### 1. Zâmbetul
- Zâmbește natural, nu forțat
- Contact vizual prietenos
- Postură deschisă (fără brațe încrucișate)

### 2. Salutul
- "Bună ziua/seara! Bine ați venit!"
- "Aveți rezervare sau căutați o masă?"
- "Cu plăcere, vă conduc la masă."

### 3. Prezentarea Mesei
- "Aceasta este masa dumneavoastră."
- "Vă aduc meniul imediat."
- "Doriți ceva de băut între timp?"

## ❌ De evitat:
- "Ce doriți?" (prea direct)
- Să stai pe telefon când intră clientul
- Să ignori clientul mai mult de 30 de secunde
        `,
        duration: 8,
        order: 1
      },
      {
        id: 302,
        title: 'Preluarea Comenzii',
        type: 'text',
        content: `
# Tehnica Preluării Comenzii

## Pașii Corecți

### 1. Abordarea
- Așteaptă să se uite la meniu
- "Sunteți pregătiți să comandați sau mai aveți nevoie de câteva minute?"

### 2. Recomandări
- "Vă recomand [preparatul zilei]..."
- "Dacă vă place [ingredient], aveți [preparat]..."
- NU forța vânzarea!

### 3. Notarea
- Notează clar, citeț
- Repetă comanda la final
- "Deci avem: [produse]. Este corect?"

### 4. Întrebări Importante
- "Aveți alergii alimentare?"
- "Cum doriți carnea? (Medium, bine făcută)"
- "Doriți garnitură separată?"

### 5. Confirmare Băuturi
- "Doriți să comandați și băuturi?"
- "Apa plată sau minerală?"

## Upselling Natural
- "Doriți să adăugați o porție de cartofi?"
- "Avem un vin excelent care se potrivește cu..."
        `,
        duration: 8,
        order: 2
      },
      {
        id: 303,
        title: 'Gestionarea Reclamațiilor',
        type: 'text',
        content: `
# Transformă Reclamația în Oportunitate

## Metoda LAST

### L - Listen (Ascultă)
- Lasă clientul să vorbească
- NU întrerupe
- Arată că ești atent (da din cap, contact vizual)

### A - Apologize (Scuze)
- "Îmi pare foarte rău că..."
- "Înțeleg frustrarea dumneavoastră..."
- Fără scuze defensive!

### S - Solve (Rezolvă)
- "Ce pot face pentru a remedia situația?"
- Oferă soluții concrete
- Dacă nu poți rezolva → cheamă managerul

### T - Thank (Mulțumește)
- "Vă mulțumesc că ne-ați spus."
- "Feedback-ul dumneavoastră ne ajută să ne îmbunătățim."

## Exemple de Situații

| Problemă | Soluție |
|----------|---------|
| Mâncare rece | Reîncălzire sau refacere + scuze |
| Așteptare lungă | Scuze + posibil oferit ceva |
| Produs greșit | Schimbare imediată + scuze |
| Produs indisponibil | Oferă alternativă similară |

## 🚫 NU spune niciodată:
- "Nu e vina mea"
- "Așa e la noi"
- "Trebuia să spuneți de la început"
        `,
        duration: 10,
        order: 3
      },
      {
        id: 304,
        title: 'Quiz Customer Service',
        type: 'quiz',
        content: null,
        duration: 4,
        order: 4,
        quiz: {
          passingScore: 80,
          questions: [
            {
              id: 1,
              question: 'În câte secunde își formează clientul prima impresie?',
              options: ['5 secunde', '10 secunde', '30 secunde', '1 minut'],
              correctIndex: 1,
              explanation: 'Clientul își formează prima impresie în primele 10 secunde.'
            },
            {
              id: 2,
              question: 'Ce înseamnă "L" în metoda LAST?',
              options: ['Learn', 'Listen', 'Look', 'Leave'],
              correctIndex: 1,
              explanation: 'L = Listen (Ascultă) - primul pas în gestionarea reclamațiilor.'
            },
            {
              id: 3,
              question: 'Ce faci când nu poți rezolva singur o reclamație?',
              options: ['Ignori clientul', 'Spui că nu e vina ta', 'Chemi managerul', 'Îți ceri scuze și pleci'],
              correctIndex: 2,
              explanation: 'Când nu poți rezolva singur, chemi managerul pentru asistență.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 4,
    title: 'POS & Sisteme de Comandă',
    category: 'Technical',
    description: 'Ghid complet pentru utilizarea sistemului POS, comenzi și încasări.',
    duration: 25,
    mandatory: true,
    icon: '💻',
    order: 4,
    modules: [
      {
        id: 401,
        title: 'Interfața POS',
        type: 'text',
        content: `
# Ghid Interfață POS

## Ecranul Principal

### Zona Stânga - Mese
- Mese verzi = libere
- Mese roșii = ocupate
- Mese galbene = au comandă în așteptare
- Click pe masă pentru a deschide comanda

### Zona Centru - Meniu
- Categorii sus (Aperitive, Fel Principal, etc.)
- Produse dedesubt
- Click pe produs pentru a-l adăuga

### Zona Dreapta - Comandă
- Lista produselor comandate
- Buton +/- pentru cantitate
- Buton "Trimite" pentru a trimite la bucătărie

## Navigare Rapidă
- **ESC** = Înapoi
- **ENTER** = Confirmă
- **F1** = Ajutor
- **F5** = Refresh
        `,
        duration: 8,
        order: 1
      },
      {
        id: 402,
        title: 'Procesarea Plăților',
        type: 'text',
        content: `
# Încasarea și Metodele de Plată

## Metode Acceptate

### 1. Numerar
- Verifică suma primită
- Numără restul de 2 ori
- Oferă bonul fiscal

### 2. Card
- Poziționează POS-ul spre client
- Așteaptă confirmarea
- "Vă rog introduceți cardul/apropiați cardul"

### 3. Voucher/Card Cadou
- Scanează codul
- Verifică valabilitatea
- Diferența se achită separat

## Împărțirea Notei
1. Deschide comanda
2. Click "Împarte Nota"
3. Selectează produsele pentru fiecare persoană
4. Procesează fiecare plată separat

## Tips pentru Bacșiș (Card)
- "Doriți să adăugați bacșiș?"
- Introdu suma indicată de client
- Confirmă totalul final
        `,
        duration: 8,
        order: 2
      },
      {
        id: 403,
        title: 'Quiz POS',
        type: 'quiz',
        content: null,
        duration: 9,
        order: 3,
        quiz: {
          passingScore: 80,
          questions: [
            {
              id: 1,
              question: 'Ce culoare are o masă ocupată în POS?',
              options: ['Verde', 'Albastru', 'Roșu', 'Galben'],
              correctIndex: 2,
              explanation: 'Mesele ocupate sunt afișate în roșu.'
            },
            {
              id: 2,
              question: 'Ce faci înainte de a da restul clientului?',
              options: ['Nimic special', 'Numeri de 2 ori', 'Întrebi managerul', 'Dai direct'],
              correctIndex: 1,
              explanation: 'Întotdeauna numără restul de 2 ori pentru a evita greșelile.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 5,
    title: 'Vinuri & Băuturi - Sommelier Basics',
    category: 'Specialization',
    description: 'Cunoașterea vinurilor, tehnici de servire și recomandări pentru clienți.',
    duration: 90,
    mandatory: false,
    icon: '🍷',
    order: 5,
    requiresCourse: 3, // Necesită Customer Service
    modules: [
      {
        id: 501,
        title: 'Tipuri de Vinuri',
        type: 'text',
        content: `
# Clasificarea Vinurilor

## După Culoare

### 🍷 Vinuri Roșii
- **Soiuri populare**: Cabernet Sauvignon, Merlot, Pinot Noir, Fetească Neagră
- **Se servesc la**: 16-18°C
- **Se potrivesc cu**: carne roșie, paste cu sos roșu, brânzeturi maturate

### 🥂 Vinuri Albe
- **Soiuri populare**: Chardonnay, Sauvignon Blanc, Fetească Albă, Riesling
- **Se servesc la**: 8-12°C
- **Se potrivesc cu**: pește, fructe de mare, pui, salate

### 🌸 Vinuri Rosé
- **Se servesc la**: 10-12°C
- **Se potrivesc cu**: aperitive, pizza, salate

## După Dulceață
- **Sec (Dry)** - fără zahăr rezidual
- **Demisec** - ușor dulce
- **Demidulce** - moderat dulce
- **Dulce** - desert wines
        `,
        duration: 15,
        order: 1
      },
      {
        id: 502,
        title: 'Tehnica Servirii Vinului',
        type: 'text',
        content: `
# Servirea Profesională a Vinului

## Pașii Servirii

### 1. Prezentarea
- Adu sticla la masă
- Arată eticheta clientului
- "Acesta este [numele vinului] pe care l-ați comandat?"

### 2. Desfacerea
- Tăiați folia sub buza sticlei
- Introduceți tirbusonul în centrul dopului
- Extrageți încet, fără zgomot

### 3. Degustarea
- Turnați ~30ml în paharul celui care a comandat
- Așteptați aprobarea
- "Este vinul conform așteptărilor?"

### 4. Servirea
- Serviți doamnele primele
- Apoi domnii
- La final, cel care a degustat
- Umpleți paharul la 1/3 (vin roșu) sau 1/2 (vin alb)

### 5. Păstrarea
- Vinul alb se pune în frapieră cu gheață
- Vinul roșu rămâne pe masă
        `,
        duration: 15,
        order: 2
      }
    ]
  },
  {
    id: 6,
    title: 'Prevenirea Pierderilor (Loss Prevention)',
    category: 'Security',
    description: 'Proceduri pentru prevenirea furturilor, pierderilor de inventar și fraudelor.',
    duration: 40,
    mandatory: true,
    icon: '🔒',
    order: 6,
    modules: [
      {
        id: 601,
        title: 'Tipuri de Pierderi',
        type: 'text',
        content: `
# Tipuri de Pierderi în Restaurant

## 1. Furt Intern (Angajați)
- Produse (mâncare, băuturi)
- Bani din casă
- "Sweet-hearting" (produse gratuite prietenilor)

## 2. Furt Extern (Clienți)
- Plecarea fără plată ("dine and dash")
- Sustragerea de obiecte (tacâmuri, decorațiuni)

## 3. Pierderi Operaționale
- Waste alimentar excesiv
- Porții mai mari decât standardul
- Produse expirate

## 4. Erori Administrative
- Comenzi neînregistrate
- Discount-uri neautorizate
- Erori de numărare

## 📊 Statistici
- ~3-4% din venituri se pierd prin furt și waste
- 75% din furturi sunt interne
- Majoritatea pierderilor sunt PREVENIBILE!
        `,
        duration: 10,
        order: 1
      },
      {
        id: 602,
        title: 'Proceduri de Prevenire',
        type: 'text',
        content: `
# Cum Prevenim Pierderile

## Reguli de Bază

### 1. Totul în POS
- **ORICE** iese din bucătărie/bar = înregistrat în POS
- Inclusiv mâncarea pentru personal
- Inclusiv "mostre" pentru clienți

### 2. Anulări și Discount-uri
- Doar cu aprobarea managerului
- Se notează motivul
- Se păstrează bonul anulat

### 3. Casa de Marcat
- Numără casa la început și sfârșit de tură
- Diferențele se raportează IMEDIAT
- NU împrumuta bani din casă

### 4. Verificare Comenzi
- Verifică nota cu mâncarea servită
- Asigură-te că totul e pe bon

## Semnale de Alarmă 🚩
- Coleg care refuză să lucreze cu alții
- Coleg care rămâne singur la casă
- Anulări frecvente
- Clienți "prieteni" care nu plătesc normal
- Porții vizibil mai mari

## Ce faci dacă observi ceva suspect?
→ Raportează CONFIDENȚIAL managerului
→ NU confrunța direct persoana
        `,
        duration: 15,
        order: 2
      },
      {
        id: 603,
        title: 'Quiz Loss Prevention',
        type: 'quiz',
        content: null,
        duration: 15,
        order: 3,
        quiz: {
          passingScore: 80,
          questions: [
            {
              id: 1,
              question: 'Ce procent din furturi sunt interne (angajați)?',
              options: ['25%', '50%', '75%', '90%'],
              correctIndex: 2,
              explanation: 'Aproximativ 75% din furturi sunt comise de angajați.'
            },
            {
              id: 2,
              question: 'Ce faci dacă observi un coleg că fură?',
              options: ['Îl confrunți direct', 'Raportezi confidențial managerului', 'Ignori', 'Postezi pe social media'],
              correctIndex: 1,
              explanation: 'Raportezi confidențial managerului, fără confruntare directă.'
            },
            {
              id: 3,
              question: 'Cine poate aproba o anulare sau discount?',
              options: ['Orice angajat', 'Doar managerul', 'Clientul', 'Bucătarul'],
              correctIndex: 1,
              explanation: 'Doar managerul poate aproba anulări și discount-uri.'
            }
          ]
        }
      }
    ]
  }
];

// Progress storage per employee
let employeeProgress = {};

// Certifications storage
let certifications = [];

// ===== ROUTES =====

// GET all courses
router.get('/courses', (req, res) => {
  // Return courses with progress if employee_id is provided
  const employeeId = req.query.employee_id;
  
  const coursesWithProgress = courses.map(course => {
    let progress = null;
    if (employeeId && employeeProgress[employeeId]) {
      progress = employeeProgress[employeeId][course.id] || null;
    }
    
    // Calculate total modules
    const totalModules = course.modules.length;
    const completedModules = progress?.completedModules?.length || 0;
    
    // Check if locked (requires another course)
    let isLocked = false;
    if (course.requiresCourse) {
      const requiredCourse = courses.find(c => c.id === course.requiresCourse);
      if (requiredCourse && employeeId) {
        const requiredProgress = employeeProgress[employeeId]?.[course.requiresCourse];
        isLocked = !requiredProgress?.completed;
      } else {
        isLocked = true;
      }
    }
    
    return {
      id: course.id,
      title: course.title,
      category: course.category,
      description: course.description,
      duration: course.duration,
      mandatory: course.mandatory,
      icon: course.icon,
      order: course.order,
      totalModules,
      completedModules,
      progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      status: progress?.completed ? 'completed' : 
              completedModules > 0 ? 'in_progress' : 
              isLocked ? 'locked' : 'not_started',
      isLocked,
      requiresCourse: course.requiresCourse
    };
  });
  
  res.json(coursesWithProgress);
});

// GET single course with modules
router.get('/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id);
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const employeeId = req.query.employee_id;
  let moduleProgress = {};
  
  if (employeeId && employeeProgress[employeeId]?.[courseId]) {
    const progress = employeeProgress[employeeId][courseId];
    progress.completedModules?.forEach(moduleId => {
      moduleProgress[moduleId] = true;
    });
  }
  
  const modulesWithProgress = course.modules.map(module => ({
    ...module,
    completed: !!moduleProgress[module.id],
    // Don't include quiz answers in response
    quiz: module.quiz ? {
      passingScore: module.quiz.passingScore,
      questionsCount: module.quiz.questions.length
    } : null
  }));
  
  res.json({
    ...course,
    modules: modulesWithProgress
  });
});

// GET module content (for reading/viewing)
router.get('/courses/:courseId/modules/:moduleId', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  // For quiz, return questions without correct answers
  if (module.type === 'quiz' && module.quiz) {
    const quizForStudent = {
      passingScore: module.quiz.passingScore,
      questions: module.quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
        // correctIndex NOT included!
      }))
    };
    
    return res.json({
      ...module,
      quiz: quizForStudent
    });
  }
  
  res.json(module);
});

// POST mark module as completed
router.post('/courses/:courseId/modules/:moduleId/complete', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const { employee_id } = req.body;
  
  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id is required' });
  }
  
  // Initialize progress structure
  if (!employeeProgress[employee_id]) {
    employeeProgress[employee_id] = {};
  }
  if (!employeeProgress[employee_id][courseId]) {
    employeeProgress[employee_id][courseId] = {
      completedModules: [],
      quizScores: {},
      completed: false,
      startedAt: new Date().toISOString()
    };
  }
  
  // Add module to completed if not already
  if (!employeeProgress[employee_id][courseId].completedModules.includes(moduleId)) {
    employeeProgress[employee_id][courseId].completedModules.push(moduleId);
  }
  
  // Check if all modules completed
  const course = courses.find(c => c.id === courseId);
  if (course) {
    const allModulesCompleted = course.modules.every(m => 
      employeeProgress[employee_id][courseId].completedModules.includes(m.id)
    );
    
    if (allModulesCompleted) {
      employeeProgress[employee_id][courseId].completed = true;
      employeeProgress[employee_id][courseId].completedAt = new Date().toISOString();
      
      // Auto-generate certification if mandatory course
      if (course.mandatory) {
        const existingCert = certifications.find(c => 
          c.employeeId === employee_id && c.courseId === courseId
        );
        
        if (!existingCert) {
          certifications.push({
            id: Date.now().toString(),
            employeeId: employee_id,
            courseId,
            courseTitle: course.title,
            courseIcon: course.icon,
            earnedAt: new Date().toISOString(),
            expiresAt: null // or set expiry for compliance certs
          });
        }
      }
    }
  }
  
  res.json({ 
    success: true, 
    progress: employeeProgress[employee_id][courseId]
  });
});

// POST submit quiz answers
router.post('/courses/:courseId/modules/:moduleId/quiz', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const { employee_id, answers } = req.body;
  
  if (!employee_id || !answers) {
    return res.status(400).json({ error: 'employee_id and answers are required' });
  }
  
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const module = course.modules.find(m => m.id === moduleId);
  if (!module || module.type !== 'quiz' || !module.quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Calculate score
  let correct = 0;
  const results = module.quiz.questions.map(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctIndex;
    if (isCorrect) correct++;
    
    return {
      questionId: q.id,
      userAnswer,
      correctAnswer: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    };
  });
  
  const score = Math.round((correct / module.quiz.questions.length) * 100);
  const passed = score >= module.quiz.passingScore;
  
  // Save quiz score
  if (!employeeProgress[employee_id]) {
    employeeProgress[employee_id] = {};
  }
  if (!employeeProgress[employee_id][courseId]) {
    employeeProgress[employee_id][courseId] = {
      completedModules: [],
      quizScores: {},
      completed: false,
      startedAt: new Date().toISOString()
    };
  }
  
  employeeProgress[employee_id][courseId].quizScores[moduleId] = {
    score,
    passed,
    attemptedAt: new Date().toISOString()
  };
  
  // If passed, mark module as completed
  if (passed) {
    if (!employeeProgress[employee_id][courseId].completedModules.includes(moduleId)) {
      employeeProgress[employee_id][courseId].completedModules.push(moduleId);
    }
    
    // Check if course completed
    const allModulesCompleted = course.modules.every(m => 
      employeeProgress[employee_id][courseId].completedModules.includes(m.id)
    );
    
    if (allModulesCompleted) {
      employeeProgress[employee_id][courseId].completed = true;
      employeeProgress[employee_id][courseId].completedAt = new Date().toISOString();
      
      // Auto-generate certification
      if (course.mandatory) {
        const existingCert = certifications.find(c => 
          c.employeeId === employee_id && c.courseId === courseId
        );
        
        if (!existingCert) {
          certifications.push({
            id: Date.now().toString(),
            employeeId: employee_id,
            courseId,
            courseTitle: course.title,
            courseIcon: course.icon,
            earnedAt: new Date().toISOString()
          });
        }
      }
    }
  }
  
  res.json({
    score,
    passed,
    passingScore: module.quiz.passingScore,
    correct,
    total: module.quiz.questions.length,
    results
  });
});

// GET employee progress
router.get('/progress/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  const progress = employeeProgress[employeeId] || {};
  
  // Calculate overall stats
  let totalCourses = courses.length;
  let completedCourses = 0;
  let mandatoryTotal = 0;
  let mandatoryCompleted = 0;
  
  courses.forEach(course => {
    if (progress[course.id]?.completed) {
      completedCourses++;
    }
    if (course.mandatory) {
      mandatoryTotal++;
      if (progress[course.id]?.completed) {
        mandatoryCompleted++;
      }
    }
  });
  
  const overallProgress = totalCourses > 0 
    ? Math.round((completedCourses / totalCourses) * 100) 
    : 0;
  
  res.json({
    employeeId,
    overallProgress,
    completedCourses,
    totalCourses,
    mandatoryCompleted,
    mandatoryTotal,
    courseProgress: progress
  });
});

// GET certifications for employee
router.get('/certifications/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  const employeeCerts = certifications.filter(c => c.employeeId === employeeId);
  res.json(employeeCerts);
});

// GET all certifications (for managers)
router.get('/certifications', (req, res) => {
  res.json(certifications);
});

// GET team progress (for managers)
router.get('/team-progress', async (req, res) => {
  try {
    // Get all employees from database or use mock
    // For now, return aggregated data
    const teamData = Object.entries(employeeProgress).map(([empId, progress]) => {
      let completed = 0;
      let total = courses.length;
      
      courses.forEach(course => {
        if (progress[course.id]?.completed) {
          completed++;
        }
      });
      
      const empCerts = certifications.filter(c => c.employeeId === empId);
      
      return {
        employeeId: empId,
        completedCourses: completed,
        totalCourses: total,
        progress: Math.round((completed / total) * 100),
        certifications: empCerts.length
      };
    });
    
    res.json(teamData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET flashcards from menu (for menu learning)
router.get('/flashcards', async (req, res) => {
  try {
    // This would normally fetch from the menu database
    // For now, return mock flashcards
    const flashcards = [
      {
        id: 1,
        front: { name: 'Burger Classic', image: null },
        back: { price: 35, allergens: ['gluten', 'lactate'], description: 'Carne de vită, cheddar, bacon' }
      },
      {
        id: 2,
        front: { name: 'Pizza Margherita', image: null },
        back: { price: 28, allergens: ['gluten', 'lactate'], description: 'Sos de roșii, mozzarella, busuioc' }
      },
      {
        id: 3,
        front: { name: 'Tiramisu', image: null },
        back: { price: 22, allergens: ['ouă', 'lactate', 'gluten'], description: 'Desert italian clasic cu cafea' }
      }
    ];
    
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

