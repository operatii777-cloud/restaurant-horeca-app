// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { paddingTop: 24, paddingBottom: 32, paddingHorizontal: 32, fontSize: 10 },
  title: { fontSize: 14, textAlign: "center", marginBottom: 6 },
  meta: { marginBottom: 10 },
  label: { fontWeight: "bold" },
  table: { borderWidth: 0.5, borderColor: "#000" },
  tr: { flexDirection: "row", borderBottomWidth: 0.3, borderColor: "#d1d5db" },
  th: { padding: 4, fontWeight: "bold", backgroundColor: "#e5e7eb" },
  td: { padding: 4 },
  colIngredient: { width: "36%" },
  colUnit: { width: "12%" },
  colQty: { width: "16%", textAlign: "right" },
  colCost: { width: "18%", textAlign: "right" },
  colValue: { width: "18%", textAlign: "right" },
  totals: { marginTop: 10, alignSelf: "flex-end" },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  footerCol: { width: "30%" },
  footerLine: { borderTopWidth: 0.5, borderColor: "#000", marginTop: 28 },
});

const safe = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
const fmt = (n, d = 2) => safe(n).toFixed(d);

const TransferPdfDocument = ({ transfer }) => {
  const header = transfer?.header || {};
  const lines = transfer?.lines || [];
  const totals = transfer?.totals || {};
  const totalValue =
    safe(totals.total_value) || lines.reduce((s, l) => s + safe(l.value_total), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>TRANSFER DE DEPOZIT</Text>
        <View style={styles.meta}>
          <Text>
            <Text style={styles.label}>Nr.: </Text>
            {header.document_number || "—"}{" "}
            <Text style={styles.label}>Data: </Text>
            {header.document_date || "—"}
          </Text>
          <Text>
            <Text style={styles.label}>Sursa: </Text>
            {header.source_location || "—"}{" "}
            <Text style={styles.label}>→ Destinație: </Text>
            {header.target_location || "—"}
          </Text>
          <Text>
            <Text style={styles.label}>Responsabil: </Text>
            {header.responsible || "—"}
          </Text>
          {header.notes ? (
            <Text>
              <Text style={styles.label}>Observații: </Text>
              {header.notes}
            </Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.colIngredient]}>Ingredient</Text>
            <Text style={[styles.th, styles.colUnit]}>UM</Text>
            <Text style={[styles.th, styles.colQty]}>Cantitate</Text>
            <Text style={[styles.th, styles.colCost]}>Cost unitar</Text>
            <Text style={[styles.th, styles.colValue]}>Valoare</Text>
          </View>
          {lines.map((l, idx) => (
            <View key={`${idx}-${l.ingredient_id || "row"}`} style={styles.tr}>
              <Text style={[styles.td, styles.colIngredient]}>{l.ingredient_name || "-"}</Text>
              <Text style={[styles.td, styles.colUnit]}>{l.unit || "-"}</Text>
              <Text style={[styles.td, styles.colQty]}>{fmt(l.quantity)}</Text>
              <Text style={[styles.td, styles.colCost]}>{fmt(l.cost_unit)}</Text>
              <Text style={[styles.td, styles.colValue]}>{fmt(l.value_total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <Text>
            <Text style={styles.label}>Total general: </Text>
            {fmt(totalValue)}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Predat de</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Primit de</Text>
            <View style={styles.footerLine} />
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.label}>Administrator</Text>
            <View style={styles.footerLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TransferPdfDocument;

export const exportTransferPdf = async (transferData) => {
  const instance = pdf(<TransferPdfDocument transfer={transferData} />);
  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);
  return { blob, url };
};


