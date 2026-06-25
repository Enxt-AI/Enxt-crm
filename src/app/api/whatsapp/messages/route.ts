import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'whatsapp_messages')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error("Failed to read WhatsApp messages from Supabase:", error);
    return NextResponse.json({ error: "Failed to read messages" }, { status: 500 });
  }
}
