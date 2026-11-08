import * as XLSX from "xlsx";

import type { RemoteWorkbookPayload } from "../data/workbook-types";
import type { Movement } from "../data/funel-data";

const normalize = (value: unknown) => String(value ?? "").trim();
const normalizeHeader = (value: unknown) => normalize(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

function isAllowedOneDriveUrl(input: string) {
  const url = new URL(input);
  const host = url.hostname.toLowerCase();
  return host === "1drv.ms" || host.endsWith(".1drv.ms") || host.endsWith("onedrive.live.com") || host.endsWith("sharepoint.com");
}

function toOneDriveCandidates(input: string) {
  const original = new URL(input);
  original.searchParams.set("download", "1");
  const encoded = Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return [original.toString(), `https://api.onedrive.com/v1.0/shares/u!${encoded}/root/content`];
}

async function downloadSharedWorkbook(input: string) {
  if (!isAllowedOneDriveUrl(input)) throw new Error("Pega un enlace compartido válido de OneDrive o SharePoint.");
  let lastError = "No se pudo descargar el archivo compartido.";
  for (const candidate of toOneDriveCandidates(input)) {
    try {
      const response = await fetch(candidate, { redirect: "follow", signal: AbortSignal.timeout(25_000) });
      if (!response.ok) {
        lastError = `OneDrive respondió ${response.status}.`;
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 4 || buffer.subarray(0, 2).toString() !== "PK") {
        lastError = "El enlace no devolvió un archivo XLSX descargable. Revisa que el vínculo permita ver o descargar el archivo.";
        continue;
      }
      return buffer;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }
  throw new Error(lastError);
}

function findHeaderRow(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.some((header) => header.includes("DN CELULAR")) && headers.some((header) => header === "FECHA");
  });
}

function headerIndex(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.some((alias) => header === alias || header.includes(alias)));
}

function normalizeDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }
  const text = normalize(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (match) {
    const [, first, second, year] = match;
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const day = firstNumber > 12 ? first : secondNumber > 12 ? second : second;
    const month = firstNumber > 12 ? second : secondNumber > 12 ? first : first;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return text.slice(0, 10);
}

function parseMovements(rows: unknown[][]): Movement[] {
  const rowIndex = findHeaderRow(rows);
  if (rowIndex === -1) return [];
  const rawHeaders = rows[rowIndex] ?? [];
  const headers = rawHeaders.map(normalizeHeader);
  const at = (aliases: string[]) => headerIndex(headers, aliases);
  const indices = {
    id: at(["ID REGISTRO", "ID"]),
    fecha: at(["FECHA"]),
    dnCelular: at(["DN CELULAR", "DN"]),
    servicio: at(["SERV. AL CLIENTE", "SERVICIO AL CLIENTE", "SERVICIO"]),
    operacion: at(["OPERACION", "OPERACIÓN"]),
    iccid: at(["ICCID"]),
    rfc: at(["RFC"]),
    folio: at(["ORDEN / FOLIO", "FOLIO", "ORDEN"]),
    canal: at(["CANAL ATENCION", "CANAL ATENCIÓN", "CANAL"]),
    modalidad: at(["MODALIDAD"]),
    codificado: at(["CODIFICADO"]),
    notas: at(["NOTAS", "OBSERVACIONES"]),
  } satisfies Record<keyof Movement, number>;
  return rows.slice(rowIndex + 1).map((row, index) => {
    const value = (key: keyof Movement) => indices[key] >= 0 ? normalize(row[indices[key]]) || null : null;
    const movement: Movement = {
      id: value("id") || `OPE-REMOTE-${String(index + 1).padStart(3, "0")}`,
      fecha: normalizeDate(row[indices.fecha]),
      dnCelular: value("dnCelular"),
      servicio: value("servicio"),
      operacion: value("operacion"),
      iccid: value("iccid"),
      rfc: value("rfc"),
      folio: value("folio"),
      canal: value("canal"),
      modalidad: value("modalidad"),
      codificado: value("codificado"),
      notas: value("notas"),
    };
    return movement;
  }).filter((movement) => Object.values(movement).some((value) => value));
}

function parseCatalogs(rows: unknown[][]) {
  const headerRow = rows.findIndex((row) => row.map(normalizeHeader).some((value) => value.includes("MACROSERVICIO")));
  if (headerRow < 0) return {};
  const headers = (rows[headerRow] ?? []).map(normalize);
  return headers.reduce<Record<string, string[]>>((catalogs, name, column) => {
    if (!name) return catalogs;
    const values = rows.slice(headerRow + 1).map((row) => normalize(row[column])).filter(Boolean);
    catalogs[name] = Array.from(new Set(values));
    return catalogs;
  }, {});
}

function parseSnapshot(rows: unknown[][]) {
  const meta: { fecha?: string; cac?: string; ejecutivo?: string } = {};
  const values: Record<string, string | null> = {};
  for (const row of rows) {
    const key = normalize(row[0]).toUpperCase();
    const label = normalize(row[1]);
    if (key === "FECHA") meta.fecha = normalizeDate(row[1]) ?? normalize(row[1]);
    if (key === "CAC") meta.cac = normalize(row[1]);
    if (key === "EJECUTIVO") meta.ejecutivo = normalize(row[1]);
    if (label) values[label] = row[2] === undefined || row[2] === "" ? null : normalize(row[2]);
  }
  return { meta, values };
}

export function parseWorkbookBuffer(buffer: Buffer, sourceUrl: string): RemoteWorkbookPayload {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: true });
  const sheetNames = workbook.SheetNames;
  const rowsBySheet = Object.fromEntries(sheetNames.map((name) => [name, XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, defval: null, raw: true })]));
  const movementSheet = sheetNames.find((name) => findHeaderRow(rowsBySheet[name] ?? []) >= 0);
  const catalogSheet = sheetNames.find((name) => (rowsBySheet[name] ?? []).some((row) => row.map(normalizeHeader).some((value) => value.includes("MACROSERVICIO"))));
  const dailySnapshots: RemoteWorkbookPayload["dailySnapshots"] = {};
  for (const name of sheetNames) {
    const snapshot = parseSnapshot(rowsBySheet[name] ?? []);
    if (Object.keys(snapshot.meta).length > 0) dailySnapshots[name] = snapshot;
  }
  return {
    sourceName: new URL(sourceUrl).hostname.includes("sharepoint") ? "Excel compartido de SharePoint" : "Excel compartido de OneDrive",
    sourceUrl,
    sourceUpdatedAt: new Date().toISOString(),
    sheetNames,
    movements: movementSheet ? parseMovements(rowsBySheet[movementSheet] ?? []) : [],
    catalogs: catalogSheet ? parseCatalogs(rowsBySheet[catalogSheet] ?? []) : {},
    dailySnapshots,
  };
}

export async function loadOneDriveWorkbook(sourceUrl: string): Promise<RemoteWorkbookPayload> {
  const buffer = await downloadSharedWorkbook(sourceUrl);
  return parseWorkbookBuffer(buffer, sourceUrl);
}
