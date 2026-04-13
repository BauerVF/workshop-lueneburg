import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({
  providedIn: 'root',
})
export class PowerConsumptionService {
  private readonly http = inject(HttpClient);
  private readonly csvUrl = '/household_power_consumption.csv';

  private readonly _records = signal<PowerConsumptionRecord[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly records = this._records.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._records().length);

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get(this.csvUrl, { responseType: 'text' }).subscribe({
      next: (csv) => {
        this._records.set(this.parseCsv(csv));
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.message ?? 'Failed to load data');
        this._loading.set(false);
      },
    });
  }

  private parseCsv(csv: string): PowerConsumptionRecord[] {
    const lines = csv.split('\n');
    return lines
      .slice(1)
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const [
          index,
          date,
          time,
          globalActivePower,
          globalReactivePower,
          voltage,
          globalIntensity,
          subMetering1,
          subMetering2,
          subMetering3,
        ] = line.split(',');
        return {
          index: Number(index),
          date,
          time,
          globalActivePower: Number(globalActivePower),
          globalReactivePower: Number(globalReactivePower),
          voltage: Number(voltage),
          globalIntensity: Number(globalIntensity),
          subMetering1: Number(subMetering1),
          subMetering2: Number(subMetering2),
          subMetering3: Number(subMetering3),
        };
      });
  }
}
