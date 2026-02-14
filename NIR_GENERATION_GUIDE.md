# NIR Generation Guide - Standard & Extended Versions

## Table of Contents
1. [Introduction](#introduction)
2. [NIR Overview](#nir-overview)
3. [Standard NIR Generation](#standard-nir-generation)
4. [Extended NIR Generation](#extended-nir-generation)
5. [NIR Workflow](#nir-workflow)
6. [API Reference](#api-reference)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

**NIR** (Notă de Intrare Recepție) is a Romanian legal document used to record the reception of goods from suppliers. This guide covers both standard and extended NIR generation in the Restaurant HORECA Application.

**Date:** February 14, 2026  
**Application Version:** v3  
**Module:** Tipizate Enterprise  

---

## NIR Overview

### Purpose
- Document goods received from suppliers
- Update inventory/stock levels
- Track costs and VAT
- Maintain audit trail
- Comply with Romanian accounting regulations

### Legal Requirements (Romania)
- Must contain supplier information
- Must list all items received
- Must show prices and VAT calculations
- Must be dated and numbered
- Should be signed by authorized personnel
- Must be kept for minimum 10 years

### Document States

```
DRAFT → VALIDATED → SIGNED → LOCKED → ARCHIVED
  ↓         ↓          ↓        ↓         ↓
 Edit    Review     Legal    Stock    History
 Mode              Proof    Update    Only
```

---

## Standard NIR Generation

### 1. Access NIR Module

**Path:** Admin → Tipizate Enterprise → NIR

**URL:** `/admin-vite/tipizate/nir`

### 2. Create New NIR

#### Method 1: UI (React Interface)

```typescript
// Navigate to NIR List Page
// Click "New NIR" button
// NIR Editor Page opens with empty form
```

#### Method 2: API (Direct)

```javascript
POST /api/tipizate/nir

Request Body:
{
  "number": "NIR-2026-001",  // Optional, auto-generated if omitted
  "date": "2026-02-14",
  "supplierName": "SC Alimentara SA",
  "supplierCUI": "RO12345678",
  "supplierAddress": "Str. Principală nr. 1, București",
  "warehouseId": 1,
  "referenceDocument": "Invoice INV-2026-123",
  "notes": "Delivery in good condition",
  "items": [
    {
      "ingredientId": 42,
      "name": "Roșii cherry",
      "code": "VEG-001",
      "unit": "kg",
      "quantityReceived": 25.5,
      "pricePerUnit": 12.50,
      "vatRate": 9,
      "discount": 0
    },
    {
      "ingredientId": 73,
      "name": "Mozarella",
      "code": "DAIRY-015",
      "unit": "kg",
      "quantityReceived": 10,
      "pricePerUnit": 35.00,
      "vatRate": 9,
      "discount": 5  // 5% discount
    }
  ]
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": 156,
    "number": "NIR-2026-001",
    "date": "2026-02-14",
    "status": "DRAFT",
    "supplierName": "SC Alimentara SA",
    "totalExVAT": 668.88,
    "totalVAT": 60.20,
    "totalInclVAT": 729.08,
    "createdAt": "2026-02-14T10:30:00.000Z",
    "createdBy": "admin",
    "items": [...]
  }
}
```

### 3. Standard NIR Fields

#### Header Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `number` | String | No* | NIR number (auto-generated if empty) |
| `date` | Date | Yes | Reception date (ISO 8601: YYYY-MM-DD) |
| `supplierName` | String | Yes | Supplier name |
| `supplierCUI` | String | No | Supplier tax code (CUI) |
| `supplierAddress` | String | No | Supplier address |
| `warehouseId` | Integer | Yes | Warehouse/location ID |
| `referenceDocument` | String | No | Invoice/delivery note reference |
| `notes` | Text | No | Additional notes |

*Auto-generated format: `NIR-YYYY-NNNN` (e.g., NIR-2026-0001)

#### Line Items Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ingredientId` | Integer | Yes* | Ingredient/product ID |
| `name` | String | Yes | Product name |
| `code` | String | No | Product code |
| `unit` | String | Yes | Unit of measure (kg, L, buc, etc.) |
| `quantityReceived` | Decimal | Yes | Quantity received |
| `pricePerUnit` | Decimal | Yes | Price per unit (excluding VAT) |
| `vatRate` | Integer | Yes | VAT rate (0, 5, 9, 19) |
| `discount` | Decimal | No | Discount percentage (0-100) |

*Required for stock update

#### Calculated Fields (Automatic)

```javascript
// Per Line Item
lineTotal = quantityReceived × pricePerUnit × (1 - discount/100)
lineVAT = lineTotal × (vatRate/100)
lineTotalInclVAT = lineTotal + lineVAT

// Document Totals
totalExVAT = Σ(lineTotal)
totalVAT = Σ(lineVAT)
totalInclVAT = Σ(lineTotalInclVAT)

// VAT Breakdown by Rate
vatBreakdown = {
  "19%": { base: 0, vat: 0, total: 0 },
  "9%": { base: 668.88, vat: 60.20, total: 729.08 },
  "5%": { base: 0, vat: 0, total: 0 },
  "0%": { base: 0, vat: 0, total: 0 }
}
```

### 4. Save NIR

```javascript
// Status: DRAFT
PUT /api/tipizate/nir/:id

Response:
{
  "success": true,
  "message": "NIR saved successfully",
  "data": { ... }
}
```

### 5. Generate PDF (Standard)

```javascript
GET /api/tipizate/nir/:id/pdf

Response:
Content-Type: application/pdf
Content-Disposition: attachment; filename="NIR-2026-001.pdf"

[PDF Binary Data]
```

**PDF Contents (Standard):**
- Company header (logo, name, address)
- NIR number and date
- Supplier information
- Items table (name, code, unit, qty, price, VAT, total)
- Totals section
- VAT breakdown
- Signatures section (receptor, verificator)

---

## Extended NIR Generation

### Overview

Extended NIR includes **additional fields** for enhanced tracking, quality control, compliance, and integration with other systems.

### 1. Extended Fields

#### Header Extensions

```javascript
{
  // ... standard fields ...
  
  // Extended fields
  "transportNumber": "TRANS-2026-456",
  "vehiclePlate": "B-123-ABC",
  "driverName": "Ion Popescu",
  "driverPhone": "+40722123456",
  "departureTime": "2026-02-14T08:00:00Z",
  "arrivalTime": "2026-02-14T10:30:00Z",
  "temperatureAtArrival": 4.5,  // Celsius
  "weatherConditions": "Sunny, 12°C",
  "customsDocument": "VAMA-2026-789",
  "insurancePolicy": "POL-2026-INS-123",
  "incoterms": "DAP",
  "paymentTerms": "Net 30",
  "currency": "RON",
  "exchangeRate": 1.0,
  "inspectorId": 5,
  "inspectorName": "Maria Ionescu",
  "qualityStatus": "APPROVED",
  "qualityNotes": "All items in good condition",
  "packagingCondition": "INTACT",
  "sealNumber": "SEAL-98765",
  "sealCondition": "INTACT",
  "sustainabilityCertificates": ["ISO14001", "FSC"],
  "organicCertificate": "BIO-RO-2025-123",
  "tags": ["urgent", "perishable", "premium"]
}
```

#### Line Item Extensions

```javascript
{
  // ... standard line fields ...
  
  // Extended line fields
  "lotNumber": "LOT-2026-0214-001",
  "batchNumber": "BATCH-ABC123",
  "productionDate": "2026-02-12",
  "expiryDate": "2026-03-14",
  "bestBeforeDate": "2026-03-10",
  "serialNumbers": ["SN001", "SN002", "SN003"],
  "barcode": "5901234123457",
  "supplierItemCode": "SUP-VEG-001",
  "manufacturerName": "Ferma Verde SRL",
  "manufacturerCountry": "Romania",
  "originCountry": "Romania",
  "certifications": ["GlobalGAP", "BIO"],
  "allergens": ["none"],
  "packagingType": "Plastic crate",
  "packagingWeight": 0.5,  // kg
  "netWeight": 25.0,  // kg
  "grossWeight": 25.5,  // kg
  "numberOfPackages": 5,
  "temperatureAtReception": 4.2,  // Celsius
  "qualityGrade": "A",
  "qualityScore": 95,  // 0-100
  "damagePercentage": 0,
  "rejectedQuantity": 0,
  "acceptedQuantity": 25.5,
  "samplesT": false,
  "sampleId": null,
  "labTestRequired": false,
  "quarantineRequired": false,
  "storagLocation": "Cold Room 1 - Shelf A3",
  "handlingInstructions": "Keep refrigerated at 2-6°C",
  "hazardClassification": "none",
  "customsValue": 318.75,
  "countryOfOrigin": "RO",
  "hsCode": "0702.00.00",  // Harmonized System Code
  "nutritionalInfo": {
    "calories": 18,
    "protein": 0.9,
    "carbs": 3.9,
    "fat": 0.2
  },
  "sustainabilityMetrics": {
    "carbonFootprint": 0.15,  // kg CO2e per kg
    "waterUsage": 13,  // L per kg
    "locallySourced": true
  }
}
```

### 2. Extended NIR API

```javascript
POST /api/tipizate/nir/extended

Request Body:
{
  // All standard fields
  "number": "NIR-EXT-2026-001",
  "date": "2026-02-14",
  "supplierName": "SC Alimentara Premium SA",
  "supplierCUI": "RO12345678",
  
  // Extended header
  "transportNumber": "TRANS-2026-456",
  "vehiclePlate": "B-123-ABC",
  "driverName": "Ion Popescu",
  "arrivalTime": "2026-02-14T10:30:00Z",
  "temperatureAtArrival": 4.5,
  "inspectorId": 5,
  "qualityStatus": "APPROVED",
  
  // Items with extended data
  "items": [
    {
      "ingredientId": 42,
      "name": "Roșii cherry BIO",
      "code": "VEG-001-BIO",
      "unit": "kg",
      "quantityReceived": 25.5,
      "pricePerUnit": 15.00,
      "vatRate": 9,
      
      // Extended item data
      "lotNumber": "LOT-2026-0214-001",
      "productionDate": "2026-02-12",
      "expiryDate": "2026-03-14",
      "barcode": "5901234123457",
      "originCountry": "Romania",
      "certifications": ["GlobalGAP", "BIO-RO"],
      "organicCertificate": "BIO-RO-2025-123",
      "packagingType": "Recyclable plastic crate",
      "netWeight": 25.0,
      "grossWeight": 25.5,
      "numberOfPackages": 5,
      "temperatureAtReception": 4.2,
      "qualityGrade": "A",
      "qualityScore": 95,
      "storageLocation": "Cold Room 1 - Shelf A3",
      "sustainabilityMetrics": {
        "carbonFootprint": 0.12,
        "waterUsage": 10,
        "locallySourced": true,
        "recyclablePackaging": true
      }
    }
  ],
  
  // Extended metadata
  "metadata": {
    "version": "2.0",
    "schemaVersion": "extended-1.0",
    "dataSource": "mobile-app",
    "gpsLocation": {
      "latitude": 44.4268,
      "longitude": 26.1025,
      "accuracy": 10
    },
    "photos": [
      "/uploads/nir-photos/NIR-2026-001-delivery.jpg",
      "/uploads/nir-photos/NIR-2026-001-items.jpg"
    ],
    "signatures": {
      "driver": "/uploads/signatures/driver-123.png",
      "receptor": "/uploads/signatures/receptor-456.png"
    }
  }
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": 157,
    "number": "NIR-EXT-2026-001",
    "status": "DRAFT",
    "type": "EXTENDED",
    "version": "2.0",
    // ... all NIR data ...
  }
}
```

### 3. Extended PDF Features

```javascript
GET /api/tipizate/nir/:id/pdf?extended=true

// Or specify template
GET /api/tipizate/nir/:id/pdf?template=extended-premium
```

**Extended PDF includes:**

1. **Enhanced Header**
   - Transport information
   - Driver details
   - Temperature logs
   - Weather conditions
   - Inspector information

2. **Detailed Items Table**
   - Lot/batch numbers
   - Expiry dates
   - Quality grades
   - Temperature readings
   - Certifications
   - Origin information

3. **Quality Control Section**
   - Inspection checklist
   - Quality scores
   - Damage reports
   - Acceptance/rejection notes
   - Photos (if available)

4. **Sustainability Report**
   - Carbon footprint
   - Water usage
   - Local sourcing percentage
   - Certification summary

5. **Traceability Information**
   - Complete supply chain
   - Manufacturer details
   - Country of origin
   - HS codes
   - Customs information

6. **Digital Signatures**
   - Driver signature (image)
   - Receptor signature (image)
   - Inspector signature (image)
   - Digital certificates
   - Timestamp

7. **Barcodes/QR Codes**
   - NIR QR code (for mobile verification)
   - Item barcodes
   - Lot number barcodes

### 4. Extended Export Formats

#### XML/UBL Export

```javascript
GET /api/tipizate/nir/:id/ubl

Response: UBL 2.1 compliant XML
<?xml version="1.0" encoding="UTF-8"?>
<ReceiptAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:ReceiptAdvice-2">
  <ID>NIR-EXT-2026-001</ID>
  <IssueDate>2026-02-14</IssueDate>
  <ReceiptAdviceType>GOODS_RECEIPT</ReceiptAdviceType>
  <!-- ... UBL structure ... -->
</ReceiptAdvice>
```

#### JSON Export (Full)

```javascript
GET /api/tipizate/nir/:id/json?extended=true

Response: Complete JSON with all extended fields
```

#### CSV Export (Extended)

```javascript
GET /api/tipizate/nir/:id/csv?extended=true

Response: CSV with additional columns for extended fields
```

#### Excel Export

```javascript
GET /api/tipizate/nir/:id/excel

Response: Excel file with multiple sheets:
- Sheet 1: Header information
- Sheet 2: Line items
- Sheet 3: Quality control data
- Sheet 4: Sustainability metrics
- Sheet 5: Traceability info
```

### 5. Integration Features

#### Stock Update (Extended)

When NIR is **locked**, the extended version also:

```javascript
// Standard stock update
+ Create stock moves
+ Update quantities
+ Update costs

// Extended stock update
+ Create lot records with expiry dates
+ Set up expiry alerts
+ Update traceability database
+ Create quality control records
+ Update sustainability metrics
+ Generate compliance reports
+ Trigger automated reorder (if needed)
+ Update allergen database
+ Create nutritional data records
```

#### ANAF Integration

```javascript
POST /api/tipizate/nir/:id/anaf/submit

// Submits NIR to ANAF (Romanian tax authority)
// Returns e-Transport receipt
```

#### SAF-T Export

```javascript
GET /api/tipizate/nir/:id/saft

// Generates SAF-T XML for tax reporting
```

#### Accounting Integration

```javascript
POST /api/tipizate/nir/:id/accounting/post

// Creates accounting entries:
// DR: Inventory (Stock)
// DR: VAT Deductible
// CR: Accounts Payable (Supplier)
```

---

## NIR Workflow

### Complete Workflow Diagram

```
┌─────────────┐
│   CREATE    │ User creates new NIR
│    DRAFT    │ Status: DRAFT
└──────┬──────┘
       │
       │ Add items, fill data
       ↓
┌─────────────┐
│    SAVE     │ Save progress
│    DRAFT    │ Status: DRAFT (editable)
└──────┬──────┘
       │
       │ Review complete
       ↓
┌─────────────┐
│  VALIDATE   │ Validate data
│             │ Status: VALIDATED
└──────┬──────┘
       │
       │ Authorization
       ↓
┌─────────────┐
│    SIGN     │ Digital signature
│             │ Status: SIGNED
└──────┬──────┘
       │
       │ Final confirmation
       ↓
┌─────────────┐
│    LOCK     │ Lock document
│             │ Status: LOCKED
│             │ → Update stock
│             │ → Create accounting entries
│             │ → Generate reports
└──────┬──────┘
       │
       │ Time passes
       ↓
┌─────────────┐
│   ARCHIVE   │ Archive old documents
│             │ Status: ARCHIVED
└─────────────┘
```

### Workflow API Calls

```javascript
// 1. Create
POST /api/tipizate/nir
→ Status: DRAFT

// 2. Update (multiple times)
PUT /api/tipizate/nir/:id
→ Status: DRAFT

// 3. Validate
POST /api/tipizate/nir/:id/validate
→ Status: VALIDATED

// 4. Sign
POST /api/tipizate/nir/:id/sign
Body: { "pin": "1234", "signature": "base64..." }
→ Status: SIGNED

// 5. Lock
POST /api/tipizate/nir/:id/lock
Body: { "confirmStockUpdate": true }
→ Status: LOCKED
→ Triggers: Stock update, accounting, notifications

// 6. Archive (automatic after 1 year)
POST /api/tipizate/nir/:id/archive
→ Status: ARCHIVED
```

### State Permissions

| Action | DRAFT | VALIDATED | SIGNED | LOCKED | ARCHIVED |
|--------|-------|-----------|--------|--------|----------|
| Edit | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| Delete | ✅ Yes | ⚠️ Admin | ❌ No | ❌ No | ❌ No |
| Validate | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Sign | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Lock | ❌ No | ❌ No | ✅ Yes | ❌ No | ❌ No |
| View | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| PDF | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Export | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## API Reference

### Base URL

```
http://localhost:3001/api/tipizate
```

### Endpoints

#### List NIR Documents

```http
GET /api/tipizate/nir

Query Parameters:
  - status: DRAFT|VALIDATED|SIGNED|LOCKED|ARCHIVED
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - supplierId: integer
  - page: integer (default: 1)
  - perPage: integer (default: 30, max: 100)

Response:
{
  "success": true,
  "data": {
    "items": [ ...NIR documents... ],
    "total": 156,
    "page": 1,
    "perPage": 30,
    "totalPages": 6
  }
}
```

#### Get Single NIR

```http
GET /api/tipizate/nir/:id

Response:
{
  "success": true,
  "data": { ...NIR document with all fields... }
}
```

#### Create NIR

```http
POST /api/tipizate/nir
Content-Type: application/json

Body: { ...NIR data... }

Response: 201 Created
{
  "success": true,
  "data": { ...created NIR... }
}
```

#### Update NIR

```http
PUT /api/tipizate/nir/:id
Content-Type: application/json

Body: { ...updated fields... }

Requires: status === 'DRAFT'

Response: 200 OK
{
  "success": true,
  "data": { ...updated NIR... }
}
```

#### Delete NIR

```http
DELETE /api/tipizate/nir/:id

Requires: status === 'DRAFT' OR (status === 'VALIDATED' AND admin)

Response: 200 OK
{
  "success": true,
  "message": "NIR deleted successfully"
}
```

#### Sign NIR

```http
POST /api/tipizate/nir/:id/sign
Content-Type: application/json

Body:
{
  "pin": "1234",
  "signature": "data:image/png;base64,..."
}

Response: 200 OK
{
  "success": true,
  "data": { ...signed NIR... }
}
```

#### Lock NIR

```http
POST /api/tipizate/nir/:id/lock
Content-Type: application/json

Body:
{
  "confirmStockUpdate": true
}

Response: 200 OK
{
  "success": true,
  "data": { ...locked NIR... },
  "stockUpdates": [
    {
      "ingredientId": 42,
      "oldQuantity": 100,
      "newQuantity": 125.5,
      "change": +25.5
    }
  ]
}
```

#### Generate PDF

```http
GET /api/tipizate/nir/:id/pdf?extended=false

Query Parameters:
  - extended: boolean (default: false)
  - template: standard|extended-premium|minimal
  - download: boolean (default: true)

Response: PDF file (application/pdf)
```

#### Export JSON

```http
GET /api/tipizate/nir/:id/json?extended=false

Response: JSON file (application/json)
```

#### Export CSV

```http
GET /api/tipizate/nir/:id/csv?extended=false

Response: CSV file (text/csv)
```

#### Generate UBL

```http
GET /api/tipizate/nir/:id/ubl

Response: UBL XML file (application/xml)
```

---

## Code Examples

### Example 1: Create Standard NIR (JavaScript)

```javascript
const axios = require('axios');

async function createStandardNIR() {
  try {
    const response = await axios.post('http://localhost:3001/api/tipizate/nir', {
      date: new Date().toISOString().split('T')[0],
      supplierName: 'SC Metro Cash & Carry',
      supplierCUI: 'RO13265221',
      warehouseId: 1,
      referenceDocument: 'INV-2026-00123',
      items: [
        {
          ingredientId: 15,
          name: 'Cartofi',
          code: 'VEG-015',
          unit: 'kg',
          quantityReceived: 50,
          pricePerUnit: 3.50,
          vatRate: 9
        },
        {
          ingredientId: 28,
          name: 'Lapte 3.5%',
          code: 'DAIRY-003',
          unit: 'L',
          quantityReceived: 20,
          pricePerUnit: 5.20,
          vatRate: 9
        }
      ]
    });
    
    console.log('NIR created:', response.data.data.number);
    console.log('ID:', response.data.data.id);
    console.log('Total:', response.data.data.totalInclVAT, 'RON');
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating NIR:', error.response?.data || error.message);
  }
}

createStandardNIR();
```

### Example 2: Create Extended NIR (TypeScript)

```typescript
import axios from 'axios';

interface ExtendedNIRData {
  date: string;
  supplierName: string;
  supplierCUI: string;
  transportNumber?: string;
  temperatureAtArrival?: number;
  inspectorId?: number;
  items: ExtendedNIRItem[];
}

interface ExtendedNIRItem {
  ingredientId: number;
  name: string;
  code: string;
  unit: string;
  quantityReceived: number;
  pricePerUnit: number;
  vatRate: number;
  lotNumber?: string;
  expiryDate?: string;
  certifications?: string[];
}

async function createExtendedNIR(): Promise<void> {
  const nirData: ExtendedNIRData = {
    date: '2026-02-14',
    supplierName: 'BIO Farm Premium SRL',
    supplierCUI: 'RO99887766',
    transportNumber: 'TRANS-2026-789',
    temperatureAtArrival: 4.2,
    inspectorId: 3,
    items: [
      {
        ingredientId: 42,
        name: 'Roșii cherry BIO',
        code: 'BIO-VEG-001',
        unit: 'kg',
        quantityReceived: 30,
        pricePerUnit: 18.00,
        vatRate: 9,
        lotNumber: 'LOT-2026-0214-BIO',
        expiryDate: '2026-03-14',
        certifications: ['BIO-RO', 'GlobalGAP']
      }
    ]
  };
  
  try {
    const response = await axios.post(
      'http://localhost:3001/api/tipizate/nir/extended',
      nirData
    );
    
    console.log('Extended NIR created:', response.data.data.number);
    
    // Generate extended PDF
    const pdfUrl = `http://localhost:3001/api/tipizate/nir/${response.data.data.id}/pdf?extended=true`;
    console.log('PDF URL:', pdfUrl);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
    } else {
      console.error('Error:', error);
    }
  }
}

createExtendedNIR();
```

### Example 3: Complete NIR Workflow

```javascript
const axios = require('axios');

class NIRWorkflow {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.nirId = null;
  }
  
  async create(nirData) {
    console.log('Step 1: Creating NIR...');
    const response = await axios.post(`${this.baseURL}/api/tipizate/nir`, nirData);
    this.nirId = response.data.data.id;
    console.log(`✓ NIR created: ${response.data.data.number} (ID: ${this.nirId})`);
    return response.data.data;
  }
  
  async update(updates) {
    console.log('Step 2: Updating NIR...');
    const response = await axios.put(`${this.baseURL}/api/tipizate/nir/${this.nirId}`, updates);
    console.log('✓ NIR updated');
    return response.data.data;
  }
  
  async validate() {
    console.log('Step 3: Validating NIR...');
    const response = await axios.post(`${this.baseURL}/api/tipizate/nir/${this.nirId}/validate`);
    console.log('✓ NIR validated');
    return response.data.data;
  }
  
  async sign(pin, signature) {
    console.log('Step 4: Signing NIR...');
    const response = await axios.post(`${this.baseURL}/api/tipizate/nir/${this.nirId}/sign`, {
      pin,
      signature
    });
    console.log('✓ NIR signed');
    return response.data.data;
  }
  
  async lock() {
    console.log('Step 5: Locking NIR and updating stock...');
    const response = await axios.post(`${this.baseURL}/api/tipizate/nir/${this.nirId}/lock`, {
      confirmStockUpdate: true
    });
    console.log('✓ NIR locked');
    console.log('✓ Stock updated:', response.data.stockUpdates);
    return response.data.data;
  }
  
  async generatePDF(extended = false) {
    console.log('Step 6: Generating PDF...');
    const response = await axios.get(
      `${this.baseURL}/api/tipizate/nir/${this.nirId}/pdf`,
      {
        params: { extended },
        responseType: 'blob'
      }
    );
    console.log('✓ PDF generated');
    return response.data;
  }
  
  async run(nirData, pin = '1234', signature = null) {
    try {
      await this.create(nirData);
      await this.validate();
      await this.sign(pin, signature);
      await this.lock();
      const pdf = await this.generatePDF(true);
      
      console.log('\n✅ NIR workflow completed successfully!');
      console.log(`   NIR ID: ${this.nirId}`);
      
      return this.nirId;
    } catch (error) {
      console.error('\n❌ Workflow failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage
const workflow = new NIRWorkflow('http://localhost:3001');

const nirData = {
  date: '2026-02-14',
  supplierName: 'Test Supplier',
  items: [
    {
      ingredientId: 1,
      name: 'Test Item',
      code: 'TEST-001',
      unit: 'kg',
      quantityReceived: 10,
      pricePerUnit: 5.00,
      vatRate: 19
    }
  ]
};

workflow.run(nirData);
```

---

## Best Practices

### 1. Data Entry

✅ **DO:**
- Use autocomplete for ingredient selection
- Verify supplier information before creating NIR
- Double-check quantities and prices
- Add lot numbers for perishable items
- Include expiry dates for food items
- Take photos of delivery (extended NIR)

❌ **DON'T:**
- Skip validation step
- Lock NIR without review
- Modify quantities without supplier agreement
- Forget to record temperature for cold items

### 2. Quality Control

✅ **DO:**
- Inspect all items upon arrival
- Record any damages or discrepancies
- Reject items that don't meet quality standards
- Document quality scores
- Keep temperature logs

❌ **DON'T:**
- Accept damaged goods without documentation
- Skip quality inspection
- Lock NIR with unresolved issues

### 3. Stock Management

✅ **DO:**
- Lock NIR immediately after verification
- Verify stock quantities after lock
- Use proper storage locations
- Track expiry dates
- Monitor stock levels

❌ **DON'T:**
- Leave NIR in DRAFT status too long
- Lock NIR with incorrect quantities
- Ignore expiry date warnings

### 4. Compliance

✅ **DO:**
- Keep all NIR documents for 10+ years
- Generate PDF for record keeping
- Submit to ANAF when required
- Maintain audit trail
- Use digital signatures

❌ **DON'T:**
- Delete NIR documents
- Modify locked documents
- Skip signature step
- Ignore regulatory requirements

---

## Troubleshooting

### Common Issues

#### Issue 1: NIR Creation Fails

**Symptom:** 500 error when creating NIR

**Possible Causes:**
1. Invalid ingredient ID
2. Missing required fields
3. Invalid VAT rate

**Solutions:**
```javascript
// Validate ingredient exists
const ingredient = await getIngredient(ingredientId);
if (!ingredient) {
  throw new Error('Ingredient not found');
}

// Validate VAT rate
const validVATRates = [0, 5, 9, 19];
if (!validVATRates.includes(vatRate)) {
  throw new Error('Invalid VAT rate');
}

// Check required fields
const required = ['date', 'supplierName', 'items'];
for (const field of required) {
  if (!nirData[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}
```

#### Issue 2: Stock Not Updating After Lock

**Symptom:** NIR is locked but stock quantity unchanged

**Possible Causes:**
1. ingredientId not linked to stock item
2. Warehouse mismatch
3. Transaction rolled back

**Solutions:**
```javascript
// Verify ingredient-stock linkage
const stockItem = await db.get(
  'SELECT * FROM stock_items WHERE ingredient_id = ?',
  [ingredientId]
);

if (!stockItem) {
  console.warn('Ingredient not in stock, creating new stock item');
  await db.run(
    'INSERT INTO stock_items (ingredient_id, quantity, warehouse_id) VALUES (?, ?, ?)',
    [ingredientId, quantityReceived, warehouseId]
  );
}

// Check transaction
await db.run('BEGIN TRANSACTION');
try {
  // ... stock update ...
  await db.run('COMMIT');
} catch (error) {
  await db.run('ROLLBACK');
  throw error;
}
```

#### Issue 3: PDF Generation Fails

**Symptom:** PDF is blank or errors

**Possible Causes:**
1. Missing template
2. Invalid data
3. Puppeteer not installed

**Solutions:**
```bash
# Install Puppeteer
npm install puppeteer

# Or use puppeteer-core with system Chrome
npm install puppeteer-core
```

```javascript
// Validate PDF data
if (!nir.items || nir.items.length === 0) {
  throw new Error('Cannot generate PDF: NIR has no items');
}

// Check template exists
const templatePath = path.join(__dirname, 'templates', 'nir.template.ts');
if (!fs.existsSync(templatePath)) {
  throw new Error('PDF template not found');
}
```

#### Issue 4: Cannot Sign NIR

**Symptom:** Sign button disabled or fails

**Possible Causes:**
1. NIR not validated
2. Invalid PIN
3. Missing signature

**Solutions:**
```javascript
// Check status
if (nir.status !== 'VALIDATED') {
  throw new Error('NIR must be validated before signing');
}

// Verify PIN
const user = await getUserByPin(pin);
if (!user || !user.canSignDocuments) {
  throw new Error('Invalid PIN or insufficient permissions');
}

// Validate signature
if (!signature || !signature.startsWith('data:image/')) {
  throw new Error('Invalid signature format');
}
```

---

## Appendix: Field Reference

### VAT Rates (Romania)

| Rate | Applies To | Examples |
|------|-----------|----------|
| 19% | Standard rate | Most products, services |
| 9% | Reduced rate | Food, beverages, restaurants |
| 5% | Super-reduced | Books, newspapers, medicines |
| 0% | Zero-rated | Exports, specific services |

### Units of Measure

| Code | Name (Romanian) | Name (English) |
|------|-----------------|----------------|
| kg | Kilogram | Kilogram |
| g | Gram | Gram |
| L | Litru | Liter |
| ml | Mililitru | Milliliter |
| buc | Bucată | Piece |
| pach | Pachet | Package |
| cut | Cutie | Box |
| dz | Duzină | Dozen |

### Quality Grades

| Grade | Score | Description |
|-------|-------|-------------|
| A+ | 95-100 | Premium quality |
| A | 85-94 | Excellent quality |
| B | 75-84 | Good quality |
| C | 65-74 | Acceptable quality |
| D | 50-64 | Below standard |
| F | 0-49 | Rejected |

---

**Document Version:** 1.0  
**Last Updated:** February 14, 2026  
**Author:** GitHub Copilot Coding Agent
