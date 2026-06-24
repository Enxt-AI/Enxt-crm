import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, message, templateName, templateParams } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // Format phone to clean international digits (E.164 without '+' or spaces)
    let toPhone = phone.trim();
    if (toPhone.startsWith('whatsapp:')) {
      toPhone = toPhone.substring('whatsapp:'.length);
    }
    const digits = toPhone.replace(/\D/g, "");
    let formattedTo = digits;
    if (digits.length === 10) {
      formattedTo = `91${digits}`;
    }

    // 1. Try Meta WhatsApp Cloud API first
    if (whatsappToken && phoneId && !whatsappToken.includes('your_meta_access_token')) {
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
      console.log('[whatsapp global api] Dispatching via Meta Cloud API to:', formattedTo);
      
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: {
          preview_url: false,
          body: message || "",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[whatsapp global api] Meta response:', data);

      if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || "Failed to send WhatsApp message" }, { status: response.status });
      }

      return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });
    }

    // 2. Simulation fallback if Meta API is unconfigured
    console.log("-----------------------------------------");
    console.log("SIMULATED WHATSAPP MESSAGE (No API Keys)");
    console.log(`To: whatsapp:+${formattedTo}`);
    console.log(`Body:\n${message}`);
    console.log("-----------------------------------------");
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return NextResponse.json({ 
      success: true, 
      simulated: true, 
      message: "Message successfully simulated. Add Meta keys to .env.local to send for real." 
    });
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
