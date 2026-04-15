import { computeTop3Hours } from './top3-hours.utils';
import { PowerConsumptionRecord } from '../power-consumption.service';

/** Helper to create a minimal record. */
function makeRecord(time: string, globalActivePower: number): PowerConsumptionRecord {
  return {
    index: 0,
    date: '1/1/26',
    time,
    globalActivePower,
    globalReactivePower: 0,
    voltage: 230,
    globalIntensity: 4,
    subMetering1: 0,
    subMetering2: 0,
    subMetering3: 0,
  };
}

describe('computeTop3Hours', () => {
  it('should return empty array for no records', () => {
    expect(computeTop3Hours([])).toEqual([]);
  });

  it('should compute averages by hour and return top 3', () => {
    const records = [
      // Hour 8: avg = (2 + 4) / 2 = 3.0
      makeRecord('8:00:00', 2.0),
      makeRecord('8:30:00', 4.0),
      // Hour 18: avg = (6 + 8) / 2 = 7.0
      makeRecord('18:00:00', 6.0),
      makeRecord('18:15:00', 8.0),
      // Hour 12: avg = 5.0
      makeRecord('12:00:00', 5.0),
      // Hour 3: avg = 1.0
      makeRecord('3:00:00', 1.0),
    ];

    const result = computeTop3Hours(records);
    expect(result).toHaveLength(3);
    // Top 1: hour 18 (7.0 kW)
    expect(result[0].hour).toBe(18);
    expect(result[0].avgPowerKw).toBeCloseTo(7.0);
    expect(result[0].label).toBe('18:00 – 19:00');
    // Top 2: hour 12 (5.0 kW)
    expect(result[1].hour).toBe(12);
    expect(result[1].avgPowerKw).toBeCloseTo(5.0);
    // Top 3: hour 8 (3.0 kW)
    expect(result[2].hour).toBe(8);
    expect(result[2].avgPowerKw).toBeCloseTo(3.0);
  });

  it('should return fewer than 3 if fewer hours have data', () => {
    const records = [makeRecord('10:00:00', 3.0)];
    const result = computeTop3Hours(records);
    expect(result).toHaveLength(1);
    expect(result[0].hour).toBe(10);
  });

  it('should format hour 23 wrapping to 00', () => {
    const records = [makeRecord('23:30:00', 5.0)];
    const result = computeTop3Hours(records);
    expect(result[0].label).toBe('23:00 – 00:00');
  });
});
