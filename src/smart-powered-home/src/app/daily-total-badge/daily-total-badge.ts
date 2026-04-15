import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionService } from '../power-consumption.service';

/**
 * REQ-008 – Daily Total Consumption Badge
 *
 * Shows total energy consumed on the **last date** in the dataset in kWh.
 * Conversion: each record is a 1-minute sample of kW →
 *   kWh = sum(globalActivePower) * (1/60)
 * Calculated once after data load via `computed()` (NFR).
 */
@Component({
  selector: 'app-daily-total-badge',
  imports: [Card, DecimalPipe],
  templateUrl: './daily-total-badge.html',
  styleUrl: './daily-total-badge.scss',
})
export class DailyTotalBadge {
  private readonly powerService = inject(PowerConsumptionService);

  /** The date string of the last record in the dataset. */
  readonly lastDate = computed(() => {
    const records = this.powerService.records();
    return records.length > 0 ? records[records.length - 1].date : null;
  });

  /** Total kWh for the last date, rounded to 2 decimals. Computed once. */
  readonly dailyTotalKwh = computed(() => {
    const records = this.powerService.records();
    const date = this.lastDate();
    if (!date) return 0;

    const dayRecords = records.filter((r) => r.date === date);
    const sumKw = dayRecords.reduce((sum, r) => sum + r.globalActivePower, 0);
    // Each record spans 1 minute → kWh = sumKw / 60
    return sumKw / 60;
  });
}
