import { NextResponse } from 'next/server';
import { fetchActiveSubscriptions } from '../../../../lib/zohoBooks';

export async function GET() {
  try {
    const subs = await fetchActiveSubscriptions();
    return NextResponse.json({ success: true, data: subs });
  } catch (error: any) {
    console.error('Error fetching active subscriptions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
