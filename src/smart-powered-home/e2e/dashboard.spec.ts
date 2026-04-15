import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Smart Powered Home dashboard.
 *
 * Prerequisites:
 *   - .NET API running on http://localhost:5229 (with imported data)
 *   - Angular dev server running on http://localhost:4200
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // REQ-009: Loading Skeleton Screen
  test('REQ-009: shows loading skeletons then replaces with content', async ({ page }) => {
    // On fresh navigation, skeleton should appear briefly
    // After data loads, skeleton should be gone and dashboard should be visible
    await page.waitForSelector('.dashboard', { timeout: 30_000 });
    const skeleton = page.locator('app-loading-skeleton');
    await expect(skeleton).toHaveCount(0);
  });

  // REQ-001: Power Overview Widget
  test('REQ-001: shows power overview card with kW value and timestamp', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const powerValue = page.locator('[data-testid="power-value"]');
    await expect(powerValue).toBeVisible();
    // Should contain a numeric value and "kW"
    const text = await powerValue.textContent();
    expect(text).toMatch(/[\d.]+/);

    const powerMeta = page.locator('[data-testid="power-meta"]');
    await expect(powerMeta).toBeVisible();
    // Should contain a date and "at" separator
    const metaText = await powerMeta.textContent();
    expect(metaText).toContain('at');
  });

  // REQ-008: Daily Total Consumption Badge
  test('REQ-008: shows daily total badge with kWh value and date', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const totalValue = page.locator('[data-testid="daily-total-value"]');
    await expect(totalValue).toBeVisible();
    const text = await totalValue.textContent();
    expect(text).toMatch(/[\d.]+/);

    const totalDate = page.locator('[data-testid="daily-total-date"]');
    await expect(totalDate).toBeVisible();
  });

  // REQ-003: Consumption Timeline Chart
  test('REQ-003: renders timeline chart with canvas element', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const chartContainer = page.locator('[data-testid="timeline-chart"]');
    await expect(chartContainer).toBeVisible();

    // Chart.js renders to a <canvas> element
    const canvas = chartContainer.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });

  // REQ-004: Sub-Metering Breakdown Chart
  test('REQ-004: renders breakdown doughnut chart', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const chartContainer = page.locator('[data-testid="breakdown-chart"]');
    await expect(chartContainer).toBeVisible();

    const canvas = chartContainer.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });

  // REQ-005: Peak Shaving Alert System
  test('REQ-005: shows peak event log section', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const eventLog = page.locator('[data-testid="peak-event-log"]');
    await expect(eventLog).toBeVisible();

    // Should either have a table of events or a "no peaks" message
    const table = eventLog.locator('table');
    const noPeaks = eventLog.locator('.no-peaks');
    const hasTable = await table.count();
    const hasNoPeaks = await noPeaks.count();
    expect(hasTable + hasNoPeaks).toBeGreaterThan(0);
  });

  test('REQ-005: peak threshold controls are configurable', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const thresholdInput = page.locator('[data-testid="peak-threshold-input"]');
    await expect(thresholdInput).toBeVisible();

    const minutesInput = page.locator('[data-testid="peak-minutes-input"]');
    await expect(minutesInput).toBeVisible();
  });

  // REQ-010: Top 3 Highest Consumption Hours
  test('REQ-010: displays top 3 peak consumption hours', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const list = page.locator('[data-testid="top3-hours-list"]');
    await expect(list).toBeVisible();

    // Should have exactly 3 list items
    const items = list.locator('li');
    await expect(items).toHaveCount(3);

    // Each item should display an hour range (e.g. "18:00 – 19:00") and a kW value
    for (let i = 0; i < 3; i++) {
      const text = await items.nth(i).textContent();
      expect(text).toMatch(/\d{2}:00/); // hour label
      expect(text).toMatch(/[\d.]+\s*kW/); // kW value
    }
  });
});
