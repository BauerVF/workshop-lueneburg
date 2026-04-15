import { Component, inject, OnInit, OnDestroy, computed, signal, effect } from '@angular/core';
import { PowerConsumptionService } from '../power-consumption.service';
import { SignalRService } from '../signalr/signalr.service';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';
import { PowerOverview } from '../power-overview/power-overview';
import { DailyTotalBadge } from '../daily-total-badge/daily-total-badge';
import { ConsumptionTimeline } from '../consumption-timeline/consumption-timeline';
import { SubmeteringBreakdown } from '../submetering-breakdown/submetering-breakdown';
import { PeakShaving } from '../peak-shaving/peak-shaving';
import { TopThreeHours } from '../top3-hours/top3-hours';
import { InfoBar } from '../info-bar/info-bar';
import { VoltageStatus } from '../voltage-status/voltage-status';
import { CurrentIntensity } from '../current-intensity/current-intensity';
import { ReactivePowerWarning } from '../reactive-power-warning/reactive-power-warning';
import { ZoneComparison } from '../zone-comparison/zone-comparison';
import { StandbyLoad } from '../standby-load/standby-load';
import { DataTable } from '../data-table/data-table';

/**
 * Dashboard page component. Orchestrates all widgets and provides
 * shared state (filtered records via the timeline's date/range selection).
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    LoadingSkeleton,
    PowerOverview,
    DailyTotalBadge,
    ConsumptionTimeline,
    SubmeteringBreakdown,
    PeakShaving,
    TopThreeHours,
    InfoBar,
    VoltageStatus,
    CurrentIntensity,
    ReactivePowerWarning,
    ZoneComparison,
    StandbyLoad,
    DataTable,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  protected readonly powerService = inject(PowerConsumptionService);
  protected readonly signalR = inject(SignalRService);

  /** Selected date for the shared time-range filter (M/D/YY format). */
  readonly selectedDate = signal<string | null>(null);
  /** Selected date range [start, end] for week mode. */
  readonly selectedDateRange = signal<[string, string] | null>(null);
  /** Range mode: 'day' or 'week'. */
  readonly rangeMode = signal<'day' | 'week'>('day');

  /** Records filtered by the shared time-range. */
  readonly filteredRecords = computed(() => {
    const records = this.powerService.records();
    const mode = this.rangeMode();
    if (records.length === 0) return [];

    if (mode === 'day') {
      const date = this.selectedDate();
      if (!date) return [];
      return records.filter((r) => r.date === date);
    }

    const range = this.selectedDateRange();
    if (!range) return [];
    const allDates = [...new Set(records.map((r) => r.date))];
    const startDate = this.parseDate(range[0]);
    const endDate = this.parseDate(range[1]);
    const matchingDates = new Set(
      allDates.filter((d) => {
        const parsed = this.parseDate(d);
        return parsed >= startDate && parsed <= endDate;
      }),
    );
    return records.filter((r) => matchingDates.has(r.date));
  });

  constructor() {
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear() % 100}`;
    this.selectedDate.set(todayStr);
  }

  onTimelineDateChanged(date: string): void {
    this.selectedDate.set(date);
  }

  onTimelineDateRangeChanged(range: [string, string]): void {
    this.selectedDateRange.set(range);
  }

  onTimelineRangeModeChanged(mode: 'day' | 'week'): void {
    this.rangeMode.set(mode);
  }

  private parseDate(dateStr: string): Date {
    const [m, d, y] = dateStr.split('/').map(Number);
    return new Date((y < 100 ? 2000 + y : y), m - 1, d);
  }

  ngOnInit(): void {
    this.powerService.load();
    this.signalR.start();
  }

  ngOnDestroy(): void {
    this.signalR.stop();
  }
}
