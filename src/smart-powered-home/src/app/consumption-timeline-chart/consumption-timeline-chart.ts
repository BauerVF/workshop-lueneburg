import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js';
import { PowerConsumptionService } from '../power-consumption.service';
import { createDateSelection } from '../date-selection';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

@Component({
  selector: 'app-consumption-timeline-chart',
  imports: [BaseChartDirective],
  templateUrl: './consumption-timeline-chart.html',
  styleUrl: './consumption-timeline-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionTimelineChart {
  private readonly powerService = inject(PowerConsumptionService);

  protected readonly dateSelection = createDateSelection(this.powerService.uniqueDates);

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const date = this.dateSelection.activeDate();
    if (!date) return { labels: [], datasets: [] };

    const dayRecords = this.powerService.records().filter((r) => r.date === date);
    return {
      labels: dayRecords.map((r) => r.time),
      datasets: [
        {
          label: 'Global Active Power (kW)',
          data: dayRecords.map((r) => r.globalActivePower),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ],
    };
  });

  protected readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 24,
          font: { size: 10 },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'kW' },
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
}
