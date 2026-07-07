async function main() {
  const url = 'https://enxt-crm.vercel.app/api/whatsapp';
  
  const payload = {
    phone: '917056754400',
    message: 'test from vercel API script',
    templateName: 'team_broadcast',
    templateParams: ['Yug Jain', 'test from vercel API script']
  };

  console.log('Sending request to Vercel API...');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Status Code:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

main();
