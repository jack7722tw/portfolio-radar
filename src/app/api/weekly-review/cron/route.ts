import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // TODO: fetch positions from persistent storage, run weekly review
  return NextResponse.json({ status: 'ok', message: 'Weekly review cron triggered' });
}
