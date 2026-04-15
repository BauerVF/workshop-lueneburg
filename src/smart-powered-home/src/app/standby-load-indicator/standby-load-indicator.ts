import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';
import { getHour } from '../utils';

@Component({
  selector: 'app-standby-load-indicator',
  templateUrl: './standby-load-indicator.html',
  styleUrl: './standby-load-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandbyLoadIndicator {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly avgStandbyPower = computed(() => {
    const records = this.powerService.records();
    if (records.length === 0) return 0;

    const nightRecords = records.filter((r) => {
      const hour = getHour(r.time);
      return hour >= 0 && hour <= 4;
    });

    if (nightRecords.length === 0) return 0;
    return nightRecords.reduce((sum, r) => sum + r.globalActivePower, 0) / nightRecords.length;
  });

  protected readonly nightlyWaste = computed(() => this.avgStandbyPower() * 5);
}
