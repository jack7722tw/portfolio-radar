'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Position, QuoteData, StopAnalysisMap } from '@/lib/types';
import {
  calcTotalValue,
  calcTotalPnL,
  calcAllocationPercent,
  calcConcentration,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import PositionCard from './PositionCard';
import PositionInput from './PositionInput';
import EditModal from './EditModal';

interface Props {
  positions: Position[];
  quotes: Record<string, QuoteData>;
  analyses: StopAnalysisMap;
  onUpdatePositions: (positions: Position[]) => void;
  onRefreshQuotes: () => void;
  onRunAnalysis: () => void;
  loading: boolean;
  analysisLoading: boolean;
}

export default function PortfolioView({
  positions,
  quotes,
  analyses,
  onUpdatePositions,
  onRefreshQuotes,
  onRunAnalysis,
  loading,
  analysisLoading,
}: Props) {
  const [showInput, setShowInput] = useState(false);
  const [editSymbol, setEditSymbol] = useState<string | null>(null);

  const totalValue = calcTotalValue(positions, quotes);
  const totalPnL = calcTotalPnL(positions, quotes);
  const totalPnLPercent = positions.reduce((sum, p) => sum + p.costBasis * p.shares, 0);
  const pnlPercent = totalPnLPercent > 0 ? (totalPnL / totalPnLPercent) * 100 : 0;

  const alertCount = positions.filter(p => {
    const q = quotes[p.symbol];
    if (!q || !p.stopLoss) return false;
    return q.c <= p.stopLoss;
  }).length;

  const concentrationWarnings = calcConcentration(positions, quotes);

  const handleAdd = useCallback((position: Position) => {
    onUpdatePositions([...positions, position]);
  }, [positions, onUpdatePositions]);

  const handleDelete = useCallback((symbol: string) => {
    onUpdatePositions(positions.filter(p => p.symbol !== symbol));
  }, [positions, onUpdatePositions]);

  const handleEdit = useCallback((updated: Position) => {
    onUpdatePositions(positions.map(p => p.symbol === updated.symbol ? updated : p));
  }, [positions, onUpdatePositions]);

  const editingPosition = editSymbol ? positions.find(p => p.symbol === editSymbol) || null : null;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio Radar</div>
        <div className="flex items-baseline justify-between mt-1">
          <div className="font-mono text-3xl font-bold">{formatCurrency(totalValue)}</div>
          {alertCount > 0 && (
            <span className="text-[#fbbf24] text-sm">{alertCount} 個警報</span>
          )}
        </div>
        <div className={`font-mono text-sm mt-1 ${totalPnL >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
          {formatCurrency(totalPnL)} 未實現損益 ({formatPercent(pnlPercent)})
        </div>
      </div>

      {concentrationWarnings.length > 0 && (
        <div className="bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 rounded-lg p-3 space-y-1">
          {concentrationWarnings.map(w => (
            <div key={w.sector} className="flex items-center gap-2 text-sm">
              <span className="text-[#ff4d6d] font-medium">集中度警告</span>
              <span className="text-foreground">
                {w.sector} 佔 {w.percent.toFixed(1)}%（{w.symbols.join(', ')}）
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowInput(!showInput)}>
          + 新增持倉
        </Button>
        <Button size="sm" variant="outline" onClick={onRefreshQuotes} disabled={loading}>
          {loading ? '更新中...' : '↻ 更新報價'}
        </Button>
        <Button size="sm" onClick={onRunAnalysis} disabled={analysisLoading || positions.length === 0}>
          {analysisLoading ? 'AI 分析中...' : 'AI 分析止損止盈'}
        </Button>
      </div>

      {showInput && (
        <PositionInput onAdd={handleAdd} onClose={() => setShowInput(false)} />
      )}

      <div className="grid gap-3">
        {positions.map(position => (
          <PositionCard
            key={position.symbol}
            position={position}
            quote={quotes[position.symbol]}
            analysis={analyses[position.symbol]}
            allocationPercent={
              quotes[position.symbol]
                ? calcAllocationPercent(position, quotes[position.symbol], totalValue)
                : 0
            }
            onEdit={setEditSymbol}
            onDelete={handleDelete}
          />
        ))}
        {positions.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            尚無持倉，按「+ 新增持倉」開始
          </div>
        )}
      </div>

      <EditModal
        position={editingPosition}
        open={!!editSymbol}
        onClose={() => setEditSymbol(null)}
        onSave={handleEdit}
      />
    </div>
  );
}
