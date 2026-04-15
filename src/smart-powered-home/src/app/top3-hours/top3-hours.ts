import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionRecord } from '../power-consumption.service';
import { computeTop3Hours } from './top3-hours.utils';

/** Medal icons for ranks 1–3 */
const RANK_ICONS = ['pi pi-trophy', 'pi pi-trophy', 'pi pi-trophy'] as const;
const RANK_COLORS = ['#f59e0b', '#a1a1aa', '#cd7f32'] as const;

/**
 * REQ-010 – Top 3 Highest Consumption Hours
 *
 * Groups filtered records by hour (0–23), computes the average
 * globalActivePower per hour, and displays the top 3.
 * Reacts to the shared date selection from the timeline.
 * Calculated once per input change via `computed()` (NFR).
 */
@Component({
  selector: 'app-top3-hours',
  imports: [Card, DecimalPipe],
  templateUrl: './top3-hours.html',
  styleUrl: './top3-hours.scss',
})
export class TopThreeHours {
  /** Filtered records from the parent (shares the timeline date filter). */
  readonly records = input.required<PowerConsumptionRecord[]>();

  /** Top 3 hours computed from the filtered records. */
  readonly top3 = computed(() => computeTop3Hours(this.records()));

  readonly rankIcons = RANK_ICONS;
  readonly rankColors = RANK_COLORS;
}
