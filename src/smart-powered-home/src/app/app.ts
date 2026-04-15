import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { PowerConsumptionService } from './power-consumption.service';
import { InfoBar } from './info-bar/info-bar';
import { PowerOverviewWidget } from './power-overview-widget/power-overview-widget';
import { DailyTotalBadge } from './daily-total-badge/daily-total-badge';
import { CurrentIntensityBadge } from './current-intensity-badge/current-intensity-badge';
import { StandbyLoadIndicator } from './standby-load-indicator/standby-load-indicator';
import { TopConsumptionHours } from './top-consumption-hours/top-consumption-hours';
import { ConsumptionTimelineChart } from './consumption-timeline-chart/consumption-timeline-chart';
import { SubmeteringBreakdownChart } from './submetering-breakdown-chart/submetering-breakdown-chart';
import { ConsumptionDataTable } from './consumption-data-table/consumption-data-table';

@Component({
  selector: 'app-root',
  imports: [
    InfoBar,
    PowerOverviewWidget,
    DailyTotalBadge,
    CurrentIntensityBadge,
    StandbyLoadIndicator,
    TopConsumptionHours,
    ConsumptionTimelineChart,
    SubmeteringBreakdownChart,
    ConsumptionDataTable,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly powerService = inject(PowerConsumptionService);

  readonly loading = this.powerService.loading;
  readonly error = this.powerService.error;

  ngOnInit(): void {
    this.powerService.load();
  }
}
