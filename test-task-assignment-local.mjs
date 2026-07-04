async function run() {
  const url = 'http://localhost:3000/api/whatsapp/webhook';
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
                  id: 'wamid.tcr-test-assignment-local-' + Date.now(),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'assign a task to yug for crm model due date is 10th july 10:39'
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
    console.log(`Sending simulated Admin task assignment request to LOCAL webhook: ${url}...`);
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
      console.log('\n✅ Local webhook successfully processed the simulated task assignment request!');
      console.log('Instructions:');
      console.log('1. Check your local dashboard (http://localhost:3000) under Tasks -> Task Board.');
      console.log('2. You should see the new task "Review layout css components" assigned to Alok instantly!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
