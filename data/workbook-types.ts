import type { Movement } from "./funel-data";

export type RemoteWorkbookPayload = {
  sourceName: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  sheetNames: string[];
  movements: Movement[];
  catalogs: Record<string, string[]>;
  dailySnapshots: Record<string, { meta: { fecha?: string; cac?: string; ejecutivo?: string }; values: Record<string, string | null> }>;
};
