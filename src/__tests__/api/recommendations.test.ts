import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/finnhub', () => ({
  getQuotes: vi.fn(),
}));

import { POST as trackPOST, GET as trackGET } from '@/app/api/recommendations/track/route';
import { POST as evalPOST } from '@/app/api/recommendations/evaluate/route';
import { getQuotes } from '@/lib/finnhub';
import { NextRequest } from 'next/server';

const mockedGetQuotes = vi.mocked(getQuotes);

function makePostRequest(url: string, body: unknown) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/recommendations/track', () => {
  it('returns 400 if required fields missing', async () => {
    const res = await trackPOST(makePostRequest('/api/recommendations/track', {}));
    expect(res.status).toBe(400);
  });

  it('creates a recommendation', async () => {
    const res = await trackPOST(makePostRequest('/api/recommendations/track', {
      symbol: 'NVDA',
      type: 'stop_loss',
      priceAtRecommendation: 214,
      content: '止損 $185',
      confidence: '高',
    }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.symbol).toBe('NVDA');
    expect(data.outcome).toBeNull();
  });
});

describe('GET /api/recommendations/track', () => {
  it('returns list of recommendations', async () => {
    const res = await trackGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/recommendations/evaluate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if recommendations missing', async () => {
    const res = await evalPOST(makePostRequest('/api/recommendations/evaluate', {}));
    expect(res.status).toBe(400);
  });

  it('evaluates pending recommendations', async () => {
    mockedGetQuotes.mockResolvedValue({
      NVDA: { c: 220, dp: 2.0, h: 222, l: 218 },
    });

    const res = await evalPOST(makePostRequest('/api/recommendations/evaluate', {
      recommendations: [
        { id: 'rec_1', symbol: 'NVDA', priceAtRecommendation: 200, outcome: null },
      ],
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.evaluations).toHaveLength(1);
    expect(data.evaluations[0].returnPercent).toBe(10);
    expect(data.evaluations[0].direction).toBe('win');
  });

  it('skips already evaluated recommendations', async () => {
    const res = await evalPOST(makePostRequest('/api/recommendations/evaluate', {
      recommendations: [
        { id: 'rec_1', symbol: 'NVDA', priceAtRecommendation: 200, outcome: { returnPercent: 5 } },
      ],
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.evaluations).toHaveLength(0);
  });
});
