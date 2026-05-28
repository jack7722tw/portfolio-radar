import { NextResponse } from 'next/server';

// History is stored client-side in localStorage for MVP
// This route is a placeholder for future server-side storage
export async function GET() {
  return NextResponse.json({ reports: [] });
}
