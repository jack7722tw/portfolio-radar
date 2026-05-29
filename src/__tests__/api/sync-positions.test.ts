import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SYNC_SECRET', 'test-secret');

import { POST, GET } from '@/app/api/sync-positions/route';
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

  it('POST returns 401 without auth', async () => {
    const res = await POST(makeRequest('POST', { positions: [] }));
    expect(res.status).toBe(401);
  });

  it('POST returns 401 with wrong auth', async () => {
    const res = await POST(makeRequest('POST', { positions: [] }, 'Bearer wrong'));
    expect(res.status).toBe(401);
  });

  it('POST saves positions with valid auth', async () => {
    const res = await POST(makeRequest('POST', {
      positions: [{ symbol: 'NVDA', shares: 3, costBasis: 200 }],
    }, 'Bearer test-secret'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(1);
  });

  it('GET returns 401 without auth', async () => {
    const res = await GET(makeRequest('GET', undefined));
    expect(res.status).toBe(401);
  });

  it('GET returns positions with valid auth', async () => {
    const res = await GET(makeRequest('GET', undefined, 'Bearer test-secret'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.positions).toBeDefined();
  });
});
