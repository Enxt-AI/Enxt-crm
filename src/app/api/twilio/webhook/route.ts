import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Twilio integration is deprecated and disabled. Use Meta WhatsApp webhook instead.' },
    { status: 410 }
  );
}
