import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, body } = await request.json();
    if (!to || !body) {
      return NextResponse.json({ error: 'Missing "to" or "body"' }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // Format destination number for Meta/Twilio
    let cleanTo = to.trim();
    if (cleanTo.startsWith('whatsapp:')) {
      cleanTo = cleanTo.substring('whatsapp:'.length);
    }
    const digits = cleanTo.replace(/\D/g, '');
    let formattedTo = digits;
    
    // If it's a 10-digit number, prepend '91' (default to India country code)
    if (digits.length === 10) {
      formattedTo = `91${digits}`;
    }

    // 1. Try Meta WhatsApp Cloud API first
    if (whatsappToken && phoneId && !whatsappToken.includes('your_meta_access_token')) {
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
      console.log('[whatsapp send api] Dispatching via Meta Cloud API to:', formattedTo);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'text',
          text: {
            preview_url: false,
            body: body,
          },
        }),
      });

      const data = await res.json();
      console.log('[whatsapp send api] Meta response:', data);

      if (!res.ok) {
        return NextResponse.json({ error: `Meta API error: ${res.status} ${JSON.stringify(data)}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: data }, { status: 200 });
    }

    // 2. Fallback to Twilio if Twilio configuration exists
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

    if (accountSid && authToken && whatsappNumber && !accountSid.includes('placeholder')) {
      console.log('[whatsapp send api] Meta keys missing, trying Twilio fallback to:', formattedTo);
      
      const cleanFrom = whatsappNumber.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}`;
      const cleanToTwilio = `whatsapp:+${formattedTo}`;
      
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', cleanFrom);
      params.append('To', cleanToTwilio);
      params.append('Body', body);

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const responseText = await res.text();
      console.log('[whatsapp send api] Twilio response:', { status: res.status, text: responseText });

      if (!res.ok) {
        return NextResponse.json({ error: `Twilio error: ${res.status} ${responseText}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: JSON.parse(responseText) }, { status: 200 });
    }

    // 3. Simulation fallback if both are unconfigured
    console.log('-----------------------------------------');
    console.log('SIMULATED WHATSAPP MESSAGE (No API Keys)');
    console.log(`To: ${formattedTo}`);
    console.log(`Body:\n${body}`);
    console.log('-----------------------------------------');

    return NextResponse.json({ success: true, simulated: true }, { status: 200 });
  } catch (error: any) {
    console.error('[whatsapp send api] Error dispatching message:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
