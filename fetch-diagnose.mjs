async function run() {
  const url = 'https://enxt-crm.vercel.app/api/diagnose-env';
  try {
    console.log(`Fetching live environment configuration from Vercel: ${url}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    console.log('\n--- VERCEL ENV DIAGNOSIS ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
