import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PowerConsumptionService } from '../power-consumption.service';
import { createDateSelection } from '../date-selection';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-submetering-breakdown-chart',
  imports: [BaseChartDirective],
  templateUrl: './submetering-breakdown-chart.html',
  styleUrl: './submetering-breakdown-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmeteringBreakdownChart {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly dateSelection = createDateSelection(this.powerService.uniqueDates);

  protected readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const date = this.dateSelection.activeDate();
    if (!date) return { labels: [], datasets: [] };

    const dayRecords = this.powerService.records().filter((r) => r.date === date);

    const kitchen = dayRecords.reduce((s, r) => s + r.subMetering1, 0);
    const laundry = dayRecords.reduce((s, r) => s + r.subMetering2, 0);
    const heating = dayRecords.reduce((s, r) => s + r.subMetering3, 0);
    const totalActiveWh = dayRecords.reduce((s, r) => s + (r.globalActivePower * 1000) / 60, 0);
    const other = Math.max(0, totalActiveWh - kitchen - laundry - heating);

    return {
      labels: ['Kitchen', 'Laundry', 'Heating/AC', 'Other'],
      datasets: [
        {
          data: [kitchen, laundry, heating, other],
          backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#6b7280'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  });

  protected readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = ctx.parsed;
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${ctx.label}: ${pct}%`;
          },
        },
      },
    },
  };
}
