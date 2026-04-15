/**
 * REQ-003 – Utility functions for the consumption timeline chart.
 * Pure functions — no DOM, no inject(), no HTTP.
 */

/**
 * Parse a date string in M/D/YY format to a JavaScript Date.
 * Example: "1/15/26" → new Date(2026, 0, 15)
 */
export function parseRecordDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day);
}

/**
 * Format a JS Date back to M/D/YY string to match the dataset format.
 */
export function formatRecordDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const yy = date.getFullYear() % 100;
  return `${m}/${d}/${yy}`;
}
