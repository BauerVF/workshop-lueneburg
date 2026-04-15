import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';
import { getHour } from '../utils';

interface HourConsumption {
  hour: number;
  label: string;
  avgPower: number;
}

@Component({
  selector: 'app-top-consumption-hours',
  templateUrl: './top-consumption-hours.html',
  styleUrl: './top-consumption-hours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopConsumptionHours {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly topHours = computed<HourConsumption[]>(() => {
    const records = this.powerService.records();
    if (records.length === 0) return [];

    const hourMap = new Map<number, { sum: number; count: number }>();

    for (const record of records) {
      const hour = getHour(record.time);
      const entry = hourMap.get(hour) ?? { sum: 0, count: 0 };
      entry.sum += record.globalActivePower;
      entry.count++;
      hourMap.set(hour, entry);
    }

    return Array.from(hourMap.entries())
      .map(([hour, { sum, count }]) => ({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00 – ${(hour + 1).toString().padStart(2, '0')}:00`,
        avgPower: sum / count,
      }))
      .sort((a, b) => b.avgPower - a.avgPower)
      .slice(0, 3);
  });
}
