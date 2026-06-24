import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (!res.ok) throw new Error('Not ok');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message, status: 'ngrok not running locally' });
  }
}
