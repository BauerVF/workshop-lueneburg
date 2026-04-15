import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface PowerConsumptionRecord {
  index: number;
  date: string;
  time: string;
  globalActivePower: number;
  globalReactivePower: number;
  voltage: number;
  globalIntensity: number;
  subMetering1: number;
  subMetering2: number;
  subMetering3: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DataSummary {
  totalRecords: number;
  firstDate: string;
  lastDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class PowerConsumptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _records = signal<PowerConsumptionRecord[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly records = this._records.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._records().length);

  /**
   * Load all records from the API (used by charts and computed signals).
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<PowerConsumptionRecord[]>(`${this.apiUrl}/powerconsumption/all`)
      .subscribe({
        next: (records) => {
          this._records.set(records);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message ?? 'Failed to load data');
          this._loading.set(false);
        },
      });
  }

  /**
   * Paginated fetch – used by the data table (REQ-002).
   */
  loadPaged(page: number, pageSize: number, date?: string) {
    let url = `${this.apiUrl}/powerconsumption?page=${page}&pageSize=${pageSize}`;
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    return this.http.get<PagedResult<PowerConsumptionRecord>>(url);
  }

  /**
   * Lightweight summary (record count + date range).
   */
  loadSummary() {
    return this.http.get<DataSummary>(`${this.apiUrl}/powerconsumption/summary`);
  }
}
