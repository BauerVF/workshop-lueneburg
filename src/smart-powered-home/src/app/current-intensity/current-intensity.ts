import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-012 – Current Intensity Badge
 *
 * Displays the latest Global_intensity (A) from the filtered records
 * with the corresponding date and time.
 */
@Component({
  selector: 'app-current-intensity',
  imports: [Card, DecimalPipe],
  templateUrl: './current-intensity.html',
  styleUrl: './current-intensity.scss',
})
export class CurrentIntensity {
  readonly records = input.required<PowerConsumptionRecord[]>();

  readonly latestRecord = computed(() => {
    const recs = this.records();
    return recs.length > 0 ? recs[recs.length - 1] : null;
  });
}
