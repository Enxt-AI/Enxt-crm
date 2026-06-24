import type { ZohoInvoice, ZohoSubscription } from './types';

/**
 * Helper to get a fresh OAuth access token using the refresh token.
 * Reads credentials from environment variables defined in .env.local.
 */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho credentials are not set in environment variables');
  }

  // Build token request using URLSearchParams and send as form‑urlencoded body
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });
console.log('🛠️ Zoho token request payload →', params.toString());
  const tokenUrl = `https://accounts.zoho.in/oauth/v2/token`;
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to refresh Zoho token: ${res.status} ${txt}`);
  }
  const data = await res.json();
  // Debug: show full token response
  console.log('🔑 Token response →', data);
  // If Zoho returns an explicit error field, surface it
  if (data.error) {
    throw new Error(`Zoho token request failed: ${data.error}`);
  }
  if (!data.access_token) {
    throw new Error('Access token missing in Zoho response');
  }
  return data.access_token;
}

/** Generic helper to call Zoho Books API with proper auth header. */
async function zohoFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const accessToken = await getAccessToken();
  console.log('🟢 Zoho access token →', accessToken); // <‑‑ temporary debug line

  const baseUrl = `https://books.zoho.in/api/v3`;
  const url = `${baseUrl}${endpoint}`;

  const init: RequestInit = {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const res = await fetch(url, init);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Zoho API error ${res.status}: ${txt}`);
  }
  return res.json();
}

/** Fetch pending invoices (status=sent or partially_sent). */
export async function fetchPendingInvoices(): Promise<ZohoInvoice[]> {
  const orgId = process.env.ZOHO_ORGANIZATION_ID;
  if (!orgId) throw new Error('ZOHO_ORGANIZATION_ID not set');
  const resp = await zohoFetch(`/invoices?organization_id=${orgId}`);
  return resp.invoices as ZohoInvoice[];
}

/** Create a new invoice. */
export async function createInvoice(payload: any): Promise<ZohoInvoice> {
  const orgId = process.env.ZOHO_ORGANIZATION_ID;
  if (!orgId) throw new Error('ZOHO_ORGANIZATION_ID not set');
  const resp = await zohoFetch(`/invoices?organization_id=${orgId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return resp.invoice as ZohoInvoice;
}

/** Fetch active subscriptions. */
export async function fetchActiveSubscriptions(): Promise<ZohoSubscription[]> {
  const orgId = process.env.ZOHO_ORGANIZATION_ID;
  if (!orgId) throw new Error('ZOHO_ORGANIZATION_ID not set');
  const resp = await zohoFetch(
    `/subscriptions?organization_id=${orgId}&status=active`,
  );
  return resp.subscriptions as ZohoSubscription[];
}
