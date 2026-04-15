import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';

@Component({
  selector: 'app-daily-total-badge',
  templateUrl: './daily-total-badge.html',
  styleUrl: './daily-total-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyTotalBadge {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly lastDate = computed(() => this.powerService.lastRecord()?.date ?? null);

  protected readonly totalKwh = computed(() => {
    const date = this.lastDate();
    if (!date) return 0;
    const dayRecords = this.powerService.records().filter((r) => r.date === date);
    const totalKw = dayRecords.reduce((sum, r) => sum + r.globalActivePower, 0);
    return totalKw / 60;
  });
}
