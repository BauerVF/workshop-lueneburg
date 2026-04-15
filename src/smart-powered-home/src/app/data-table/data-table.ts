import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TableLazyLoadEvent } from 'primeng/types/table';
import { DatePicker } from 'primeng/datepicker';
import { Card } from 'primeng/card';
import { PowerConsumptionService, PowerConsumptionRecord, PagedResult } from '../power-consumption.service';

/**
 * REQ-002 – Consumption Data Table
 *
 * PrimeNG table with server-side (API) pagination and an optional date filter.
 * Uses loadPaged() to avoid rendering all 148K rows at once.
 */
@Component({
  selector: 'app-data-table',
  imports: [TableModule, DatePicker, Card, DecimalPipe, FormsModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable implements OnInit {
  private readonly powerService = inject(PowerConsumptionService);

  readonly rows = signal<PowerConsumptionRecord[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filterDate = signal<Date | null>(null);

  ngOnInit(): void {
    this.loadPage(1, this.pageSize());
  }

  /** Called by PrimeNG on lazy-load (page change). */
  onLazyLoad(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.pageSize())) + 1;
    const size = event.rows ?? this.pageSize();
    this.first.set(event.first ?? 0);
    this.pageSize.set(size);
    this.loadPage(page, size);
  }

  /** Called when the date filter changes. */
  onDateFilterChange(date: Date | null): void {
    this.filterDate.set(date);
    this.first.set(0);
    this.loadPage(1, this.pageSize());
  }

  /** Clear the date filter. */
  clearDateFilter(): void {
    this.filterDate.set(null);
    this.first.set(0);
    this.loadPage(1, this.pageSize());
  }

  private loadPage(page: number, pageSize: number): void {
    this.loading.set(true);

    let dateParam: string | undefined;
    const d = this.filterDate();
    if (d) {
      dateParam = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear() % 100}`;
    }

    this.powerService.loadPaged(page, pageSize, dateParam).subscribe({
      next: (result: PagedResult<PowerConsumptionRecord>) => {
        this.rows.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
