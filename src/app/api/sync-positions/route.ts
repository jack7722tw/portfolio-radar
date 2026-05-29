import { NextRequest, NextResponse } from 'next/server';

// In-memory store for server-side position sync
// Replace with Upstash Redis via Vercel Marketplace for persistence
let serverPositions: unknown[] = [];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { positions } = body;

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json({ error: 'Missing positions array' }, { status: 400 });
    }

    serverPositions = positions;
    return NextResponse.json({ status: 'ok', count: positions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json({ positions: serverPositions });
}
