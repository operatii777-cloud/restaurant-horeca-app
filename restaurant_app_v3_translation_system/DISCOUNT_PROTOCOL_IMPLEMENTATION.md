# Discount & Protocol Sales Implementation

## Functionalitati Implementate

### 1. Sistem de Discounturi

#### Backend
- **Tabele baza de date:**
  - `discount_definitions` - Definitii de discounturi (template-uri)
  - `order_discounts` - Discounturi aplicate pe comenzi
  - Campuri noi in `order_items`: discount_type, discount_value, discount_amount
  - Campuri noi in `orders`: discount_total, subtotal

- **Tipuri de discounturi:**
  - Percentage (procent)
  - Fixed amount (suma fixa)
  - Protocol (bazat pe contract)

- **Aplicare discounturi:**
  - Pe produs individual (order_item level)
  - Pe categorie de produse
  - Pe intreaga comanda (order level)

- **Validari:**
  - Valoare minima comanda
  - Suma maxima discount
  - Perioada de validitate
  - Necesita aprobare (optional)

#### API Endpoints
- `GET /api/discounts` - Lista discounturi
- `POST /api/discounts` - Creare discount
- `PUT /api/discounts/:id` - Actualizare discount
- `DELETE /api/discounts/:id` - Stergere discount
- `POST /api/discounts/apply-item` - Aplicare discount pe produs
- `POST /api/discounts/apply-order` - Aplicare discount pe comanda
- `GET /api/discounts/applicable` - Obtinere discounturi aplicabile

### 2. Vanzari pe Protocol (Company Contracts)

#### Backend
- **Tabele baza de date:**
  - `protocols` - Contracte cu firme/institutii
  - `protocol_invoices` - Facturi generate pentru protocoale
  - Camp nou in `orders`: protocol_id

- **Functionalitati:**
  - Gestionare contracte cu companii
  - Discount automat bazat pe contract
  - Termeni de plata (imediat, 15/30/60/90 zile)
  - Plafon de credit
  - Facturare periodica (zilnica, saptamanala, lunara)
  - Tracking datorie curenta

- **Cicluri de facturare:**
  - Daily, Weekly, Monthly
  - Generare automata facturi pentru perioada
  - Calcul TVA si discounturi
  - Tracking status plata

#### API Endpoints
- `GET /api/protocols` - Lista protocoale
- `POST /api/protocols` - Creare protocol
- `PUT /api/protocols/:id` - Actualizare protocol
- `DELETE /api/protocols/:id` - Stergere protocol
- `POST /api/protocols/:id/apply-to-order` - Aplicare protocol pe comanda
- `POST /api/protocols/:id/generate-invoice` - Generare factura
- `GET /api/protocols/:id/invoices` - Lista facturi protocol

### 3. Grupare Produse dupa Ordinea de Servire

#### Backend
- **Tabele baza de date:**
  - `serving_order_groups` - Grupuri de servire
  - Camp nou in `order_items`: serving_order_group_id

- **Grupuri predefinite:**
  1. Aperitive (🥗)
  2. Felul Principal (🍝)
  3. Garnituri (🥔)
  4. Desert (🍰)
  5. Bauturi (🥤)

- **Functionalitati:**
  - Asignare produse la grupuri
  - Afisare pe bon grupate
  - Culori si iconite personalizate
  - Ordinea de servire configurabila

#### API Endpoints
- `GET /api/serving-order/groups` - Lista grupuri
- `POST /api/serving-order/groups` - Creare grup
- `PUT /api/serving-order/groups/:id` - Actualizare grup
- `DELETE /api/serving-order/groups/:id` - Stergere grup
- `POST /api/serving-order/assign-item` - Asignare grup la produs
- `GET /api/serving-order/order/:orderId/grouped` - Produse grupate

## Structura Fisiere

```
server/
├── database-discount-protocol.js         # Schema baza de date
├── src/modules/
│   ├── discounts/
│   │   ├── services/
│   │   │   └── discount.service.js      # Business logic discounturi
│   │   ├── controllers/
│   │   │   └── discount.controller.js   # REST API controllers
│   │   └── routes.js                     # Route definitions
│   ├── protocols/
│   │   ├── services/
│   │   │   └── protocol.service.js      # Business logic protocoale
│   │   ├── controllers/
│   │   │   └── protocol.controller.js   # REST API controllers
│   │   └── routes.js                     # Route definitions
│   └── serving-order/
│       ├── services/
│       │   └── serving-order.service.js # Business logic serving order
│       ├── controllers/
│       │   └── serving-order.controller.js # REST API controllers
│       └── routes.js                     # Route definitions
```

## Integrare

Routes montate in `server.js`:
```javascript
app.use('/api/discounts', discountsRoutes);
app.use('/api/protocols', protocolsRoutes);
app.use('/api/serving-order', servingOrderRoutes);
```

## Exemple de Utilizare

### Creare Discount
```javascript
POST /api/discounts
{
  "name": "Discount 10% Aperitive",
  "type": "percentage",
  "value": 10,
  "applies_to": "category",
  "target_id": 1,
  "active": true
}
```

### Creare Protocol
```javascript
POST /api/protocols
{
  "protocol_number": "PROT-2026-001",
  "company_name": "SC EXEMPLU SRL",
  "company_cui": "RO12345678",
  "discount_type": "percentage",
  "discount_value": 15,
  "payment_terms": "30_days",
  "credit_limit": 10000
}
```

### Aplicare Discount pe Comanda
```javascript
POST /api/discounts/apply-order
{
  "orderId": 123,
  "discountId": 5,
  "userId": 1
}
```

### Grupare Produse pe Bon
```javascript
GET /api/serving-order/order/123/grouped

Response:
{
  "success": true,
  "data": [
    {
      "group_name": "Aperitive",
      "group_sequence": 1,
      "items": [...]
    },
    {
      "group_name": "Felul Principal",
      "group_sequence": 2,
      "items": [...]
    }
  ]
}
```

## Urmatoare Pasi (Frontend)

1. **Pagina Management Discounturi**
   - Lista discounturi active/inactive
   - Formular creare/editare discount
   - Filtare dupa tip si aplicabilitate

2. **Pagina Management Protocoale**
   - Lista contracte active
   - Formular creare/editare contract
   - Vizualizare facturi generate
   - Tracking debite

3. **Integrare in POS**
   - Buton "Aplicare Discount" in cos
   - Selectie discount disponibil
   - Selectie protocol pentru comenzi corporate
   - Afisare discount aplicat pe bon

4. **Receipt Printing**
   - Grupare produse dupa serving order
   - Afisare discount per produs si total
   - Afisare informatii protocol (daca aplicabil)
