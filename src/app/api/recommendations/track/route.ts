import { NextRequest, NextResponse } from 'next/server';

// Server-side in-memory store for recommendations
// In production, replace with Upstash Redis via Vercel Marketplace
const recommendations: Map<string, unknown> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, type, priceAtRecommendation, content, confidence } = body;

    if (!symbol || !type || !priceAtRecommendation || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const rec = {
      id,
      timestamp: new Date().toISOString(),
      symbol,
      type,
      priceAtRecommendation,
      content,
      confidence: confidence || '中',
      outcome: null,
    };

    recommendations.set(id, rec);
    return NextResponse.json(rec, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const all = Array.from(recommendations.values());
  return NextResponse.json(all);
}
