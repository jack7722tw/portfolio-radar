'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Recommendation } from '@/lib/types';
import {
  getRecommendations,
  saveRecommendations,
  calcRecommendationStats,
} from '@/lib/recommendations';
import { formatPercent } from '@/lib/calculations';

export default function AccuracyTab() {
  const [recs, setRecs] = useState<Recommendation[]>(() => getRecommendations());
  const [evaluating, setEvaluating] = useState(false);

  const stats = useMemo(() => calcRecommendationStats(recs), [recs]);

  const pendingCount = recs.filter(r => r.outcome === null).length;

  const evaluateAll = useCallback(async () => {
    const pending = recs.filter(r => r.outcome === null);
    if (pending.length === 0) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/recommendations/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendations: pending }),
      });
      const data = await res.json();
      if (data.evaluations) {
        const updated = [...recs];
        for (const ev of data.evaluations) {
          if (ev.error) continue;
          const rec = updated.find(r => r.id === ev.id);
          if (rec) {
            rec.outcome = {
              evaluatedAt: new Date().toISOString(),
              priceAtEvaluation: ev.currentPrice,
              returnPercent: ev.returnPercent,
              followed: true,
            };
          }
        }
        setRecs(updated);
        saveRecommendations(updated);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  }, [recs]);

  const toggleFollowed = useCallback((id: string) => {
    const updated = recs.map(r => {
      if (r.id !== id || !r.outcome) return r;
      return { ...r, outcome: { ...r.outcome, followed: !r.outcome.followed } };
    });
    setRecs(updated);
    saveRecommendations(updated);
  }, [recs]);

  const followedStats = useMemo(() => {
    const followed = recs.filter(r => r.outcome?.followed);
    const unfollowed = recs.filter(r => r.outcome && !r.outcome.followed);
    return { followed, unfollowed };
  }, [recs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">AI 準確度儀表板</h2>
        <Button
          size="sm"
          onClick={evaluateAll}
          disabled={evaluating || pendingCount === 0}
        >
          {evaluating ? '評估中...' : `評估 ${pendingCount} 筆待結算`}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="建議總數" value={String(stats.total)} />
        <StatBox label="已結算" value={String(stats.evaluated)} />
        <StatBox
          label="勝率"
          value={`${stats.winRate.toFixed(0)}%`}
          color={stats.winRate >= 50 ? '#00d4aa' : '#ff4d6d'}
        />
        <StatBox
          label="平均報酬"
          value={formatPercent(stats.avgReturn)}
          color={stats.avgReturn >= 0 ? '#00d4aa' : '#ff4d6d'}
        />
      </div>

      {stats.evaluated > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm text-muted-foreground">照做 vs 沒照做</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">照做 AI 建議</div>
              <div className="flex items-center gap-2">
                <BarVisual value={stats.followedWinRate} />
                <span className="font-mono text-sm">{stats.followedWinRate.toFixed(0)}% 勝率</span>
              </div>
              <div className={`font-mono text-sm ${stats.followedAvgReturn >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
                平均 {formatPercent(stats.followedAvgReturn)}
              </div>
              <div className="text-xs text-muted-foreground">{followedStats.followed.length} 筆</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">沒照做</div>
              <div className="flex items-center gap-2">
                <BarVisual value={stats.unfollowedWinRate} />
                <span className="font-mono text-sm">{stats.unfollowedWinRate.toFixed(0)}% 勝率</span>
              </div>
              <div className={`font-mono text-sm ${stats.unfollowedAvgReturn >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
                平均 {formatPercent(stats.unfollowedAvgReturn)}
              </div>
              <div className="text-xs text-muted-foreground">{followedStats.unfollowed.length} 筆</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm text-muted-foreground">建議歷史</h3>
        {recs.map(rec => (
          <div key={rec.id} className="bg-card border border-border rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{rec.symbol}</span>
                <Badge variant="outline" className="text-xs">{rec.type.replace('_', ' ')}</Badge>
                <Badge variant={
                  rec.confidence === '高' ? 'default' :
                  rec.confidence === '中' ? 'secondary' : 'outline'
                } className="text-xs">
                  {rec.confidence}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(rec.timestamp).toLocaleDateString('zh-TW')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{rec.content}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                建議時 ${rec.priceAtRecommendation.toFixed(2)}
              </span>
              {rec.outcome ? (
                <div className="flex items-center gap-2">
                  <span className={rec.outcome.returnPercent >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}>
                    {formatPercent(rec.outcome.returnPercent)} → ${rec.outcome.priceAtEvaluation.toFixed(2)}
                  </span>
                  <button
                    onClick={() => toggleFollowed(rec.id)}
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      rec.outcome.followed
                        ? 'bg-[#00d4aa]/20 text-[#00d4aa]'
                        : 'bg-[#64748b]/20 text-[#64748b]'
                    }`}
                  >
                    {rec.outcome.followed ? '已照做' : '沒照做'}
                  </button>
                </div>
              ) : (
                <span className="text-[#fbbf24]">待結算</span>
              )}
            </div>
          </div>
        ))}
        {recs.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            尚無 AI 建議記錄，先執行「AI 分析止損止盈」
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-xl font-bold mt-1" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function BarVisual({ value }: { value: number }) {
  return (
    <div className="w-16 bg-muted rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundColor: value >= 50 ? '#00d4aa' : '#ff4d6d',
        }}
      />
    </div>
  );
}
