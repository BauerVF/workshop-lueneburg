import { Component, computed, inject, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Card } from 'primeng/card';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PowerConsumptionRecord } from '../power-consumption.service';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

/**
 * REQ-004 – Sub-Metering Breakdown Chart
 *
 * Doughnut chart breaking down energy consumption into:
 *   Kitchen (Sub_metering_1), Laundry (Sub_metering_2),
 *   Heating/AC (Sub_metering_3), Other (remainder).
 *
 * Accepts filtered records as input so it shares the time-range
 * filter from REQ-003. Updates within 1 second (NFR).
 */
@Component({
  selector: 'app-submetering-breakdown',
  imports: [BaseChartDirective, Card],
  templateUrl: './submetering-breakdown.html',
  styleUrl: './submetering-breakdown.scss',
})
export class SubmeteringBreakdown {
  /** Filtered records from the parent (shares REQ-003 time filter). */
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** Aggregated sub-metering totals. Computed once per input change. */
  readonly totals = computed(() => {
    const recs = this.records();
    let kitchen = 0;
    let laundry = 0;
    let heatingAc = 0;
    let totalActive = 0;

    for (const r of recs) {
      kitchen += r.subMetering1;
      laundry += r.subMetering2;
      heatingAc += r.subMetering3;
      // Global active power is in kW, convert minute-sample to Wh: kW * 1000 / 60
      totalActive += (r.globalActivePower * 1000) / 60;
    }

    const subTotal = kitchen + laundry + heatingAc;
    const other = Math.max(0, totalActive - subTotal);

    return { kitchen, laundry, heatingAc, other, total: totalActive };
  });

  /** Chart.js doughnut data. */
  readonly chartDatasets = computed(() => {
    const t = this.totals();
    return [
      {
        data: [t.kitchen, t.laundry, t.heatingAc, t.other],
        backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#6b7280'],
        hoverBackgroundColor: ['#fbbf24', '#60a5fa', '#f87171', '#9ca3af'],
        borderWidth: 0,
      },
    ];
  });

  readonly chartLabels = ['Kitchen', 'Laundry', 'Heating/AC', 'Other'];

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#a1a1aa', padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label?: string; parsed: number; dataset: { data: number[] } }) => {
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
            return `${ctx.label}: ${ctx.parsed.toFixed(0)} Wh (${pct}%)`;
          },
        },
      },
    },
  };
}
