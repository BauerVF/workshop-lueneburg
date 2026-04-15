import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';

@Component({
  selector: 'app-current-intensity-badge',
  templateUrl: './current-intensity-badge.html',
  styleUrl: './current-intensity-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentIntensityBadge {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly lastRecord = this.powerService.lastRecord;
}
