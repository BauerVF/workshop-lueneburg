import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-001 – Power Overview Widget
 *
 * Summary card showing the latest `Global_active_power` value in kW,
 * along with the corresponding date and time. Reacts to the shared
 * date selection — shows the latest record for the selected range.
 * Renders within 2 seconds of data being loaded (NFR).
 */
@Component({
  selector: 'app-power-overview',
  imports: [Card, DecimalPipe],
  templateUrl: './power-overview.html',
  styleUrl: './power-overview.scss',
})
export class PowerOverview {
  /** Filtered records from the parent (shares the timeline date filter). */
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** The most recent record in the filtered set (last by array order). */
  readonly latestRecord = computed(() => {
    const recs = this.records();
    return recs.length > 0 ? recs[recs.length - 1] : null;
  });
}
