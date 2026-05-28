import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/finnhub';
import { analyzeWithClaude, parseJsonResponse } from '@/lib/anthropic';
import { STOPS_PROMPT, fillPrompt } from '@/lib/prompts';
import type { StopAnalysisMap } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { positions } = body;

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json({ error: 'Missing or empty positions array' }, { status: 400 });
    }

    const symbols = positions.map((p: { symbol: string }) => p.symbol);
    const quotes = await getQuotes(symbols);

    const prompt = fillPrompt(STOPS_PROMPT, {
      positions_json: JSON.stringify(positions, null, 2),
      quotes_json: JSON.stringify(quotes, null, 2),
    });

    const response = await analyzeWithClaude(prompt, 'haiku');
    const analysis = parseJsonResponse<StopAnalysisMap>(response);

    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
