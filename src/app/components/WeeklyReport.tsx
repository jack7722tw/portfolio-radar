'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Position, QuoteData } from '@/lib/types';

interface Props {
  positions: Position[];
  quotes: Record<string, QuoteData>;
}

export default function WeeklyReport({ positions, quotes }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const positionsWithPerformance = positions.map(p => ({
        symbol: p.symbol,
        shares: p.shares,
        costBasis: p.costBasis,
        currentPrice: quotes[p.symbol]?.c || 0,
        dayChange: quotes[p.symbol]?.dp || 0,
        stopLoss: p.stopLoss,
        takeProfit: p.takeProfit,
      }));

      const res = await fetch('/api/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionsWithPerformance }),
      });
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error('Weekly review failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">週報</h2>
        <Button size="sm" onClick={generateReport} disabled={loading || positions.length === 0}>
          {loading ? 'AI 生成中...' : '產生週報'}
        </Button>
      </div>

      {report ? (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {report}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          按「產生週報」讓 AI 深度分析本週表現
        </div>
      )}
    </div>
  );
}
