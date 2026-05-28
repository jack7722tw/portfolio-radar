import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithClaude } from '@/lib/anthropic';
import { WEEKLY_REVIEW_PROMPT, fillPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      positionsWithPerformance,
      lastWeekRecommendations,
      recentTrades,
    } = body;

    if (!positionsWithPerformance) {
      return NextResponse.json({ error: 'Missing positionsWithPerformance' }, { status: 400 });
    }

    const prompt = fillPrompt(WEEKLY_REVIEW_PROMPT, {
      positions_with_weekly_performance: JSON.stringify(positionsWithPerformance, null, 2),
      last_week_recommendations: lastWeekRecommendations || '無',
      recent_trades: recentTrades ? JSON.stringify(recentTrades, null, 2) : '本週無交易',
    });

    const response = await analyzeWithClaude(prompt, 'sonnet');

    return NextResponse.json({ report: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
