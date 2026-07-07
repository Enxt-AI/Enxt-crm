const WABA_ID = '2101576453952866';
const PHONE_ID = '946239071914285';
const ACCESS_TOKEN = 'EAIPh7NlYrLMBR008l6VfMl1u9zKNtfGM7ItPF8zdjuB7UhOboYnKB3lWOMhjcMfIjy5GNLJ9qmnXsHMnb9ePEZARmA63VCncxLYuh6L0HIPqqM0mzM3qLZCnlWAlOXRFn43iZA0QRZBiZCOn95dNDSgxsZBEWa9BQsaeh3GJstr8ZC8SZAaqZBk1xv4fzgvfPRQZDZD';

async function main() {
  const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: '917056754400', // Yug's number
    type: 'template',
    template: {
      name: 'team_broadcast',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'Yug Jain' },
            { type: 'text', text: 'hlo from test script' }
          ]
        }
      ]
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Status Code:', res.status);
  console.log('Response Data:', JSON.stringify(data, null, 2));
}

main();
