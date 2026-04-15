import { Component, computed, inject, signal, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Badge } from 'primeng/badge';
import { InputNumber } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { PowerConsumptionRecord } from '../power-consumption.service';
import { detectPeakEvents, PeakEvent } from './peak-shaving.utils';

/** Default configurable thresholds */
const DEFAULT_THRESHOLD_KW = 5.0;
const DEFAULT_CONSECUTIVE_MINUTES = 3;

/**
 * REQ-005 – Peak Shaving Alert System
 *
 * Visual alert badge + Peak Event Log. Algorithm runs once per data/config
 * change via `computed()` — never recalculated per render cycle (NFR).
 * Threshold and window are configurable via the UI.
 */
@Component({
  selector: 'app-peak-shaving',
  imports: [Card, Badge, InputNumber, TableModule, FormsModule, DecimalPipe],
  templateUrl: './peak-shaving.html',
  styleUrl: './peak-shaving.scss',
})
export class PeakShaving {
  /** Filtered records from the parent (shares REQ-003 time filter). */
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** Configurable threshold in kW. */
  readonly thresholdKw = signal(DEFAULT_THRESHOLD_KW);

  /** Configurable consecutive-minute window. */
  readonly consecutiveMinutes = signal(DEFAULT_CONSECUTIVE_MINUTES);

  /** Detected peak events — computed once per input/config change. */
  readonly peakEvents = computed<PeakEvent[]>(() =>
    detectPeakEvents(this.records(), this.thresholdKw(), this.consecutiveMinutes()),
  );

  /** Whether there are any active peaks in the current view. */
  readonly hasPeaks = computed(() => this.peakEvents().length > 0);
}
