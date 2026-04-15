import { Component, inject, OnInit, OnDestroy, computed, signal, effect } from '@angular/core';
import { PowerConsumptionService } from './power-consumption.service';
import { SignalRService } from './signalr/signalr.service';
import { LoadingSkeleton } from './loading-skeleton/loading-skeleton';
import { PowerOverview } from './power-overview/power-overview';
import { DailyTotalBadge } from './daily-total-badge/daily-total-badge';
import { ConsumptionTimeline } from './consumption-timeline/consumption-timeline';
import { SubmeteringBreakdown } from './submetering-breakdown/submetering-breakdown';
import { PeakShaving } from './peak-shaving/peak-shaving';
import { TopThreeHours } from './top3-hours/top3-hours';

/**
 * Root dashboard component. Orchestrates all widgets and provides
 * shared state (filtered records via the timeline's date/range selection).
 */
@Component({
  selector: 'app-root',
  imports: [
    LoadingSkeleton,
    PowerOverview,
    DailyTotalBadge,
    ConsumptionTimeline,
    SubmeteringBreakdown,
    PeakShaving,
    TopThreeHours,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly powerService = inject(PowerConsumptionService);
  protected readonly signalR = inject(SignalRService);

  /** Selected date for the shared time-range filter (M/D/YY format). */
  readonly selectedDate = signal<string | null>(null);
  /** Range mode: 'day' or 'week'. */
  readonly rangeMode = signal<'day' | 'week'>('day');

  /** Records filtered by the shared time-range — used by breakdown + peak shaving. */
  readonly filteredRecords = computed(() => {
    const records = this.powerService.records();
    const date = this.selectedDate();
    const mode = this.rangeMode();
    if (!date || records.length === 0) return [];

    if (mode === 'day') {
      return records.filter((r) => r.date === date);
    }

    // Week mode: 7 consecutive days from selected date
    const dates = [...new Set(records.map((r) => r.date))];
    const startIdx = dates.indexOf(date);
    if (startIdx === -1) return [];
    const weekDates = new Set(dates.slice(startIdx, startIdx + 7));
    return records.filter((r) => weekDates.has(r.date));
  });

  constructor() {
    // Auto-select the last date once data loads
    effect(() => {
      const records = this.powerService.records();
      if (records.length > 0 && this.selectedDate() === null) {
        this.selectedDate.set(records[records.length - 1].date);
      }
    });
  }

  ngOnInit(): void {
    this.powerService.load();
    this.signalR.start();
  }

  ngOnDestroy(): void {
    this.signalR.stop();
  }
}
