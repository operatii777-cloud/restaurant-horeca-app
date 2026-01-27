// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

// Pentru font custom:
// import { Font } from "@react-pdf/renderer";
// Font.register({ family: "Roboto", src: "/fonts/Roboto-Regular.ttf" });

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 10,
    // fontFamily: "Roboto",
  },
  header: {
    marginBottom: 16,
  },
  tenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: "contain",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLabel: {
    fontWeight: "bold",
  },
  headerValue: {
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 11,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  table: {
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#000",
    backgroundColor: "#eee",
    paddingVertical: 4,
  },
  th: {
    paddingHorizontal: 4,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderColor: "#ccc",
    paddingVertical: 2,
  },
  td: {
    paddingHorizontal: 4,
  },
  colIngredient: { width: "36%" },
  colQty: { width: "16%", textAlign: "right" },
  colUnitPrice: { width: "16%", textAlign: "right" },
  colTva: { width: "14%", textAlign: "right" },
  colLineTotal: { width: "18%", textAlign: "right" },
  totalsContainer: {
    marginTop: 10,
    marginLeft: "auto",
    width: "45%",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 6,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: {
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerColumn: {
    width: "30%",
  },
  footerLabel: {
    fontWeight: "bold",
    marginBottom: 32,
  },
  footerLine: {
    borderTopWidth: 0.5,
    borderColor: "#000",
    marginTop: 24,
  },
  smallText: {
    fontSize: 8,
  },
  pageNumber: {
    fontSize: 8,
    textAlign: "right",
    position: "absolute",
    bottom: 16,
    right: 32,
  },
});

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatNumber = (value, decimals = 2) => safeNumber(value).toFixed(decimals);

const NirPdfDocument = ({ nir }) => {
  const header = nir?.header || nir || {};
  const lines = nir?.lines || nir?.items || [];
  const totals = nir?.totals || {};

  const tenant = nir?.tenant || {};
  const tenantName = tenant.name || "";
  const tenantCui = tenant.cui || "";
  const tenantAddress = tenant.address || "";
  const logoUrl = tenant.logo_url || null;

  const supplierName = header.supplier_name || header.supplierName || header.supplier?.name || "-";
  const supplierCode = header.supplier_cui || header.supplierCui || header.supplier?.cui || header.supplier_code || "";
  const supplierAddress = header.supplier_address || header.supplierAddress || header.supplier?.address || "";

  const documentNumber = header.document_number || header.number || header.nir_number || nir?.id;
  const documentDateRaw = header.document_date || header.date || header.nir_date || nir?.date;
  const documentDate =
    typeof documentDateRaw === "string" ? documentDateRaw : documentDateRaw?.toISOString?.().slice(0, 10) || "";

  const notes = header.notes || header.observations || nir?.notes || "";

  let totalValue = 0;
  let totalTva = 0;

  const mappedLines = (lines || []).map((line, idx) => {
    const ingredientName = line.ingredient_name || line.ingredientName || line.name || "-";
    const qty = safeNumber(line.quantity || line.qty);
    const unitPrice = safeNumber(line.unit_price || line.price || line.unitPrice);
    const tvaPercent = safeNumber(line.tva_percent || line.vat_percent || line.tva || line.vat);

    let lineTotal = line.line_total || line.total || line.lineTotal;
    if (!Number.isFinite(Number(lineTotal))) {
      const base = qty * unitPrice;
      const tva = (base * tvaPercent) / 100;
      lineTotal = base + tva;
    }

    const baseValue = qty * unitPrice;
    const tvaValue = safeNumber(lineTotal) - baseValue;

    totalValue += baseValue;
    totalTva += tvaValue;

    return {
      key: `${idx}-${ingredientName}`,
      ingredientName,
      qty,
      unitPrice,
      tvaPercent,
      lineTotal: safeNumber(lineTotal),
    };
  });

  const finalTotalValue = safeNumber(totals.total_value ?? totals.base_total ?? totalValue);
  const finalTotalTva = safeNumber(totals.total_tva ?? totals.vat_total ?? totalTva);
  const grandTotal = safeNumber(totals.grand_total ?? totals.total ?? 0) || finalTotalValue + finalTotalTva;

  const preparedBy = header.prepared_by || header.created_by_name || nir?.created_by_name || nir?.createdByName || "Admin";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {(tenantName || logoUrl) && (
            <View style={styles.tenantRow}>
              <View>
                {tenantName ? <Text style={styles.headerLabel}>{tenantName}</Text> : null}
                {tenantCui ? <Text style={styles.smallText}>CUI: {tenantCui}</Text> : null}
                {tenantAddress ? <Text style={styles.smallText}>{tenantAddress}</Text> : null}
              </View>
              {logoUrl ? (
                <Image src={logoUrl} style={styles.logo} />
              ) : null}
            </View>
          )}
          <Text style={styles.title}>NOTĂ DE INTRARE RECEPȚIE (NIR)</Text>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerLabel}>Furnizor:</Text>
              <Text style={styles.headerValue}>{supplierName}</Text>
              {supplierCode ? <Text style={styles.smallText}>CUI: {supplierCode}</Text> : null}
              {supplierAddress ? <Text style={styles.smallText}>Adresă: {supplierAddress}</Text> : null}
            </View>
            <View>
              <Text style={styles.headerLabel}>Nr. document:</Text>
              <Text style={styles.headerValue}>{documentNumber}</Text>
              {documentDate ? (
                <>
                  <Text style={[styles.headerLabel, { marginTop: 4 }]}>Dată:</Text>
                  <Text style={styles.headerValue}>{documentDate}</Text>
                </>
              ) : null}
            </View>
          </View>
          {notes ? (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.headerLabel}>Observații:</Text>
              <Text style={styles.headerValue}>{notes}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Detalii linii</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colIngredient]}>Ingredient</Text>
            <Text style={[styles.th, styles.colQty]}>Cantitate</Text>
            <Text style={[styles.th, styles.colUnitPrice]}>Preț unitar</Text>
            <Text style={[styles.th, styles.colTva]}>TVA %</Text>
            <Text style={[styles.th, styles.colLineTotal]}>Total linie</Text>
          </View>

          {mappedLines.map((line, index) => (
            <View
              key={line.key}
              style={[
                styles.tr,
                index % 2 === 1
                  ? {
                      backgroundColor: "#f7f7f7",
                    }
                  : null,
              ]}
            >
              <Text style={[styles.td, styles.colIngredient]}>{line.ingredientName}</Text>
              <Text style={[styles.td, styles.colQty]}>{formatNumber(line.qty)}</Text>
              <Text style={[styles.td, styles.colUnitPrice]}>{formatNumber(line.unitPrice)}</Text>
              <Text style={[styles.td, styles.colTva]}>{formatNumber(line.tvaPercent, 0)}</Text>
              <Text style={[styles.td, styles.colLineTotal]}>{formatNumber(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total valoare (fără TVA):</Text>
            <Text>{formatNumber(finalTotalValue)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total TVA:</Text>
            <Text>{formatNumber(finalTotalTva)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total general:</Text>
            <Text>{formatNumber(grandTotal)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerColumn}>
            <Text style={styles.footerLabel}>Furnizor</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerLabel}>Primitor</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerLabel}>Întocmit de</Text>
            <Text>{preparedBy}</Text>
            <View style={styles.footerLine} />
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.smallText}>Document generat automat din sistemul Admin V4.</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default NirPdfDocument;

export const exportNirPdf = async (nirData) => {
  const doc = <NirPdfDocument nir={nirData} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

