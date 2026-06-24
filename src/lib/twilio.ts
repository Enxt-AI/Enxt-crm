import { Buffer } from 'buffer';

// Twilio configuration – read from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

if (!accountSid || !authToken || !whatsappNumber) {
  console.warn('[twilio] Missing Twilio configuration in .env');
}

/** Send a WhatsApp message via Twilio REST API using fetch */
export async function sendWhatsAppMessage(to: string, body: string): Promise<any> {
  if (!accountSid || !authToken || !whatsappNumber) {
    console.warn('[twilio] Configuration missing – cannot send message');
    return;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append('From', `whatsapp:${whatsappNumber}`);
  // Ensure the destination number includes a leading + and only one whatsapp: prefix
  const formattedTo = to.startsWith('+') ? to : `+${to}`;
  params.append('To', `whatsapp:${formattedTo}`);
  params.append('Body', body);

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  console.log('[twilio] Sending message', { From: `whatsapp:${whatsappNumber}`, To: `whatsapp:${formattedTo}`, Body: body });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const responseText = await res.text();
  console.log('[twilio] Response', { status: res.status, text: responseText });
  if (!res.ok) {
    throw new Error(`Twilio request failed: ${res.status} ${responseText}`);
  }
  return JSON.parse(responseText);
}

// Placeholder stubs for verification – kept to preserve existing imports
export async function startVerification(to: string): Promise<any> {
  console.warn('startVerification not implemented in lightweight client');
  return null;
}

export async function checkVerification(to: string, code: string): Promise<any> {
  console.warn('checkVerification not implemented in lightweight client');
  return null;
}
