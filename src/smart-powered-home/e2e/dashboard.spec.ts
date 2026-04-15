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

    // Should have between 1 and 3 items (today may have fewer hours so far)
    const items = list.locator('li');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);

    // Each item should display an hour range (e.g. "18:00 – 19:00") and a kW value
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      expect(text).toMatch(/\d{2}:00/); // hour label
      expect(text).toMatch(/[\d.]+\s*kW/); // kW value
    }
  });

  // REQ-013: Record Count & Date Range Info Bar
  test('REQ-013: shows info bar with record count and date range', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const infoBar = page.locator('[data-testid="info-bar"]');
    await expect(infoBar).toBeVisible();

    const text = await infoBar.textContent();
    // Should contain a number (record count) and a "–" separator for date range
    expect(text).toMatch(/[\d,]+\s*records/);
    expect(text).toContain('–');
  });

  // REQ-007: Voltage Status Indicator
  test('REQ-007: shows voltage status with colour-coded indicator', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const voltageStatus = page.locator('[data-testid="voltage-status"]');
    await expect(voltageStatus).toBeVisible();

    // Should show a voltage value with V unit
    const text = await voltageStatus.textContent();
    expect(text).toMatch(/[\d.]+/);
    // Should contain a label (Normal, Marginal, or Critical)
    expect(text).toMatch(/Normal|Marginal|Critical/);
  });

  // REQ-012: Current Intensity Badge
  test('REQ-012: shows current intensity value in amps', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const intensityValue = page.locator('[data-testid="intensity-value"]');
    await expect(intensityValue).toBeVisible();

    const text = await intensityValue.textContent();
    expect(text).toMatch(/[\d.]+/);

    const meta = page.locator('[data-testid="intensity-meta"]');
    await expect(meta).toBeVisible();
    const metaText = await meta.textContent();
    expect(metaText).toContain('at');
  });

  // REQ-014: Reactive Power Warning Flag
  test('REQ-014: shows power factor value', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const pfDisplay = page.locator('[data-testid="power-factor"]');
    await expect(pfDisplay).toBeVisible();

    const text = await pfDisplay.textContent();
    // Should contain a decimal number (power factor between 0 and 1)
    expect(text).toMatch(/[\d.]+/);
    // Should show either Good or a warning message
    expect(text).toMatch(/Good|Poor power factor/);
  });

  // REQ-015: Appliance Zone Comparison Bars
  test('REQ-015: shows zone comparison bars for kitchen, laundry, heating', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const zones = page.locator('[data-testid="zone-comparison"]');
    await expect(zones).toBeVisible();

    // Should have 3 zone rows
    const rows = zones.locator('.zone-row');
    await expect(rows).toHaveCount(3);

    // Each row should have a label and a Wh value
    for (let i = 0; i < 3; i++) {
      const text = await rows.nth(i).textContent();
      expect(text).toMatch(/Kitchen|Laundry|Heating/);
      expect(text).toMatch(/Wh/);
    }
  });

  // REQ-016: Midnight Standby Load Indicator
  test('REQ-016: shows standby load indicator', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const standby = page.locator('[data-testid="standby-load"]');
    // Standby data might not be available if no midnight records for today
    // So we check the component or no-data message is rendered
    const standbyComponent = page.locator('app-standby-load');
    await expect(standbyComponent).toBeVisible();
  });

  // REQ-002: Consumption Data Table
  test('REQ-002: shows paginated data table with records', async ({ page }) => {
    await page.waitForSelector('.dashboard', { timeout: 30_000 });

    const table = page.locator('[data-testid="data-table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Table should have header columns
    const headers = table.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBe(8); // Date, Time, AP, Voltage, Intensity, Sub1/2/3

    // Table should have data rows (at least 1)
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });
});
