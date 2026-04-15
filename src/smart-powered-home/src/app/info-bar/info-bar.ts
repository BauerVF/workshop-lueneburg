import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PowerConsumptionService } from '../power-consumption.service';

/**
 * REQ-013 – Record Count & Date Range Info Bar
 *
 * Single-line bar showing total record count, first date, and last date.
 * Uses the count signal and derives dates from loaded data.
 */
@Component({
  selector: 'app-info-bar',
  imports: [DecimalPipe],
  templateUrl: './info-bar.html',
  styleUrl: './info-bar.scss',
})
export class InfoBar {
  private readonly powerService = inject(PowerConsumptionService);

  readonly count = this.powerService.count;

  readonly firstDate = computed(() => {
    const records = this.powerService.records();
    return records.length > 0 ? records[0].date : '–';
  });

  readonly lastDate = computed(() => {
    const records = this.powerService.records();
    return records.length > 0 ? records[records.length - 1].date : '–';
  });
}
