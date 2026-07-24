import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

async function sendMetaMessage(to: string, body: string, whatsappToken: string, phoneId: string) {
  if (!whatsappToken || !phoneId || whatsappToken.includes('your_meta_access_token')) {
    console.log(`[whatsapp admin copy] Simulated admin notification to ${to}:\n${body}`);
    return { simulated: true };
  }
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: body,
        },
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error(`[whatsapp admin copy] Failed to send to ${to}:`, err);
    return { ok: false, error: err };
  }
}

export async function POST(request: Request) {
  try {
    const { to, body, template, notifyAdmins } = await request.json();
    if (!to || !body) {
      return NextResponse.json({ error: 'Missing "to" or "body"' }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // Format destination number for Meta
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

    // Lookup employee name from documents
    let employeeName = 'Unknown User';
    try {
      const { data: docData } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', 'documents')
        .single();

      const documents = docData?.data || [];
      const employee = documents.find((doc: any) => {
        if (doc.type !== 'employee') return false;
        const phone = doc.fields?.phone;
        if (!phone) return false;
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.includes(formattedTo) || formattedTo.includes(cleanPhone);
      });

      if (employee) {
        employeeName = employee.fields?.name || employee.title || 'Unknown User';
      }
    } catch (e) {
      console.warn('[whatsapp send api] Failed to lookup employee name:', e);
    }

    // Helper to log message to DB
    const logMessageToDB = async () => {
      try {
        const { data } = await supabase
          .from('app_data')
          .select('data')
          .eq('key', 'whatsapp_messages')
          .single();

        const messages = (data?.data) || [];
        messages.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          from: formattedTo,
          employeeName,
          text: body.trim(),
          timestamp: new Date().toISOString(),
          type: 'outbound'
        });

        await supabase
          .from('app_data')
          .upsert({ key: 'whatsapp_messages', data: messages });
      } catch (err) {
        console.error("[whatsapp send api] Failed to save outbound message to Supabase:", err);
      }
    };

    const triggerAdminAlertIfRequested = async () => {
      try {
        if (!notifyAdmins) return;
        const adminNumbers = (process.env.ADMIN_PHONE_NUMBERS || '')
          .split(',')
          .map((num) => {
            const digits = num.replace(/\D/g, '').trim();
            return digits.length === 10 ? `91${digits}` : digits;
          })
          .filter(Boolean);

        const adminAlertBody = `📢 *[Admin Copy]* Task assigned to *${employeeName}*:\n\n${body.replace(/Hi .*?!\n\n/, '')}`;

        for (const adminTo of adminNumbers) {
          if (adminTo === formattedTo) continue;
          await sendMetaMessage(adminTo, adminAlertBody, whatsappToken, phoneId);
        }
      } catch (err) {
        console.error("[whatsapp send api] Failed to send admin alert copy:", err);
      }
    };

    // 1. Try Meta WhatsApp Cloud API first
    if (whatsappToken && phoneId && !whatsappToken.includes('your_meta_access_token')) {
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

      // 1a. Try template message first (works outside 24-hour window)
      if (template?.name && template?.parameters) {
        console.log(`[whatsapp send api] Trying template "${template.name}" to:`, formattedTo);

        const templateRes = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedTo,
            type: 'template',
            template: {
              name: template.name,
              language: { code: template.language || 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: template.parameters.map((p: string) => ({
                    type: 'text',
                    text: p,
                  })),
                },
              ],
            },
          }),
        });

        const templateData = await templateRes.json();
        console.log(`[whatsapp send api] Template response:`, templateData);

        if (templateRes.ok) {
          await logMessageToDB();
          return NextResponse.json({ success: true, result: templateData, method: 'template' }, { status: 200 });
        }

        // Template failed — fall back to free-form text below
        console.warn(`[whatsapp send api] Template "${template.name}" failed (${templateRes.status}), falling back to free-form text`);
      }

      // 1b. Free-form text message (works within 24-hour window only)
      console.log('[whatsapp send api] Dispatching free-form text via Meta Cloud API to:', formattedTo);

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

      // Dispatch admin copies if requested
      await triggerAdminAlertIfRequested();

      // Log outbound message to database
      await logMessageToDB();

      return NextResponse.json({ success: true, result: data, method: 'text' }, { status: 200 });
    }

    // 2. Simulation fallback if Meta API is unconfigured
    console.log('-----------------------------------------');
    console.log('SIMULATED WHATSAPP MESSAGE (No API Keys)');
    console.log(`To: ${formattedTo}`);
    console.log(`Body:\n${body}`);
    console.log('-----------------------------------------');

    // Dispatch admin copies if requested
    await triggerAdminAlertIfRequested();

    // Still log simulated messages so they appear in UI during local dev
    await logMessageToDB();

    return NextResponse.json({ success: true, simulated: true }, { status: 200 });
  } catch (error: any) {
    console.error('[whatsapp send api] Error dispatching message:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
