import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at:', envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) return;
    const key = trimmed.substring(0, firstEq).trim();
    let val = trimmed.substring(firstEq + 1).trim();
    // remove quotes if any
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token) {
    console.error('WHATSAPP_ACCESS_TOKEN is missing in .env.local');
    process.exit(1);
  }

  console.log('Using Access Token prefix:', token.substring(0, 15) + '...');
  console.log('Using Phone Number ID:', phoneId);

  // Helper to make request
  async function apiCall(endpoint, method = 'GET') {
    const url = `https://graph.facebook.com/v20.0/${endpoint}`;
    console.log(`\n--- Requesting ${method} ${url} ---`);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      console.error('Fetch failed:', e);
      return null;
    }
  }

  // 1. Call debug_token or me endpoint
  await apiCall('me');
  
  // 2. Call me/accounts (pages) or me/businesses
  await apiCall('me/businesses');

  // 3. Try querying phone number details
  if (phoneId) {
    await apiCall(phoneId);
  }
}

main().catch(err => {
  console.error(err);
});
