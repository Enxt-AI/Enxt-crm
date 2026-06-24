import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../lib/zohoBooks';

export async function GET() {
  try {
    const token = await getAccessToken();
    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error('Debug token error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
