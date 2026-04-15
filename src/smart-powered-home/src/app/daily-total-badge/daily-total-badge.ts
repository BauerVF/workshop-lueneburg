import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-008 – Daily Total Consumption Badge
 *
 * Shows total energy consumed for the **selected date/range** in kWh.
 * Conversion: each record is a 1-minute sample of kW →
 *   kWh = sum(globalActivePower) * (1/60)
 * Reacts to the shared date selection from the timeline.
 * Calculated once per input change via `computed()` (NFR).
 */
@Component({
  selector: 'app-daily-total-badge',
  imports: [Card, DecimalPipe],
  templateUrl: './daily-total-badge.html',
  styleUrl: './daily-total-badge.scss',
})
export class DailyTotalBadge {
  /** Filtered records from the parent (shares the timeline date filter). */
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** The date label — first and last date in the filtered set. */
  readonly dateLabel = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return null;
    const first = recs[0].date;
    const last = recs[recs.length - 1].date;
    return first === last ? first : `${first} – ${last}`;
  });

  /** Total kWh for the filtered records, rounded to 2 decimals. */
  readonly dailyTotalKwh = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return 0;
    const sumKw = recs.reduce((sum, r) => sum + r.globalActivePower, 0);
    // Each record spans 1 minute → kWh = sumKw / 60
    return sumKw / 60;
  });
}
