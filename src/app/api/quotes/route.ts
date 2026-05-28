import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/finnhub';

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols');
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
  }

  if (symbols.length > 20) {
    return NextResponse.json({ error: 'Too many symbols (max 20)' }, { status: 400 });
  }

  try {
    const quotes = await getQuotes(symbols);
    return NextResponse.json(quotes);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
