import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  effect,
  untracked,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Card } from 'primeng/card';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { PowerConsumptionService, PowerConsumptionRecord } from '../power-consumption.service';
import { parseRecordDate, formatRecordDate } from './consumption-timeline.utils';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
);

/** Range option for the dropdown */
interface RangeOption {
  label: string;
  value: 'day' | 'week';
}

/**
 * REQ-003 – Consumption Timeline Chart
 *
 * Line chart of `Global_active_power` over time. Allows selecting a date
 * (day mode) or a date range (week mode). Renders < 3s for ~1,440 points (NFR).
 * Uses Chart.js via ng2-charts — Angular-compatible, no direct DOM manipulation.
 */
@Component({
  selector: 'app-consumption-timeline',
  imports: [BaseChartDirective, DatePicker, Select, Card, FormsModule],
  templateUrl: './consumption-timeline.html',
  styleUrl: './consumption-timeline.scss',
})
export class ConsumptionTimeline implements OnInit {
  private readonly powerService = inject(PowerConsumptionService);

  /** Available dates derived from the dataset. */
  readonly availableDates = computed(() => {
    const records = this.powerService.records();
    const dateSet = new Set(records.map((r) => r.date));
    return [...dateSet];
  });

  /** Currently selected date string (M/D/YY format) — used in day mode. */
  readonly selectedDate = signal<string | null>(null);

  /** Date range [start, end] — used in week mode. */
  readonly selectedDateRange = signal<[string, string] | null>(null);

  /** Range mode: single day or date-range window. */
  readonly rangeMode = signal<'day' | 'week'>('day');

  readonly rangeOptions: RangeOption[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
  ];

  /** Emits the selected date string whenever the user picks a new date. */
  readonly dateChanged = output<string>();
  /** Emits the selected date range whenever it changes. */
  readonly dateRangeChanged = output<[string, string]>();
  /** Emits when the granularity changes. */
  readonly rangeModeChanged = output<'day' | 'week'>();

  /** Filtered records for the selected range. Computed once per selection change. */
  readonly filteredRecords = computed(() => {
    const records = this.powerService.records();
    const mode = this.rangeMode();
    if (records.length === 0) return [];

    if (mode === 'day') {
      const date = this.selectedDate();
      if (!date) return [];
      return records.filter((r) => r.date === date);
    }

    // Week mode: filter by the selected date range
    const range = this.selectedDateRange();
    if (!range) return [];
    return this.getRangeRecords(records, range[0], range[1]);
  });

  /** Chart.js labels (time strings). */
  readonly chartLabels = computed(() =>
    this.filteredRecords().map((r) =>
      this.rangeMode() === 'week' ? `${r.date} ${r.time}` : r.time,
    ),
  );

  /** Chart.js dataset. */
  readonly chartDatasets = computed(() => [
    {
      data: this.filteredRecords().map((r) => r.globalActivePower),
      label: 'Global Active Power (kW)',
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHitRadius: 4,
      borderWidth: 2,
    },
  ]);

  /** Reactive chart options — x-axis title changes with the selected mode. */
  readonly chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: true, labels: { color: '#a1a1aa' } },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: this.rangeMode() === 'day' ? 'Time' : 'Date',
          color: '#a1a1aa',
        },
        ticks: {
          color: '#a1a1aa',
          maxTicksLimit: 24,
          maxRotation: 0,
        },
        grid: { color: 'rgba(161, 161, 170, 0.1)' },
      },
      y: {
        title: { display: true, text: 'kW', color: '#a1a1aa' },
        ticks: { color: '#a1a1aa' },
        grid: { color: 'rgba(161, 161, 170, 0.1)' },
        beginAtZero: true,
      },
    },
  }));

  constructor() {
    // When switching modes, seed the other signal so the chart has data right away.
    // Use untracked() for the signals we also write to — prevents circular deps.
    effect(() => {
      const mode = this.rangeMode();
      const dates = this.availableDates();
      if (dates.length === 0) return;

      if (mode === 'week' && !untracked(this.selectedDateRange)) {
        // Seed with a range ending today
        const todayStr = formatRecordDate(new Date());
        const todayDate = new Date();
        const weekAgo = new Date(todayDate);
        weekAgo.setDate(weekAgo.getDate() - 6);
        const startStr = formatRecordDate(weekAgo);
        this.selectedDateRange.set([startStr, todayStr]);
        this.dateRangeChanged.emit([startStr, todayStr]);
      }
      if (mode === 'day' && !untracked(this.selectedDate)) {
        const todayStr = formatRecordDate(new Date());
        this.selectedDate.set(todayStr);
        this.dateChanged.emit(todayStr);
      }
    });
  }

  ngOnInit(): void {
    // Default to today's date so live-simulated data is visible immediately
    const today = new Date();
    const todayStr = formatRecordDate(today);
    this.selectedDate.set(todayStr);
    this.dateChanged.emit(todayStr);
  }

  /** Called when user picks a new date from the single-date calendar (day mode). */
  onDateChange(value: Date | null): void {
    if (!value) return;
    const dateStr = formatRecordDate(value);
    this.selectedDate.set(dateStr);
    this.dateChanged.emit(dateStr);
  }

  /** Called when user picks a date range from the range calendar (week mode). */
  onDateRangeChange(value: (Date | null)[] | null): void {
    if (!value || value.length < 2 || !value[0] || !value[1]) return;
    const range: [string, string] = [
      formatRecordDate(value[0]),
      formatRecordDate(value[1]),
    ];
    this.selectedDateRange.set(range);
    this.dateRangeChanged.emit(range);
  }

  /** Called when user changes the granularity dropdown. */
  onRangeModeChange(value: 'day' | 'week'): void {
    this.rangeMode.set(value);
    this.rangeModeChanged.emit(value);
  }

  /**
   * Selected date as a JS Date for the single-date calendar binding.
   * Must be a computed() — a plain getter creates a new Date reference every
   * change-detection cycle which causes PrimeNG DatePicker to re-render in a loop.
   */
  readonly calendarDate = computed<Date | null>(() => {
    const dateStr = this.selectedDate();
    if (!dateStr) return null;
    return parseRecordDate(dateStr);
  });

  /**
   * Selected range as JS Dates for the range calendar binding.
   * Same reason as above — must be computed() to keep a stable reference.
   */
  readonly calendarDateRange = computed<(Date | null)[] | null>(() => {
    const range = this.selectedDateRange();
    if (!range) return null;
    return [parseRecordDate(range[0]), parseRecordDate(range[1])];
  });

  /** Shift the selected date by +/- N days (for arrow buttons). */
  shiftDay(offset: number): void {
    const current = this.calendarDate();
    if (!current) return;
    const next = new Date(current);
    next.setDate(next.getDate() + offset);
    this.onDateChange(next);
  }

  /** Filter records that fall within a date range (inclusive). */
  private getRangeRecords(
    records: PowerConsumptionRecord[],
    startDateStr: string,
    endDateStr: string,
  ): PowerConsumptionRecord[] {
    // Build a set of all dataset dates that fall within the range
    const startDate = parseRecordDate(startDateStr);
    const endDate = parseRecordDate(endDateStr);
    const matchingDates = new Set<string>();

    for (const d of this.availableDates()) {
      const parsed = parseRecordDate(d);
      if (parsed >= startDate && parsed <= endDate) {
        matchingDates.add(d);
      }
    }
    return records.filter((r) => matchingDates.has(r.date));
  }
}
