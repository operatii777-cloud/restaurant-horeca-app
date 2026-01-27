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
    marginBottom: 6,
  },
  tenantInfo: {
    marginBottom: 8,
  },
  tenantName: {
    fontWeight: "bold",
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaCol: {
    flex: 1,
  },
  label: {
    fontWeight: "bold",
  },
  table: {
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 0.5,
    borderColor: "#000",
  },
  headerCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderColor: "#d1d5db",
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  colIngredient: { width: "32%" },
  colUnit: { width: "10%" },
  colSystem: { width: "16%", textAlign: "right" },
  colCounted: { width: "16%", textAlign: "right" },
  colDiff: { width: "13%", textAlign: "right" },
  colValue: { width: "13%", textAlign: "right" },
  totalsWrapper: {
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: "#000",
    alignSelf: "flex-end",
    width: "55%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.3,
    borderColor: "#d1d5db",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  totalsLabel: {
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCol: {
    width: "30%",
  },
  footerLine: {
    borderTopWidth: 0.5,
    borderColor: "#000",
    marginTop: 28,
  },
  smallText: {
    fontSize: 8,
    marginTop: 8,
  },
  pageNumber: {
    position: "absolute",
    bottom: 16,
    right: 32,
    fontSize: 8,
  },
});

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatNumber = (value, decimals = 2) => safeNumber(value).toFixed(decimals);

const InventoryPdfDocument = ({ inventory }) => {
  const header = inventory?.header || {};
  const tenant = inventory?.tenant || {};
  const tenantName = tenant.name || "";
  const tenantCui = tenant.cui || "";
  const tenantAddress = tenant.address || "";

  const documentNumber = header.document_number || header.number || inventory?.id || "";
  const documentDate =
    typeof header.document_date === "string"
      ? header.document_date
      : header.document_date?.toISOString?.().slice(0, 10) || "";

  const mappedLines = (inventory?.lines || []).map((line, idx) => {
    const stockSystem = safeNumber(line.stock_system ?? line.system_stock);
    const stockCounted = safeNumber(line.stock_counted ?? line.counted_stock);
    const diffQty =
      safeNumber(line.diff_qty ?? line.diff ?? stockCounted - stockSystem);
    const diffValue = safeNumber(line.diff_value ?? line.diffValue);

    return {
      key: `${idx}-${line.ingredient_id ?? idx}`,
      ingredient: line.ingredient_name || line.name || "-",
      unit: line.unit || line.ingredient_unit || "",
      stockSystem,
      stockCounted,
      diffQty,
      diffValue,
    };
  });

  const totals = inventory?.totals || {};
  const totalPositive =
    safeNumber(totals.total_positive) ||
    mappedLines.filter((line) => line.diffQty > 0).reduce((acc, line) => acc + line.diffQty, 0);
  const totalNegative =
    safeNumber(totals.total_negative) ||
    mappedLines.filter((line) => line.diffQty < 0).reduce((acc, line) => acc + line.diffQty, 0);
  const totalPositiveValue =
    safeNumber(totals.total_positive_value) ||
    mappedLines.filter((line) => line.diffQty > 0).reduce((acc, line) => acc + safeNumber(line.diffValue), 0);
  const totalNegativeValue =
    safeNumber(totals.total_negative_value) ||
    mappedLines.filter((line) => line.diffQty < 0).reduce((acc, line) => acc + safeNumber(line.diffValue), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {tenantName ? (
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>{tenantName}</Text>
              {tenantCui ? <Text>CUI: {tenantCui}</Text> : null}
              {tenantAddress ? <Text>{tenantAddress}</Text> : null}
            </View>
          ) : null}
          <Text style={styles.title}>PROCES-VERBAL DE INVENTARIERE</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text>
                <Text style={styles.label}>Nr. inventar:&nbsp;</Text>
                {documentNumber || "—"}
              </Text>
              <Text>
                <Text style={styles.label}>Data:&nbsp;</Text>
                {documentDate || "—"}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text>
                <Text style={styles.label}>Locație:&nbsp;</Text>
                {header.location || "—"}
              </Text>
              <Text>
                <Text style={styles.label}>Responsabil:&nbsp;</Text>
                {header.responsible || "—"}
              </Text>
            </View>
          </View>
          {header.notes ? (
            <Text>
              <Text style={styles.label}>Observații:&nbsp;</Text>
              {header.notes}
            </Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colIngredient]}>Ingredient</Text>
            <Text style={[styles.headerCell, styles.colUnit]}>Unitate</Text>
            <Text style={[styles.headerCell, styles.colSystem]}>Stoc scriptic</Text>
            <Text style={[styles.headerCell, styles.colCounted]}>Stoc faptic</Text>
            <Text style={[styles.headerCell, styles.colDiff]}>Diferență</Text>
            <Text style={[styles.headerCell, styles.colValue]}>Valoare dif.</Text>
          </View>

          {mappedLines.map((line, index) => (
            <View
              key={line.key}
              style={[
                styles.row,
                index % 2 === 1
                  ? {
                      backgroundColor: "#f9fafb",
                    }
                  : null,
              ]}
            >
              <Text style={[styles.cell, styles.colIngredient]}>{line.ingredient}</Text>
              <Text style={[styles.cell, styles.colUnit]}>{line.unit || "—"}</Text>
              <Text style={[styles.cell, styles.colSystem]}>{formatNumber(line.stockSystem)}</Text>
              <Text style={[styles.cell, styles.colCounted]}>{formatNumber(line.stockCounted)}</Text>
              <Text style={[styles.cell, styles.colDiff]}>{formatNumber(line.diffQty)}</Text>
              <Text style={[styles.cell, styles.colValue]}>{formatNumber(line.diffValue)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrapper}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total plus (cant.):</Text>
            <Text>{formatNumber(totalPositive)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total minus (cant.):</Text>
            <Text>{formatNumber(totalNegative)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total plus (valoare):</Text>
            <Text>{formatNumber(totalPositiveValue)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total minus (valoare):</Text>
            <Text>{formatNumber(totalNegativeValue)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Întocmit</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Gestionar</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Administrator</Text>
            <View style={styles.footerLine} />
          </View>
        </View>

        <Text style={styles.smallText}>Document generat automat din Admin V4.</Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default InventoryPdfDocument;

export const exportInventoryPdf = async (inventoryData) => {
  const doc = <InventoryPdfDocument inventory={inventoryData} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

