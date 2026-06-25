

async function run() {
  console.log("Sending test payload to local webhook...");
  try {
    const res = await fetch('http://localhost:3000/api/whatsapp/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          id: '123',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '123', phone_number_id: '123' },
              contacts: [{ profile: { name: 'Test' }, wa_id: '917056754400' }],
              messages: [{
                from: '917056754400',
                id: 'wamid.123',
                timestamp: '123',
                type: 'text',
                text: { body: 'completed' } // Send 'completed' command
              }]
            },
            field: 'messages'
          }]
        }]
      })
    });
    
    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response body:", text);
    
    console.log("\nIf this says Response status: 200, the local webhook is working fine!");
    console.log("Please check your 'npm run dev' terminal for any logs like '[whatsapp webhook] Payload received'.");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
