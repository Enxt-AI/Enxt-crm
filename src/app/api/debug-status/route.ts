import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data } = await supabase.from('app_data').select('data').eq('key', 'webhook_logs').single();
    return NextResponse.json({
      success: true,
      logs: data?.data || []
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
