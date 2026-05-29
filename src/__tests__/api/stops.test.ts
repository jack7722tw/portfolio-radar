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

import { POST } from '@/app/api/analyze/stops/route';
import { getQuotes } from '@/lib/finnhub';
import { analyzeWithClaude, parseJsonResponse } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

const mockedGetQuotes = vi.mocked(getQuotes);
const mockedAnalyze = vi.mocked(analyzeWithClaude);
const mockedParse = vi.mocked(parseJsonResponse);

function makePostRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/analyze/stops', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/analyze/stops', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if positions is missing', async () => {
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 if positions is empty', async () => {
    const res = await POST(makePostRequest({ positions: [] }));
    expect(res.status).toBe(400);
  });

  it('returns AI analysis for valid positions', async () => {
    const mockAnalysis = {
      NVDA: {
        suggestedStopLoss: 185,
        stopLossReason: '50日均線支撐',
        suggestedTakeProfit: 260,
        takeProfitReason: '前高壓力位',
        riskRewardRatio: 2.4,
        currentTrend: '上升趨勢',
        atrPercent: 3.2,
        confidence: '中',
      },
    };

    mockedGetQuotes.mockResolvedValue({
      NVDA: { c: 214.29, dp: -2.38, h: 220.5, l: 213.1 },
    });
    mockedAnalyze.mockResolvedValue(JSON.stringify(mockAnalysis));
    mockedParse.mockReturnValue(mockAnalysis);

    const res = await POST(makePostRequest({
      positions: [{ symbol: 'NVDA', shares: 3, costBasis: 200 }],
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.NVDA.suggestedStopLoss).toBe(185);
    expect(mockedAnalyze).toHaveBeenCalledWith(expect.any(String), 'haiku');
  });

  it('returns 500 on AI error', async () => {
    mockedGetQuotes.mockResolvedValue({ NVDA: { c: 214, dp: 0, h: 215, l: 213 } });
    mockedAnalyze.mockRejectedValue(new Error('AI unavailable'));

    const res = await POST(makePostRequest({
      positions: [{ symbol: 'NVDA', shares: 3, costBasis: 200 }],
    }));
    expect(res.status).toBe(500);
  });
});
