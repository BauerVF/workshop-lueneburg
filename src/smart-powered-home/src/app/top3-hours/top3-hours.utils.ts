import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-010 – Top 3 Highest Consumption Hours (pure function).
 *
 * Groups all records by hour of day (0–23), computes the average
 * `globalActivePower` per hour, and returns the top 3 sorted descending.
 *
 * Pure function — no DOM, no inject(), no HTTP.
 */
export interface HourlyAverage {
  /** Hour of the day (0–23). */
  hour: number;
  /** Human-readable label, e.g. "18:00 – 19:00". */
  label: string;
  /** Average globalActivePower in kW. */
  avgPowerKw: number;
}

export function computeTop3Hours(records: PowerConsumptionRecord[]): HourlyAverage[] {
  if (records.length === 0) return [];

  // Accumulate sum and count per hour
  const sums = new Float64Array(24);
  const counts = new Uint32Array(24);

  for (const r of records) {
    const hour = parseHour(r.time);
    if (hour >= 0 && hour < 24) {
      sums[hour] += r.globalActivePower;
      counts[hour]++;
    }
  }

  // Build averages for hours that have data
  const averages: HourlyAverage[] = [];
  for (let h = 0; h < 24; h++) {
    if (counts[h] > 0) {
      averages.push({
        hour: h,
        label: formatHourRange(h),
        avgPowerKw: sums[h] / counts[h],
      });
    }
  }

  // Sort descending by average power and take top 3
  averages.sort((a, b) => b.avgPowerKw - a.avgPowerKw);
  return averages.slice(0, 3);
}

/**
 * Extract the hour from a time string like "18:05:00" or "8:00:00".
 */
function parseHour(time: string): number {
  const colonIdx = time.indexOf(':');
  if (colonIdx === -1) return -1;
  return parseInt(time.substring(0, colonIdx), 10);
}

/**
 * Format an hour number (e.g. 18) as "18:00 – 19:00".
 */
function formatHourRange(hour: number): string {
  const start = hour.toString().padStart(2, '0');
  const end = ((hour + 1) % 24).toString().padStart(2, '0');
  return `${start}:00 – ${end}:00`;
}
