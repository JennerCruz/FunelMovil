import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DailySummaryView } from "@/components/daily-summary";
import { PortalBrowser } from "@/components/portal-browser";
import { RecordDetail } from "@/components/record-detail";
import { RecordForm } from "@/components/record-form";
import { ScreenContainer } from "@/components/screen-container";
import {
  BILLING_CYCLES,
  CATALOGS,
  DAILY_SNAPSHOTS,
  getFreshMetrics,
  MOVEMENTS,
  SOURCE_FILE,
  SOURCE_SHEETS,
  START_COMMENTS,
  START_LINKS,
  type Movement,
  uniqueValues,
} from "@/data/funel-data";
import { availableDates, buildDailySummary } from "@/data/daily-summary";
import type { RemoteWorkbookPayload } from "@/data/workbook-types";
import { apiCall } from "@/lib/_core/api";

type ViewMode = "resumen" | "movimientos" | "diario" | "catalogos" | "navegador";
const ONEDRIVE_LINK_KEY = "funel:onedrive-shared-link";

const COLORS = {
  ink: "#1E2A32",
  muted: "#71808A",
  paper: "#F7F5F0",
  card: "#FFFFFF",
  line: "#E5E2DA",
  navy: "#355070",
  navySoft: "#E9EEF2",
  mint: "#6DCCB5",
  mintSoft: "#E7F4EF",
  amber: "#D99A2B",
  amberSoft: "#FFF4DD",
};

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${day} ${months[Number(month) - 1] ?? month} ${year.slice(2)}`;
}

function cleanMetric(value: string | null | undefined) {
  if (!value || value === "#DIV/0!") return "—";
  if (value === "0") return "0";
  return value;
}

function SegmentButton({ mode, active, icon, label, onPress }: { mode: ViewMode; active: ViewMode; icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; onPress: (mode: ViewMode) => void }) {
  const selected = mode === active;
  return (
    <Pressable onPress={() => onPress(mode)} style={[styles.segment, selected && styles.segmentActive]}>
      <MaterialIcons name={icon} size={16} color={selected ? COLORS.navy : COLORS.muted} />
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value, accent = COLORS.navy, suffix }: { label: string; value: string | number; accent?: string; suffix?: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricMark, { backgroundColor: accent }]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}<Text style={styles.metricSuffix}>{suffix}</Text></Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      {active ? <MaterialIcons name="check" size={13} color="#FFFFFF" /> : null}
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MovementCard({ movement, onPress }: { movement: Movement; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.movementCard, pressed && styles.pressed]}>
      <View style={[styles.movementRail, { backgroundColor: movement.codificado === "SI" ? COLORS.mint : COLORS.amber }]} />
      <View style={styles.movementMain}>
        <View style={styles.movementTopline}>
          <Text style={styles.movementId}>{movement.id}</Text>
          <Text style={styles.movementDate}>{formatDate(movement.fecha)}</Text>
        </View>
        <Text style={styles.movementDn}>{movement.dnCelular || "DN no capturado"}</Text>
        <View style={styles.movementMeta}>
          <Text style={styles.movementService}>{movement.servicio || "Sin servicio"}</Text>
          <Text style={styles.movementOperation}>{movement.operacion || "Operación pendiente"}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#AAB2B5" />
    </Pressable>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction ? <Pressable onPress={onAction}><Text style={styles.actionText}>{action}</Text></Pressable> : null}
    </View>
  );
}

export default function HomeScreen() {
  const [view, setView] = useState<ViewMode>("resumen");
  const [records, setRecords] = useState<Movement[]>(MOVEMENTS);
  const [catalogs, setCatalogs] = useState<Record<string, string[]>>(CATALOGS);
  const [sourceFile, setSourceFile] = useState(SOURCE_FILE);
  const [sourceSheets, setSourceSheets] = useState<string[]>([...SOURCE_SHEETS]);
  const [dailySnapshots, setDailySnapshots] = useState(DAILY_SNAPSHOTS);
  const [oneDriveLink, setOneDriveLink] = useState("");
  const [sourceStatus, setSourceStatus] = useState("Fuente local activa");
  const [sourceLoading, setSourceLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [detail, setDetail] = useState<Movement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const dates = useMemo(() => availableDates(records), [records]);
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const effectiveSelectedDate = dates.includes(selectedDate) ? selectedDate : (dates[0] ?? "");

  const metrics = useMemo(() => getFreshMetrics(records), [records]);
  const services = useMemo(() => uniqueValues("servicio", records), [records]);
  const operations = useMemo(() => uniqueValues("operacion", records), [records]);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRecords = useMemo(() => records.filter((record) => {
    const matchesSearch = !normalizedSearch || Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
    const matchesService = !serviceFilter || record.servicio === serviceFilter;
    const matchesOperation = !operationFilter || record.operacion === operationFilter;
    return matchesSearch && matchesService && matchesOperation;
  }), [normalizedSearch, operationFilter, records, serviceFilter]);

  const recent = useMemo(() => [...records].reverse().slice(0, 5), [records]);
  const daily = dailySnapshots.Hoja1;
  const dailySummary = useMemo(() => effectiveSelectedDate ? buildDailySummary(records, effectiveSelectedDate) : null, [effectiveSelectedDate, records]);

  const applyWorkbook = useCallback((payload: RemoteWorkbookPayload) => {
    setRecords(payload.movements);
    setCatalogs(Object.keys(payload.catalogs).length > 0 ? payload.catalogs : CATALOGS);
    setSourceFile(payload.sourceName);
    setSourceSheets(payload.sheetNames);
    setDailySnapshots(Object.keys(payload.dailySnapshots).length > 0 ? payload.dailySnapshots : DAILY_SNAPSHOTS);
    setLastSynced(payload.sourceUpdatedAt);
    setSourceStatus(`Sincronizado · ${payload.movements.length} filas`);
  }, []);

  const loadSharedWorkbook = useCallback(async (link = oneDriveLink, quiet = false) => {
    const trimmedLink = link.trim();
    if (!trimmedLink) {
      setSourceStatus("Pega un enlace compartido de OneDrive");
      return;
    }
    setSourceLoading(true);
    if (!quiet) setSourceStatus("Descargando archivo de OneDrive…");
    try {
      const payload = await apiCall<RemoteWorkbookPayload>("/api/onedrive/load", { method: "POST", body: JSON.stringify({ url: trimmedLink }) });
      await AsyncStorage.setItem(ONEDRIVE_LINK_KEY, trimmedLink);
      setOneDriveLink(trimmedLink);
      applyWorkbook(payload);
    } catch (error) {
      setSourceStatus(error instanceof Error ? error.message : "No se pudo sincronizar el archivo");
    } finally {
      setSourceLoading(false);
    }
  }, [applyWorkbook, oneDriveLink]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ONEDRIVE_LINK_KEY).then((savedLink) => {
      if (active && savedLink) {
        setOneDriveLink(savedLink);
        void loadSharedWorkbook(savedLink, true);
      }
    });
    return () => { active = false; };
  }, [loadSharedWorkbook]);

  useEffect(() => {
    if (!oneDriveLink) return undefined;
    const interval = setInterval(() => { void loadSharedWorkbook(oneDriveLink, true); }, 60_000);
    return () => clearInterval(interval);
  }, [loadSharedWorkbook, oneDriveLink]);

  const addMovement = (draft: Omit<Movement, "id" | "fecha" | "codificado">) => {
    const localCount = records.filter((record) => record.id.startsWith("OPE-LOCAL")).length + 1;
    const next: Movement = {
      ...draft,
      id: `OPE-LOCAL-${String(localCount).padStart(3, "0")}`,
      fecha: new Date().toISOString().slice(0, 10),
      codificado: "SI",
    };
    setRecords((current) => [next, ...current]);
    setView("movimientos");
    setFormVisible(false);
  };

  const clearFilters = () => {
    setSearch("");
    setServiceFilter("");
    setOperationFilter("");
  };

  return (
    <ScreenContainer containerClassName="bg-[#F7F5F0]" safeAreaClassName="bg-[#F7F5F0]">
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brand}>funel.</Text>
            <View style={styles.sourceTag}><Text style={styles.sourceTagText}>XLSX LOCAL</Text></View>
          </View>
          <Pressable onPress={() => setFormVisible(true)} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}>
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Nuevo</Text>
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View style={styles.greetingCopy}>
            <Text style={styles.kicker}>ARCHIVO OPERATIVO</Text>
            <Text style={styles.title}>Encuentra la línea.{"\n"}<Text style={styles.titleAccent}>Sigue la gestión.</Text></Text>
          </View>
          <View style={styles.fileStamp}>
            <MaterialIcons name="description" size={20} color={COLORS.navy} />
            <Text style={styles.fileStampText}>{records.length} filas</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color={COLORS.navy} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Busca por DN, folio, ICCID o nombre" placeholderTextColor={COLORS.muted} style={styles.searchInput} returnKeyType="search" />
          {search ? <Pressable onPress={() => setSearch("")}><MaterialIcons name="cancel" size={18} color={COLORS.muted} /></Pressable> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentBar}>
          <SegmentButton mode="resumen" active={view} icon="space-dashboard" label="Resumen" onPress={setView} />
          <SegmentButton mode="movimientos" active={view} icon="format-list-bulleted" label="Movimientos" onPress={setView} />
          <SegmentButton mode="diario" active={view} icon="today" label="Diario" onPress={setView} />
          <SegmentButton mode="catalogos" active={view} icon="tune" label="Catálogos" onPress={setView} />
          <SegmentButton mode="navegador" active={view} icon="language" label="Navegador" onPress={setView} />
        </ScrollView>

        {view === "resumen" ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>HOY · {daily?.meta?.cac ?? "CAC OAXACA"}</Text>
                <Text style={styles.heroTitle}>Control de operaciones</Text>
                <Text style={styles.heroDescription}>Consulta movimientos, identifica pendientes y registra la siguiente gestión sin salir del archivo.</Text>
              </View>
              <View style={styles.heroMark}><Text style={styles.heroMarkTop}>06</Text><Text style={styles.heroMarkBottom}>NOV</Text></View>
            </View>

            <SectionTitle eyebrow="LECTURA RÁPIDA" title="Estado de la base" action="Ver movimientos" onAction={() => setView("movimientos")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
              <MetricCard label="Movimientos" value={metrics.total} accent={COLORS.navy} />
              <MetricCard label="Con DN" value={metrics.conDn} accent={COLORS.mint} />
              <MetricCard label="Codificados" value={metrics.codificados} accent={COLORS.mint} />
              <MetricCard label="Telemarketing" value={metrics.telemarketing} accent={COLORS.amber} />
              <MetricCard label="Ventas" value={metrics.ventas} accent="#9E6A8A" />
            </ScrollView>

            <View style={styles.snapshotCard}>
              <View style={styles.snapshotHeader}>
                <View><Text style={styles.snapshotEyebrow}>HOJA1 · CORTE DIARIO</Text><Text style={styles.snapshotTitle}>{daily?.meta?.ejecutivo ?? "Eduardo Luis Cruz"}</Text></View>
                <Text style={styles.snapshotDate}>{formatDate(daily?.meta?.fecha ?? null)}</Text>
              </View>
              <View style={styles.snapshotGrid}>
                <View style={styles.snapshotItem}><Text style={styles.snapshotLabel}>Atenciones</Text><Text style={styles.snapshotValue}>{cleanMetric(daily?.values?.["TOTAL ATENCIONES"])}</Text></View>
                <View style={styles.snapshotItem}><Text style={styles.snapshotLabel}>TLMK $100</Text><Text style={styles.snapshotValue}>{cleanMetric(daily?.values?.["TLMK $100"])}</Text></View>
                <View style={styles.snapshotItem}><Text style={styles.snapshotLabel}>Conversión POS</Text><Text style={styles.snapshotValue}>{cleanMetric(daily?.values?.["CONVERSION POS"])}<Text style={styles.snapshotSuffix}>%</Text></Text></View>
                <View style={styles.snapshotItem}><Text style={styles.snapshotLabel}>Citados</Text><Text style={styles.snapshotValue}>{cleanMetric(daily?.values?.CITADOS)}</Text></View>
              </View>
            </View>

            <SectionTitle eyebrow="ÚLTIMAS CAPTURAS" title="Actividad reciente" action="Abrir todo" onAction={() => setView("movimientos")} />
            <View style={styles.listStack}>{recent.map((movement) => <MovementCard key={`${movement.id}-${movement.dnCelular}`} movement={movement} onPress={() => setDetail(movement)} />)}</View>
          </>
        ) : null}

        {view === "movimientos" ? (
          <>
            <SectionTitle eyebrow="BASE_Datos_Movimientos" title={`${filteredRecords.length} movimientos`} action={serviceFilter || operationFilter ? "Limpiar" : undefined} onAction={clearFilters} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
              <FilterChip label="Todos" active={!serviceFilter && !operationFilter} onPress={clearFilters} />
              {services.map((service) => <FilterChip key={service} label={service} active={serviceFilter === service} onPress={() => { setServiceFilter(serviceFilter === service ? "" : service); setOperationFilter(""); }} />)}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRowSecondary}>
              <Text style={styles.filterLabel}>Operación</Text>
              {operations.slice(0, 10).map((operation) => <FilterChip key={operation} label={operation} active={operationFilter === operation} onPress={() => setOperationFilter(operationFilter === operation ? "" : operation)} />)}
            </ScrollView>
            <View style={styles.resultHint}><MaterialIcons name="info-outline" size={16} color={COLORS.navy} /><Text style={styles.resultHintText}>Toca una fila para ver el expediente completo.</Text></View>
            <View style={styles.listStack}>
              {filteredRecords.map((movement) => <MovementCard key={`${movement.id}-${movement.dnCelular}-${movement.folio}`} movement={movement} onPress={() => setDetail(movement)} />)}
              {filteredRecords.length === 0 ? <View style={styles.emptyState}><MaterialIcons name="search-off" size={30} color={COLORS.muted} /><Text style={styles.emptyTitle}>No encontramos ese movimiento</Text><Text style={styles.emptyText}>Prueba con otro DN o limpia los filtros para regresar a la base completa.</Text><Pressable onPress={clearFilters} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Limpiar búsqueda</Text></Pressable></View> : null}
            </View>
          </>
        ) : null}

        {view === "diario" ? (
          <>
            <SectionTitle eyebrow="HOJA DIARIA" title="Resumen por día" />
            <Text style={styles.introText}>El conteo se recalcula desde la fuente activa. Atención general excluye TELEMARKETIN; TLMK se separa por monto y JUMP cuenta registros con HÍBRIDO.</Text>
            <DailySummaryView summary={dailySummary} dates={dates} selectedDate={effectiveSelectedDate} onSelectDate={setSelectedDate} />
          </>
        ) : null}

        {view === "navegador" ? (
          <>
            <SectionTitle eyebrow="PORTAL OPERATIVO" title="Navegador" />
            <PortalBrowser />
          </>
        ) : null}

        {view === "catalogos" ? (
          <>
            <SectionTitle eyebrow="CONFIG_CATALOGOS" title="Menús maestros" />
            <Text style={styles.introText}>Estos valores alimentan los selectores del registro y conservan la lógica de menús del archivo original.</Text>
            <View style={styles.catalogStack}>
              {Object.entries(catalogs).map(([name, values]) => (
                <View key={name} style={styles.catalogCard}>
                  <View style={styles.catalogHeader}><Text style={styles.catalogName}>{name}</Text><Text style={styles.catalogCount}>{values.length} valores</Text></View>
                  <View style={styles.catalogValues}>{values.map((value) => <View key={value} style={styles.catalogPill}><Text style={styles.catalogPillText}>{value}</Text></View>)}</View>
                </View>
              ))}
            </View>
            <View style={styles.sourceCard}>
              <Text style={styles.snapshotEyebrow}>FUENTE Y ESTRUCTURA</Text>
              <Text style={styles.sourceTitle}>{sourceFile}</Text>
              <Text style={styles.sourceDescription}>{oneDriveLink ? "Fuente remota activa: la app revisa el vínculo compartido cada minuto." : "La app usa una extracción local del libro hasta que conectes un vínculo compartido."}</Text>
              <View style={styles.sheetList}>{sourceSheets.map((sheet, index) => <View key={sheet} style={styles.sheetRow}><Text style={styles.sheetNumber}>{String(index + 1).padStart(2, "0")}</Text><Text style={styles.sheetName}>{sheet}</Text><MaterialIcons name="check-circle" size={16} color={COLORS.mint} /></View>)}</View>
            </View>
            <View style={styles.connectCard}>
              <View style={styles.connectHeader}><View><Text style={styles.snapshotEyebrow}>ONEDRIVE / SHAREPOINT</Text><Text style={styles.connectTitle}>Usar otro Excel</Text></View><MaterialIcons name="link" size={22} color={COLORS.mint} /></View>
              <Text style={styles.connectDescription}>Pega el vínculo compartido del archivo. Al sincronizar, los movimientos, catálogos y resumen diario se recalculan con ese libro.</Text>
              <TextInput value={oneDriveLink} onChangeText={setOneDriveLink} placeholder="https://1drv.ms/x/s!..." placeholderTextColor="#A9BCC3" autoCapitalize="none" autoCorrect={false} style={styles.linkInput} />
              <View style={styles.connectActions}>
                <Pressable onPress={() => void loadSharedWorkbook()} disabled={sourceLoading} style={({ pressed }) => [styles.syncButton, pressed && styles.pressed, sourceLoading && styles.disabledButton]}>{sourceLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="sync" size={17} color="#FFFFFF" />}<Text style={styles.syncButtonText}>{sourceLoading ? "Sincronizando…" : "Cargar y sincronizar"}</Text></Pressable>
                {oneDriveLink ? <Pressable onPress={async () => { await AsyncStorage.removeItem(ONEDRIVE_LINK_KEY); setOneDriveLink(""); setRecords(MOVEMENTS); setCatalogs(CATALOGS); setSourceFile(SOURCE_FILE); setSourceSheets([...SOURCE_SHEETS]); setDailySnapshots(DAILY_SNAPSHOTS); setLastSynced(null); setSourceStatus("Fuente local activa"); }} style={styles.localButton}><Text style={styles.localButtonText}>Volver a local</Text></Pressable> : null}
              </View>
              <Text style={styles.syncStatus}>{sourceStatus}{lastSynced ? ` · ${new Date(lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</Text>
            </View>
            <View style={styles.startCard}>
              <Text style={styles.snapshotEyebrow}>INICIO · ACCESOS</Text>
              <View style={styles.startLinks}>{START_LINKS.slice(0, 6).map((link) => <Text key={link} style={styles.startLink}>↗ {link}</Text>)}</View>
              <View style={styles.cycleRow}><Text style={styles.cycleTitle}>Ciclos de factura</Text><Text style={styles.cycleValue}>{BILLING_CYCLES.length} cortes configurados</Text></View>
              <View style={styles.commentRow}>{START_COMMENTS.filter((item) => item.activo).map((item) => <View key={item.nombre} style={styles.commentPill}><View style={styles.commentDot} /><Text style={styles.commentText}>{item.nombre}</Text></View>)}</View>
            </View>
          </>
        ) : null}
      </ScrollView>
      <RecordForm visible={formVisible} catalogs={catalogs} onClose={() => setFormVisible(false)} onSave={addMovement} />
      <RecordDetail movement={detail} onClose={() => setDetail(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 42, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.mint },
  brand: { color: COLORS.ink, fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
  sourceTag: { marginLeft: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.navySoft },
  sourceTagText: { color: COLORS.navy, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  newButton: { minHeight: 38, paddingHorizontal: 13, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: COLORS.navy },
  newButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  greetingRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 },
  greetingCopy: { flex: 1 },
  kicker: { color: COLORS.navy, fontSize: 10, fontWeight: "900", letterSpacing: 1.7, marginBottom: 6 },
  title: { color: COLORS.ink, fontSize: 31, lineHeight: 32, fontWeight: "900", letterSpacing: -1.1 },
  titleAccent: { color: COLORS.navy },
  fileStamp: { alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card, gap: 4 },
  fileStampText: { color: COLORS.muted, fontSize: 10, fontWeight: "800" },
  searchBox: { minHeight: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 9, borderRadius: 15, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },
  searchInput: { flex: 1, color: COLORS.ink, fontSize: 14, paddingVertical: 4 },
  segmentBar: { flexDirection: "row", backgroundColor: "#ECE9E2", borderRadius: 13, padding: 4, gap: 3 },
  segment: { flex: 1, minHeight: 38, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  segmentActive: { backgroundColor: COLORS.card, shadowColor: "#22313A", shadowOpacity: 0.07, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segmentText: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  segmentTextActive: { color: COLORS.navy, fontWeight: "900" },
  heroCard: { minHeight: 156, padding: 20, borderRadius: 20, backgroundColor: COLORS.navy, flexDirection: "row", overflow: "hidden" },
  heroCopy: { flex: 1, paddingRight: 8 },
  heroEyebrow: { color: COLORS.mint, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  heroTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", marginTop: 12 },
  heroDescription: { color: "#D7E4E9", fontSize: 12, lineHeight: 17, marginTop: 8, maxWidth: 260 },
  heroMark: { width: 64, height: 72, marginTop: 6, borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.22)", paddingLeft: 14, justifyContent: "center" },
  heroMarkTop: { color: COLORS.mint, fontSize: 31, lineHeight: 31, fontWeight: "900" },
  heroMarkBottom: { color: "#D7E4E9", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 },
  eyebrow: { color: COLORS.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  sectionTitle: { color: COLORS.ink, fontSize: 21, fontWeight: "900", marginTop: 3, letterSpacing: -0.4 },
  actionText: { color: COLORS.navy, fontSize: 12, fontWeight: "800", paddingBottom: 2 },
  metricsRow: { gap: 10, paddingRight: 4 },
  metricCard: { width: 118, minHeight: 106, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card },
  metricMark: { width: 22, height: 4, borderRadius: 2, marginBottom: 12 },
  metricLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700", lineHeight: 14 },
  metricValue: { color: COLORS.ink, fontSize: 27, lineHeight: 29, fontWeight: "900", marginTop: 5 },
  metricSuffix: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  snapshotCard: { padding: 16, borderRadius: 17, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },
  snapshotHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  snapshotEyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  snapshotTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "900", marginTop: 4 },
  snapshotDate: { color: COLORS.navy, fontSize: 11, fontWeight: "800" },
  snapshotGrid: { flexDirection: "row", flexWrap: "wrap", paddingTop: 14, rowGap: 15 },
  snapshotItem: { width: "50%" },
  snapshotLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  snapshotValue: { color: COLORS.ink, fontSize: 21, fontWeight: "900", marginTop: 4 },
  snapshotSuffix: { color: COLORS.muted, fontSize: 12 },
  listStack: { gap: 9 },
  movementCard: { minHeight: 84, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 15, overflow: "hidden", paddingRight: 11 },
  movementRail: { width: 5, alignSelf: "stretch" },
  movementMain: { flex: 1, padding: 13, paddingLeft: 14 },
  movementTopline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  movementId: { color: COLORS.navy, fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  movementDate: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  movementDn: { color: COLORS.ink, fontSize: 17, fontWeight: "900", marginTop: 4, letterSpacing: 0.3 },
  movementMeta: { flexDirection: "row", gap: 7, alignItems: "center", marginTop: 4 },
  movementService: { color: COLORS.navy, fontSize: 10, fontWeight: "900" },
  movementOperation: { color: COLORS.muted, fontSize: 10, flex: 1 },
  filtersRow: { gap: 7, paddingRight: 6 },
  filtersRowSecondary: { gap: 7, paddingRight: 6, alignItems: "center" },
  filterLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "800", marginRight: 2 },
  filterChip: { minHeight: 32, paddingHorizontal: 11, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card, flexDirection: "row", alignItems: "center", gap: 4 },
  filterChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  filterText: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "800" },
  resultHint: { paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 6 },
  resultHintText: { color: COLORS.muted, fontSize: 11 },
  emptyState: { alignItems: "center", padding: 30, borderRadius: 17, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card, gap: 8 },
  emptyTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "900", marginTop: 3 },
  emptyText: { color: COLORS.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  emptyButton: { paddingHorizontal: 15, paddingVertical: 10, marginTop: 5, borderRadius: 10, backgroundColor: COLORS.navySoft },
  emptyButtonText: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  introText: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: -8 },
  catalogStack: { gap: 10 },
  catalogCard: { padding: 15, borderRadius: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },
  catalogHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 },
  catalogName: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
  catalogCount: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  catalogValues: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  catalogPill: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: COLORS.navySoft },
  catalogPillText: { color: COLORS.navy, fontSize: 11, fontWeight: "700" },
  sourceCard: { padding: 16, borderRadius: 17, backgroundColor: COLORS.navy },
  sourceTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", marginTop: 6 },
  sourceDescription: { color: "#D7E4E9", fontSize: 12, lineHeight: 17, marginTop: 7 },
  sheetList: { gap: 9, marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  sheetNumber: { color: COLORS.mint, fontSize: 10, fontWeight: "900", width: 20 },
  sheetName: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", flex: 1 },
  startCard: { padding: 16, borderRadius: 17, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },
  startLinks: { gap: 8, marginTop: 12 },
  startLink: { color: COLORS.navy, fontSize: 12, fontWeight: "700" },
  cycleRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: COLORS.line },
  cycleTitle: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  cycleValue: { color: COLORS.muted, fontSize: 11 },
  commentRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  commentPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, backgroundColor: COLORS.mintSoft },
  commentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.mint },
  commentText: { color: COLORS.navy, fontSize: 10, fontWeight: "800" },
  connectCard: { padding: 16, borderRadius: 17, backgroundColor: "#2A4657", borderWidth: 1, borderColor: "#496578" },
  connectHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  connectTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 5 },
  connectDescription: { color: "#D7E4E9", fontSize: 12, lineHeight: 17, marginTop: 8 },
  linkInput: { minHeight: 45, marginTop: 13, paddingHorizontal: 12, borderRadius: 11, backgroundColor: "#FFFFFF", color: COLORS.ink, fontSize: 12 },
  connectActions: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  syncButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 11, backgroundColor: COLORS.mint, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, flex: 1 },
  disabledButton: { opacity: 0.65 },
  syncButtonText: { color: COLORS.navy, fontSize: 11, fontWeight: "900" },
  localButton: { minHeight: 42, paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: "#7691A0", alignItems: "center", justifyContent: "center" },
  localButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  syncStatus: { color: "#A9BCC3", fontSize: 10, marginTop: 9 },
  pressed: { opacity: 0.78 },
});
