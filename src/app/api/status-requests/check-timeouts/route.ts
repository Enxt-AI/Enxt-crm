import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date().toISOString();

    // Find all sent requests where the reply deadline has passed
    const { data, error } = await supabase
      .from('status_requests')
      .select('id, employee_name')
      .eq('status', 'sent')
      .lt('reply_deadline', now);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired requests found.',
        updated: 0,
      });
    }

    const expiredIds = data.map((r: any) => r.id);

    // Batch update all expired requests to 'not_replied'
    const { error: updateError } = await supabase
      .from('status_requests')
      .update({ status: 'not_replied' })
      .in('id', expiredIds);

    if (updateError) throw updateError;

    console.log(`[status-requests/check-timeouts] Marked ${expiredIds.length} requests as not_replied:`,
      data.map((r: any) => r.employee_name).join(', ')
    );

    return NextResponse.json({
      success: true,
      updated: expiredIds.length,
      employees: data.map((r: any) => r.employee_name),
    });
  } catch (error: any) {
    console.error('[status-requests/check-timeouts] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
