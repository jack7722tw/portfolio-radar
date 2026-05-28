import type { Position, QuoteData } from './types';

export function calcUnrealizedPnL(position: Position, quote: QuoteData): number {
  return (quote.c - position.costBasis) * position.shares;
}

export function calcUnrealizedPnLPercent(position: Position, quote: QuoteData): number {
  if (position.costBasis === 0) return 0;
  return ((quote.c - position.costBasis) / position.costBasis) * 100;
}

export function calcMarketValue(position: Position, quote: QuoteData): number {
  return quote.c * position.shares;
}

export function calcTotalValue(positions: Position[], quotes: Record<string, QuoteData>): number {
  return positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? calcMarketValue(p, q) : p.costBasis * p.shares);
  }, 0);
}

export function calcTotalCost(positions: Position[]): number {
  return positions.reduce((sum, p) => sum + p.costBasis * p.shares, 0);
}

export function calcTotalPnL(positions: Position[], quotes: Record<string, QuoteData>): number {
  return positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? calcUnrealizedPnL(p, q) : 0);
  }, 0);
}

export function calcAllocationPercent(
  position: Position,
  quote: QuoteData,
  totalValue: number
): number {
  if (totalValue === 0) return 0;
  return (calcMarketValue(position, quote) / totalValue) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
