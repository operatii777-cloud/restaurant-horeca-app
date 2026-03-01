#!/usr/bin/env python3
"""
NIR Extractor - Automatic NIR (Notă de Intrare Recepție) generation from invoice documents.

Usage:
    # Process a single file
    python nir_extractor.py --file invoices/factura_metro.pdf

    # Watch the invoices/ folder and process new files automatically
    python nir_extractor.py --watch

    # Specify a custom API URL
    python nir_extractor.py --file invoice.pdf --api-url http://localhost:3001

Supported document types: PDF, PNG, JPG, JPEG, TIFF
"""

import os
import re
import sys
import json
import time
import shutil
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional

import requests

# ---------------------------------------------------------------------------
# Optional imports for PDF / image processing
# ---------------------------------------------------------------------------
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    from PIL import Image
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False

try:
    from pdf2image import convert_from_path
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("nir_extractor")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SUPPORTED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif"}
DEFAULT_API_URL = "http://localhost:3001"
NIR_ENDPOINT = "/api/tipizate/nir/from-invoice"

# Romanian VAT rates
VALID_VAT_RATES = {0, 5, 9, 19}

# Supplier-specific patterns (can be extended)
SUPPLIER_PATTERNS = {
    "metro": {
        "name": "Metro Cash & Carry România S.R.L.",
        "cui": "RO13265221",
    },
    "selgros": {
        "name": "Selgros Cash & Carry S.R.L.",
        "cui": "RO5744175",
    },
    "lidl": {
        "name": "Lidl Discount S.R.L.",
        "cui": "RO18802292",
    },
    "kaufland": {
        "name": "Kaufland România S.C.S.",
        "cui": "RO14730206",
    },
}

# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pdfplumber (preferred) or pytesseract (fallback)."""
    text = ""

    if HAS_PDFPLUMBER:
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            if text.strip():
                logger.info("Extracted text from PDF using pdfplumber (%d chars)", len(text))
                return text
        except Exception as exc:
            logger.warning("pdfplumber failed: %s", exc)

    # Fallback: convert pages to images and OCR
    if HAS_PDF2IMAGE and HAS_PYTESSERACT:
        try:
            images = convert_from_path(file_path, dpi=200)
            for img in images:
                text += pytesseract.image_to_string(img, lang="ron+eng") + "\n"
            logger.info("Extracted text from PDF via OCR (%d chars)", len(text))
            return text
        except Exception as exc:
            logger.warning("OCR fallback failed: %s", exc)

    logger.error("Cannot extract text from PDF: install pdfplumber or pdf2image + pytesseract")
    return ""


def extract_text_from_image(file_path: str) -> str:
    """Extract text from an image file using pytesseract."""
    if not HAS_PYTESSERACT:
        logger.error("pytesseract is not installed. Run: pip install pytesseract Pillow")
        return ""
    try:
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img, lang="ron+eng")
        logger.info("Extracted text from image via OCR (%d chars)", len(text))
        return text
    except Exception as exc:
        logger.error("Image OCR failed: %s", exc)
        return ""


