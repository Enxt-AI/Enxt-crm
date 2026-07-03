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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!token || !phoneId) {
  console.error("Missing Meta WhatsApp keys in .env.local");
  process.exit(1);
}

async function run() {
  try {
    console.log("Fetching active employees from Supabase...");
    const empRes = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.documents`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const empData = await empRes.json();
    const documents = empData?.[0]?.data || [];
    const activeEmployees = documents.filter(d => 
      d.type === 'employee' && 
      String(d.fields?.status || '').toLowerCase() === 'active' &&
      d.fields?.phone
    );

    if (activeEmployees.length === 0) {
      console.log("No active employees found with phone numbers.");
      return;
    }

    console.log(`Found ${activeEmployees.length} active employees:`);
    for (const emp of activeEmployees) {
      const name = emp.fields?.name || emp.title;
      const phone = emp.fields?.phone;
      console.log(`- ${name}: ${phone}`);
    }

    console.log("\nAttempting to send test text messages via Meta API directly...");
    for (const emp of activeEmployees) {
      const name = emp.fields?.name || emp.title;
      const phone = emp.fields?.phone;
      const digits = phone.replace(/\D/g, '');
      const formattedTo = digits.length === 10 ? `91${digits}` : digits;

      console.log(`\nSending text message to ${name} (${formattedTo})...`);
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: `Hello ${name}! This is a diagnostic test message from Enxt Brain.`
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
    }
  } catch (err) {
    console.error("Diagnostic error:", err.message);
  }
}

run();
