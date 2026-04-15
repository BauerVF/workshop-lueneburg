/**
 * REQ-014 – Reactive Power Warning (pure functions).
 *
 * Power factor = GAP / sqrt(GAP² + GRP²)
 * Warning threshold: < 0.8
 */

export interface PowerFactorInfo {
  powerFactor: number;
  isWarning: boolean;
}

/**
 * Calculate the power factor from active and reactive power.
 * Returns null if inputs are invalid (both zero).
 */
export function calculatePowerFactor(
  globalActivePower: number,
  globalReactivePower: number,
): PowerFactorInfo | null {
  if (globalActivePower === 0 && globalReactivePower === 0) {
    return null;
  }
  const apparent = Math.sqrt(
    globalActivePower * globalActivePower +
    globalReactivePower * globalReactivePower,
  );
  if (apparent === 0) return null;

  const pf = globalActivePower / apparent;
  return {
    powerFactor: Math.round(pf * 100) / 100,
    isWarning: pf < 0.8,
  };
}
