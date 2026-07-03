const supabaseUrl = 'https://ngugtavyedqodakuhmqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndWd0YXZ5ZWRxb2Rha3VobXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI5NDA5NywiZXhwIjoyMDk3ODcwMDk3fQ.JNfznpkiqjnpMmf6pWdFzMmHYUxhxX8NF-7vGNtpGFM';

async function run() {
  try {
    console.log('Fetching last 15 WhatsApp messages from Supabase...');
    const res = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.whatsapp_messages`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);

    const data = await res.json();
    const messages = data?.[0]?.data || [];

    if (messages.length === 0) {
      console.log('No WhatsApp messages found in the database.');
      return;
    }

    console.log('\n--- LAST 15 MESSAGES ---');
    const last15 = messages.slice(-15);
    last15.forEach((msg, idx) => {
      console.log(`[#${idx+1}] Time: ${msg.timestamp}`);
      console.log(`      From: ${msg.from} (Employee: ${msg.employeeName})`);
      console.log(`      Type: ${msg.type}`);
      console.log(`      Body: "${msg.text}"`);
      console.log('-----------------------------------');
    });

    console.log('\nFetching active time change requests...');
    const reqRes = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.time_change_requests`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const reqData = await reqRes.json();
    const requests = reqData?.[0]?.data || [];
    console.log(`Total extension requests: ${requests.length}`);
    requests.forEach((req, idx) => {
      console.log(` - Request #${idx+1}: Task "${req.taskTitle}" for ${req.employeeName} (Status: ${req.status}, Created: ${req.createdAt})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
