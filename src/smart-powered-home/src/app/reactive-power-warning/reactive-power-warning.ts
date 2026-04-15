import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';
import { calculatePowerFactor } from './reactive-power-warning.utils';

/**
 * REQ-014 – Reactive Power Warning Flag
 *
 * Calculates power factor from the latest reading and shows a warning
 * when it drops below 0.8.
 */
@Component({
  selector: 'app-reactive-power-warning',
  imports: [Card, DecimalPipe],
  templateUrl: './reactive-power-warning.html',
  styleUrl: './reactive-power-warning.scss',
})
export class ReactivePowerWarning {
  readonly records = input.required<PowerConsumptionRecord[]>();

  readonly info = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return null;
    const latest = recs[recs.length - 1];
    return calculatePowerFactor(
      latest.globalActivePower,
      latest.globalReactivePower,
    );
  });
}
