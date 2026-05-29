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

// Sector mapping for concentration analysis
const SECTOR_MAP: Record<string, string> = {
  NVDA: 'AI/半導體', AMD: 'AI/半導體', AVGO: 'AI/半導體', TSM: 'AI/半導體', INTC: 'AI/半導體',
  TSLA: '電動車', RIVN: '電動車', LCID: '電動車', NIO: '電動車',
  AAPL: '科技', MSFT: '科技', GOOG: '科技', GOOGL: '科技', META: '科技', AMZN: '科技',
  COIN: '加密貨幣', MSTR: '加密貨幣', MSTU: '加密貨幣', IBIT: '加密貨幣', HOOD: '金融科技',
  PLTR: 'AI/軟體', AI: 'AI/軟體', SNOW: 'AI/軟體', CRWD: '資安',
  GEV: '電力', CEG: '核能', VST: '核能', VRT: '散熱', RKLB: '太空',
  SPY: '大盤ETF', QQQ: '大盤ETF', VOO: '大盤ETF',
};

export function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] || '其他';
}

export interface ConcentrationWarning {
  sector: string;
  percent: number;
  symbols: string[];
}

export function calcConcentration(
  positions: Position[],
  quotes: Record<string, QuoteData>
): ConcentrationWarning[] {
  const totalValue = calcTotalValue(positions, quotes);
  if (totalValue === 0) return [];

  const sectorMap: Record<string, { value: number; symbols: string[] }> = {};
  for (const p of positions) {
    const q = quotes[p.symbol];
    if (!q) continue;
    const sector = getSector(p.symbol);
    if (!sectorMap[sector]) sectorMap[sector] = { value: 0, symbols: [] };
    sectorMap[sector].value += calcMarketValue(p, q);
    sectorMap[sector].symbols.push(p.symbol);
  }

  return Object.entries(sectorMap)
    .map(([sector, data]) => ({
      sector,
      percent: (data.value / totalValue) * 100,
      symbols: data.symbols,
    }))
    .filter(w => w.percent > 50)
    .sort((a, b) => b.percent - a.percent);
}

export function calcPositionSizePercent(
  atrPercent: number,
  confidence: '高' | '中' | '低',
  riskPerTrade: number = 2
): number {
  const confidenceMultiplier = { '高': 1.5, '中': 1.0, '低': 0.5 }[confidence];
  if (atrPercent <= 0) return 5;
  const raw = (riskPerTrade / atrPercent) * 100 * confidenceMultiplier;
  return Math.min(Math.max(Math.round(raw), 2), 25);
}
