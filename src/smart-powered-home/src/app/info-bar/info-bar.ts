import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PowerConsumptionService } from '../power-consumption.service';

@Component({
  selector: 'app-info-bar',
  imports: [DecimalPipe],
  templateUrl: './info-bar.html',
  styleUrl: './info-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBar {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly count = this.powerService.count;

  protected readonly firstDate = computed(() => {
    const records = this.powerService.records();
    return records.length > 0 ? records[0].date : '—';
  });

  protected readonly lastDate = computed(() => this.powerService.lastRecord()?.date ?? '—');
}
