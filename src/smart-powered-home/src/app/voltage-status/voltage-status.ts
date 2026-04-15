import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';
import { classifyVoltage } from './voltage-status.utils';

/**
 * REQ-007 – Voltage Status Indicator
 *
 * Colour-coded indicator showing whether the latest voltage is normal,
 * marginal, or critical. No external library needed.
 */
@Component({
  selector: 'app-voltage-status',
  imports: [Card, DecimalPipe],
  templateUrl: './voltage-status.html',
  styleUrl: './voltage-status.scss',
})
export class VoltageStatus {
  readonly records = input.required<PowerConsumptionRecord[]>();

  readonly info = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return null;
    const latest = recs[recs.length - 1];
    return classifyVoltage(latest.voltage);
  });
}