def extract_text(file_path: str) -> str:
    """Extract text from any supported document type."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext in {".png", ".jpg", ".jpeg", ".tiff", ".tif"}:
        return extract_text_from_image(file_path)
    logger.error("Unsupported file type: %s", ext)
    return ""

# ---------------------------------------------------------------------------
# Invoice parsing
# ---------------------------------------------------------------------------

def _first_match(pattern: str, text: str, flags: int = re.IGNORECASE) -> Optional[str]:
    """Return the first capturing group match or None."""
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else None


def parse_date(raw: Optional[str]) -> Optional[str]:
    """Attempt to normalise a date string to YYYY-MM-DD."""
    if not raw:
        return None
    raw = raw.strip()
    # Try common Romanian/European formats
    for fmt in ("%d.%m.%Y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d %m %Y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return raw  # return as-is if we cannot parse


def parse_number(raw: Optional[str]) -> Optional[float]:
    """Convert Romanian-style number string (1.234,56) to float."""
    if raw is None:
        return None
    # Remove thousands separators (. in Romanian format) then replace , with .
    cleaned = raw.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_vat_rate(raw: Optional[str]) -> int:
    """Return a valid Romanian VAT rate integer, defaulting to 9% (food)."""
    if raw is None:
        return 9
    try:
        rate = int(float(raw.replace("%", "").strip()))
        return rate if rate in VALID_VAT_RATES else 9
    except (ValueError, AttributeError):
        return 9


def detect_supplier(text: str) -> dict:
    """Try to identify the supplier from known patterns."""
    text_lower = text.lower()
    for key, info in SUPPLIER_PATTERNS.items():
        if key in text_lower:
            return {"supplierName": info["name"], "supplierCUI": info["cui"]}

    # Generic extraction: look for "Furnizor:" label or company-name patterns
    supplier_name = _first_match(
        r"(?:furnizor|vanzator|emitent)[:\s]+([A-Z][^\n]{3,60})", text
    )
    supplier_cui = _first_match(
        r"(?:CUI|CIF|C\.U\.I\.|cod fiscal)[:\s]*([RO]*\d{6,10})", text
    )
    return {
        "supplierName": supplier_name or "Furnizor necunoscut",
        "supplierCUI": supplier_cui,
    }


def parse_invoice_items(text: str) -> list:
    """
    Extract line items from invoice text.

    Tries to find table rows of the form:
        [row#]  <name>  <unit>  <qty>  <price>  [vat%]  [total]

    Returns a list of item dicts compatible with the NIR API.
    """
    items = []
    # Header keywords to skip
    header_keywords = re.compile(
        r"^\s*(?:nr\.?\s*crt|denumire|descriere|cod|um|cantitate|pret|tva|valoare|total|"
        r"crt\.|item|product|quantity|unit|price)",
        re.IGNORECASE,
    )

    unit_group = r"(?P<unit>kg|g(?!\w)|L(?!\w)|ml|buc|pach|cut|dz|pcs|lt|litru|litr|l(?!\w))"

    # Pattern 1: rows with 2+ space column separator (typical for formatted invoices)
    row_pattern = re.compile(
        r"^\s*(?:\d+[\s.)]+)?"          # optional row number
        r"(?P<name>.+?)\s{2,}"            # name (lazy), then 2+ spaces
        + unit_group + r"\s+"             # unit of measure
        r"(?P<qty>[\d.,]+)\s+"           # quantity
        r"(?P<price>[\d.,]+)\s+"         # price per unit
        r"(?P<vat>\d{1,2})\s*%?\s+"    # VAT rate
        r"(?P<total>[\d.,]+)",            # line total
        re.IGNORECASE | re.MULTILINE,
    )

    for m in row_pattern.finditer(text):
        if header_keywords.match(m.group("name")):
            continue
        qty = parse_number(m.group("qty"))
        price = parse_number(m.group("price"))
        if qty is None or price is None or qty <= 0 or price < 0:
            continue
        items.append({
            "name": m.group("name").strip(),
            "unit": m.group("unit").lower(),
            "quantityReceived": qty,
            "pricePerUnit": price,
            "vatRate": parse_vat_rate(m.group("vat")),
        })

    if items:
        return items

    # Pattern 2: single-space separated (name followed directly by unit)
    row_pattern2 = re.compile(
        r"^\s*(?:\d+[\s.)]+)?"
        r"(?P<name>.+?)\s+"
        + unit_group + r"\s+"
        r"(?P<qty>[\d.,]+)\s+"
        r"(?P<price>[\d.,]+)"
        r"(?:\s+(?P<vat>\d{1,2})\s*%?)?"
        r"(?:\s+(?P<total>[\d.,]+))?",
        re.IGNORECASE | re.MULTILINE,
    )
    for m in row_pattern2.finditer(text):
        if header_keywords.match(m.group("name")):
            continue
        qty = parse_number(m.group("qty"))
        price = parse_number(m.group("price"))
        if qty is None or price is None or qty <= 0 or price < 0:
            continue
        items.append({
            "name": m.group("name").strip(),
            "unit": m.group("unit").lower(),
            "quantityReceived": qty,
            "pricePerUnit": price,
            "vatRate": parse_vat_rate(m.group("vat")),
        })

    if items:
        return items

    # Fallback: lines starting with a letter that contain 3+ numbers separated by 2+ spaces
    simple_pattern = re.compile(
        r"^(?P<name>[A-Za-z\u00C0-\u017E][^\n]{2,60?}?)\s{2,}"
        r"([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)",
        re.MULTILINE,
    )
    for m in simple_pattern.finditer(text):
        if header_keywords.match(m.group("name")):
            continue
        nums = [parse_number(g) for g in m.groups()[1:]]
        if any(n is None for n in nums):
            continue
        qty, price, *_ = nums
        if qty and price and qty > 0 and price >= 0:
            items.append({
                "name": m.group("name").strip(),
                "unit": "buc",
                "quantityReceived": qty,
                "pricePerUnit": price,
                "vatRate": 9,
            })

    return items


def parse_invoice(text: str, source_file: str) -> dict:
    """Parse raw invoice text into a structured NIR-compatible dict."""
    supplier = detect_supplier(text)

    # Invoice / document number
    invoice_number = _first_match(
        r"(?:nr\.?\s*factur[aă]|factur[aă]\s*nr\.?|invoice\s*no\.?)[:\s#]*([A-Z0-9/_-]{3,30})",
        text,
    )
    if not invoice_number:
        # Try "Serie: XX  Nr.: NNNNN" format (common in Romanian invoices)
        m = re.search(
            r"(?:serie[a:]?|series?)[:\s]*([A-Z]{1,10})\s+(?:nr\.?|no\.?)[:\s]*(\d{4,12})",
            text,
            re.IGNORECASE,
        )
        if m:
            invoice_number = f"{m.group(1).strip()}-{m.group(2).strip()}"
    if not invoice_number:
        invoice_number = _first_match(r"(?:nr\.?|no\.?)[:\s#]+([A-Z0-9/_-]{3,30})", text)

    # Invoice date
    raw_date = _first_match(
        r"(?:data\s*facturii?|data\s*emiterii?|data|date)[:\s]*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})",
        text,
    )
    invoice_date = parse_date(raw_date) or datetime.now().strftime("%Y-%m-%d")

    # Supplier address
    supplier_address = _first_match(
        r"(?:adresa|str\.?|strada|bd\.?|bulevardul)[:\s]*([^\n]{5,80})",
        text,
    )

    items = parse_invoice_items(text)

    return {
        "date": invoice_date,
        "supplierName": supplier["supplierName"],
        "supplierCUI": supplier["supplierCUI"],
        "supplierAddress": supplier_address,
        "referenceDocument": invoice_number,
        "warehouseId": 1,
        "notes": f"Generat automat din: {Path(source_file).name}",
        "items": items,
    }

# ---------------------------------------------------------------------------
# NIR submission
# ---------------------------------------------------------------------------

def submit_nir(extracted_data: dict, source_file: str, api_url: str) -> Optional[dict]:
    """Submit extracted invoice data to the NIR API and return the created NIR."""
    url = api_url.rstrip("/") + NIR_ENDPOINT
    payload = {
        "extractedData": extracted_data,
        "sourceFile": Path(source_file).name,
    }
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        if result.get("success"):
            nir = result["data"]
            logger.info(
                "NIR creat cu succes: %s (ID: %s, Total: %.2f RON)",
                nir.get("number"),
                nir.get("id"),
                nir.get("totalInclVAT", 0),
            )
            return nir
        logger.error("API returned failure: %s", result)
        return None
    except requests.RequestException as exc:
        logger.error("API request failed: %s", exc)
        return None

# ---------------------------------------------------------------------------
# File processing
# ---------------------------------------------------------------------------

def process_file(file_path: str, api_url: str, output_dir: Optional[str] = None) -> bool:
    """Extract data from a document, create a NIR, and optionally move the file."""
    logger.info("Procesare document: %s", file_path)

    text = extract_text(file_path)
    if not text.strip():
        logger.error("Nu s-a putut extrage text din: %s", file_path)
        return False

    extracted = parse_invoice(text, file_path)

    if not extracted["items"]:
        logger.warning(
            "Nu s-au găsit produse în factura %s. Verificați formatul documentului.",
            file_path,
        )
        # Still attempt submission so the user can fill items manually in the app
        extracted["notes"] = (extracted.get("notes") or "") + " [ATENȚIE: produse neextrase automat]"

    logger.info(
        "Date extrase: Furnizor=%s, Data=%s, Nr.doc=%s, Produse=%d",
        extracted.get("supplierName"),
        extracted.get("date"),
        extracted.get("referenceDocument"),
        len(extracted.get("items", [])),
    )

    nir = submit_nir(extracted, file_path, api_url)

    if nir and output_dir:
        dest = Path(output_dir) / Path(file_path).name
        try:
            shutil.move(file_path, dest)
            logger.info("Document mutat în: %s", dest)
        except OSError as exc:
            logger.warning("Nu s-a putut muta documentul: %s", exc)

    return nir is not None


# ---------------------------------------------------------------------------
# Folder watcher
# ---------------------------------------------------------------------------

def watch_folder(watch_dir: str, processed_dir: str, api_url: str, interval: int = 5) -> None:
    """
    Poll `watch_dir` for new invoice files and process them automatically.
    Processed files are moved to `processed_dir`.
    """
    watch_path = Path(watch_dir)
    processed_path = Path(processed_dir)
    watch_path.mkdir(parents=True, exist_ok=True)
    processed_path.mkdir(parents=True, exist_ok=True)

    logger.info("Monitorizare folder: %s (interval: %ds)", watch_dir, interval)
    logger.info("Documente procesate vor fi mutate în: %s", processed_dir)
    logger.info("Apăsați Ctrl+C pentru oprire.")

    seen: set = set()

    while True:
        try:
            for entry in watch_path.iterdir():
                if entry.suffix.lower() not in SUPPORTED_EXTENSIONS:
                    continue
                if entry.name in seen:
                    continue
                seen.add(entry.name)
                process_file(str(entry), api_url, processed_dir)
        except KeyboardInterrupt:
            logger.info("Oprire monitorizare.")
            break
        except Exception as exc:  # noqa: BLE001
            logger.error("Eroare în watch loop: %s", exc)
        time.sleep(interval)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="NIR Extractor – generare automată NIR din documente de factură",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--file", "-f",
        metavar="PATH",
        help="Calea către documentul de procesat (PDF, PNG, JPG, TIFF)",
    )
    group.add_argument(
        "--watch", "-w",
        action="store_true",
        help="Monitorizează folderul ./invoices/ pentru fișiere noi",
    )
    parser.add_argument(
        "--watch-dir",
        default="invoices",
        metavar="DIR",
        help="Folderul de urmărit (implicit: invoices/)",
    )
    parser.add_argument(
        "--processed-dir",
        default="processed",
        metavar="DIR",
        help="Folderul în care se mută documentele procesate (implicit: processed/)",
    )
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        metavar="URL",
        help=f"URL-ul aplicației (implicit: {DEFAULT_API_URL})",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=5,
        metavar="SEC",
        help="Intervalul de verificare a folderului în secunde (implicit: 5)",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.watch:
        watch_folder(
            watch_dir=args.watch_dir,
            processed_dir=args.processed_dir,
            api_url=args.api_url,
            interval=args.interval,
        )
        return 0

    # Single file mode
    if not Path(args.file).exists():
        logger.error("Fișierul nu există: %s", args.file)
        return 1
    ext = Path(args.file).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        logger.error(
            "Tip de fișier nesuportat: %s. Tipuri acceptate: %s",
            ext,
            ", ".join(SUPPORTED_EXTENSIONS),
        )
        return 1

    success = process_file(args.file, args.api_url)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
