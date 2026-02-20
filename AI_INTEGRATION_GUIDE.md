# HORECA AI Engine - Integration Guide

## Overview

The HORECA AI Engine integrates advanced AI capabilities into the restaurant management system, providing:

- **Menu ingestion**: Extract products from text/CSV files
- **Allergen detection**: Auto-detect EU 14 mandatory allergens from ingredients
- **Price suggestions**: Calculate optimal prices based on food cost or market data
- **Menu audit**: Health check with 10 issue types
- **Auto-repair**: Fix allergens, VAT, pricing automatically

---

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure AI settings:

```env
# AI provider: 'mock' (default, no key needed), 'groq', or 'openai'
AI_PROVIDER=mock

# For Groq (free tier, recommended):
# GROQ_API_KEY=gsk_xxx
# AI_PROVIDER=groq

# For OpenAI:
# OPENAI_API_KEY=sk-xxx
# AI_PROVIDER=openai

# Mock mode for CI/testing (regex-based, no API key)
USE_MOCK_AI=true

# Disable photo generation
SKIP_PHOTOS=true
```

### 2. Supported Providers

| Provider | Model | Cost | Key Required |
|----------|-------|------|-------------|
| `mock` | Regex-based | Free | No |
| `groq` | llama-3.3-70b-versatile | Free tier | Yes |
| `openai` | gpt-4o | Paid | Yes |

### 3. Getting a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create API key
4. Set `GROQ_API_KEY` in `.env`
5. Set `AI_PROVIDER=groq`

---

## API Endpoints

Base URL: `/api/ai`

All responses return: `{ ok: true, data: ... }` or `{ ok: false, error: "..." }`

### POST /api/ai/extract-products

Extract products from menu text.

**Request:**
```json
{ "text": "Pizza Margherita 25 lei\nPasta Carbonara 30 lei" }
```

**Response:**
```json
{
  "ok": true,
  "data": [
    { "name": "Pizza Margherita", "price": 25, "currency": "RON" },
    { "name": "Pasta Carbonara", "price": 30, "currency": "RON" }
  ]
}
```

### POST /api/ai/detect-allergens

Detect EU 14 allergens from ingredients list.

**Request:**
```json
{ "ingredients": "lapte, oua, faina de grau, unt", "product_id": 123 }
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "allergens": ["milk", "eggs", "cereals_gluten"],
    "eu14": ["celery", "cereals_gluten", "crustaceans", "eggs", "fish", "lupin", "milk", "molluscs", "mustard", "nuts", "peanuts", "sesame", "soybeans", "sulphites"]
  }
}
```

### POST /api/ai/suggest-price

Calculate optimal selling price.

**Request:**
```json
{ "name": "Friptura vita", "costPrice": 15, "price": 45 }
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "suggestedPrice": 52.5,
    "markup": 3.5,
    "basis": "cost_markup"
  }
}
```

### POST /api/ai/ingest

Process menu from uploaded file or text.

**Request (multipart/form-data):**
- `file`: Text file (txt, csv, md) — optional
- `text`: Menu text — optional

**Response:**
```json
{
  "ok": true,
  "data": { "products": [...], "count": 12 }
}
```

### POST /api/ai/audit

Run health check on menu products.

**Request:**
```json
{
  "products": [
    { "id": 1, "name": "Pizza", "price": 30 },
    { "id": 2, "name": "Pasta", "price": 25, "allergens": "milk,eggs" }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "healthScore": 95,
    "issues": [
      { "productId": 1, "type": "missing_allergens", "severity": "warning" }
    ],
    "totalProducts": 2
  }
}
```

### POST /api/ai/repair

Auto-fix a product (allergens, VAT, price).

**Request:**
```json
{
  "product": { "id": 1, "name": "Omleta", "ingredients": "oua, lapte, unt" }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "product": { "id": 1, "name": "Omleta", "allergens": "eggs,milk", "vat_rate": 9 },
    "repairs": ["allergens_detected", "vat_set_to_9"]
  }
}
```

### GET /api/ai/market-prices

Get reference ingredient prices (RON/kg or RON/L).

