import fs from 'fs';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
const refreshToken = env.GOOGLE_REFRESH_TOKEN;

console.log("Testing OAuth refresh with:");
console.log("Client ID:", clientId);
console.log("Client Secret:", clientSecret ? `${clientSecret.slice(0, 10)}...` : 'undefined');
console.log("Refresh Token:", refreshToken ? `${refreshToken.slice(0, 10)}...` : 'undefined');

async function testRefresh() {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    const text = await res.text();
    console.log("\nStatus:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testRefresh();
