import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import type { Movement } from "@/data/funel-data";

const COLORS = {
  ink: "#1E2A32",
  muted: "#71808A",
  paper: "#F7F5F0",
  card: "#FFFFFF",
  line: "#E5E2DA",
  navy: "#355070",
  mint: "#6DCCB5",
};

const fields: { key: keyof Movement; label: string; wide?: boolean }[] = [
  { key: "fecha", label: "Fecha" },
  { key: "dnCelular", label: "DN celular" },
  { key: "servicio", label: "Servicio al cliente" },
  { key: "operacion", label: "Operación" },
  { key: "iccid", label: "ICCID" },
  { key: "rfc", label: "RFC" },
  { key: "folio", label: "Orden / folio" },
  { key: "canal", label: "Canal de atención" },
  { key: "modalidad", label: "Modalidad" },
  { key: "codificado", label: "Codificado" },
  { key: "notas", label: "Notas / observaciones", wide: true },
];

export function RecordDetail({ movement, onClose }: { movement: Movement | null; onClose: () => void }) {
  if (!movement) return null;
  return (
    <Modal visible={Boolean(movement)} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>DETALLE DE GESTIÓN</Text>
              <Text style={styles.id}>{movement.id}</Text>
              <Text style={styles.subtitle}>{movement.dnCelular ? `Línea ${movement.dnCelular}` : "Sin DN capturado"}</Text>
            </View>
            <Pressable accessibilityLabel="Cerrar detalle" onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={22} color={COLORS.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{movement.codificado === "SI" ? "Registro codificado" : "Pendiente de codificar"}</Text>
              <Text style={styles.sourceText}>XLSX LOCAL</Text>
            </View>
            <View style={styles.grid}>
              {fields.map(({ key, label, wide }) => {
                const value = movement[key];
                return (
                  <View key={key} style={[styles.field, wide && styles.fieldWide]}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={[styles.value, !value && styles.empty]}>{value || "Sin dato"}</Text>
                  </View>
                );
              })}
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.doneButton, pressed && { opacity: 0.8 }]}>
              <Text style={styles.doneText}>Volver al archivo</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20, 31, 38, 0.42)" },
  sheet: { maxHeight: "91%", backgroundColor: COLORS.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 22, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  headerCopy: { flex: 1 },
  eyebrow: { color: COLORS.navy, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  id: { color: COLORS.ink, fontSize: 27, fontWeight: "900", marginTop: 3 },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  closeButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: COLORS.card },
  content: { padding: 20, paddingBottom: 35 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingBottom: 18 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.mint },
  statusText: { color: COLORS.navy, fontSize: 12, fontWeight: "700", flex: 1 },
  sourceText: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  field: { width: "48%", minHeight: 67, padding: 12, borderRadius: 13, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },
  fieldWide: { width: "100%" },
  label: { color: COLORS.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  value: { color: COLORS.ink, fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 6 },
  empty: { color: "#A7B0B4", fontWeight: "500", fontStyle: "italic" },
  doneButton: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: COLORS.navy, alignItems: "center", justifyContent: "center", marginTop: 20 },
  doneText: { color: COLORS.navy, fontSize: 14, fontWeight: "800" },
});
