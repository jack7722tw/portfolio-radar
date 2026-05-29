import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/finnhub';
import { analyzeWithClaude, parseJsonResponse } from '@/lib/anthropic';
import { ALTERNATIVES_PROMPT, fillPrompt } from '@/lib/prompts';
import { getCached, setCache } from '@/lib/cache';
import type { Alternative, HotMoney } from '@/lib/types';

interface AlternativesResponse {
  recommendations: Alternative[];
  hotMoney: HotMoney[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPositions, sectors, riskTolerance } = body;

    if (!currentPositions || !Array.isArray(currentPositions) || currentPositions.length === 0) {
      return NextResponse.json({ error: 'Missing or empty currentPositions' }, { status: 400 });
    }

    const cacheKey = `alternatives:${[...currentPositions].sort().join(',')}`;
    const cached = getCached<AlternativesResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const quotes = await getQuotes(currentPositions);

    const positionsWithQuotes = currentPositions.map((symbol: string) => ({
      symbol,
      quote: quotes[symbol],
      sectors: sectors || [],
      riskTolerance: riskTolerance || 'medium',
    }));

    const prompt = fillPrompt(ALTERNATIVES_PROMPT, {
      positions_with_quotes_json: JSON.stringify(positionsWithQuotes, null, 2),
    });

    const response = await analyzeWithClaude(prompt, 'haiku');
    const analysis = parseJsonResponse<AlternativesResponse>(response);

    setCache(cacheKey, analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
