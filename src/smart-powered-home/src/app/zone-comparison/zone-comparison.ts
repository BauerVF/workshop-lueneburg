import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-015 – Appliance Zone Comparison Bars
 *
 * Horizontal CSS bars comparing kitchen, laundry, and heating/AC
 * totals from the filtered records, scaled relative to the maximum.
 */
@Component({
  selector: 'app-zone-comparison',
  imports: [Card, DecimalPipe],
  templateUrl: './zone-comparison.html',
  styleUrl: './zone-comparison.scss',
})
export class ZoneComparison {
  readonly records = input.required<PowerConsumptionRecord[]>();

  readonly zones = computed(() => {
    const recs = this.records();
    if (recs.length === 0) return [];

    let kitchen = 0;
    let laundry = 0;
    let heating = 0;

    for (const r of recs) {
      kitchen += r.subMetering1;
      laundry += r.subMetering2;
      heating += r.subMetering3;
    }

    const max = Math.max(kitchen, laundry, heating, 1); // avoid div-by-zero

    return [
      { label: 'Kitchen', value: kitchen, pct: (kitchen / max) * 100, icon: 'pi pi-shopping-bag', color: '#3b82f6' },
      { label: 'Laundry', value: laundry, pct: (laundry / max) * 100, icon: 'pi pi-home',         color: '#8b5cf6' },
      { label: 'Heating / AC', value: heating, pct: (heating / max) * 100, icon: 'pi pi-sun',      color: '#f59e0b' },
    ];
  });
}
