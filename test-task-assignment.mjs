async function run() {
  const url = 'https://enxt-crm.vercel.app/api/whatsapp/webhook';
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '1234567890',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551952218',
                phone_number_id: '946239071914285'
              },
              contacts: [
                {
                  profile: {
                    name: 'Yug Jain'
                  },
                  wa_id: '917056754400'
                }
              ],
              messages: [
                {
                  from: '917056754400',
                  id: 'wamid.tcr-test-assignment-' + Date.now(),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'Assign task to Alok: Review layout css components by 2026-07-06 at 11:00am'
                  },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  try {
    console.log(`Sending simulated Admin task assignment request to live webhook: ${url}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Status Code:', res.status);
    const body = await res.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));
    
    if (res.ok) {
      console.log('\n✅ Live webhook successfully processed the simulated task assignment request!');
      console.log('Instructions:');
      console.log('1. Refresh your dashboard to see if the new task is added.');
      console.log('2. Check the message log to see if the notification and confirmation were logged.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
