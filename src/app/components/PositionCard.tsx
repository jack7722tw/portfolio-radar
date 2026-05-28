'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Position, QuoteData, StopAnalysis } from '@/lib/types';
import {
  calcUnrealizedPnL,
  calcUnrealizedPnLPercent,
  calcMarketValue,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';

interface Props {
  position: Position;
  quote?: QuoteData;
  analysis?: StopAnalysis;
  allocationPercent: number;
  onEdit: (symbol: string) => void;
  onDelete: (symbol: string) => void;
}

export default function PositionCard({
  position,
  quote,
  analysis,
  allocationPercent,
  onEdit,
  onDelete,
}: Props) {
  const pnl = quote ? calcUnrealizedPnL(position, quote) : 0;
  const pnlPercent = quote ? calcUnrealizedPnLPercent(position, quote) : 0;
  const marketValue = quote ? calcMarketValue(position, quote) : position.costBasis * position.shares;
  const isPositive = pnl >= 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg">{position.symbol}</span>
            {analysis && (
              <Badge variant={
                analysis.confidence === '高' ? 'default' :
                analysis.confidence === '中' ? 'secondary' : 'outline'
              } className="text-xs">
                {analysis.confidence}
              </Badge>
            )}
          </div>
          {position.aiAnalysis && (
            <p className="text-xs text-muted-foreground mt-0.5">{position.aiAnalysis}</p>
          )}
        </div>
        <div className="text-right">
          {quote && (
            <>
              <div className="font-mono font-bold text-lg">{formatCurrency(quote.c)}</div>
              <div className={`font-mono text-sm ${quote.dp >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
                {formatPercent(quote.dp)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(allocationPercent, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        配置 {allocationPercent.toFixed(1)}%
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">止損</div>
          <div className="font-mono text-[#ff4d6d]">
            {position.stopLoss ? formatCurrency(position.stopLoss) : '--'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{position.shares} 股</div>
          <div className="font-mono">{formatCurrency(position.costBasis)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">止盈</div>
          <div className="font-mono text-[#00d4aa]">
            {position.takeProfit ? formatCurrency(position.takeProfit) : '--'}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>AI</span>
            <span className="text-foreground">{analysis.currentTrend}</span>
          </div>
          {analysis.stopLossReason && (
            <div className="text-muted-foreground">
              止損: {analysis.stopLossReason}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-muted-foreground">市值 </span>
          <span className="font-mono text-sm">{formatCurrency(marketValue)}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">損益 </span>
          <span className={`font-mono text-sm ${isPositive ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
            {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
          </span>
        </div>
      </div>

      <div className="flex gap-1 pt-1">
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onEdit(position.symbol)}>
          編輯
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => onDelete(position.symbol)}>
          刪除
        </Button>
      </div>
    </div>
  );
}
