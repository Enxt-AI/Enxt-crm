async function run() {
  const url = 'https://enxt-crm.vercel.app/api/whatsapp/webhook';
  const payload = {
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": { "display_phone_number": "123", "phone_number_id": "123" },
          "contacts": [{ "profile": { "name": "Alok" }, "wa_id": "919904986183" }],
          "messages": [{
            "from": "919904986183",
            "id": "wamid.live-test-" + Date.now(),
            "timestamp": "123",
            "type": "text",
            "text": { "body": "need 2 hours more for youtube" } 
          }]
        },
        "field": "messages"
      }]
    }]
  };

  try {
    console.log(`Sending simulated WhatsApp request to live webhook: ${url}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log(`Status Code: ${res.status}`);
    console.log(`Response Body: ${text}`);
    if (res.ok) {
      console.log('\n✅ Live webhook successfully processed the simulated request!');
      console.log('Instructions:');
      console.log('1. Run "node read-messages.mjs" to verify if it has registered the request.');
      console.log('2. Check your Vercel admin dashboard to verify if the request appeared.');
    } else {
      console.log('\n❌ Live webhook failed to process the request.');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();
