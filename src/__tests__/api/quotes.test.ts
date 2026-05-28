import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/finnhub', () => ({
  getQuotes: vi.fn(),
}));

import { GET } from '@/app/api/quotes/route';
import { getQuotes } from '@/lib/finnhub';
import { NextRequest } from 'next/server';

const mockedGetQuotes = vi.mocked(getQuotes);

function makeRequest(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/quotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if symbols param is missing', async () => {
    const res = await GET(makeRequest('/api/quotes'));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing symbols');
  });

  it('returns 400 if symbols is empty', async () => {
    const res = await GET(makeRequest('/api/quotes?symbols='));
    expect(res.status).toBe(400);
  });

  it('returns 400 if too many symbols', async () => {
    const symbols = Array.from({ length: 21 }, (_, i) => `SYM${i}`).join(',');
    const res = await GET(makeRequest(`/api/quotes?symbols=${symbols}`));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Too many symbols');
  });

  it('returns quotes for valid symbols', async () => {
    mockedGetQuotes.mockResolvedValue({
      NVDA: { c: 214.29, dp: -2.38, h: 220.5, l: 213.1 },
      TSLA: { c: 423.68, dp: 1.4, h: 425.0, l: 418.2 },
    });

    const res = await GET(makeRequest('/api/quotes?symbols=NVDA,TSLA'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.NVDA.c).toBe(214.29);
    expect(data.TSLA.c).toBe(423.68);
    expect(mockedGetQuotes).toHaveBeenCalledWith(['NVDA', 'TSLA']);
  });

  it('returns 500 if finnhub throws', async () => {
    mockedGetQuotes.mockRejectedValue(new Error('API down'));
    const res = await GET(makeRequest('/api/quotes?symbols=NVDA'));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('API down');
  });
});
