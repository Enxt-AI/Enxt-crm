const WABA_ID = '2101576453952866';
const ACCESS_TOKEN = 'EAIPh7NlYrLMBR008l6VfMl1u9zKNtfGM7ItPF8zdjuB7UhOboYnKB3lWOMhjcMfIjy5GNLJ9qmnXsHMnb9ePEZARmA63VCncxLYuh6L0HIPqqM0mzM3qLZCnlWAlOXRFn43iZA0QRZBiZCOn95dNDSgxsZBEWa9BQsaeh3GJstr8ZC8SZAaqZBk1xv4fzgvfPRQZDZD';

const url = `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`;

const payload = {
  name: 'team_broadcast',
  category: 'UTILITY',
  language: 'en',
  components: [
    {
      type: 'BODY',
      text: 'Hi {{1}}, a message from Enxt AI:\n\n{{2}}\n\nThe Enxt AI Team',
      example: {
        body_text: [['Yug Jain', 'Please note that the office will be closed tomorrow for the holiday.']],
      },
    },
  ],
};

async function main() {
  console.log('Creating team_broadcast template (Utility)...');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Created! ID: ${data.id}, Status: ${data.status}`);
  } else {
    console.log(`❌ Failed:`, JSON.stringify(data.error, null, 2));
  }
}

main();
