import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checkKey = (val: string | undefined) => {
    if (!val) return 'MISSING ❌';
    if (val.length < 8) return 'TOO SHORT ⚠️';
    return `PRESENT (Length: ${val.length}, Starts: "${val.substring(0, 6)}...", Ends: "...${val.slice(-6)}") ✅`;
  };

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: checkKey(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: checkKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    WHATSAPP_ACCESS_TOKEN: checkKey(process.env.WHATSAPP_ACCESS_TOKEN),
    GEMINI_API_KEY: checkKey(process.env.GEMINI_API_KEY),
    WHATSAPP_PHONE_NUMBER_ID: checkKey(process.env.WHATSAPP_PHONE_NUMBER_ID)
  });
}
