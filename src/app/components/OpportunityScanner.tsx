'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Position, Alternative, HotMoney } from '@/lib/types';
import AlternativeCard from './AlternativeCard';

interface Props {
  positions: Position[];
}

export default function OpportunityScanner({ positions }: Props) {
  const [recommendations, setRecommendations] = useState<Alternative[]>([]);
  const [hotMoney, setHotMoney] = useState<HotMoney[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  async function handleScan() {
    if (positions.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPositions: positions.map(p => p.symbol),
          sectors: ['tech', 'AI', 'fintech'],
          riskTolerance: 'medium',
        }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setHotMoney(data.hotMoney || []);
      setLastScanned(new Date().toLocaleString('zh-TW'));
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">機會掃描器</h2>
        <div className="flex items-center gap-3">
          {lastScanned && (
            <span className="text-xs text-muted-foreground">上次掃描: {lastScanned}</span>
          )}
          <Button size="sm" onClick={handleScan} disabled={loading || positions.length === 0}>
            {loading ? 'AI 掃描中...' : '掃描市場'}
          </Button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-muted-foreground">建議替換</h3>
          <div className="grid gap-3">
            {recommendations.map((rec, i) => (
              <AlternativeCard key={i} alternative={rec} />
            ))}
          </div>
        </div>
      )}

      {hotMoney.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-muted-foreground">市場熱點</h3>
          <div className="grid gap-3">
            {hotMoney.map((hot, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#fbbf24]">{hot.symbol}</span>
                  <span className="text-sm text-foreground">{hot.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{hot.reason}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">進場: <span className="text-foreground">{hot.suggestedEntry}</span></span>
                  <span className="text-muted-foreground">持有: <span className="text-foreground">{hot.suggestedHolding}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && hotMoney.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-12">
          按「掃描市場」讓 AI 分析替代標的和市場熱點
        </div>
      )}
    </div>
  );
}
