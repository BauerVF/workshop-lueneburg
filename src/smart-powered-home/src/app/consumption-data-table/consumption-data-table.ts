import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PowerConsumptionService, PowerConsumptionRecord } from '../power-consumption.service';
import { getHour } from '../utils';

interface AggregatedRecord {
  date: string;
  count: number;
  avgActivePower: number;
  avgVoltage: number;
  avgIntensity: number;
  totalSubMetering1: number;
  totalSubMetering2: number;
  totalSubMetering3: number;
}

@Component({
  selector: 'app-consumption-data-table',
  templateUrl: './consumption-data-table.html',
  styleUrl: './consumption-data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionDataTable {
  private readonly powerService = inject(PowerConsumptionService);
  private readonly pageSize = 50;

  protected readonly dateFilter = signal('');
  protected readonly currentPage = signal(0);
  protected readonly nightFilterActive = signal(false);

  protected readonly filteredRecords = computed(() => {
    const records = this.powerService.records();
    const filter = this.dateFilter();
    const base = filter ? records.filter((r) => r.date === filter) : records;
    if (!this.nightFilterActive()) return base;
    return base.filter((r) => getHour(r.time) <= 4);
  });

  protected readonly aggregatedRecords = computed<AggregatedRecord[]>(() => {
    if (!this.nightFilterActive()) return [];
    const records = this.filteredRecords();
    const map = new Map<string, PowerConsumptionRecord[]>();
    for (const r of records) {
      const group = map.get(r.date) ?? [];
      group.push(r);
      map.set(r.date, group);
    }
    return Array.from(map.entries()).map(([date, rows]) => ({
      date,
      count: rows.length,
      avgActivePower: rows.reduce((s, r) => s + r.globalActivePower, 0) / rows.length,
      avgVoltage: rows.reduce((s, r) => s + r.voltage, 0) / rows.length,
      avgIntensity: rows.reduce((s, r) => s + r.globalIntensity, 0) / rows.length,
      totalSubMetering1: rows.reduce((s, r) => s + r.subMetering1, 0),
      totalSubMetering2: rows.reduce((s, r) => s + r.subMetering2, 0),
      totalSubMetering3: rows.reduce((s, r) => s + r.subMetering3, 0),
    }));
  });

  protected readonly totalPages = computed(() => {
    const count = this.nightFilterActive()
      ? this.aggregatedRecords().length
      : this.filteredRecords().length;
    return Math.ceil(count / this.pageSize);
  });

  protected readonly paginatedRecords = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredRecords().slice(start, start + this.pageSize);
  });

  protected readonly paginatedAggregated = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.aggregatedRecords().slice(start, start + this.pageSize);
  });

  protected readonly filteredCount = computed(() =>
    this.nightFilterActive()
      ? this.aggregatedRecords().length
      : this.filteredRecords().length
  );

  protected onDateFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dateFilter.set(input.value);
    this.currentPage.set(0);
  }

  protected toggleNightFilter(): void {
    this.nightFilterActive.update((v) => !v);
    this.currentPage.set(0);
  }

  protected prevPage(): void {
    this.currentPage.update((p) => Math.max(0, p - 1));
  }

  protected nextPage(): void {
    const last = this.totalPages() - 1;
    if (last < 0) return;
    this.currentPage.update((p) => Math.min(last, p + 1));
  }
}
