import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'time_change_requests')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data?.data || []);
  } catch (error: any) {
    console.error("Failed to fetch time change requests:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, timerStartedAt } = await request.json();
    
    // Load existing requests
    const { data: currentData, error: loadError } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'time_change_requests')
      .single();

    if (loadError && loadError.code !== 'PGRST116') throw loadError;

    const requests = currentData?.data || [];
    const updated = requests.map((r: any) => {
      if (r.id === id) {
        return { 
          ...r, 
          status, 
          timerStartedAt: timerStartedAt !== undefined ? timerStartedAt : r.timerStartedAt 
        };
      }
      return r;
    });

    const { error: upsertError } = await supabase
      .from('app_data')
      .upsert({ key: 'time_change_requests', data: updated });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update time change request:", error);
    return NextResponse.json({ error: error.message || "Failed to update request" }, { status: 500 });
  }
}
