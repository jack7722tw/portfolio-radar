import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSet = vi.fn();
const mockGet = vi.fn();

vi.mock('@upstash/redis', () => ({
  Redis: class {
    set = mockSet;
    get = mockGet;
  },
}));

vi.stubEnv('SYNC_SECRET', 'test-secret');
vi.stubEnv('KV_REST_API_URL', 'https://fake.upstash.io');
vi.stubEnv('KV_REST_API_TOKEN', 'fake-token');

import { POST, GET, OPTIONS } from '@/app/api/sync-positions/route';
import { NextRequest } from 'next/server';

function makeRequest(method: string, body?: unknown, auth?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) headers['authorization'] = auth;
  return new NextRequest(new URL('/api/sync-positions', 'http://localhost:3000'), {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
    headers,
  });
}

describe('/api/sync-positions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OPTIONS returns 204 with CORS headers', async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('POST returns 401 without auth', async () => {
    const res = await POST(makeRequest('POST', { positions: [] }));
    expect(res.status).toBe(401);
  });

  it('POST returns 400 without positions', async () => {
    const res = await POST(makeRequest('POST', {}, 'Bearer test-secret'));
    expect(res.status).toBe(400);
  });

  it('POST saves positions to Redis', async () => {
    mockSet.mockResolvedValue('OK');

    const res = await POST(makeRequest('POST', {
      positions: [{ symbol: 'NVDA', shares: 3, costBasis: 200 }],
    }, 'Bearer test-secret'));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(1);
    expect(data.syncedAt).toBeDefined();
    expect(mockSet).toHaveBeenCalledOnce();
  });

  it('GET returns 401 without auth', async () => {
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('GET returns empty when no data', async () => {
    mockGet.mockResolvedValue(null);

    const res = await GET(makeRequest('GET', undefined, 'Bearer test-secret'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.positions).toEqual([]);
    expect(data.syncedAt).toBeNull();
  });

  it('GET returns saved positions', async () => {
    const stored = {
      positions: [{ symbol: 'TSLA', shares: 5, costBasis: 400 }],
      syncedAt: '2026-05-29T00:00:00Z',
      count: 1,
    };
    mockGet.mockResolvedValue(JSON.stringify(stored));

    const res = await GET(makeRequest('GET', undefined, 'Bearer test-secret'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.positions).toHaveLength(1);
    expect(data.positions[0].symbol).toBe('TSLA');
  });
});
