// ComBrain - WhatsApp Cloud API & Gemini Integration Route
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, message, templateName, templateParams, useGemini, employeeName } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    let finalMessage = message;
    let finalParams = templateParams;

    // Generate custom welcome message via Gemini API if requested
    if (useGemini && employeeName) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
          const prompt = `You are ComBrain, the AI assistant for ComBrain AI.
Write an enthusiastic, warm, single-line WhatsApp welcome message for team member "${employeeName}".
Mention that they are set up on the ComBrain portal and can reply with "Hi" anytime to view assigned tasks, update project status, or chat with the AI.
Include friendly emojis. CRITICAL: Keep your entire output on ONE SINGLE LINE without any line breaks or newlines.`;

          const gRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: {
                "x-goog-api-key": apiKey,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                system_instruction: {
                  parts: [
                    {
                      text: "You are ComBrain AI assistant. Generate concise, single-line WhatsApp welcome messages for team members."
                    }
                  ]
                },
                contents: [
                  {
                    role: "user",
                    parts: [{ text: prompt }]
                  }
                ]
              })
            }
          );

          const gData = await gRes.json();
          const generatedText = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (generatedText) {
            const cleanText = generatedText.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
            console.log(`[whatsapp global api] Gemini generated welcome message for ${employeeName}: "${cleanText}"`);
            finalMessage = cleanText;
            if (templateName && templateParams?.length) {
              finalParams = templateName === 'employee_welcome' ? [employeeName] : [employeeName, cleanText];
            }
          }
        } catch (err) {
          console.warn("[whatsapp global api] Gemini generation error, using fallback message:", err);
        }
      }
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

      // 1a. Try template message first (works outside 24-hour window)
      if (templateName && finalParams?.length) {
        console.log(`[whatsapp global api] Trying template "${templateName}" to:`, formattedTo);

        const sanitizedParams = finalParams.map((p: string) => 
          (typeof p === "string" ? p : String(p || ""))
            .replace(/[\r\n]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        );

        const tRes = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedTo,
            type: "template",
            template: {
              name: templateName,
              language: { code: (templateName === 'task_due_one_hour' || templateName === 'employee_welcome') ? 'en' : 'en_US' },
              components: [{
                type: "body",
                parameters: sanitizedParams.map((p: string) => ({ type: "text", text: p })),
              }],
            },
          }),
        });

        const tData = await tRes.json();
        console.log(`[whatsapp global api] Template response:`, tData);

        if (tRes.ok) {
          return NextResponse.json({ success: true, messageId: tData.messages?.[0]?.id, method: 'template' });
        }

        // Template failed — fall back to free-form text below
        console.warn(`[whatsapp global api] Template "${templateName}" failed (${tRes.status}), falling back to text`);
      }

      // 1b. Free-form text fallback (works within 24-hour window)
      console.log('[whatsapp global api] Dispatching free-form text to:', formattedTo);

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: {
          preview_url: false,
          body: finalMessage || "",
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

      return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id, method: 'text' });
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
