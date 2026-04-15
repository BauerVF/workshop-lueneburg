import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';

@Component({
  selector: 'app-power-overview-widget',
  templateUrl: './power-overview-widget.html',
  styleUrl: './power-overview-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerOverviewWidget {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly lastRecord = this.powerService.lastRecord;
}
