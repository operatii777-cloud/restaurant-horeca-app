import React from "react";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 10,
  },
  header: {
    marginBottom: 16,
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
  headerCol: {
    flexDirection: "column",
  },
  headerLabel: {
    fontWeight: "bold",
  },
  headerValue: {
    marginLeft: 2,
  },
  smallText: {
    fontSize: 8,
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
  colIngredient: { width: "55%" },
  colQty: { width: "25%", textAlign: "right" },
  colTva: { width: "20%", textAlign: "right" },
  totalsContainer: {
    marginTop: 10,
    marginLeft: "auto",
    width: "40%",
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
    borderTopWidth: 1,
    borderColor: "#000",
    marginTop: 24,
  },
  pageNumberWrapper: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
  },
  pageNumber: {
    fontSize: 8,
    textAlign: "right",
  },
});

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatNumber = (value, decimals = 2) => safeNumber(value).toFixed(decimals);

const ConsumePdfDocument = ({ consume }) => {
  const header = consume?.header || {};
  const lines = consume?.lines || [];
  const totals = consume?.totals || {};
  const tenant = consume?.tenant || {};

  const tenantName = tenant.name || "";
  const tenantCui = tenant.cui || "";
  const tenantAddress = tenant.address || "";

  const documentNumber = header.document_number || header.number || consume?.id;
  const documentDateRaw = header.document_date || header.date || consume?.date;
  const documentDate =
    typeof documentDateRaw === "string" ? documentDateRaw : documentDateRaw?.toISOString?.().slice(0, 10) || "";

  const destination = header.destination || "";
  const reason = header.reason || "";
  const notes = header.notes || "";

  const mappedLines = (lines || []).map((line, idx) => ({
    key: `${idx}-${line.ingredient_id || line.ingredient_name || "row"}`,
    ingredientName: line.ingredient_name || line.ingredientName || line.name || "-",
    quantity: safeNumber(line.quantity || 0),
    tvaPercent: safeNumber(line.tva_percent || line.vat_percent || line.tva || 0),
  }));

  const totalQuantity =
    safeNumber(totals.total_quantity) || mappedLines.reduce((acc, l) => acc + safeNumber(l.quantity), 0);

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
        render={({ pageNumber, totalPages }) => (
          <>
            <View style={styles.header}>
              <View style={[styles.headerRow, { marginBottom: 6 }]}>
                <View style={styles.headerCol}>
                  {tenantName ? (
                    <>
                      <Text style={styles.headerLabel}>{tenantName}</Text>
                      {tenantCui ? <Text style={styles.smallText}>CUI: {tenantCui}</Text> : null}
                      {tenantAddress ? <Text style={styles.smallText}>Adresă: {tenantAddress}</Text> : null}
                    </>
                  ) : null}
                </View>
              </View>

              <Text style={styles.title}>BON CONSUM</Text>

              <View style={styles.headerRow}>
                <View style={styles.headerCol}>
                  <Text style={styles.headerLabel}>Număr document:</Text>
                  <Text style={styles.headerValue}>{documentNumber}</Text>
                  {documentDate ? (
                    <>
                      <Text style={[styles.headerLabel, { marginTop: 4 }]}>Dată:</Text>
                      <Text style={styles.headerValue}>{documentDate}</Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.headerCol}>
                  {destination ? (
                    <>
                      <Text style={styles.headerLabel}>Destinație:</Text>
                      <Text style={styles.headerValue}>{destination}</Text>
                    </>
                  ) : null}
                  {reason ? (
                    <>
                      <Text style={[styles.headerLabel, { marginTop: 4 }]}>Motiv:</Text>
                      <Text style={styles.headerValue}>{reason}</Text>
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

            <Text style={styles.sectionTitle}>Detalii consum</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colIngredient]}>Ingredient</Text>
                <Text style={[styles.th, styles.colQty]}>Cantitate</Text>
                <Text style={[styles.th, styles.colTva]}>TVA %</Text>
              </View>

              {mappedLines.map((line, idx) => (
                <View
                  key={line.key}
                  style={[styles.tr, idx % 2 === 1 ? { backgroundColor: "#fafafa" } : null]}
                >
                  <Text style={[styles.td, styles.colIngredient]}>{line.ingredientName}</Text>
                  <Text style={[styles.td, styles.colQty]}>{formatNumber(line.quantity)}</Text>
                  <Text style={[styles.td, styles.colTva]}>{formatNumber(line.tvaPercent, 0)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalsContainer}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total cantitate:</Text>
                <Text>{formatNumber(totalQuantity, 2)}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerColumn}>
                <Text style={styles.footerLabel}>Întocmit</Text>
                <View style={styles.footerLine} />
              </View>
              <View style={styles.footerColumn}>
                <Text style={styles.footerLabel}>Gestionar</Text>
                <View style={styles.footerLine} />
              </View>
              <View style={styles.footerColumn}>
                <Text style={styles.footerLabel}>Avizat</Text>
                <View style={styles.footerLine} />
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.smallText}>Document generat automat din sistemul Admin V4.</Text>
            </View>

            <View style={styles.pageNumberWrapper}>
              <Text style={styles.pageNumber}>
                Pagina {pageNumber} / {totalPages}
              </Text>
            </View>
          </>
        )}
      />
    </Document>
  );
};

export default ConsumePdfDocument;

export const exportConsumePdf = async (consumeData) => {
  const doc = <ConsumePdfDocument consume={consumeData} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

