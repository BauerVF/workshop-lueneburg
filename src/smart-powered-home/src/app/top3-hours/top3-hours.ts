import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Card } from 'primeng/card';
import { PowerConsumptionService } from '../power-consumption.service';
import { computeTop3Hours } from './top3-hours.utils';

/** Medal icons for ranks 1–3 */
const RANK_ICONS = ['pi pi-trophy', 'pi pi-trophy', 'pi pi-trophy'] as const;
const RANK_COLORS = ['#f59e0b', '#a1a1aa', '#cd7f32'] as const;

/**
 * REQ-010 – Top 3 Highest Consumption Hours
 *
 * Groups all records by hour (0–23), computes the average globalActivePower
 * per hour, and displays the top 3. Calculated **once** after data loads
 * via `computed()` — never recalculated per render cycle (NFR).
 */
@Component({
  selector: 'app-top3-hours',
  imports: [Card, DecimalPipe],
  templateUrl: './top3-hours.html',
  styleUrl: './top3-hours.scss',
})
export class TopThreeHours {
  private readonly powerService = inject(PowerConsumptionService);

  /** Top 3 hours computed once from the full dataset. */
  readonly top3 = computed(() => computeTop3Hours(this.powerService.records()));

  readonly rankIcons = RANK_ICONS;
  readonly rankColors = RANK_COLORS;
}
