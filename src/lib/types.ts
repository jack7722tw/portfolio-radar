export interface Position {
  symbol: string;
  shares: number;
  costBasis: number;
  stopLoss?: number;
  takeProfit?: number;
  stopLossSource: 'ai' | 'manual';
  takeProfitSource: 'ai' | 'manual';
  aiAnalysis?: string;
  lastAnalyzed?: string;
  note?: string;
}

export interface Trade {
  id: number;
  date: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  emotion: string;
  reason: string;
  note?: string;
  exitPrice?: number;
  exitDate?: string;
}

export interface StopAnalysis {
  suggestedStopLoss: number;
  stopLossReason: string;
  suggestedTakeProfit: number;
  takeProfitReason: string;
  riskRewardRatio: number;
  currentTrend: string;
  atrPercent: number;
  confidence: '高' | '中' | '低';
}

export interface Alternative {
  replace: string;
  replaceReason: string;
  suggestSymbol: string;
  suggestName: string;
  suggestReason: string;
  expectedHoldingPeriod: string;
  confidence: '高' | '中' | '低';
  catalyst?: string;
}

export interface HotMoney {
  symbol: string;
  name: string;
  reason: string;
  suggestedEntry: string;
  suggestedHolding: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  date: string;
  portfolioReturn: number;
  spyReturn: number;
  bestPerformer: { symbol: string; return: number };
  worstPerformer: { symbol: string; return: number };
  positionReviews: PositionReview[];
  opportunities: HotMoney[];
  lastWeekAccuracy?: number;
  riskAlerts: string[];
  fullReport: string;
}

export interface PositionReview {
  symbol: string;
  weeklyReturn: number;
  action: 'hold' | 'sell' | 'adjust';
  adjustedStopLoss?: number;
  adjustedTakeProfit?: number;
  reason: string;
}

export interface QuoteData {
  c: number;  // current price
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
}

export type QuotesMap = Record<string, QuoteData>;
export type StopAnalysisMap = Record<string, StopAnalysis>;