**Response:**
```json
{
  "ok": true,
  "data": {
    "chicken": 18, "beef": 32, "pork": 22,
    "milk": 6, "eggs": 1.5, "flour": 3
  }
}
```

---

## EU 14 Mandatory Allergens

The following allergens are tracked (as per EU Regulation No 1169/2011):

| Code | Romanian | English |
|------|----------|---------|
| `celery` | Țelină | Celery |
| `cereals_gluten` | Cereale/Gluten | Cereals containing gluten |
| `crustaceans` | Crustacee | Crustaceans |
| `eggs` | Ouă | Eggs |
| `fish` | Pește | Fish |
| `lupin` | Lupin | Lupin |
| `milk` | Lapte | Milk |
| `molluscs` | Moluște | Molluscs |
| `mustard` | Muștar | Mustard |
| `nuts` | Nuci | Tree nuts |
| `peanuts` | Arahide | Peanuts |
| `sesame` | Susan | Sesame |
| `soybeans` | Soia | Soybeans |
| `sulphites` | Sulfiți | Sulphur dioxide/sulphites |

---

## Pricing Algorithm

### With Cost Price (HORECA Standard Markup)

```
suggestedPrice = costPrice × markup (3.5x)
rounded to nearest 0.5 RON
```

### Without Cost Price (Market Fallback)

Uses current selling price as-is (market-based).

### Market Reference Prices

Ingredient reference prices from Metro/Selgros/Lidl are available at `GET /api/ai/market-prices`.

---

## Supported File Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| Plain text | `.txt` | One product per line |
| CSV | `.csv` | Name, price columns |
| Markdown | `.md` | Table or list format |

**Size limit:** 5 MB per file

---

## Admin UI Components

### AI Product Import (`/ai/audit`)

Navigate to **AI → Audit** in the admin panel to access:

1. **Import produse cu AI** — Upload menu file or paste text
2. **Audit meniu** — Run health check on all products
3. **Reparare automată** — Fix all issues with one click

### Component Usage (React)

```tsx
import AIProductImport from '@/modules/horeca-ai/components/AIProductImport';
import PricingSuggestions from '@/modules/horeca-ai/components/PricingSuggestions';
import AllergenDetection from '@/modules/horeca-ai/components/AllergenDetection';

// Import products from text/file
<AIProductImport onProductsSaved={(products) => console.log(products)} />

// Get price suggestion
<PricingSuggestions
  productName="Pizza Margherita"
  costPrice={8}
  onPriceSelected={(price) => console.log('Selected:', price)}
/>

// Detect allergens
<AllergenDetection
  initialIngredients="lapte, oua, faina"
  productId={123}
  onAllergensSaved={(allergens) => console.log(allergens)}
/>
```

---

## Testing

Run AI integration tests (no API key required — uses mock mode):

```bash
cd restaurant_app_v3_translation_system/server
npm test
```

Expected output: **17 tests passed**

### Mock Mode

Set `USE_MOCK_AI=true` in environment to use regex-based fallback:
- No API key needed
- Works in CI/CD
- Deterministic results
- Romanian and English ingredient keywords supported

---

## Database Tables

The AI engine adds these tables:

- `allergen_detection_log` — Log of AI allergen detections per product
- `ai_audit_log` — Log of menu audit runs with health scores

And these columns to `products`:

- `ingredients` TEXT — Raw ingredient list
- `costPrice` REAL — Food cost (production cost)
- `suggestedPrice` REAL — AI-calculated selling price

---

## Troubleshooting

### "AI request failed" errors

- Check `AI_PROVIDER` is set to `mock`, `groq`, or `openai`
- If using Groq/OpenAI, verify API key in `.env`
- Set `USE_MOCK_AI=true` to bypass API calls

### No products extracted from file

- Check file is UTF-8 encoded
- Verify format: `Product Name price RON` per line
- Try simpler format: `Produs 25 lei`

### Allergens not detected

- Ensure ingredients are in Romanian or English
- Use comma-separated format: `lapte, oua, faina`
- Check `USE_MOCK_AI=true` is set for local testing
