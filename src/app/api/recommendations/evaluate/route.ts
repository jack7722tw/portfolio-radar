import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/finnhub';

interface StoredRecommendation {
  id: string;
  symbol: string;
  priceAtRecommendation: number;
  outcome: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendations } = body as { recommendations: StoredRecommendation[] };

    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return NextResponse.json({ error: 'Missing recommendations array' }, { status: 400 });
    }

    const pendingRecs = recommendations.filter(r => r.outcome === null);
    if (pendingRecs.length === 0) {
      return NextResponse.json({ evaluations: [] });
    }

    const symbols = [...new Set(pendingRecs.map(r => r.symbol))];
    const quotes = await getQuotes(symbols);

    const evaluations = pendingRecs.map(rec => {
      const quote = quotes[rec.symbol];
      if (!quote) return { id: rec.id, error: 'No quote available' };

      const returnPercent = ((quote.c - rec.priceAtRecommendation) / rec.priceAtRecommendation) * 100;

      return {
        id: rec.id,
        symbol: rec.symbol,
        priceAtRecommendation: rec.priceAtRecommendation,
        currentPrice: quote.c,
        returnPercent: Math.round(returnPercent * 100) / 100,
        direction: returnPercent > 0 ? 'win' : 'loss',
      };
    });

    return NextResponse.json({ evaluations });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
