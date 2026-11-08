import type { Movement } from "./funel-data";

export type SummaryLine = { label: string; count: number };

export type DailySummary = {
  date: string;
  executive: string;
  attentionGeneral: number;
  tlmk: SummaryLine[];
  tlmkTotal: number;
  jump: number;
  pos: SummaryLine[];
  terminales: SummaryLine[];
  ventas: SummaryLine[];
  extras: SummaryLine[];
  totalTransactions: number;
  clientsManaged: number;
  cited: number;
  conversion: SummaryLine[];
};

const textOf = (movement: Movement) => Object.values(movement).filter(Boolean).join(" ").toUpperCase();
const isSameDay = (movement: Movement, date: string) => Boolean(movement.fecha?.slice(0, 10) === date);
const countMatching = (items: Movement[], date: string, matcher: RegExp) => items.filter((movement) => isSameDay(movement, date) && matcher.test(textOf(movement))).length;
const countService = (items: Movement[], date: string, service: string) => items.filter((movement) => isSameDay(movement, date) && movement.servicio?.toUpperCase() === service).length;

const section = (items: Movement[], date: string, definitions: Array<[string, RegExp]>): SummaryLine[] =>
  definitions.map(([label, matcher]) => ({ label, count: countMatching(items, date, matcher) }));

export const availableDates = (items: Movement[]) => Array.from(new Set(items.map((movement) => movement.fecha?.slice(0, 10)).filter((date): date is string => Boolean(date)))).sort((a, b) => b.localeCompare(a));

export function buildDailySummary(items: Movement[], date: string, executive = "Eduardo Cruz"): DailySummary {
  const dayItems = items.filter((movement) => isSameDay(movement, date));
  const tlmkBase = countService(items, date, "TELEMARKETIN");
  const tlmk = section(items, date, [
    ["TLMK $60", /TLMK\s*\$?\s*60|60\s*.*TLMK/],
    ["TLMK $90", /TLMK\s*\$?\s*90|90\s*.*TLMK/],
    ["TLMK $100", /TLMK\s*\$?\s*100|100\s*.*TLMK/],
    ["MIGRACIONES TLMK", /MIGRACION(?:ES)?\s*TLMK|MIG-POSAGO/],
    ["JUMP / HÍBRIDO", /JUMP|HIBRIDO|HÍBRIDO/],
  ]);
  const namedTlmk = tlmk.reduce((sum, line) => sum + line.count, 0);
  tlmk.push({ label: "OTRAS TLMK", count: Math.max(0, tlmkBase - namedTlmk) });
  const pos = section(items, date, [
    ["PLAN ILIMITADO", /PLAN\s*ILIMITADO|PRO\s*ILIMITADO/],
    ["PRO 30", /PRO\s*30/],
    ["PRO 20", /PRO\s*20/],
    ["PRO 16", /PRO\s*16/],
    ["PREPLAN", /PRE\s*PLAN|PREPLAN/],
    ["SOHO", /SOHO/],
  ]);
  const terminales = section(items, date, [
    ["RENOVACIÓN", /RENOVACION|RENOVACIÓN/],
    ["PAYJOY", /PAYJOY/],
    ["PREPAGO", /PREPAGO/],
    ["MSI", /\bMSI\b/],
    ["RENO TLMK", /RENO\s*TLMK/],
  ]);
  const ventas = section(items, date, [
    ["POSPAGO TOTAL", /VENTA\s*POSPAGO|POSPAGO/],
    ["TERMINALES", /TERMINAL/],
    ["PREPAGO TOTAL", /VENTA\s*PREPAGO|PREPAGO/],
  ]);
  const extras = section(items, date, [
    ["SEGUROS", /SEGURO/],
    ["NBA", /\bNBA\b/],
    ["COTIZACIONES PAYJOY", /COTIZACIONES\s*PAYJOY/],
    ["COTIZACIONES PLATA", /COTIZACIONES\s*PLATA/],
    ["SIM DE REGALO", /SIM\s*DE\s*REGALO/],
  ]);
  const totalTransactions = dayItems.length;
  const denominator = totalTransactions || 1;
  const conversion = [
    ["CONVERSIÓN POS", (ventas[0]?.count ?? 0) / denominator],
    ["CONVERSIÓN TLMK", (tlmk.reduce((sum, line) => sum + line.count, 0) / denominator)],
    ["CONVERSIÓN PAYJOY", (countMatching(items, date, /PAYJOY/) / denominator)],
    ["CONVERSIÓN PRE", (countMatching(items, date, /PREPAGO|PRE\s*PLAN|PREPLAN/) / denominator)],
  ].map(([label, value]) => ({ label: String(label), count: Number(value) }));
  return {
    date,
    executive,
    attentionGeneral: dayItems.filter((movement) => movement.servicio?.toUpperCase() !== "TELEMARKETIN").length,
    tlmk,
    tlmkTotal: tlmkBase,
    jump: countMatching(items, date, /JUMP|HIBRIDO|HÍBRIDO/),
    pos,
    terminales,
    ventas,
    extras,
    totalTransactions,
    clientsManaged: dayItems.filter((movement) => Boolean(movement.dnCelular)).length,
    cited: countMatching(items, date, /CITAD|CITADO/),
    conversion,
  };
}

export function formatDay(value: string) {
  const [year, month, day] = value.split("-");
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return year && month && day ? `${day} ${months[Number(month) - 1] ?? month} ${year.slice(2)}` : value;
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
