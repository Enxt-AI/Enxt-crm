import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'webhook_logs')
      .single();

    return NextResponse.json({
      success: true,
      adminEnv: process.env.ADMIN_PHONE_NUMBERS,
      webhookLogs: data?.data || [],
      error: error?.message
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || err });
  }
}
