import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-005 – Peak Shaving detection algorithm.
 *
 * Pure function — no DOM, no inject(), no HTTP.
 * Scans records for sequences where `globalActivePower` exceeds the
 * threshold for at least `consecutiveMinutes` consecutive measurements.
 *
 * @param records - Time-ordered array of power consumption records
 * @param thresholdKw - Power threshold in kW (e.g. 5.0)
 * @param consecutiveMinutes - Minimum consecutive readings above threshold (e.g. 3)
 * @returns Array of detected peak events
 */
export interface PeakEvent {
  /** Start time string (date + time of first record in the peak). */
  startDate: string;
  startTime: string;
  /** End time string (date + time of last record in the peak). */
  endDate: string;
  endTime: string;
  /** Maximum globalActivePower during the event, in kW. */
  maxPowerKw: number;
  /** Number of consecutive minutes the peak lasted. */
  durationMinutes: number;
}

export function detectPeakEvents(
  records: PowerConsumptionRecord[],
  thresholdKw: number,
  consecutiveMinutes: number,
): PeakEvent[] {
  const events: PeakEvent[] = [];
  let streak: PowerConsumptionRecord[] = [];

  for (const record of records) {
    if (record.globalActivePower >= thresholdKw) {
      streak.push(record);
    } else {
      if (streak.length >= consecutiveMinutes) {
        events.push(buildEvent(streak));
      }
      streak = [];
    }
  }

  // Handle streak at the end of the array
  if (streak.length >= consecutiveMinutes) {
    events.push(buildEvent(streak));
  }

  return events;
}

function buildEvent(streak: PowerConsumptionRecord[]): PeakEvent {
  const first = streak[0];
  const last = streak[streak.length - 1];
  const maxPowerKw = Math.max(...streak.map((r) => r.globalActivePower));

  return {
    startDate: first.date,
    startTime: first.time,
    endDate: last.date,
    endTime: last.time,
    maxPowerKw,
    durationMinutes: streak.length,
  };
}
