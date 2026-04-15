import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-016 – Midnight Standby Load Indicator
 *
 * Filters records between 00:00:00 and 04:59:59, calculates the average
 * Global_active_power, and estimates nightly standby waste (~X kWh per night).
 */
@Component({
  selector: 'app-standby-load',
  imports: [Card, DecimalPipe],
  templateUrl: './standby-load.html',
  styleUrl: './standby-load.scss',
})
export class StandbyLoad {
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** Calculated once from the filtered records. */
  readonly standbyInfo = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return null;

    // Filter records 00:00:00 – 04:59:59
    const nightRecords = recs.filter((r) => {
      const hour = this.parseHour(r.time);
      return hour >= 0 && hour < 5;
    });

    if (nightRecords.length === 0) return null;

    const total = nightRecords.reduce((sum, r) => sum + r.globalActivePower, 0);
    const avg = total / nightRecords.length;
    const wastedKwh = avg * 5; // 5 hours midnight–05:00

    return {
      avgKw: avg,
      wastedKwh,
      sampleCount: nightRecords.length,
    };
  });

  /** Extract the hour from a time string like "H:MM:SS" or "HH:MM:SS". */
  private parseHour(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0], 10);
  }
}
