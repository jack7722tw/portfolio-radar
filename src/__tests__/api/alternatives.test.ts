import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/finnhub', () => ({
  getQuotes: vi.fn(),
}));

vi.mock('@/lib/anthropic', () => ({
  analyzeWithClaude: vi.fn(),
  parseJsonResponse: vi.fn(),
}));

vi.mock('@/lib/cache', () => ({
  getCached: vi.fn(() => null),
  setCache: vi.fn(),
}));

import { POST } from '@/app/api/analyze/alternatives/route';
import { getQuotes } from '@/lib/finnhub';
import { analyzeWithClaude, parseJsonResponse } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

const mockedGetQuotes = vi.mocked(getQuotes);
const mockedAnalyze = vi.mocked(analyzeWithClaude);
const mockedParse = vi.mocked(parseJsonResponse);

function makePostRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/analyze/alternatives', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/analyze/alternatives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if currentPositions is missing', async () => {
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 if currentPositions is empty', async () => {
    const res = await POST(makePostRequest({ currentPositions: [] }));
    expect(res.status).toBe(400);
  });

  it('returns alternatives for valid request', async () => {
    const mockResponse = {
      recommendations: [{
        replace: 'MSTU',
        replaceReason: '槓桿衰減',
        suggestSymbol: 'IBIT',
        suggestName: 'iShares Bitcoin Trust ETF',
        suggestReason: '無槓桿直接曝險',
        expectedHoldingPeriod: '8-12 週',
        confidence: '高',
      }],
      hotMoney: [{
        symbol: 'GEV',
        name: 'GE Vernova',
        reason: '電力基建主題',
        suggestedEntry: '$380-400',
        suggestedHolding: '12-16 週',
      }],
    };

    mockedGetQuotes.mockResolvedValue({
      COIN: { c: 250, dp: 1.5, h: 255, l: 248 },
      MSTU: { c: 30, dp: -3.2, h: 32, l: 29 },
    });
    mockedAnalyze.mockResolvedValue(JSON.stringify(mockResponse));
    mockedParse.mockReturnValue(mockResponse);

    const res = await POST(makePostRequest({
      currentPositions: ['COIN', 'MSTU'],
      sectors: ['tech', 'fintech'],
      riskTolerance: 'medium',
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recommendations).toHaveLength(1);
    expect(data.recommendations[0].suggestSymbol).toBe('IBIT');
    expect(data.hotMoney).toHaveLength(1);
  });

  it('returns 500 on error', async () => {
    mockedGetQuotes.mockRejectedValue(new Error('Network error'));
    const res = await POST(makePostRequest({ currentPositions: ['COIN'] }));
    expect(res.status).toBe(500);
  });
});
