import { displayWeight, fromStoredKg, kgToLb, lbToKg, toStoredKg } from '@/utils';

describe('unit conversions', () => {
  it('converts kg <-> lb and round-trips', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 6);
  });

  it('formats weight for each unit system', () => {
    expect(displayWeight(100, 'metric')).toBe('100.0 kg');
    expect(displayWeight(100, 'imperial')).toMatch(/lb$/);
    expect(displayWeight(null, 'metric')).toBe('—');
  });

  it('stores user-entered weight as kg and reads back in the user unit', () => {
    const storedFromLb = toStoredKg(220, 'imperial');
    expect(storedFromLb).toBeCloseTo(99.79, 1);
    expect(fromStoredKg(storedFromLb, 'imperial')).toBeCloseTo(220, 4);
    expect(toStoredKg(80, 'metric')).toBe(80);
  });
});
