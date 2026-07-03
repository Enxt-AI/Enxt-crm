async function run() {
  const url = 'http://localhost:3000/api/whatsapp/webhook';
  const payload = {
    object: "whatsapp_business_account",
    entry: [{
      id: "123",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: { display_phone_number: "123", phone_number_id: "123" },
          contacts: [{ profile: { name: "Yug Jain" }, wa_id: "917056754400" }],
          messages: [{
            from: "917056754400",
            id: "wamid.local-test-" + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: "text",
            text: { body: "hi bot, who are you?" }
          }]
        },
        field: "messages"
      }]
    }]
  };

  try {
    console.log(`Sending mock payload to local webhook: ${url}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log(`Status Code: ${res.status}`);
    console.log(`Response Body: ${text}`);
    if (res.ok) {
      console.log('\n✅ Local webhook successfully processed the simulated request!');
      console.log('Now check your local next dev console output for any log details.');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();
