import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#\s][^=]*)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1].trim()] = val;
  }
});

const token = env.WHATSAPP_ACCESS_TOKEN;
const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;

if (!token || !phoneId) {
  console.error("Missing Meta WhatsApp keys in .env.local");
  process.exit(1);
}

async function run() {
  try {
    const name = "Alok";
    const phone = "9904986183";
    const digits = phone.replace(/\D/g, '');
    const formattedTo = digits.length === 10 ? `91${digits}` : digits;

    console.log(`Sending diagnostic text message to ${name} (${formattedTo})...`);
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedTo,
      type: 'text',
      text: {
        preview_url: false,
        body: `Hello ${name}! This is a targeted diagnostic test message from Enxt Brain.`
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Success for ${name}! Message ID: ${data.messages?.[0]?.id}`);
    } else {
      console.log(`❌ FAILED for ${name}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Diagnostic error:", err.message);
  }
}

run();
