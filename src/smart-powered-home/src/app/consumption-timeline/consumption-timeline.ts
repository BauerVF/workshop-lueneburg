import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
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
import { parseRecordDate } from './consumption-timeline.utils';

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
 * and a range mode (day / week). Renders < 3s for ~1,440 points (NFR).
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

  /** Currently selected date string (M/D/YY format). */
  readonly selectedDate = signal<string | null>(null);

  /** Range mode: single day or 7-day window. */
  readonly rangeMode = signal<'day' | 'week'>('day');

  readonly rangeOptions: RangeOption[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
  ];

  /** Filtered records for the selected range. Computed once per selection change. */
  readonly filteredRecords = computed(() => {
    const records = this.powerService.records();
    const date = this.selectedDate();
    const mode = this.rangeMode();
    if (!date || records.length === 0) return [];

    if (mode === 'day') {
      return records.filter((r) => r.date === date);
    }

    // Week mode: include 7 days starting from the selected date
    return this.getWeekRecords(records, date);
  });

  /** Chart.js labels (time strings). */
  readonly chartLabels = computed(() =>
    this.filteredRecords().map((r) => (this.rangeMode() === 'week' ? `${r.date} ${r.time}` : r.time)),
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

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: true, labels: { color: '#a1a1aa' } },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
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
  };

  ngOnInit(): void {
    // Default to last date in dataset when records load
    const records = this.powerService.records();
    if (records.length > 0) {
      this.selectedDate.set(records[records.length - 1].date);
    }
  }

  /** Called when user picks a new date from the calendar. */
  onDateChange(value: Date | null): void {
    if (!value) return;
    // Convert JS Date to M/D/YY format to match dataset
    const m = value.getMonth() + 1;
    const d = value.getDate();
    const yy = value.getFullYear() % 100;
    this.selectedDate.set(`${m}/${d}/${yy}`);
  }

  /** Get the selected date as a JS Date for the calendar binding. */
  get calendarDate(): Date | null {
    const dateStr = this.selectedDate();
    if (!dateStr) return null;
    return parseRecordDate(dateStr);
  }

  /** Find 7 consecutive days of records starting from the given date. */
  private getWeekRecords(records: PowerConsumptionRecord[], startDateStr: string): PowerConsumptionRecord[] {
    const dates = [...new Set(records.map((r) => r.date))];
    const startIdx = dates.indexOf(startDateStr);
    if (startIdx === -1) return [];
    const weekDates = new Set(dates.slice(startIdx, startIdx + 7));
    return records.filter((r) => weekDates.has(r.date));
  }
}
