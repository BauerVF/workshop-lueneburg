import { detectPeakEvents, PeakEvent } from './peak-shaving.utils';
import { PowerConsumptionRecord } from '../power-consumption.service';

/** Helper to create a minimal record for testing. */
function makeRecord(overrides: Partial<PowerConsumptionRecord> = {}): PowerConsumptionRecord {
  return {
    index: 0,
    date: '1/1/26',
    time: '0:00:00',
    globalActivePower: 1.0,
    globalReactivePower: 0,
    voltage: 230,
    globalIntensity: 4,
    subMetering1: 0,
    subMetering2: 0,
    subMetering3: 0,
    ...overrides,
  };
}

describe('detectPeakEvents', () => {
  it('should return empty array when no records exceed threshold', () => {
    const records = [
      makeRecord({ globalActivePower: 2.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 3.0, time: '0:01:00' }),
      makeRecord({ globalActivePower: 1.5, time: '0:02:00' }),
    ];
    const result = detectPeakEvents(records, 5.0, 2);
    expect(result).toEqual([]);
  });

  it('should detect a single peak event', () => {
    const records = [
      makeRecord({ globalActivePower: 1.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 6.0, time: '0:01:00' }),
      makeRecord({ globalActivePower: 7.0, time: '0:02:00' }),
      makeRecord({ globalActivePower: 5.5, time: '0:03:00' }),
      makeRecord({ globalActivePower: 2.0, time: '0:04:00' }),
    ];
    const result = detectPeakEvents(records, 5.0, 3);
    expect(result).toHaveLength(1);
    expect(result[0].startTime).toBe('0:01:00');
    expect(result[0].endTime).toBe('0:03:00');
    expect(result[0].maxPowerKw).toBe(7.0);
    expect(result[0].durationMinutes).toBe(3);
  });

  it('should not detect peak if streak is shorter than consecutiveMinutes', () => {
    const records = [
      makeRecord({ globalActivePower: 6.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 6.0, time: '0:01:00' }),
      makeRecord({ globalActivePower: 1.0, time: '0:02:00' }),
    ];
    const result = detectPeakEvents(records, 5.0, 3);
    expect(result).toEqual([]);
  });

  it('should detect multiple peak events', () => {
    const records = [
      makeRecord({ globalActivePower: 6.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 7.0, time: '0:01:00' }),
      makeRecord({ globalActivePower: 8.0, time: '0:02:00' }),
      makeRecord({ globalActivePower: 1.0, time: '0:03:00' }),
      makeRecord({ globalActivePower: 9.0, time: '0:04:00' }),
      makeRecord({ globalActivePower: 10.0, time: '0:05:00' }),
      makeRecord({ globalActivePower: 6.0, time: '0:06:00' }),
    ];
    const result = detectPeakEvents(records, 5.0, 2);
    expect(result).toHaveLength(2);
    expect(result[0].maxPowerKw).toBe(8.0);
    expect(result[1].maxPowerKw).toBe(10.0);
  });

  it('should handle peak at the end of the array', () => {
    const records = [
      makeRecord({ globalActivePower: 1.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 6.0, time: '0:01:00' }),
      makeRecord({ globalActivePower: 7.0, time: '0:02:00' }),
    ];
    const result = detectPeakEvents(records, 5.0, 2);
    expect(result).toHaveLength(1);
    expect(result[0].endTime).toBe('0:02:00');
  });

  it('should return empty for empty records', () => {
    expect(detectPeakEvents([], 5.0, 2)).toEqual([]);
  });

  it('should work with configurable thresholds', () => {
    const records = [
      makeRecord({ globalActivePower: 3.0, time: '0:00:00' }),
      makeRecord({ globalActivePower: 3.5, time: '0:01:00' }),
      makeRecord({ globalActivePower: 4.0, time: '0:02:00' }),
    ];
    // With high threshold: no peaks
    expect(detectPeakEvents(records, 5.0, 2)).toEqual([]);
    // With lower threshold: one peak
    expect(detectPeakEvents(records, 3.0, 3)).toHaveLength(1);
  });
});
