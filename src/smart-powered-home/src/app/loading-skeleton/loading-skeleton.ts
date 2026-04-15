import { Component } from '@angular/core';

/**
 * REQ-009 – Loading Skeleton Screen
 *
 * CSS-only skeleton placeholders matching widget shapes.
 * Renders while `loading()` is true on `PowerConsumptionService`.
 * No external library — uses the global `.skeleton` CSS class with shimmer animation.
 */
@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss',
})
export class LoadingSkeleton {}
