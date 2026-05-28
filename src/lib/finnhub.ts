import type { QuoteData } from './types';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('FINNHUB_API_KEY is not set');
  return key;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getQuote(symbol: string): Promise<QuoteData> {
  const res = await fetch(
    `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Finnhub error for ${symbol}: ${res.status}`);
  const data = await res.json();
  return { c: data.c, dp: data.dp, h: data.h, l: data.l };
}

export async function getQuotes(symbols: string[]): Promise<Record<string, QuoteData>> {
  const result: Record<string, QuoteData> = {};
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i].toUpperCase().trim();
    if (!symbol) continue;
    result[symbol] = await getQuote(symbol);
    if (i < symbols.length - 1) await delay(200);
  }
  return result;
}
