import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const KV_KEY = 'portfolio-radar:positions';

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { positions } = body;

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json({ error: 'Missing positions array' }, { status: 400, headers: corsHeaders() });
    }

    const redis = getRedis();
    const payload = {
      positions,
      syncedAt: new Date().toISOString(),
      count: positions.length,
    };
    await redis.set(KV_KEY, JSON.stringify(payload));

    return NextResponse.json(
      { status: 'ok', count: positions.length, syncedAt: payload.syncedAt },
      { headers: corsHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const redis = getRedis();
    const raw = await redis.get<string>(KV_KEY);

    if (!raw) {
      return NextResponse.json(
        { positions: [], syncedAt: null, count: 0 },
        { headers: corsHeaders() }
      );
    }

    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders() });
  }
}
