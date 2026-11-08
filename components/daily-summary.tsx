import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { type DailySummary, formatDay, formatPercent } from "@/data/daily-summary";

const COLORS = { ink: "#1E2A32", muted: "#71808A", card: "#FFFFFF", line: "#232323", navy: "#355070", mint: "#6DCCB5", yellow: "#FFF200", green: "#22F000", blue: "#A9CFF4", red: "#F01818", purple: "#74128A", orange: "#FF9C18", lilac: "#DDA7F3" };

type Row = { label: string; count: number | string };

function TableSection({ title, color, rows }: { title: string; color: string; rows: Row[] }) {
  return (
    <View style={styles.tableSection}>
      <View style={[styles.sectionNameCell, { backgroundColor: color }]}><Text style={styles.sectionName}>{title}</Text></View>
      <View style={styles.sectionRows}>{rows.map((row) => <View key={row.label} style={styles.tableRow}><Text style={styles.rowLabel}>{row.label}</Text><Text style={styles.rowValue}>{row.count}</Text></View>)}</View>
    </View>
  );
}

export function DailySummaryView({ summary, dates, selectedDate, onSelectDate }: { summary: DailySummary | null; dates: string[]; selectedDate: string; onSelectDate: (date: string) => void }) {
  if (!summary) return <View style={styles.empty}><MaterialIcons name="event-note" size={32} color={COLORS.muted} /><Text style={styles.emptyTitle}>No hay fechas disponibles</Text><Text style={styles.emptyText}>Carga un Excel con registros que tengan fecha para generar el resumen diario.</Text></View>;
  const conversionRows = summary.conversion.map((item) => ({ label: item.label, count: formatPercent(item.count) }));
  return (
    <View style={styles.wrap}>
      <View style={styles.dateStrip}><Text style={styles.dateLabel}>DÍA DEL REPORTE</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>{dates.map((date) => <Pressable key={date} onPress={() => onSelectDate(date)} style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}><Text style={[styles.dateChipText, selectedDate === date && styles.dateChipTextActive]}>{formatDay(date)}</Text></Pressable>)}</ScrollView></View>
      <View style={styles.reportHeader}><View style={styles.headerCell}><Text style={styles.headerLabel}>FECHA</Text><Text style={styles.headerValue}>{formatDay(summary.date)}</Text></View><View style={styles.headerCell}><Text style={styles.headerLabel}>CAC</Text><Text style={styles.headerValue}>CAC OAXACA</Text></View><View style={styles.headerCell}><Text style={styles.headerLabel}>EJECUTIVO</Text><Text style={styles.headerValue}>{summary.executive}</Text></View><View style={styles.headerCell}><Text style={styles.headerLabel}>TIPO DE FLUJO</Text><Text style={styles.headerValue}>CORTE DIARIO</Text></View></View>
      <View style={styles.summaryStrip}><View><Text style={styles.summaryEyebrow}>TABLA OPERATIVA · {formatDay(summary.date)}</Text><Text style={styles.summaryTitle}>Resumen diario</Text></View><View style={styles.totalBadge}><Text style={styles.totalBadgeValue}>{summary.totalTransactions}</Text><Text style={styles.totalBadgeLabel}>TRANS.</Text></View></View>
      <View style={styles.tableWrap}>
        <TableSection title="ATENCIÓN GENERAL" color={COLORS.orange} rows={[{ label: "ATENCIÓN GENERAL · NO CUENTA TLMK", count: summary.attentionGeneral }]} />
        <TableSection title="TLMK" color={COLORS.yellow} rows={[...summary.tlmk, { label: "TRÁFICO TOTAL TLMK", count: summary.tlmkTotal }]} />
        <TableSection title="JUMP" color={COLORS.purple} rows={[{ label: "JUMP · REGISTROS HÍBRIDO", count: summary.jump }]} />
        <TableSection title="POS" color={COLORS.green} rows={summary.pos} />
        <TableSection title="TERMINALES" color={COLORS.blue} rows={summary.terminales} />
        <TableSection title="VENTAS" color={COLORS.red} rows={summary.ventas} />
        <TableSection title="INDICADORES" color={COLORS.blue} rows={summary.extras} />
        <TableSection title="TOTALES" color={COLORS.purple} rows={[{ label: "TOTAL TRANSACCIONES", count: summary.totalTransactions }, { label: "CLIENTES GESTIONADOS", count: summary.clientsManaged }, { label: "CITADOS", count: summary.cited }]} />
        <TableSection title="CONVERSIONES" color={COLORS.blue} rows={conversionRows} />
        <TableSection title="EFECTIVIDAD" color={COLORS.lilac} rows={[{ label: "EFECTIVIDAD", count: summary.clientsManaged ? formatPercent(summary.cited / summary.clientsManaged) : "0.00%" }]} />
      </View>
      <Text style={styles.footnote}>Los valores se recalculan desde las filas del día seleccionado. Atención general excluye TELEMARKETIN; TLMK se clasifica por monto y JUMP por HÍBRIDO.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 11 },
  dateStrip: { gap: 8 },
  dateLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  dateList: { gap: 7, paddingRight: 6 },
  dateChip: { paddingHorizontal: 12, minHeight: 32, borderRadius: 16, borderWidth: 1, borderColor: "#E5E2DA", backgroundColor: COLORS.card, justifyContent: "center" },
  dateChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  dateChipText: { color: COLORS.muted, fontSize: 11, fontWeight: "800" },
  dateChipTextActive: { color: "#FFFFFF" },
  reportHeader: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: "#8E8BF1", overflow: "hidden" },
  headerCell: { minHeight: 43, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(35,35,35,0.8)" },
  headerLabel: { color: COLORS.ink, width: 90, fontSize: 10, fontWeight: "900" },
  headerValue: { color: COLORS.ink, fontSize: 12, fontWeight: "800", flex: 1 },
  summaryStrip: { minHeight: 71, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.navy, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryEyebrow: { color: COLORS.mint, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  summaryTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 4 },
  totalBadge: { minWidth: 55, alignItems: "center", paddingVertical: 5, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.12)" },
  totalBadgeValue: { color: COLORS.mint, fontSize: 22, fontWeight: "900" },
  totalBadgeLabel: { color: "#D7E4E9", fontSize: 8, fontWeight: "900" },
  tableWrap: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card },
  tableSection: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.line, minHeight: 48 },
  sectionNameCell: { width: 92, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: COLORS.line },
  sectionName: { color: COLORS.ink, fontSize: 10, fontWeight: "900", textAlign: "center" },
  sectionRows: { flex: 1 },
  tableRow: { minHeight: 31, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#D5D5D5" },
  rowLabel: { color: COLORS.ink, fontSize: 10, fontWeight: "700", flex: 1 },
  rowValue: { color: COLORS.ink, fontSize: 12, fontWeight: "900", minWidth: 36, textAlign: "right" },
  footnote: { color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  empty: { alignItems: "center", padding: 34, borderRadius: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: "#E5E2DA", gap: 9 },
  emptyTitle: { color: COLORS.ink, fontSize: 17, fontWeight: "900" },
  emptyText: { color: COLORS.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
});
