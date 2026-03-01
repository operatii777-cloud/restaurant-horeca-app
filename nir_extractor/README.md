# NIR Extractor

Script Python care extrage automat date din documente de factură (PDF, imagini) și generează NIR-uri în aplicația restaurant HORECA.

## Cerințe de sistem

- Python 3.8+
- Tesseract OCR (pentru documente scanate / imagini)
  - Linux: `sudo apt-get install tesseract-ocr tesseract-ocr-ron`
  - macOS: `brew install tesseract tesseract-lang`
  - Windows: descărcați de la https://github.com/UB-Mannheim/tesseract/wiki
- Poppler (pentru conversia PDF → imagine, necesar pentru PDF-uri scanate)
  - Linux: `sudo apt-get install poppler-utils`
  - macOS: `brew install poppler`
  - Windows: descărcați de la https://github.com/oschwartz10612/poppler-windows

## Instalare dependențe Python

```bash
cd nir_extractor
pip install -r requirements.txt
```

## Utilizare

### 1. Procesare fișier individual

```bash
python nir_extractor.py --file invoices/factura_metro.pdf
```

### 2. Monitorizare automată a unui folder

Plasați facturile în folderul `invoices/` și rulați:

```bash
python nir_extractor.py --watch
```

Scriptul verifică folderul la fiecare 5 secunde, procesează fișierele noi și le mută în `processed/` după finalizare.

### 3. Opțiuni avansate

```bash
# Server pe alt port
python nir_extractor.py --file factura.pdf --api-url http://localhost:3001

# Folder personalizat și interval de verificare
python nir_extractor.py --watch --watch-dir /cale/facturi --processed-dir /cale/procesate --interval 10
```

## Fluxul complet

```
Factură (PDF/imagine)
        │
        ▼
  Extragere text
  (pdfplumber sau OCR)
        │
        ▼
  Parsare date factură
  (furnizor, produse, TVA, etc.)
        │
        ▼
  Trimitere la API
  POST /api/tipizate/nir/from-invoice
        │
        ▼
  NIR creat în aplicație
  (status: DRAFT)
        │
        ▼
  Verificare și finalizare
  manuală în interfața web
```

## Formate de documente suportate

| Format | Metoda de extragere |
|--------|---------------------|
| PDF text | pdfplumber (fără OCR) |
| PDF scanat | pdf2image + pytesseract |
| PNG / JPG / TIFF | pytesseract (OCR) |

## Date extrase automat

- **Furnizor**: nume, CUI (cod fiscal), adresă
- **Document**: număr factură, dată
- **Produse**: denumire, unitate de măsură, cantitate, preț unitar, cotă TVA
- **Totale**: total fără TVA, total TVA, total cu TVA

## Furnizori recunoscuți automat

Scriptul identifică automat datele pentru:
- Metro Cash & Carry România
- Selgros Cash & Carry
- Lidl România
- Kaufland România

Pentru alți furnizori, datele sunt extrase generic din text.

## API utilizat

Scriptul folosește endpoint-ul:

```
POST /api/tipizate/nir/from-invoice
Content-Type: application/json

{
  "extractedData": {
    "date": "2026-03-01",
    "supplierName": "Metro Cash & Carry România S.R.L.",
    "supplierCUI": "RO13265221",
    "referenceDocument": "INV-2026-00123",
    "warehouseId": 1,
    "items": [
      {
        "name": "Cartofi",
        "unit": "kg",
        "quantityReceived": 50,
        "pricePerUnit": 3.50,
        "vatRate": 9
      }
    ]
  },
  "sourceFile": "factura_metro.pdf"
}
```

NIR-ul este creat cu statusul `DRAFT`. Utilizatorul îl poate verifica și finaliza din interfața web a aplicației.

## Depanare

**Problema**: Nu se extrage text din PDF  
**Soluție**: Instalați `pdfplumber`: `pip install pdfplumber`

**Problema**: PDF scanat / imagine nerecunoscută  
**Soluție**: Instalați Tesseract și `pytesseract`: 
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-ron
pip install pytesseract Pillow pdf2image
```

**Problema**: Produsele nu sunt extrase corect  
**Soluție**: NIR-ul este creat oricum în aplicație cu statusul DRAFT. Produsele pot fi adăugate manual din interfața web.

**Problema**: Conexiune refuzată la API  
**Soluție**: Verificați că serverul aplicației rulează și folosiți `--api-url` cu URL-ul corect.
