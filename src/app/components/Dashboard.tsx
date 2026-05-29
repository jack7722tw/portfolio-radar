'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Position, QuoteData, StopAnalysisMap } from '@/lib/types';
import { getPositions, savePositions } from '@/lib/store';
import { addRecommendation } from '@/lib/recommendations';
import PortfolioView from './PortfolioView';
import OpportunityScanner from './OpportunityScanner';
import JournalTab from './JournalTab';
import StatsTab from './StatsTab';
import WeeklyReport from './WeeklyReport';
import RadarTab from './RadarTab';
import AccuracyTab from './AccuracyTab';

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [analyses, setAnalyses] = useState<StopAnalysisMap>({});
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    setPositions(getPositions());
  }, []);

  const handleUpdatePositions = useCallback((updated: Position[]) => {
    setPositions(updated);
    savePositions(updated);
  }, []);

  const fetchQuotes = useCallback(async () => {
    if (positions.length === 0) return;
    setLoading(true);
    try {
      const symbols = positions.map(p => p.symbol).join(',');
      const res = await fetch(`/api/quotes?symbols=${symbols}`);
      const data = await res.json();
      if (!data.error) setQuotes(data);
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [positions]);

  useEffect(() => {
    if (positions.length > 0) fetchQuotes();
  }, [positions.length, fetchQuotes]);

  const runAnalysis = useCallback(async () => {
    if (positions.length === 0) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/analyze/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: positions.map(p => ({
            symbol: p.symbol,
            shares: p.shares,
            costBasis: p.costBasis,
          })),
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setAnalyses(data);
        const updated = positions.map(p => {
          const a = data[p.symbol];
          if (!a) return p;
          return {
            ...p,
            stopLoss: p.stopLossSource === 'manual' ? p.stopLoss : a.suggestedStopLoss,
            takeProfit: p.takeProfitSource === 'manual' ? p.takeProfit : a.suggestedTakeProfit,
            aiAnalysis: a.currentTrend,
            lastAnalyzed: new Date().toISOString(),
          };
        });
        handleUpdatePositions(updated);

        for (const symbol of Object.keys(data)) {
          const a = data[symbol];
          const q = quotes[symbol];
          if (!a || !q) continue;
          addRecommendation({
            symbol,
            type: 'stop_loss',
            priceAtRecommendation: q.c,
            content: `止損 $${a.suggestedStopLoss} / 止盈 $${a.suggestedTakeProfit} — ${a.currentTrend}`,
            confidence: a.confidence,
          });
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalysisLoading(false);
    }
  }, [positions, handleUpdatePositions]);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="w-full grid grid-cols-7 bg-muted/50">
          <TabsTrigger value="portfolio" className="text-xs">持倉</TabsTrigger>
          <TabsTrigger value="scanner" className="text-xs">掃描</TabsTrigger>
          <TabsTrigger value="accuracy" className="text-xs">準確度</TabsTrigger>
          <TabsTrigger value="journal" className="text-xs">日誌</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">統計</TabsTrigger>
          <TabsTrigger value="report" className="text-xs">週報</TabsTrigger>
          <TabsTrigger value="radar" className="text-xs">雷達</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-4">
          <PortfolioView
            positions={positions}
            quotes={quotes}
            analyses={analyses}
            onUpdatePositions={handleUpdatePositions}
            onRefreshQuotes={fetchQuotes}
            onRunAnalysis={runAnalysis}
            loading={loading}
            analysisLoading={analysisLoading}
          />
        </TabsContent>

        <TabsContent value="scanner" className="mt-4">
          <OpportunityScanner positions={positions} />
        </TabsContent>

        <TabsContent value="accuracy" className="mt-4">
          <AccuracyTab />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <JournalTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <StatsTab />
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <WeeklyReport positions={positions} quotes={quotes} />
        </TabsContent>

        <TabsContent value="radar" className="mt-4">
          <RadarTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
