'use client';

import { useMemo } from 'react';
import type { Trade } from '@/lib/types';
import { getTrades } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';

export default function StatsTab() {
  const trades = useMemo(() => getTrades(), []);

  const stats = useMemo(() => {
    if (trades.length === 0) return null;

    const sells = trades.filter(t => t.action === 'SELL' && t.exitPrice);
    const wins = sells.filter(t => t.exitPrice! > t.price);
    const winRate = sells.length > 0 ? (wins.length / sells.length) * 100 : 0;

    const totalBought = trades.filter(t => t.action === 'BUY').reduce((sum, t) => sum + t.price * t.shares, 0);
    const totalSold = trades.filter(t => t.action === 'SELL').reduce((sum, t) => sum + t.price * t.shares, 0);

    const emotionGroups: Record<string, { wins: number; total: number }> = {};
    for (const t of sells) {
      if (!t.emotion) continue;
      if (!emotionGroups[t.emotion]) emotionGroups[t.emotion] = { wins: 0, total: 0 };
      emotionGroups[t.emotion].total++;
      if (t.exitPrice! > t.price) emotionGroups[t.emotion].wins++;
    }

    return {
      totalTrades: trades.length,
      buys: trades.filter(t => t.action === 'BUY').length,
      sellCount: sells.length,
      winRate,
      totalBought,
      totalSold,
      emotionGroups,
    };
  }, [trades]);

  if (!stats || trades.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        尚無足夠的交易記錄來產生統計
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">績效統計</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="總交易數" value={String(stats.totalTrades)} />
        <StatCard label="勝率" value={`${stats.winRate.toFixed(0)}%`} color={stats.winRate >= 50 ? '#00d4aa' : '#ff4d6d'} />
        <StatCard label="總買入" value={formatCurrency(stats.totalBought)} />
        <StatCard label="總賣出" value={formatCurrency(stats.totalSold)} />
      </div>

      {Object.keys(stats.emotionGroups).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm text-muted-foreground mb-3">情緒 × 勝率分析</h3>
          <div className="space-y-2">
            {Object.entries(stats.emotionGroups).map(([emotion, data]) => {
              const rate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
              return (
                <div key={emotion} className="flex items-center justify-between">
                  <span className="text-sm">{emotion}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${rate}%`,
                          backgroundColor: rate >= 50 ? '#00d4aa' : '#ff4d6d',
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs w-12 text-right">{rate.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-xl font-bold mt-1" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
