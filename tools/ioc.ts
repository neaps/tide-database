/**
 * IOC Sea Level Station Monitoring Facility (SLSMF) v2 API client.
 *
 * SLSMF (https://www.ioc-sealevelmonitoring.org, run by VLIZ for UNESCO/IOC)
 * relays ~1,600 real-time tide gauges but publishes raw relative sea level only —
 * no constituents, no vertical datum. We fetch its quality-controlled research
 * series and fit constituents ourselves (see import-ioc.ts, issue #124).
 *
 * Needs an API key in IOC_API_KEY: register at
 * https://www.ioc-sealevelmonitoring.org/api.php and ask for the gauges API group.
 * Responses are cached gzipped under tmp/IOC/ (gitignored).
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { gzipSync, gunzipSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { binHourly, type Sample } from "./datum.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const IOC_DIR = join(__dirname, "..", "tmp", "IOC");
const API = "https://api.ioc-sealevelmonitoring.org/v2";

export interface IocStation {
  Code: string;
  Location: string;
  country: string;
  countryname: string;
  Lat: number | null;
  Lon: number | null;
  localoperator: number | null;
  lasttime: string | null; // "YYYY-MM-DD HH:MM:SS.SSS" UTC
}

export interface IocOperator {
  id: number;
  fullname: string;
}

interface IocRow {
  slevel: number | "NA";
  stime: string; // "YYYY-MM-DD HH:MM:SS" UTC
}

async function getJSON<T>(path: string, cacheFile: string): Promise<T> {
  const file = join(IOC_DIR, cacheFile);
  try {
    return JSON.parse(gunzipSync(await readFile(file)).toString());
  } catch {
    // not cached
  }
  const key = process.env["IOC_API_KEY"];
  if (!key) {
    throw new Error(
      "IOC_API_KEY is not set. Register at https://www.ioc-sealevelmonitoring.org/api.php and request the gauges API group.",
    );
  }
  // ponytail: three tries with a flat back-off; make-fetch-happen's streaming
  // was ~10× slower than undici on these 40 MB station-years.
  let text = "";
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}${path}`, { headers: { "X-API-KEY": key } });
    if (res.ok) {
      text = await res.text();
      break;
    }
    if (attempt === 3) {
      throw new Error(`IOC ${path}: ${res.status} ${res.statusText}`);
    }
    await new Promise((r) => setTimeout(r, 5_000 * attempt));
  }
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, gzipSync(text));
  return JSON.parse(text);
}

/** All SLSMF stations (cached; delete tmp/IOC/stations.json.gz to refresh). */
export const fetchStations = () =>
  getJSON<IocStation[]>("/stations", "stations.json.gz");

/** Operator id → full name. */
export async function fetchOperators(): Promise<Map<number, string>> {
  const ops = await getJSON<IocOperator[]>("/operators", "operators.json.gz");
  return new Map(ops.map((o) => [o.id, o.fullname]));
}

/** Convert research-endpoint rows to samples, dropping QC-nulled (`NA`) values. */
export function parseIocSamples(rows: IocRow[]): Sample[] {
  const samples: Sample[] = [];
  for (const r of rows) {
    if (typeof r.slevel !== "number" || !Number.isFinite(r.slevel)) continue;
    const t = Date.parse(r.stime.replace(" ", "T") + "Z");
    if (Number.isFinite(t))
      samples.push({ time: new Date(t), level: r.slevel });
  }
  return samples;
}

/**
 * Quality-controlled hourly water levels for a station, walking back one
 * calendar year per request from `until` to `from` (the research endpoint caps
 * requests at 365 days). Days flagged low-completeness/distinctness/shift and
 * samples flagged out-of-range/spike/flat are already `NA` upstream. Raw
 * 1-minute series are binned to hourly means per year to keep memory flat.
 */
export async function fetchHourlySamples(
  code: string,
  from: number,
  until = new Date().getUTCFullYear(),
): Promise<Sample[]> {
  const years: Sample[][] = [];
  for (let year = until; year >= from; year--) {
    const rows = await getJSON<{ data: IocRow[] }>(
      `/research/stations/${code}/sensors/one-sensor/data` +
        `?timestart=${year}-01-01&timestop=${year + 1}-01-01&days_per_page=365&page=1&fit_to_sample_rate=true`,
      join(code, `${year}.json.gz`),
    );
    // ponytail: rows only exist from the gauge's first report, so an empty year
    // means we've reached the start of the record; a full-year outage truncates it.
    if (rows.data.length === 0) break;
    years.unshift(binHourly(parseIocSamples(rows.data)));
  }
  return years.flat();
}
