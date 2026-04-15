import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionService } from '../power-consumption.service';

/**
 * REQ-001 – Power Overview Widget
 *
 * Summary card showing the latest `Global_active_power` value in kW,
 * along with the corresponding date and time. Visible above the fold.
 * Renders within 2 seconds of data being loaded (NFR).
 */
@Component({
  selector: 'app-power-overview',
  imports: [Card, DecimalPipe],
  templateUrl: './power-overview.html',
  styleUrl: './power-overview.scss',
})
export class PowerOverview {
  private readonly powerService = inject(PowerConsumptionService);

  /** The most recent record in the dataset (last by index). */
  readonly latestRecord = computed(() => {
    const records = this.powerService.records();
    return records.length > 0 ? records[records.length - 1] : null;
  });
}
