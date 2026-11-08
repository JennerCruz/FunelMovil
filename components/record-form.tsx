import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CATALOGS, type Movement } from "@/data/funel-data";

const COLORS = {
  ink: "#1E2A32",
  muted: "#71808A",
  paper: "#F7F5F0",
  card: "#FFFFFF",
  line: "#E5E2DA",
  navy: "#355070",
  mint: "#6DCCB5",
  amber: "#D99A2B",
};

type FormState = {
  dnCelular: string;
  servicio: string;
  operacion: string;
  iccid: string;
  rfc: string;
  folio: string;
  canal: string;
  modalidad: string;
  notas: string;
};

const INITIAL_FORM: FormState = {
  dnCelular: "",
  servicio: "",
  operacion: "",
  iccid: "",
  rfc: "",
  folio: "",
  canal: "",
  modalidad: "",
  notas: "",
};

const serviceOperations: Record<string, string[]> = {
  VENTAS: CATALOGS.VENTAS ?? [],
  TELEMARKETIN: CATALOGS.TELEMARKETIN ?? [],
  SIM: CATALOGS.SIM ?? [],
  "Gestión Financiera": CATALOGS["Gestión Financiera"] ?? [],
};

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(active ? "" : option)}
              style={[styles.choice, active && styles.choiceActive]}
            >
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function RecordForm({
  visible,
  onClose,
  onSave,
  catalogs = CATALOGS,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (movement: Omit<Movement, "id" | "fecha" | "codificado">) => void;
  catalogs?: Record<string, string[]>;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState("");

  const operations = useMemo(() => catalogs[form.servicio] ?? serviceOperations[form.servicio] ?? [], [catalogs, form.servicio]);
  const services = catalogs["Área / Macroservicio"] ?? [];
  const channels = catalogs["Canales General"] ?? [];
  const modalities = catalogs.Modalidad ?? [];

  const update = (key: keyof FormState, value: string) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "servicio") setForm((current) => ({ ...current, servicio: value, operacion: "" }));
  };

  const resetAndClose = () => {
    setForm(INITIAL_FORM);
    setError("");
    onClose();
  };

  const handleSave = () => {
    const dn = form.dnCelular.replace(/\D/g, "");
    if (dn.length !== 10) {
      setError("Captura un DN celular de 10 dígitos.");
      return;
    }
    if (!form.servicio || !form.operacion) {
      setError("Selecciona el área y la operación para continuar.");
      return;
    }
    onSave({ ...form, dnCelular: dn });
    setForm(INITIAL_FORM);
    setError("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetAndClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.eyebrow}>CAPTURA LOCAL</Text>
              <Text style={styles.title}>Nuevo movimiento</Text>
            </View>
            <Pressable accessibilityLabel="Cerrar formulario" onPress={resetAndClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={22} color={COLORS.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DN celular <Text style={styles.required}>*</Text></Text>
              <TextInput
                value={form.dnCelular}
                onChangeText={(value) => update("dnCelular", value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Ej. 9511234567"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <ChoiceRow label="Área / macroservicio *" options={services} value={form.servicio} onChange={(value) => update("servicio", value)} />
            {operations.length > 0 ? <ChoiceRow label="Operación *" options={operations} value={form.operacion} onChange={(value) => update("operacion", value)} /> : null}
            <ChoiceRow label="Canal de atención" options={channels} value={form.canal} onChange={(value) => update("canal", value)} />
            <ChoiceRow label="Modalidad" options={modalities} value={form.modalidad} onChange={(value) => update("modalidad", value)} />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.label}>ICCID</Text>
                <TextInput value={form.iccid} onChangeText={(value) => update("iccid", value)} placeholder="Opcional" placeholderTextColor={COLORS.muted} style={styles.input} autoCapitalize="characters" />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Orden / folio</Text>
                <TextInput value={form.folio} onChangeText={(value) => update("folio", value)} placeholder="Opcional" placeholderTextColor={COLORS.muted} style={styles.input} />
              </View>
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.label}>RFC</Text>
                <TextInput value={form.rfc} onChangeText={(value) => update("rfc", value)} placeholder="Opcional" placeholderTextColor={COLORS.muted} style={styles.input} autoCapitalize="characters" />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Codificado</Text>
                <View style={styles.locked}><MaterialIcons name="check-circle" size={16} color={COLORS.mint} /><Text style={styles.lockedText}>SI · automático</Text></View>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notas / observaciones</Text>
              <TextInput value={form.notas} onChangeText={(value) => update("notas", value)} placeholder="Añade contexto para el siguiente seguimiento" placeholderTextColor={COLORS.muted} style={[styles.input, styles.textarea]} multiline numberOfLines={3} textAlignVertical="top" />
            </View>
            {error ? <View style={styles.errorBox}><MaterialIcons name="error-outline" size={18} color="#A64737" /><Text style={styles.errorText}>{error}</Text></View> : null}
            <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
              <MaterialIcons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>Guardar en esta sesión</Text>
            </Pressable>
            <Text style={styles.helper}>El archivo XLSX original se conserva; esta captura actualiza la vista local de la app.</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20, 31, 38, 0.42)" },
  sheet: { maxHeight: "94%", backgroundColor: COLORS.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  content: { padding: 20, paddingBottom: 34, gap: 17 },
  eyebrow: { color: COLORS.navy, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: COLORS.ink, fontSize: 25, fontWeight: "800", marginTop: 3 },
  closeButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: COLORS.card },
  fieldGroup: { gap: 8 },
  label: { color: COLORS.ink, fontSize: 13, fontWeight: "700" },
  required: { color: COLORS.amber },
  input: { minHeight: 46, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 13, color: COLORS.ink, backgroundColor: COLORS.card, fontSize: 14 },
  textarea: { minHeight: 82, paddingTop: 12 },
  choiceRow: { gap: 8, paddingRight: 10 },
  choice: { paddingHorizontal: 12, minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card },
  choiceActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  choiceText: { color: COLORS.muted, fontSize: 12, fontWeight: "600" },
  choiceTextActive: { color: "#FFFFFF" },
  twoColumns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, gap: 8 },
  locked: { minHeight: 46, borderRadius: 12, backgroundColor: "#E7F4EF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  lockedText: { color: COLORS.navy, fontSize: 12, fontWeight: "700" },
  errorBox: { flexDirection: "row", gap: 8, alignItems: "center", padding: 12, borderRadius: 12, backgroundColor: "#FBECE8" },
  errorText: { flex: 1, color: "#A64737", fontSize: 12, fontWeight: "600" },
  saveButton: { minHeight: 52, borderRadius: 15, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9, marginTop: 2 },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  helper: { color: COLORS.muted, fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: 8 },
  pressed: { opacity: 0.8 },
});
