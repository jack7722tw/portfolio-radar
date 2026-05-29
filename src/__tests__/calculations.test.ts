import { describe, it, expect } from 'vitest';
import {
  calcConcentration,
  calcPositionSizePercent,
  getSector,
} from '@/lib/calculations';

describe('getSector', () => {
  it('maps known symbols', () => {
    expect(getSector('NVDA')).toBe('AI/半導體');
    expect(getSector('TSLA')).toBe('電動車');
    expect(getSector('COIN')).toBe('加密貨幣');
  });

  it('returns 其他 for unknown symbols', () => {
    expect(getSector('UNKNOWN')).toBe('其他');
  });
});

describe('calcConcentration', () => {
  it('returns empty for no positions', () => {
    expect(calcConcentration([], {})).toEqual([]);
  });

  it('warns when single sector exceeds 50%', () => {
    const positions = [
      { symbol: 'NVDA', shares: 10, costBasis: 200, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
      { symbol: 'AMD', shares: 10, costBasis: 100, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
      { symbol: 'TSLA', shares: 1, costBasis: 100, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
    ];
    const quotes = {
      NVDA: { c: 200, dp: 0, h: 200, l: 200 },
      AMD: { c: 100, dp: 0, h: 100, l: 100 },
      TSLA: { c: 100, dp: 0, h: 100, l: 100 },
    };
    const warnings = calcConcentration(positions, quotes);
    expect(warnings.length).toBe(1);
    expect(warnings[0].sector).toBe('AI/半導體');
    expect(warnings[0].percent).toBeGreaterThan(50);
  });

  it('no warning when balanced', () => {
    const positions = [
      { symbol: 'NVDA', shares: 1, costBasis: 100, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
      { symbol: 'TSLA', shares: 1, costBasis: 100, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
      { symbol: 'COIN', shares: 1, costBasis: 100, stopLossSource: 'ai' as const, takeProfitSource: 'ai' as const },
    ];
    const quotes = {
      NVDA: { c: 100, dp: 0, h: 100, l: 100 },
      TSLA: { c: 100, dp: 0, h: 100, l: 100 },
      COIN: { c: 100, dp: 0, h: 100, l: 100 },
    };
    const warnings = calcConcentration(positions, quotes);
    expect(warnings.length).toBe(0);
  });
});

describe('calcPositionSizePercent', () => {
  it('returns higher % for low ATR and high confidence', () => {
    const high = calcPositionSizePercent(2, '高');
    const low = calcPositionSizePercent(5, '低');
    expect(high).toBeGreaterThan(low);
  });

  it('clamps between 2% and 25%', () => {
    expect(calcPositionSizePercent(0.1, '高')).toBeLessThanOrEqual(25);
    expect(calcPositionSizePercent(50, '低')).toBeGreaterThanOrEqual(2);
  });

  it('handles zero ATR', () => {
    expect(calcPositionSizePercent(0, '中')).toBe(5);
  });
});
